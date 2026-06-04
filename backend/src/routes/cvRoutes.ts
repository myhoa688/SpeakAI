import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { authRequired } from '../middleware/auth.js';
import { CV } from '../models/CV.js';
import { extractResumeText } from '../services/aiService.js';
import { logger } from '../config/env.js';

const router = Router();

// Setup disk storage for CVs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'cvs');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/cvs
router.get('/', authRequired, async (req, res) => {
  try {
    const user = req.user!;
    const cvs = await CV.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
    return res.json({ cvs });
  } catch (error) {
    logger.error(`[GET /cvs] ${error}`);
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách CV.' });
  }
});

// POST /api/cvs/upload
router.post('/upload', authRequired, upload.single('cv'), async (req, res) => {
  try {
    const user = req.user!;
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file CV.' });
    }

    // Extract text for AI usage
    let cvText = '';
    try {
      const buffer = fs.readFileSync(req.file.path);
      cvText = await extractResumeText({
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        buffer: buffer
      });
    } catch (err) {
      logger.error(`[POST /cvs/upload] extractResumeText failed: ${err}`);
      // Continue even if text extraction fails, user might want to re-upload or it's a weird format
    }

    // Check if user has any CVs to set default
    const count = await CV.countDocuments({ userId: user._id });
    const isDefault = count === 0;

    const fileUrl = `/uploads/cvs/${req.file.filename}`;

    const newCv = new CV({
      userId: user._id,
      fileName: req.file.originalname,
      fileUrl: fileUrl,
      extractedText: cvText,
      isDefault
    });

    await newCv.save();

    // Lấy thông tin JSON từ cvText để upsert vào LearnerProfile
    if (cvText) {
      try {
        const { extractLearnerProfile } = await import('../services/aiService.js');
        const { LearnerProfile } = await import('../models/LearnerProfile.js');
        const profileData = await extractLearnerProfile(cvText);
        if (profileData) {
          await LearnerProfile.findOneAndUpdate(
            { userId: user._id },
            { 
              targetRole: profileData.targetRole || '',
              skills: profileData.skills || [],
              experience: profileData.experience || [],
              strengths: profileData.strengths || [],
              weaknesses: profileData.weaknesses || [],
              goals: profileData.goals || []
            },
            { upsert: true, new: true }
          );
        }
      } catch (err) {
        logger.error(`[POST /cvs/upload] Failed to upsert LearnerProfile: ${err}`);
      }
    }

    return res.status(201).json({ message: 'Tải lên CV thành công', cv: newCv });
  } catch (error) {
    logger.error(`[POST /cvs/upload] ${error}`);
    return res.status(500).json({ message: 'Lỗi khi tải lên CV.' });
  }
});

// PUT /api/cvs/:id/default
router.put('/:id/default', authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const cv = await CV.findOne({ _id: id, userId: user._id });
    if (!cv) return res.status(404).json({ message: 'Không tìm thấy CV.' });

    // Unset others
    await CV.updateMany({ userId: user._id, _id: { $ne: id } }, { isDefault: false });
    
    // Set this
    cv.isDefault = true;
    await cv.save();

    return res.json({ message: 'Đã đặt CV làm mặc định', cv });
  } catch (error) {
    logger.error(`[PUT /cvs/:id/default] ${error}`);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
});

// DELETE /api/cvs/:id
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const cv = await CV.findOne({ _id: id, userId: user._id });
    if (!cv) return res.status(404).json({ message: 'Không tìm thấy CV.' });

    // Remove file
    try {
      const filePath = path.join(process.cwd(), cv.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      logger.error(`[DELETE /cvs/:id] file unlink failed: ${e}`);
    }

    await CV.deleteOne({ _id: cv._id });

    // If it was default, set another one as default
    if (cv.isDefault) {
      const anotherCv = await CV.findOne({ userId: user._id });
      if (anotherCv) {
        anotherCv.isDefault = true;
        await anotherCv.save();
      }
    }

    return res.json({ message: 'Đã xóa CV thành công' });
  } catch (error) {
    logger.error(`[DELETE /cvs/:id] ${error}`);
    return res.status(500).json({ message: 'Lỗi server.' });
  }
});

export default router;
