import { Router } from 'express';
import multer from 'multer';
import { authRequired } from '../middleware/auth.js';
import { InterviewSession } from '../models/InterviewSession.js';
import { User } from '../models/User.js';
import { CV } from '../models/CV.js';
import { generateInterviewQuestion, extractResumeText, analyzePractice, generateOverallInterviewFeedback } from '../services/aiService.js';
import { parseJobDescription, analyzeCvAndJd, analyzeCvOnly } from '../services/jdParserService.js';
import { logger } from '../config/env.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const getQuestionsCount = (difficulty: 'easy' | 'medium' | 'hard'): number => {
  if (difficulty === 'hard') return 12;
  if (difficulty === 'medium') return 8;
  return 5;
};

const XP_PER_SESSION = 30;

/**
 * POST /interviews/parse-jd
 */
router.post('/parse-jd', authRequired, async (req, res) => {
  const { jdText } = req.body;
  if (!jdText) return res.status(400).json({ message: 'Missing jdText' });
  const result = await parseJobDescription(jdText);
  return res.json(result);
});

/**
 * POST /interviews/analyze
 * Phân tích độ phù hợp giữa CV và JD
 */
router.post('/analyze', authRequired, upload.single('cv'), async (req, res, next) => {
  try {
    let { jdText, cvId } = req.body;
    if (!jdText && !req.file && !cvId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp ít nhất Mô tả công việc (JD) hoặc CV.' });
    }

    let cvText = '';
    if (cvId) {
      const cv = await CV.findById(cvId);
      if (cv) cvText = cv.extractedText;
    } else if (req.file) {
      try {
        cvText = await extractResumeText({
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          buffer: req.file.buffer
        });
        logger.info(`[/analyze] Extracted CV text: ${cvText.length} chars, preview: ${cvText.slice(0, 100)}`);
      } catch (err) {
        logger.error(`[/analyze] extractResumeText failed: ${err}`);
        cvText = '';
      }
    }

    let result;
    if (jdText && cvText) {
      result = await analyzeCvAndJd(cvText, jdText);
    } else if (cvText) {
      result = await analyzeCvOnly(cvText);
    } else {
      result = await parseJobDescription(jdText);
    }

    return res.json({ ...result, cvText });
  } catch (error) {
    logger.error(`[/analyze] Fatal error: ${error instanceof Error ? error.message : String(error)}`);
    return res.status(500).json({ message: `Lỗi hệ thống khi phân tích CV/JD: ${error instanceof Error ? error.message : String(error)}` });
  }
});

/**
 * POST /interviews/start
 * Bắt đầu phiên phỏng vấn mới, sinh câu hỏi đầu tiên từ profile user
 */
