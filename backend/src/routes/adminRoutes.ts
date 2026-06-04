import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek.js';
import { Router } from 'express';

import { adminOnly, authRequired } from '../middleware/auth.js';
import { InterviewSession } from '../models/InterviewSession.js';
import { InterviewSet } from '../models/InterviewSet.js';
import { PracticeSession } from '../models/PracticeSession.js';
import { Question } from '../models/Question.js';
import { User } from '../models/User.js';
import { canDisableUser } from '../services/bootstrapService.js';
import { isRootAdmin } from '../utils/auth.js';
import { getWeekKey } from '../utils/progression.js';
import { generateInterviewSetQuestions } from '../services/jdParserService.js';

dayjs.extend(isoWeek);

const router = Router();

// ─── Overview ────────────────────────────────────────────────────────────────

router.get('/overview', authRequired, adminOnly, async (_req, res) => {
  const startOfWeek = dayjs().startOf('isoWeek').toDate();
  const currentWeek = getWeekKey();

  const [usersCount, adminsCount, disabledUsersCount, sessionsThisWeek, interviewSessionsThisWeek,
    questionsCount, interviewSetsCount, topUsers, recentUsers, recentSessions] =
    await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ isDisabled: true }),
      PracticeSession.countDocuments({ createdAt: { $gte: startOfWeek } }),
      InterviewSession.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Question.countDocuments(),
      InterviewSet.countDocuments(),
      User.find({ role: 'user', weeklyBucket: currentWeek }).sort({ weeklyXp: -1, totalXp: -1 }).limit(5),
      User.find().sort({ createdAt: -1 }).limit(5),
      PracticeSession.find().populate('userId', 'name email').sort({ createdAt: -1 }).limit(8)
    ]);

  return res.json({
    stats: {
      usersCount,
      adminsCount,
      disabledUsersCount,
      sessionsThisWeek: sessionsThisWeek + interviewSessionsThisWeek,
      interviewSessionsThisWeek,
      questionsCount,
      interviewSetsCount
    },
    topUsers: topUsers.map((user, index) => ({
      rank: index + 1,
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      weeklyXp: user.weeklyXp,
      streak: user.streak,
      energy: user.energy,
      isDisabled: user.isDisabled
    })),
    recentUsers: recentUsers.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      totalXp: user.totalXp,
      isDisabled: user.isDisabled,
      isRootAdmin: isRootAdmin(user)
    })),
    recentSessions: recentSessions.map((session: any) => ({
      id: session._id.toString(),
      practiceType: session.practiceType,
      topic: session.topic,
      user: session.userId,
      totalScore: session.totalScore,
      xpEarned: session.xpEarned,
      createdAt: session.createdAt
    }))
  });
});

// ─── Users ───────────────────────────────────────────────────────────────────

router.get('/users', authRequired, adminOnly, async (_req, res) => {
  const currentWeek = getWeekKey();
  const users = await User.find().sort({ createdAt: -1 }).limit(200);
  return res.json({
    users: users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      streak: user.streak,
      totalXp: user.totalXp,
      weeklyXp: user.weeklyBucket === currentWeek ? user.weeklyXp : 0,
      energy: user.energy,
      targetRole: user.targetRole,
      createdAt: user.createdAt,
      isDisabled: user.isDisabled,
      disabledAt: user.disabledAt,
      disabledReason: user.disabledReason,
      isRootAdmin: isRootAdmin(user)
    }))
  });
});

