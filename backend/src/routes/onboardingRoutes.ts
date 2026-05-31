import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { User } from '../models/User.js';

const router = Router();

/**
 * POST /users/onboarding
 * Lưu thông tin ngành nghề + kinh nghiệm, đánh dấu onboarding hoàn tất
 */
router.post('/', authRequired, async (req, res) => {
  const { industryGroup, industry, specialization, experienceLevel } = req.body as {
    industryGroup?: string;
    industry?: string;
    specialization?: string;
    experienceLevel?: string;
  };

  if (!industryGroup || !industry) {
    return res.status(400).json({ message: 'Vui lòng chọn nhóm nghề và nghề của bạn.' });
  }

  const validExperience = ['fresher', 'junior', 'mid', 'senior'];
  const normalizedExp = validExperience.includes(experienceLevel ?? '') ? experienceLevel : 'junior';

  // Tạo targetRole từ specialization hoặc industry
  const targetRole = specialization || industry;

  await User.findByIdAndUpdate(req.user!._id, {
    industryGroup: industryGroup.trim(),
    industry: industry.trim(),
    specialization: (specialization ?? '').trim(),
    experienceLevel: normalizedExp,
    targetRole: targetRole.trim(),
    onboardingCompleted: true
  });

  const updatedUser = await User.findById(req.user!._id).lean();
  if (!updatedUser) {
    return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
  }

  return res.json({ message: 'Đã hoàn tất thiết lập hồ sơ.', onboardingCompleted: true });
});

/**
 * GET /users/onboarding/status
 * Kiểm tra trạng thái onboarding của user hiện tại
 */
router.get('/status', authRequired, async (req, res) => {
  const user = await User.findById(req.user!._id).lean();
  return res.json({ onboardingCompleted: user?.onboardingCompleted ?? false });
});

export default router;
