import { Router } from 'express';
import { authRequired, adminOnly } from '../middleware/auth.js';
import { Transaction } from '../models/Transaction.js';
import { Package } from '../models/Package.js';
import { User } from '../models/User.js';
import { logger } from '../config/env.js';
import crypto from 'crypto';
import { PayOS } from '@payos/node';

const payos = new PayOS({
  clientId: '4a116cfd-d679-420d-90dd-1423b592d696',
  apiKey: 'e5ab4647-e5b8-4ffd-85c9-211108a9f622',
  checksumKey: '68cb36a1bd92a264f9e85dd2556b00076d1a0f5a70b2927ef3350c3dab1f85a1'
});

const router = Router();

// ─── Tạo giao dịch mới ─────────────────────────────────────
router.post('/create', authRequired, async (req, res) => {
  try {
    const user = req.user!;
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

    const transaction = new Transaction({
      userId: user._id,
      packageId: pkg._id,
      amount: pkg.price,
      transactionCode,
      orderCode,
      status: 'pending'
    });

    await transaction.save();

    // Call PayOS API to create payment link
    const body = {
      orderCode: orderCode,
      amount: pkg.price,
      description: `Thanh toan ${pkg.name}`.substring(0, 25), // Max 25 chars
      cancelUrl: 'http://localhost:5173/packages',
      returnUrl: 'http://localhost:5173/packages'
    };

    const paymentLinkRes = await payos.paymentRequests.create(body);

    return res.status(201).json({
      message: 'Tạo giao dịch thành công.',
      transactionCode,
      orderCode,
      amount: pkg.price,
      checkoutUrl: paymentLinkRes.checkoutUrl,
      qrCode: paymentLinkRes.qrCode,
      accountNumber: paymentLinkRes.accountNumber,
      accountName: paymentLinkRes.accountName,
      bin: paymentLinkRes.bin,
      description: paymentLinkRes.description,
      transactionId: transaction._id
    });
  } catch (error) {
    logger.error(`[transactions create] ${error}`);
    return res.status(500).json({ message: 'Lỗi khi tạo giao dịch.' });
  }
});

// Lấy lịch sử giao dịch của user hiện tại
router.get('/my-history', authRequired, async (req, res) => {
  try {
    const user = req.user!;
    const transactions = await Transaction.find({ userId: user._id })
      .populate('packageId', 'name price')
      .sort({ createdAt: -1 });
    return res.json({ transactions });
  } catch (error) {
    logger.error(`[transactions my-history] ${error}`);
    return res.status(500).json({ message: 'Lỗi khi lấy lịch sử giao dịch.' });
  }
});

// Kiểm tra trạng thái giao dịch (Polling)
router.get('/status/:code', authRequired, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ transactionCode: req.params.code }).populate('packageId');
    if (!transaction) {
      return res.status(404).json({ message: 'Không tìm thấy giao dịch.' });
    }

    // Nếu vẫn đang chờ xử lý, chủ động hỏi thẳng PayOS (giải quyết triệt để webhook trên localhost)
    if (transaction.status === 'pending') {
      try {
        const payosData = await payos.paymentRequests.get(String(transaction.orderCode));
        if (payosData) {
          if (payosData.status === 'PAID') {
            transaction.status = 'completed';
            await transaction.save();

            // Cộng lượt cho user tự động
            const dbUser = await User.findById(transaction.userId);
            if (dbUser && transaction.packageId) {
              const pkg = transaction.packageId as any;
              dbUser.remainingInterviews = (dbUser.remainingInterviews ?? 0) + pkg.interviewAttempts;
              dbUser.planLabel = pkg.name;
              await dbUser.save();
              logger.info(`[PayOS Polling] Đã chốt đơn tự động cho user ${dbUser.email} gói ${pkg.name}`);
            }
          } else if (payosData.status === 'CANCELLED') {
            transaction.status = 'cancelled';
            await transaction.save();
          }
        }
      } catch (payosErr) {
        logger.warn(`[PayOS Polling] Lỗi khi lấy thông tin giao dịch từ PayOS: ${payosErr}`);
      }
    }

    return res.json({ status: transaction.status });
  } catch (error) {
    logger.error(`[transactions status] ${error}`);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
});

// ─── Nhận Webhook từ PayOS ──────────────────────────────────────────────────
router.post('/webhook', async (req, res) => {
  try {
    // Xác thực chữ ký dữ liệu từ PayOS
    const webhookData = await payos.webhooks.verify(req.body);
    
    if (webhookData.code === '00') {
      // Tìm giao dịch qua orderCode
      const transaction = await Transaction.findOne({ orderCode: webhookData.orderCode }).populate('packageId');
      
      if (transaction && transaction.status === 'pending') {
        transaction.status = 'completed';
        await transaction.save();
        
        // Cộng lượt cho user tự động
        const dbUser = await User.findById(transaction.userId);
        if (dbUser && transaction.packageId) {
          const pkg = transaction.packageId as any;
          dbUser.remainingInterviews = (dbUser.remainingInterviews ?? 0) + pkg.interviewAttempts;
          dbUser.planLabel = pkg.name;
          await dbUser.save();
          logger.info(`[PayOS Webhook] Đã chốt đơn tự động cho user ${dbUser.email} gói ${pkg.name}`);
        }
      }
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

// ─── Admin: Duyệt giao dịch ──────────────────────────────────────────
router.post('/admin/:id/approve', authRequired, adminOnly, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('packageId');
    if (!transaction) return res.status(404).json({ message: 'Không tìm thấy giao dịch.' });

    if (transaction.status === 'completed') {
      return res.status(400).json({ message: 'Giao dịch này đã được duyệt trước đó.' });
    }

    // Đổi trạng thái
    transaction.status = 'completed';
    await transaction.save();

    // Cộng lượt cho user
    const dbUser = await User.findById(transaction.userId);
    if (dbUser && transaction.packageId) {
      const pkg = transaction.packageId as any; // populated
      dbUser.remainingInterviews = (dbUser.remainingInterviews ?? 0) + pkg.interviewAttempts;
      dbUser.planLabel = pkg.name;
      await dbUser.save();
    }

    return res.json({ message: 'Đã duyệt giao dịch thành công.' });
  } catch (error) {
    logger.error(`[transactions approve] ${error}`);
    return res.status(500).json({ message: 'Lỗi khi duyệt giao dịch.' });
  }
});

// ─── Admin: Hủy giao dịch ──────────────────────────────────────────
router.post('/admin/:id/cancel', authRequired, adminOnly, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Không tìm thấy giao dịch.' });

    if (transaction.status === 'completed') {
      return res.status(400).json({ message: 'Không thể hủy giao dịch đã hoàn thành.' });
    }

    transaction.status = 'cancelled';
    await transaction.save();

    return res.json({ message: 'Đã hủy giao dịch.' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi server.' });
  }
});

export default router;