router.patch('/users/:userId/status', authRequired, adminOnly, async (req, res) => {
  const actor = req.user!;
  const { isDisabled, reason } = req.body as { isDisabled?: boolean; reason?: string };

  if (typeof isDisabled !== 'boolean') {
    return res.status(400).json({ message: 'Vui lòng truyền trạng thái vô hiệu hóa hợp lệ.' });
  }

  const targetUser = await User.findById(req.params.userId);
  if (!targetUser) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });

  if (!canDisableUser(targetUser.email)) {
    return res.status(400).json({ message: 'Không thể vô hiệu hóa tài khoản quản trị viên gốc.' });
  }

  if (targetUser._id.toString() === actor._id.toString()) {
    return res.status(400).json({ message: 'Bạn không thể tự vô hiệu hóa chính mình.' });
  }

  targetUser.isDisabled = isDisabled;
  targetUser.disabledAt = isDisabled ? new Date() : null;
  targetUser.disabledReason = isDisabled ? String(reason ?? '').trim() : '';
  targetUser.disabledByEmail = isDisabled ? actor.email : '';
  await targetUser.save();

  return res.json({
    message: isDisabled ? 'Đã vô hiệu hóa tài khoản.' : 'Đã kích hoạt lại tài khoản.',
    user: {
      id: targetUser._id.toString(),
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      isDisabled: targetUser.isDisabled,
      isRootAdmin: isRootAdmin(targetUser)
    }
  });
});

router.patch('/users/:userId/role', authRequired, adminOnly, async (req, res) => {
  const { role } = req.body as { role?: string };
  if (!['admin', 'user'].includes(role ?? '')) {
    return res.status(400).json({ message: 'Role không hợp lệ.' });
  }

  const targetUser = await User.findById(req.params.userId);
  if (!targetUser) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });

  if (isRootAdmin(targetUser)) {
    return res.status(400).json({ message: 'Không thể thay đổi role của admin gốc.' });
  }

  targetUser.role = role as 'admin' | 'user';
  await targetUser.save();

  return res.json({ message: 'Cập nhật role thành công.', role: targetUser.role });
});

// ─── Practice Sessions ────────────────────────────────────────────────────────

router.get('/sessions', authRequired, adminOnly, async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? '1')));
  const limit = Math.min(100, parseInt(String(req.query.limit ?? '50')));
  const skip = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    PracticeSession.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    PracticeSession.countDocuments()
  ]);

  return res.json({
    sessions: sessions.map((s: any) => ({
      id: s._id.toString(),
      practiceType: s.practiceType,
      topic: s.topic,
      difficulty: s.difficulty,
      totalScore: s.totalScore,
      xpEarned: s.xpEarned,
      passed: s.passed,
      durationSeconds: s.durationSeconds,
      language: s.language,
      createdAt: s.createdAt,
      user: s.userId
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit)
  });
});

// ─── Interview Sessions ───────────────────────────────────────────────────────

router.get('/interview-sessions', authRequired, adminOnly, async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? '1')));
  const limit = Math.min(100, parseInt(String(req.query.limit ?? '50')));
  const skip = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    InterviewSession.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    InterviewSession.countDocuments()
  ]);

  return res.json({
    sessions: sessions.map((s: any) => ({
      id: s._id.toString(),
      status: s.status,
      topic: s.topic,
      company: s.company,
      industry: s.industry,
      difficulty: s.difficulty,
      overallScore: s.overallScore,
      totalQuestions: s.totalQuestions,
      xpEarned: s.xpEarned,
      language: s.language,
      createdAt: s.createdAt,
      completedAt: s.completedAt,
      user: s.userId
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit)
  });
});

router.get('/interview-sessions/:id', authRequired, adminOnly, async (req, res) => {
  const session = await InterviewSession.findById(req.params.id).populate('userId', 'name email');
  if (!session) return res.status(404).json({ message: 'Không tìm thấy phiên phỏng vấn.' });
  return res.json(session);
});

// ─── Questions CRUD ───────────────────────────────────────────────────────────

router.get('/questions', authRequired, adminOnly, async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? '1')));
  const limit = Math.min(100, parseInt(String(req.query.limit ?? '50')));
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = {};
  if (req.query.industry) filter.industry = req.query.industry;
  if (req.query.difficulty) filter.difficulty = req.query.difficulty;
  if (req.query.isPublished !== undefined) filter.isPublished = req.query.isPublished === 'true';
  if (req.query.search) filter.question = { $regex: req.query.search, $options: 'i' };

  const [questions, total] = await Promise.all([
    Question.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Question.countDocuments(filter)
  ]);

  return res.json({ questions, total, page, totalPages: Math.ceil(total / limit) });
});

router.post('/questions', authRequired, adminOnly, async (req, res) => {
  const question = new Question(req.body);
  await question.save();
  return res.status(201).json({ message: 'Tạo câu hỏi thành công.', question });
});