router.post('/start', authRequired, upload.single('cv'), async (req, res, next) => {
  try {
    const user = req.user!;

    // Kiểm tra lượt phỏng vấn còn lại
    const dbUser = await User.findById(user._id);
    if (!dbUser) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
    if ((dbUser.remainingInterviews ?? 0) <= 0) {
      return res.status(403).json({
        message: 'Bạn đã hết lượt phỏng vấn miễn phí. Vui lòng mua gói để tiếp tục.',
        code: 'NO_INTERVIEW_ATTEMPTS'
      });
    }

    const { difficulty, language, focusWeak, jdText, analysisContext, cvId } = req.body as { difficulty?: string, language?: string, focusWeak?: string, jdText?: string, analysisContext?: string, cvId?: string };


    const normalizedDifficulty = (['easy', 'medium', 'hard'] as const).includes(difficulty as any)
      ? (difficulty as 'easy' | 'medium' | 'hard')
      : 'medium';
    const targetLanguage = language || 'vi';
    const isFocusWeak = focusWeak === 'true';

    // Extract CV text nếu upload
    let cvText = req.body.cvText || '';
    if (cvId) {
      const cv = await CV.findById(cvId);
      if (cv) cvText = cv.extractedText;
    } else if (req.file) {
      try {
        cvText = await extractResumeText({
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          buffer: req.file.buffer
        });
      } catch {
        cvText = '';
      }
    }

    const jobDescriptionRaw = req.body.jobDescription || req.body.jdText;
    let parsedTargetRole = '';
    let fullJobDescription = '';
    let companyName = '';
    
    if (jobDescriptionRaw) {
      try {
        const parsedJd = JSON.parse(jobDescriptionRaw);
        parsedTargetRole = parsedJd.title || parsedJd.jobTitle;
        fullJobDescription = parsedJd.jobDescription || '';
        companyName = parsedJd.company || '';
      } catch {
        // It's raw text
        fullJobDescription = jobDescriptionRaw;
      }
    }

    let targetRole = parsedTargetRole || user.specialization || user.industry || user.targetRole || 'Software Engineer';
    let contextSummary = cvText || user.bio;
    let finalTopic = '';
    
    if (analysisContext) {
      try {
        const parsedAnalysis = JSON.parse(analysisContext);
        targetRole = parsedAnalysis.jobTitle || targetRole;
        const matching = parsedAnalysis.matchingSkills?.join(', ') || '';
        const missing = parsedAnalysis.missingSkills?.join(', ') || '';
        const focus = parsedAnalysis.suggestedFocus?.join(', ') || '';
        
        finalTopic = `Phỏng vấn vị trí ${targetRole}. Kỹ năng có sẵn: ${matching}. Kỹ năng thiếu: ${missing}. Trọng tâm cần hỏi: ${focus}.`;
      } catch (e) {
        finalTopic = `Phỏng vấn ${targetRole}`;
      }
    } else {
      const baseTopic = parsedTargetRole ? `Vị trí ứng tuyển: ${parsedTargetRole}` : jobDescriptionRaw ? `Vị trí ứng tuyển theo mô tả công việc` : (user.specialization || user.industry || 'chung');
      finalTopic = isFocusWeak 
        ? `Phỏng vấn ${baseTopic} (Tập trung khắc phục điểm yếu)` 
        : `Phỏng vấn ${baseTopic}`;
    }

    // Không gọi LLM lúc này, tạo session rỗng
    const session = await InterviewSession.create({
      userId: user._id,
      industryGroup: user.industryGroup || '',
      industry: user.industry || '',
      specialization: user.specialization || '',
      experienceLevel: user.experienceLevel || 'junior',
      difficulty: normalizedDifficulty,
      topic: finalTopic,
      jobDescriptionText: fullJobDescription,
      company: companyName,
      cvText,
      totalQuestions: getQuestionsCount(normalizedDifficulty),
      currentQuestionIndex: 0,
      answers: [],
      status: 'in_progress',
      language: targetLanguage
    });

    // Trừ lượt phỏng vấn
    dbUser.remainingInterviews = Math.max(0, (dbUser.remainingInterviews ?? 1) - 1);
    await dbUser.save();

    return res.json({
      sessionId: session._id.toString(),
      remainingInterviews: dbUser.remainingInterviews
    });
  } catch (error) {
    logger.error(`[/start] Fatal error: ${error instanceof Error ? error.message : String(error)}`);
    return res.status(500).json({ message: `Lỗi hệ thống khi bắt đầu phỏng vấn: ${error instanceof Error ? error.message : String(error)}` });
  }
});

/**
 * POST /interviews/:id/generate-script
 * Sinh câu hỏi đầu tiên bằng AI
 */
router.post('/:id/generate-script', authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    
    const session = await InterviewSession.findOne({ _id: id, userId: user._id });
    if (!session) return res.status(404).json({ message: 'Không tìm thấy phiên phỏng vấn.' });
    if (session.answers && session.answers.length > 0) {
       // Đã có câu hỏi, không tạo lại
       const firstQ = session.answers[0];
       return res.json({
         currentQuestion: {
           index: 0,
           total: session.totalQuestions,
           question: firstQ.question,
         }
       });
    }

    const firstQuestion = await generateInterviewQuestion({
      difficulty: session.difficulty as 'easy' | 'medium' | 'hard',
      targetRole: session.specialization || session.industry || user.targetRole || 'Software Engineer',
      history: [],
      cvSummary: session.cvText || user.bio,
      topic: session.topic || `Phỏng vấn vị trí ứng tuyển`,
      language: session.language,
      jobDescription: session.jobDescriptionText,
      company: session.company
    });

    session.answers.push({
      questionId: '',
      question: firstQuestion.question,
      answer: '',
      score: 0,
      clarityScore: 0,
      confidenceScore: 0,
      feedback: '',
      strengths: [] as string[],
      improvements: [] as string[]
    });
    await session.save();

    return res.json({
      currentQuestion: {
        index: 0,
        total: session.totalQuestions,
        question: firstQuestion.question,
        reason: firstQuestion.reason,
        challenge: firstQuestion.challenge,
        suggestedFocus: firstQuestion.suggestedFocus
      }
    });
  } catch (error) {
    logger.error(`[/generate-script] Fatal error: ${error instanceof Error ? error.message : String(error)}`);
    return res.status(500).json({ message: 'Lỗi hệ thống khi tạo kịch bản.' });
  }
});

