import { Router } from 'express';
import { authRequired, adminOnly } from '../middleware/auth.js';
import { Transaction } from '../models/Transaction.js';
import { Package } from '../models/Package.js';
import { User } from '../models/User.js';
import { logger } from '../config/env.js';
import { PayOS } from '@payos/node';

const payos = new PayOS({
  clientId: '4a116cfd-d679-420d-90dd-1423b592d696',
  apiKey: 'e5ab4647-e5b8-4ffd-85c9-211108a9f622',
  checksumKey: '68cb36a1bd92a264f9e85dd2556b00076d1a0f5a70b2927ef3350c3dab1f85a1'
});

const router = Router();

// ─── Tạo yêu cầu thanh toán (KHÔNG lưu DB) ────────────────────────────────────
// Chỉ tạo link PayOS và trả về orderCode cho frontend. DB chỉ được ghi khi thanh toán thành công.
router.post('/create', authRequired, async (req, res) => {
  try {
    const { packageId } = req.body as { packageId: string };

    if (!packageId) {
      return res.status(400).json({ message: 'Vui lòng chọn gói dịch vụ.' });
    }

    const pkg = await Package.findById(packageId);
    if (!pkg || !pkg.active) {
      return res.status(404).json({ message: 'Gói dịch vụ không tồn tại.' });
    }

    // Generate numeric orderCode for PayOS (max 53 bits)
    const orderCode = Number(String(Date.now()).slice(-9) + Math.floor(Math.random() * 100));
    const transactionCode = `PAY${orderCode}`;

    // Gọi PayOS tạo link thanh toán - KHÔNG lưu DB ở bước này
    const paymentLinkRes = await payos.paymentRequests.create({
      orderCode,
      amount: pkg.price,
      description: `Thanh toan ${pkg.name}`.substring(0, 25),
      cancelUrl: 'http://localhost:5173/packages',
      returnUrl: 'http://localhost:5173/packages'
    });

    return res.status(201).json({
      message: 'Tạo link thanh toán thành công.',
      transactionCode,
      orderCode,
      amount: pkg.price,
      packageId: pkg._id,
      checkoutUrl: paymentLinkRes.checkoutUrl,
      qrCode: paymentLinkRes.qrCode,
      accountNumber: paymentLinkRes.accountNumber,
      accountName: paymentLinkRes.accountName,
      bin: paymentLinkRes.bin,
      description: paymentLinkRes.description
    });
  } catch (error) {
    logger.error(`[transactions create] ${error}`);
    return res.status(500).json({ message: 'Lỗi khi tạo giao dịch.' });
  }
});

// ─── Lấy lịch sử giao dịch của user hiện tại (chỉ giao dịch đã hoàn thành) ───
router.get('/my-history', authRequired, async (req, res) => {
  try {
    const user = req.user!;
    const transactions = await Transaction.find({ userId: user._id, status: 'completed' })
      .populate('packageId', 'name price')
      .sort({ createdAt: -1 });
    return res.json({ transactions });
  } catch (error) {
    logger.error(`[transactions my-history] ${error}`);
    return res.status(500).json({ message: 'Lỗi khi lấy lịch sử giao dịch.' });
  }
});

// ─── Kiểm tra trạng thái giao dịch (Polling từ Frontend) ──────────────────────
// Frontend gửi orderCode + packageId lên. Backend hỏi thẳng PayOS.
// Nếu PAID: lưu DB ngay lập tức và cộng lượt cho user.
router.post('/verify', authRequired, async (req, res) => {
  try {
    const user = req.user!;
    const { orderCode, packageId, transactionCode } = req.body as {
      orderCode: number;
      packageId: string;
      transactionCode: string;
    };

    if (!orderCode || !packageId || !transactionCode) {
      return res.status(400).json({ message: 'Thiếu thông tin xác minh.' });
    }

    // Kiểm tra xem giao dịch đã được ghi DB chưa (tránh cộng lượt 2 lần)
    const existing = await Transaction.findOne({ orderCode });
    if (existing && existing.status === 'completed') {
      return res.json({ status: 'completed' });
    }

    // Hỏi thẳng PayOS
    let payosStatus = 'pending';
    try {
      const payosData = await payos.paymentRequests.get(String(orderCode));
      if (payosData?.status === 'PAID') {
        payosStatus = 'PAID';
      } else if (payosData?.status === 'CANCELLED') {
        payosStatus = 'CANCELLED';
      }
    } catch (payosErr) {
      logger.warn(`[PayOS Verify] Lỗi khi truy vấn PayOS: ${payosErr}`);
      return res.json({ status: 'pending' });
    }

    if (payosStatus === 'PAID') {
      const pkg = await Package.findById(packageId);
      if (!pkg) {
        return res.status(404).json({ message: 'Gói dịch vụ không tồn tại.' });
      }

      // Lưu giao dịch vào DB - chỉ tại đây, sau khi đã xác nhận thanh toán thành công
      const transaction = new Transaction({
        userId: user._id,
        packageId: pkg._id,
        amount: pkg.price,
        transactionCode,
        orderCode,
        status: 'completed'
      });
      await transaction.save();

      // Cộng lượt phỏng vấn cho user
      const dbUser = await User.findById(user._id);
      if (dbUser) {
        dbUser.remainingInterviews = (dbUser.remainingInterviews ?? 0) + pkg.interviewAttempts;
        dbUser.planLabel = pkg.name;
        await dbUser.save();
        logger.info(`[PayOS Verify] Đã chốt đơn tự động cho user ${dbUser.email} gói ${pkg.name}`);
      }

      return res.json({ status: 'completed' });
    }

    return res.json({ status: payosStatus === 'CANCELLED' ? 'cancelled' : 'pending' });
  } catch (error) {
    logger.error(`[transactions verify] ${error}`);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
});

// ─── Nhận Webhook từ PayOS (khi deploy production, PayOS sẽ tự gọi) ───────────
router.post('/webhook', async (req, res) => {
  try {
    const webhookData = await payos.webhooks.verify(req.body);

    if (webhookData.code === '00') {
      // Kiểm tra giao dịch đã lưu chưa (tránh duplicate)
      const existing = await Transaction.findOne({ orderCode: webhookData.orderCode });
      if (existing && existing.status === 'completed') {
        return res.json({ success: true });
      }

      // Tìm packageId từ description hoặc metadata của PayOS nếu có
      // Webhook chỉ hoạt động trên production, polling /verify sẽ xử lý trên localhost
      logger.info(`[PayOS Webhook] Nhận webhook orderCode: ${webhookData.orderCode}`);
    }

    res.json({ success: true });
  } catch (error) {
    logger.error(`[PayOS Webhook Error] ${error}`);
    res.status(400).json({ success: false });
  }
});

// ─── Admin: Lấy danh sách giao dịch ──────────────────────────────────────────
router.get('/admin/list', authRequired, adminOnly, async (_req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('userId', 'name email')
      .populate('packageId', 'name')
      .sort({ createdAt: -1 });
    return res.json({ transactions });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách.' });
  }
});

export default router;
