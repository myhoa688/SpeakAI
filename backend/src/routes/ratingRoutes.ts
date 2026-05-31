import { Router } from 'express';
import { Rating } from '../models/Rating.js';
import { adminOnly, authRequired } from '../middleware/auth.js';

const router = Router();

// [POST] /api/ratings - Create a rating (User)
router.post('/', authRequired, async (req, res) => {
  try {
    const { sessionType, sessionId, score, comment } = req.body;
    if (!sessionType || !sessionId || typeof score !== 'number') {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const rating = new Rating({
      user: req.user!._id,
      sessionType,
      sessionId,
      score,
      comment
    });

    await rating.save();
    return res.status(201).json({ message: 'Gửi đánh giá thành công', rating });
  } catch (error) {
    console.error('Error creating rating:', error);
    return res.status(500).json({ message: 'Lỗi server khi lưu đánh giá' });
  }
});

// [GET] /api/ratings/admin - Get all ratings (Admin)
router.get('/admin', authRequired, adminOnly, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1')));
    const limit = Math.min(100, parseInt(String(req.query.limit ?? '30')));
    const skip = (page - 1) * limit;

    const [ratings, total] = await Promise.all([
      Rating.find()
        .populate('user', 'name email avatarUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Rating.countDocuments()
    ]);

    return res.json({
      ratings,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching admin ratings:', error);
    return res.status(500).json({ message: 'Lỗi server khi tải đánh giá' });
  }
});

export default router;