/**
 * POST /interviews/:id/answer
 * Gửi câu trả lời, chấm điểm, lấy câu hỏi tiếp theo (nếu chưa hết)
 */
router.post('/:id/answer', authRequired, async (req, res) => {
  const { id } = req.params;
  const { answer } = req.body as { answer?: string };
  const user = req.user!;

  if (!answer?.trim()) {
    return res.status(400).json({ message: 'Vui lòng nhập câu trả lời trước khi tiếp tục.' });
  }

  const session = await InterviewSession.findOne({ _id: id, userId: user._id });
  if (!session) {
    return res.status(404).json({ message: 'Không tìm thấy phiên phỏng vấn.' });
  }

  if (session.status === 'completed') {
    return res.status(400).json({ message: 'Phiên phỏng vấn này đã kết thúc.' });
  }

  // Câu hỏi hiện tại là answers[currentIndex] — đã được lưu khi tạo/sinh câu hỏi mới
  const currentIndex = session.currentQuestionIndex;
  const currentAnswerRecord = session.answers[currentIndex];
  const currentQuestionText = currentAnswerRecord?.question ?? `Câu hỏi ${currentIndex + 1}`;

  // Chấm điểm câu trả lời bằng AI
  let score = 60;
  let clarityScore = 60;
  let confidenceScore = 60;
  let feedback = 'Câu trả lời cơ bản, nên bổ sung ví dụ cụ thể và kết quả đo được.';
  let strengths: string[] = [];
  let improvements: string[] = [];

  try {
    const analysis = await analyzePractice({
      practiceType: 'interview',
      difficulty: session.difficulty as 'easy' | 'medium' | 'hard',
      transcript: answer.trim(),
      durationSeconds: 60,
      volumeSamples: [],
      topic: currentQuestionText,
      targetRole: session.specialization || session.industry || '',
      profileSummary: user.bio || ''
    });
    score = analysis.totalScore || 60;
    clarityScore = analysis.clarityScore || 60;
    confidenceScore = analysis.confidenceScore || 60;
    feedback = analysis.summary || 'Chưa nhận được đánh giá chi tiết.';
    strengths = analysis.strengths || [];
    improvements = analysis.improvements || [];
  } catch {
    // dùng giá trị mặc định nếu AI lỗi
  }

  // Cập nhật câu trả lời vào record hiện tại (đã có question, giờ điền answer + scores)
  if (currentAnswerRecord) {
    currentAnswerRecord.answer = answer.trim();
    currentAnswerRecord.score = score;
    currentAnswerRecord.clarityScore = clarityScore;
    currentAnswerRecord.confidenceScore = confidenceScore;
    currentAnswerRecord.feedback = feedback;
    currentAnswerRecord.strengths = strengths;
    currentAnswerRecord.improvements = improvements;
  } else {
    session.answers.push({
      questionId: '',
      question: currentQuestionText,
      answer: answer.trim(),
      score,
      clarityScore,
      confidenceScore,
      feedback,
      strengths,
      improvements
    });
  }

  const nextIndex = currentIndex + 1;
  const isLastQuestion = nextIndex >= session.totalQuestions;

  if (isLastQuestion) {
    const avgScore = Math.round(
      session.answers.reduce((sum, a) => sum + a.score, 0) / session.answers.length
    );
    const clarityAvg = Math.round(session.answers.reduce((sum, a) => sum + (a.clarityScore || avgScore), 0) / session.answers.length);
    const confidenceAvg = Math.round(session.answers.reduce((sum, a) => sum + (a.confidenceScore || avgScore), 0) / session.answers.length);
    
    session.overallScore = avgScore;
    session.skillRadar = {
      contentQuality: Math.round((avgScore * 2 + clarityAvg) / 3) + 2, // approximation
      clarity: clarityAvg,
      expertise: avgScore,
      confidence: confidenceAvg
    };
    session.status = 'completed';
    session.completedAt = new Date();
    session.xpEarned = Math.round(XP_PER_SESSION * (avgScore / 100));
    
    // Generate advanced overall feedback
    const historyData = session.answers
      .filter((a) => a.answer)
      .map((a) => ({ question: a.question, answer: a.answer }));
      
    const overallFeedback = await generateOverallInterviewFeedback({
      targetRole: session.specialization || session.industry || user.targetRole || '',
      cvText: session.cvText || '',
      history: historyData,
      language: session.language
    });

    session.summary = overallFeedback.summary;
    session.overallStrengths = overallFeedback.strengths;
    session.overallImprovements = overallFeedback.improvements;
    
    // You could also save matchedKeywords, missingKeywords, recommendedModels to the DB if the schema supported it, 
    // but returning them in the final evaluation or appending to summary is also fine.
    if (overallFeedback.recommendedModels.length > 0) {
      session.summary += `\n\nCác công nghệ / mô hình nên tham khảo: ${overallFeedback.recommendedModels.join(', ')}.`;
    }
    if (overallFeedback.missingKeywords.length > 0) {
      session.summary += `\n\nCác từ khóa chuyên ngành còn thiếu: ${overallFeedback.missingKeywords.join(', ')}.`;
    }

    session.currentQuestionIndex = nextIndex;

    await session.save();

    // Cộng XP cho user
    if (session.xpEarned > 0) {
      await User.findByIdAndUpdate(user._id, {
        $inc: { totalXp: session.xpEarned, weeklyXp: session.xpEarned }
      });
    }

    return res.json({
      completed: true,
      sessionId: id,
      score,
      overallScore: avgScore,
      xpEarned: session.xpEarned
    });
  }

  // Sinh câu hỏi tiếp theo và lưu vào answers[nextIndex]
  const history = session.answers
    .filter((a) => a.answer)
    .map((a) => ({ question: a.question, answer: a.answer }));

  const nextQuestion = await generateInterviewQuestion({
    difficulty: session.difficulty as 'easy' | 'medium' | 'hard',
    targetRole: session.specialization || session.industry || user.targetRole || '',
    history,
    cvSummary: session.cvText || user.bio,
    topic: session.topic || `Phỏng vấn ${session.specialization || session.industry || 'chung'}`,
    language: session.language,
    jobDescription: session.jobDescriptionText,
    company: session.company,
    lastAnswerScore: score
  });

  // Lưu câu hỏi tiếp theo vào answers ngay (answer rỗng)
  session.answers.push({
    questionId: '',
    question: nextQuestion.question,
    answer: '',
    score: 0,
    clarityScore: 0,
    confidenceScore: 0,
    feedback: '',
    strengths: [] as string[],
    improvements: []
  });
  session.currentQuestionIndex = nextIndex;
  await session.save();

  return res.json({
    completed: false,
    score,
    nextQuestion: {
      index: nextIndex,
      total: session.totalQuestions,
      question: nextQuestion.question,
      reply: nextQuestion.reply,
      reason: nextQuestion.reason,
      challenge: nextQuestion.challenge,
      suggestedFocus: nextQuestion.suggestedFocus
    }
  });
});