router.put('/questions/:id', authRequired, adminOnly, async (req, res) => {
  const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!question) return res.status(404).json({ message: 'Không tìm thấy câu hỏi.' });
  return res.json({ message: 'Cập nhật thành công.', question });
});

router.patch('/questions/:id/publish', authRequired, adminOnly, async (req, res) => {
  const { isPublished } = req.body as { isPublished: boolean };
  const question = await Question.findByIdAndUpdate(req.params.id, { isPublished }, { new: true });
  if (!question) return res.status(404).json({ message: 'Không tìm thấy câu hỏi.' });
  return res.json({ message: 'Cập nhật trạng thái thành công.', isPublished: question.isPublished });
});

router.delete('/questions/:id', authRequired, adminOnly, async (req, res) => {
  const question = await Question.findByIdAndDelete(req.params.id);
  if (!question) return res.status(404).json({ message: 'Không tìm thấy câu hỏi.' });
  return res.json({ message: 'Xóa câu hỏi thành công.' });
});

// ─── Interview Sets CRUD ──────────────────────────────────────────────────────

router.get('/interview-sets', authRequired, adminOnly, async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? '1')));
  const limit = Math.min(100, parseInt(String(req.query.limit ?? '50')));
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = {};
  if (req.query.industry) filter.industry = req.query.industry;
  if (req.query.difficulty) filter.difficulty = req.query.difficulty;
  if (req.query.isPublished !== undefined) filter.isPublished = req.query.isPublished === 'true';
  if (req.query.search) filter.title = { $regex: req.query.search, $options: 'i' };

  const [sets, total] = await Promise.all([
    InterviewSet.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    InterviewSet.countDocuments(filter)
  ]);

  return res.json({ sets, total, page, totalPages: Math.ceil(total / limit) });
});

router.post('/interview-sets', authRequired, adminOnly, async (req, res) => {
  const set = new InterviewSet(req.body);
  await set.save();
  return res.status(201).json({ message: 'Tạo bộ đề thành công.', set });
});

router.post('/interview-sets/generate-from-jd', authRequired, adminOnly, async (req, res) => {
  const { jdText, company, title, industry, experienceLevel, difficulty, questionCount } = req.body;
  if (!jdText || !company || !title) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (jdText, company, title).' });
  }

  try {
    const generatedCount = parseInt(questionCount) || 12;
    const diff = difficulty || 'medium';
    const ind = industry || 'Khác';

    // 1. Generate questions via AI
    const generatedQuestions = await generateInterviewSetQuestions(jdText, company, title, ind, diff, generatedCount);

    if (!generatedQuestions || generatedQuestions.length === 0) {
      return res.status(500).json({ message: 'AI không thể sinh câu hỏi. Vui lòng thử lại.' });
    }

    // 2. Format and Insert to Question DB
    const questionsToInsert = generatedQuestions.map((q: any) => ({
      userId: req.user!._id,
      industryGroup: ind,
      industry: ind,
      specialization: title,
      question: q.question,
      guidance: q.guidance,
      sampleAnswer: q.sampleAnswer,
      difficulty: q.difficulty || diff,
      tags: q.tags || [],
      isPublished: true, // Auto publish generated questions
      analysis: q.analysis || {}
    }));

    const insertedQuestions = await Question.insertMany(questionsToInsert);
    const questionIds = insertedQuestions.map(q => q._id);

    // 3. Create InterviewSet
    const interviewSet = new InterviewSet({
      title: `Phỏng vấn vị trí ${title} tại ${company}`,
      company,
      industry: ind,
      category: 'general',
      difficulty: diff,
      questionCount: insertedQuestions.length,
      durationMinutes: insertedQuestions.length * 3, // Roughly 3 mins per question
      experienceLevel: experienceLevel || 'junior',
      jobDescription: jdText,
      tags: [company, title, ind].filter(Boolean),
      isPublished: true,
      questionIds
    });

    await interviewSet.save();

    return res.status(201).json({
      message: 'Tạo bộ phỏng vấn từ JD thành công.',
      interviewSet,
      questions: insertedQuestions
    });
  } catch (error) {
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Đã có lỗi xảy ra.' });
  }
});

