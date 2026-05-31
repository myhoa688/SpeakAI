import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { Question } from '../models/Question.js';

const router = Router();

/**
 * GET /questions
 * Lấy danh sách câu hỏi với filter tùy chọn
 */
router.get('/', authRequired, async (req, res) => {
  const { industryGroup, industry, specialization, difficulty, limit = '20', page = '1' } = req.query as Record<string, string>;

  const filter: Record<string, unknown> = { isPublished: true };
  if (industryGroup) filter.industryGroup = industryGroup;
  if (industry) filter.industry = industry;
  if (specialization) filter.specialization = specialization;
  if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) filter.difficulty = difficulty;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [questions, total] = await Promise.all([
    Question.find(filter).sort({ difficulty: 1, createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    Question.countDocuments(filter)
  ]);

  return res.json({
    questions: questions.map((q) => ({
      id: q._id.toString(),
      industryGroup: q.industryGroup,
      industry: q.industry,
      specialization: q.specialization,
      question: q.question,
      guidance: q.guidance,
      sampleAnswer: q.sampleAnswer,
      difficulty: q.difficulty,
      tags: q.tags
    })),
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum)
  });
});

/**
 * GET /questions/recommendations
 * Gợi ý câu hỏi theo profile của user đang đăng nhập
 */
router.get('/recommendations', authRequired, async (req, res) => {
  const user = req.user!;

  const filter: Record<string, unknown> = { isPublished: true };

  if (user.industry) filter.industry = user.industry;
  else if (user.industryGroup) filter.industryGroup = user.industryGroup;

  // Map experienceLevel sang difficulty
  const difficultyMap: Record<string, string> = {
    fresher: 'easy',
    junior: 'easy',
    mid: 'medium',
    senior: 'hard'
  };
  const targetDifficulty = difficultyMap[user.experienceLevel ?? 'junior'] ?? 'medium';
  filter.difficulty = targetDifficulty;

  const questions = await Question.find(filter).sort({ createdAt: -1 }).limit(10).lean();

  return res.json({
    questions: questions.map((q) => ({
      id: q._id.toString(),
      industryGroup: q.industryGroup,
      industry: q.industry,
      specialization: q.specialization,
      question: q.question,
      guidance: q.guidance,
      sampleAnswer: q.sampleAnswer,
      difficulty: q.difficulty,
      tags: q.tags
    }))
  });
});

/**
 * GET /questions/industries
 * Lấy danh sách các nhóm nghề + nghề hiện có trong DB
 */
router.get('/industries', authRequired, async (_req, res) => {
  const groups = await Question.aggregate([
    { $match: { isPublished: true } },
    {
      $group: {
        _id: { industryGroup: '$industryGroup', industry: '$industry' },
        specializations: { $addToSet: '$specialization' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.industryGroup': 1, '_id.industry': 1 } }
  ]);

  // Nhóm theo industryGroup
  const result: Record<string, { industry: string; specializations: string[]; count: number }[]> = {};
  for (const g of groups) {
    const { industryGroup, industry } = g._id as { industryGroup: string; industry: string };
    if (!result[industryGroup]) result[industryGroup] = [];
    result[industryGroup].push({
      industry,
      specializations: (g.specializations as string[]).filter(Boolean).sort(),
      count: g.count as number
    });
  }

  return res.json({ industries: result });
});

/**
 * GET /questions/:id
 * Lấy chi tiết một câu hỏi
 */
router.get('/:id', authRequired, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).lean();
    if (!question) return res.status(404).json({ error: 'Không tìm thấy câu hỏi' });
    
    const relatedQuestions = await Question.find({
      industry: question.industry,
      _id: { $ne: question._id },
      isPublished: true
    }).select('question difficulty industry tags').limit(5).lean();

    return res.json({
      id: question._id.toString(),
      industryGroup: question.industryGroup,
      industry: question.industry,
      specialization: question.specialization,
      question: question.question,
      guidance: question.guidance,
      sampleAnswer: question.sampleAnswer,
      difficulty: question.difficulty,
      tags: question.tags,
      analysis: question.analysis,
      relatedQuestions: relatedQuestions.map(rq => ({
        id: rq._id.toString(),
        question: rq.question,
        difficulty: rq.difficulty
      }))
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

import { analyzeQuestion } from '../services/aiService.js';

/**
 * POST /questions/:id/analyze
 * Tạo phân tích chi tiết cho câu hỏi bằng AI
 */
router.post('/:id/analyze', authRequired, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Không tìm thấy câu hỏi' });

    // Generate new analysis
    const analysisData = await analyzeQuestion(question.question, question.industry);
    
    question.set('analysis', analysisData);
    await question.save();

    return res.json({ analysis: question.analysis });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Lỗi khi tạo phân tích' });
  }
});

export default router;
