import { Router } from 'express';
import { authRequired, adminOnly } from '../middleware/auth.js';
import { Package } from '../models/Package.js';
import { User } from '../models/User.js';
import { logger } from '../config/env.js';

const router = Router();

// ─── Public: Lấy danh sách gói dịch vụ ─────────────────────────────────────

// Global promotion end time (in-memory for demo purposes)
let globalPromotionEndTime: Date | null = new Date(Date.now() + 24 * 60 * 60 * 1000); // Default 1 day from now

router.get('/promotion', async (_req, res) => {
  return res.json({ endTime: globalPromotionEndTime });
});

router.get('/', async (_req, res) => {
  try {
    const packages = await Package.find({ active: true }).sort({ sortOrder: 1, price: 1 });
    return res.json({ packages });
  } catch (error) {
    logger.error(`[packages GET] ${error}`);
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách gói dịch vụ.' });
  }
});

// ─── Auth: Nâng cấp gói (giả lập thanh toán) ─────────────────────────────────

router.post('/upgrade', authRequired, async (req, res) => {
  try {
    const user = req.user!;
    const { packageId } = req.body as { packageId: string };

    if (!packageId) {
      return res.status(400).json({ message: 'Vui lòng chọn gói dịch vụ.' });
    }

    const pkg = await Package.findById(packageId);
    if (!pkg || !pkg.active) {
      return res.status(404).json({ message: 'Gói dịch vụ không tồn tại hoặc đã bị vô hiệu hóa.' });
    }

    const dbUser = await User.findById(user._id);
    if (!dbUser) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });

    const previousRemaining = dbUser.remainingInterviews ?? 0;
    dbUser.remainingInterviews = previousRemaining + pkg.interviewAttempts;
    dbUser.planLabel = pkg.name;
    await dbUser.save();

    logger.info(`[payment] User ${dbUser.email} upgraded to "${pkg.name}" (+${pkg.interviewAttempts} interviews)`);

    return res.json({
      message: `Thanh toán thành công! Đã cộng thêm ${pkg.interviewAttempts} lượt phỏng vấn.`,
      remainingInterviews: dbUser.remainingInterviews,
      planLabel: dbUser.planLabel
    });
  } catch (error) {
    logger.error(`[packages upgrade] ${error}`);
    return res.status(500).json({ message: 'Lỗi khi xử lý thanh toán.' });
  }
});

// ─── Admin: CRUD Packages ─────────────────────────────────────────────────────

router.get('/admin/list', authRequired, adminOnly, async (_req, res) => {
  try {
    const packages = await Package.find().sort({ sortOrder: 1, createdAt: -1 });
    return res.json({ packages });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách.' });
  }
});

router.post('/admin/create', authRequired, adminOnly, async (req, res) => {
  try {
    const pkg = new Package(req.body);
    await pkg.save();
    return res.status(201).json({ message: 'Tạo gói thành công.', package: pkg });
  } catch (error) {
    logger.error(`[packages create] ${error}`);
    return res.status(400).json({ message: 'Dữ liệu không hợp lệ.' });
  }
});

router.put('/admin/:id', authRequired, adminOnly, async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!pkg) return res.status(404).json({ message: 'Không tìm thấy gói dịch vụ.' });
    return res.json({ message: 'Cập nhật thành công.', package: pkg });
  } catch (error) {
    return res.status(400).json({ message: 'Dữ liệu không hợp lệ.' });
  }
});

router.delete('/admin/:id', authRequired, adminOnly, async (req, res) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Không tìm thấy gói dịch vụ.' });
    return res.json({ message: 'Xóa gói thành công.' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi xóa gói.' });
  }
});

router.post('/admin/promotion', authRequired, adminOnly, async (req, res) => {
  try {
    const { endTime } = req.body;
    globalPromotionEndTime = endTime ? new Date(endTime) : null;
    return res.json({ message: 'Cập nhật thời gian kết thúc khuyến mãi thành công.', endTime: globalPromotionEndTime });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi cập nhật thời gian.' });
  }
});

export default router;