router.put('/interview-sets/:id', authRequired, adminOnly, async (req, res) => {
  const set = await InterviewSet.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!set) return res.status(404).json({ message: 'Không tìm thấy bộ đề.' });
  return res.json({ message: 'Cập nhật thành công.', set });
});

router.patch('/interview-sets/:id/publish', authRequired, adminOnly, async (req, res) => {
  const { isPublished } = req.body as { isPublished: boolean };
  const set = await InterviewSet.findByIdAndUpdate(req.params.id, { isPublished }, { new: true });
  if (!set) return res.status(404).json({ message: 'Không tìm thấy bộ đề.' });
  return res.json({ message: 'Cập nhật trạng thái thành công.', isPublished: set.isPublished });
});

router.delete('/interview-sets/:id', authRequired, adminOnly, async (req, res) => {
  const set = await InterviewSet.findByIdAndDelete(req.params.id);
  if (!set) return res.status(404).json({ message: 'Không tìm thấy bộ đề.' });
  return res.json({ message: 'Xóa bộ đề thành công.' });
});

// ─── Analytics ────────────────────────────────────────────────────────────────

router.get('/analytics', authRequired, adminOnly, async (_req, res) => {
  const now = dayjs();
  const last7Days = Array.from({ length: 7 }, (_, i) => now.subtract(6 - i, 'day'));

  // Daily registrations & sessions for last 7 days
  const [dailyRegistrations, dailySessions, dailyInterviews] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: last7Days[0].startOf('day').toDate() } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }
    ]),
    PracticeSession.aggregate([
      { $match: { createdAt: { $gte: last7Days[0].startOf('day').toDate() } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, avgScore: { $avg: '$totalScore' } } }
    ]),
    InterviewSession.aggregate([
      { $match: { createdAt: { $gte: last7Days[0].startOf('day').toDate() }, status: 'completed' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, avgScore: { $avg: '$overallScore' } } }
    ])
  ]);

  const regMap = Object.fromEntries(dailyRegistrations.map((d: any) => [d._id, d.count]));
  const sessMap = Object.fromEntries(dailySessions.map((d: any) => [d._id, { count: d.count, avgScore: Math.round(d.avgScore ?? 0) }]));
  const intMap = Object.fromEntries(dailyInterviews.map((d: any) => [d._id, { count: d.count, avgScore: Math.round(d.avgScore ?? 0) }]));

  const daily = last7Days.map((d) => {
    const key = d.format('YYYY-MM-DD');
    return {
      date: key,
      label: d.format('DD/MM'),
      registrations: regMap[key] ?? 0,
      practiceSessions: sessMap[key]?.count ?? 0,
      practiceAvgScore: sessMap[key]?.avgScore ?? 0,
      interviewSessions: intMap[key]?.count ?? 0,
      interviewAvgScore: intMap[key]?.avgScore ?? 0
    };
  });

  // Score distribution for practice sessions
  const [scoreDistribution, difficultyBreakdown, practiceTypeBreakdown, topIndustries] = await Promise.all([
    PracticeSession.aggregate([
      { $bucket: { groupBy: '$totalScore', boundaries: [0, 20, 40, 60, 80, 101], default: 'other', output: { count: { $sum: 1 } } } }
    ]),
    PracticeSession.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]),
    PracticeSession.aggregate([
      { $group: { _id: '$practiceType', count: { $sum: 1 } } }
    ]),
    InterviewSession.aggregate([
      { $match: { industry: { $ne: '' } } },
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ])
  ]);

  return res.json({
    daily,
    scoreDistribution: scoreDistribution.map((b: any) => ({
      range: b._id === 'other' ? '0-20' : `${b._id}-${b._id + 19}`,
      count: b.count
    })),
    difficultyBreakdown: difficultyBreakdown.map((d: any) => ({ difficulty: d._id, count: d.count })),
    practiceTypeBreakdown: practiceTypeBreakdown.map((d: any) => ({ type: d._id, count: d.count })),
    topIndustries: topIndustries.map((d: any) => ({ industry: d._id, count: d.count }))
  });
});

export default router;