/**
 * GET /interviews/:id/result
 * Lấy kết quả chi tiết của phiên phỏng vấn đã hoàn thành
 */
router.get('/:id/result', authRequired, async (req, res) => {
  const { id } = req.params;
  const user = req.user!;

  const session = await InterviewSession.findOne({ _id: id, userId: user._id }).lean();
  if (!session) {
    return res.status(404).json({ message: 'Không tìm thấy phiên phỏng vấn.' });
  }

  return res.json({
    sessionId: id,
    status: session.status,
    industryGroup: session.industryGroup,
    industry: session.industry,
    specialization: session.specialization,
    difficulty: session.difficulty,
    topic: session.topic,
    company: session.company,
    totalQuestions: session.totalQuestions,
    language: session.language,
    overallScore: session.overallScore,
    skillRadar: session.skillRadar,
    summary: session.summary,
    overallStrengths: session.overallStrengths,
    overallImprovements: session.overallImprovements,
    xpEarned: session.xpEarned,
    answers: session.answers,
    completedAt: session.completedAt,
    createdAt: session.createdAt
  });
});

/**
 * GET /interviews/history
 * Lịch sử phỏng vấn của user
 */
router.get('/history', authRequired, async (req, res) => {
  const user = req.user!;
  const sessions = await InterviewSession.find({ userId: user._id, status: 'completed' })
    .sort({ completedAt: -1 })
    .limit(20)
    .lean();

  return res.json({
    sessions: sessions.map((s) => ({
      id: s._id.toString(),
      industry: s.industry,
      specialization: s.specialization,
      difficulty: s.difficulty,
      overallScore: s.overallScore,
      totalQuestions: s.answers.length,
      xpEarned: s.xpEarned,
      completedAt: s.completedAt,
      createdAt: s.createdAt
    }))
  });
});

export default router;
