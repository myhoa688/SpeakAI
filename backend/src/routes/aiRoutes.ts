import multer from 'multer';
import { Router } from 'express';
import fs from 'fs';
import { randomUUID } from 'crypto';
import path from 'path';
import { CV } from '../models/CV.js';
import { logger } from '../config/env.js';

import { authRequired } from '../middleware/auth.js';
import {
  analyzeCv,
  analyzePractice,
  createRealtimePracticeSession,
  extractResumeText,
  generateInterviewQuestion
} from '../services/aiService.js';
import {
  buildPracticeDraft,
  getPracticePassThreshold,
  signPracticeDraft
} from '../utils/practiceDraft.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

const parseVolumeSamples = (value: unknown) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }

  return [];
};

const normalizeDifficulty = (value: unknown): 'easy' | 'medium' | 'hard' => {
  if (value === 'easy' || value === 'medium' || value === 'hard') {
    return value;
  }

  return 'medium';
};

const normalizePracticeType = (value: unknown): 'presentation' | 'interview' =>
  value === 'presentation' ? 'presentation' : 'interview';

router.post('/cv-analysis', authRequired, upload.single('cv'), async (req, res) => {
  const targetRole = String(req.body.targetRole ?? req.user?.targetRole ?? '');
  const manualResumeText = String(req.body.resumeText ?? '').trim();

  let resumeText = manualResumeText;
  if (req.body.cvId) {
    const cv = await CV.findById(req.body.cvId);
    if (cv) resumeText = cv.extractedText;
  } else if (req.file) {
    resumeText = await extractResumeText({
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      buffer: req.file.buffer
    });
  }

  if (!resumeText) {
    return res.status(400).json({ message: 'Vui lòng tải CV lên hoặc nhập nội dung CV.' });
  }

  const analysis = await analyzeCv({ resumeText, targetRole });
  const notice = String((analysis as { warningMessage?: string }).warningMessage ?? '').trim();

  return res.json({ analysis, extractedText: resumeText, notice });
});

router.post('/practice-analysis', authRequired, upload.single('audio'), async (req, res) => {
  const user = req.user!;
  const practiceType = normalizePracticeType(req.body.practiceType);
  const difficulty = normalizeDifficulty(req.body.difficulty);
  const topic = String(req.body.topic ?? 'Luyện tập SpeakAI').trim();
  const transcript = String(req.body.transcript ?? '').trim();
  const durationSeconds = Math.max(0, Number(req.body.durationSeconds ?? 0));
  const language = String(req.body.language ?? 'vi').trim();
  const volumeSamples = parseVolumeSamples(req.body.volumeSamples);
  const questionId = req.body.questionId;

  let questionContext = '';
  if (questionId) {
    try {
      const Question = (await import('../models/Question.js')).Question;
      const question = await Question.findById(questionId);
      if (question && question.analysis) {
        const tips = question.analysis.importantTips?.map(t => `- ${t.content}`).join('\n') || '';
        const points = question.analysis.answerStructure?.points?.map(p => `- ${p}`).join('\n') || '';
        questionContext = `Gợi ý quan trọng:\n${tips}\n\nCác ý chính cần có:\n${points}`;
      }
    } catch (e) {
      // Ignore if question is not found
    }
  }

  const analysis = await analyzePractice({
    practiceType,
    difficulty,
    transcript,
    durationSeconds,
    volumeSamples,
    language,
    topic,
    targetRole: user.targetRole ?? '',
    profileSummary: user.bio ?? '',
    questionContext,
    questionId,
    audioFile: req.file
      ? {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          buffer: req.file.buffer
        }
      : undefined
  });

  const hasTranscript = Boolean(String(analysis.transcript ?? '').trim());
  const hasRecordedAudioEvidence = Boolean(req.file) && (durationSeconds >= 12 || volumeSamples.length >= 8);
  const canSave = hasTranscript || hasRecordedAudioEvidence;
  const notice =
    String((analysis as { warningMessage?: string }).warningMessage ?? '').trim() ||
    (canSave && !hasTranscript
      ? 'Đã tạo bản phân tích từ tín hiệu âm thanh. Bạn vẫn có thể lưu phiên, nhưng nên dán transcript để nhận nhận xét nội dung sâu hơn.'
      : canSave
        ? ''
        : 'Đã tạo bản phân tích cơ bản từ file ghi âm. Hãy dán transcript hoặc thử lại để có thể lưu phiên.');
  let audioUrl = '';
  if (req.file) {
    try {
      const uploadDir = path.join(process.cwd(), 'uploads', 'audio');
      fs.mkdirSync(uploadDir, { recursive: true });
      const filename = `${randomUUID()}.webm`;
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);
      audioUrl = `/uploads/audio/${filename}`;
    } catch (err) {
      logger.error(`Error saving audio file: ${err}`);
    }
  }

  const draft = canSave
    ? buildPracticeDraft({
        userId: user._id.toString(),
        questionId: questionId,
        practiceType,
        difficulty,
        topic,
        durationSeconds,
        language,
        audioUrl,
        analysis
      })
    : null;

  return res.json({
    analysis,
    analysisToken: draft ? signPracticeDraft(draft) : '',
    outcome: draft
      ? {
          passed: draft.passed,
          label: draft.passed ? 'Đạt' : 'Chưa đạt',
          passThreshold: getPracticePassThreshold()
        }
      : null,
    notice
  });
});

router.post('/interview/next-question', authRequired, async (req, res) => {
  const { difficulty, history, targetRole, cvSummary, topic } = req.body as {
    difficulty?: 'easy' | 'medium' | 'hard';
    history?: Array<{ question: string; answer: string }>;
    targetRole?: string;
    cvSummary?: string;
    topic?: string;
  };

  const nextQuestion = await generateInterviewQuestion({
    difficulty: normalizeDifficulty(difficulty),
    history: Array.isArray(history) ? history : [],
    targetRole: targetRole ?? req.user?.targetRole ?? '',
    cvSummary,
    topic
  });

  return res.json({ nextQuestion });
});

router.post('/realtime/token', authRequired, async (req, res) => {
  const session = await createRealtimePracticeSession({
    practiceType: normalizePracticeType(req.body.practiceType),
    difficulty: normalizeDifficulty(req.body.difficulty),
    topic: String(req.body.topic ?? 'Luyện tập hội thoại SpeakAI').trim() || 'Luyện tập hội thoại SpeakAI',
    targetRole: req.user?.targetRole ?? '',
    profileSummary: req.user?.bio ?? '',
    userName: req.user?.name ?? ''
  });

  return res.json({ session });
});

router.post('/tts', authRequired, async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ message: 'Vui lòng cung cấp văn bản cần đọc.' });
  }

  try {
    const { generateSpeech } = await import('../services/aiService.js');
    const audioBuffer = await generateSpeech(text);
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=31536000'
    });
    return res.send(audioBuffer);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Lỗi server khi tạo âm thanh.' });
  }
});

export default router;
