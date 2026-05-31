import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { InterviewSet } from '../models/InterviewSet.js';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/interview-sets
 * Danh sách interview sets với filter, search, phân trang
 */
router.get('/', async (req, res) => {
  const {
    industry,
    difficulty,
    category,
    search,
    limit = '12',
    page = '1',
    featured,
    experienceLevel,
    isFavorite
  } = req.query as Record<string, string>;

  const filter: Record<string, any> = { isPublished: true };

  if (isFavorite === 'true') {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Bạn chưa đăng nhập.' });
    }
    try {
      const token = authHeader.replace('Bearer ', '');
      const payload = jwt.verify(token, env.jwtSecret) as { sub?: string };
      const user = await User.findById(payload.sub);
      if (!user) return res.status(401).json({ message: 'Tài khoản không tồn tại.' });
      filter._id = { $in: user.favoriteInterviewSets || [] };
    } catch {
      return res.status(401).json({ message: 'Token không hợp lệ.' });
    }
  }

  if (industry) filter.industry = { $regex: industry, $options: 'i' };
  if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
    filter.difficulty = difficulty;
  }
  if (experienceLevel) {
    filter.experienceLevel = experienceLevel;
  }
  if (category && ['technical', 'behavioral', 'management', 'general'].includes(category)) {
    filter.category = category;
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  // Featured: sort by attemptCount desc, otherwise sort by createdAt desc
  const sortBy: Record<string, 1 | -1> = featured === 'true'
    ? { attemptCount: -1 }
    : { createdAt: -1 };

  const [sets, total] = await Promise.all([
    InterviewSet.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    InterviewSet.countDocuments(filter)
  ]);

  return res.json({
    sets,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    }
  });
});

/**
 * GET /api/interview-sets/stats
 * Số liệu tổng quan cho landing page
 */
router.get('/stats', async (_req, res) => {
  const [totalSets, attemptsAgg] = await Promise.all([
    InterviewSet.countDocuments({ isPublished: true }),
    InterviewSet.aggregate([
      { $group: { _id: null, total: { $sum: '$attemptCount' } } }
    ])
  ]);

  return res.json({
    totalSets,
    totalAttempts: attemptsAgg[0]?.total ?? 0,
    totalQuestions: 20000,
    totalCompanies: 129,
    rating: 4.9
  });
});

/**
 * GET /api/interview-sets/:id
 * Chi tiết 1 interview set (bao gồm jobDescription)
 */
router.get('/:id', async (req, res) => {
  const set = await InterviewSet.findById(req.params.id).lean();
  if (!set || !set.isPublished) {
    return res.status(404).json({ message: 'Không tìm thấy bộ phỏng vấn.' });
  }
  return res.json(set);
});

/**
 * POST /api/interview-sets/:id/favorite
 * Toggle favorite status
 */
router.post('/:id/favorite', authRequired, async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const setId = req.params.id;
  const isCurrentlyFavorited = user.favoriteInterviewSets?.some(id => id.toString() === setId);

  if (isCurrentlyFavorited) {
    await User.findByIdAndUpdate(user._id, {
      $pull: { favoriteInterviewSets: setId }
    });
    return res.json({ message: 'Removed from favorites', isFavorite: false });
  } else {
    await User.findByIdAndUpdate(user._id, {
      $addToSet: { favoriteInterviewSets: setId }
    });
    return res.json({ message: 'Added to favorites', isFavorite: true });
  }
});

export default router;
