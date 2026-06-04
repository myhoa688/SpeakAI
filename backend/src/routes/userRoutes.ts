import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek.js';
import { Router } from 'express';

import { authRequired } from '../middleware/auth.js';
import { PracticeSession } from '../models/PracticeSession.js';
import { InterviewSession } from '../models/InterviewSession.js';
import { serializeUser } from '../utils/auth.js';
import { calculateWeekComparison, claimGoalReward, syncGoalsWithStats } from '../utils/progression.js';
import {
  getLeaderboard,
  getRecentPracticeSessions,
  getTodayPracticeStats,
  getWeeklyTimeline,
  getWeekMinutes
} from '../utils/sessionStats.js';

dayjs.extend(isoWeek);

const router = Router();

const mapSession = (session: any) => ({
  id: session._id.toString(),
  practiceType: session.practiceType,
  topic: session.topic,
  difficulty: session.difficulty,
  durationSeconds: session.durationSeconds,
  speechRateWpm: session.speechRateWpm,
  volumeStability: session.volumeStability,
  confidenceScore: session.confidenceScore,
  totalScore: session.totalScore,
  passed: session.passed,
  xpEarned: session.xpEarned,
  energyChange: session.energyChange,
  summary: session.summary,
  strengths: session.strengths,
  improvements: session.improvements,
  coachNotes: session.coachNotes,
  followUpQuestions: session.followUpQuestions,
  speedTimeline: session.speedTimeline,
  heatmap: session.heatmap,
  transcript: session.transcript,
  createdAt: session.createdAt
});

router.get('/dashboard', authRequired, async (req, res) => {
  const user = req.user!;

  const [todayStats, thisWeekMinutes, lastWeekMinutes, weeklyTimeline, recentPractice, leaderboard, totalPractice, recentInterviews, totalInterviews] =
    await Promise.all([
      getTodayPracticeStats(user._id.toString()),
      getWeekMinutes(user._id.toString(), 0),
      getWeekMinutes(user._id.toString(), -1),
      getWeeklyTimeline(user._id.toString()),
      getRecentPracticeSessions(user._id.toString(), 6),
      getLeaderboard(10),
      PracticeSession.countDocuments({ userId: user._id }),
      InterviewSession.find({ userId: user._id, status: 'completed' }).sort({ completedAt: -1 }).limit(6).lean(),
      InterviewSession.countDocuments({ userId: user._id, status: 'completed' })
    ]);

  syncGoalsWithStats(user, todayStats);
  await user.save();

  return res.json({
    user: serializeUser(user),
    overview: {
      totalSessions: totalInterviews, // Show interview count for "Tổng số phỏng vấn"
      sessionsToday: todayStats.sessionCount,
      minutesToday: todayStats.totalMinutes,
      thisWeekMinutes,
      lastWeekMinutes
    },
    progress: calculateWeekComparison(thisWeekMinutes, lastWeekMinutes),
    weeklyTimeline,
    leaderboard,
    recentSessions: recentInterviews.map((session: any) => ({
      id: session._id.toString(),
      practiceType: 'interview',
      topic: session.specialization || session.industry || 'Phỏng vấn',
      difficulty: session.difficulty,
      totalScore: session.overallScore,
      createdAt: session.createdAt,
      completedAt: session.completedAt
    }))
  });
});

router.patch('/profile', authRequired, async (req, res) => {
  const user = req.user!;
  const { name, bio, targetRole, experienceLevel, skills, avatarUrl, language } = req.body as {
    name?: string;
    bio?: string;
    targetRole?: string;
    experienceLevel?: string;
    skills?: string[] | string;
    avatarUrl?: string;
    language?: string;
  };

  if (name) user.name = name.trim();
  if (bio !== undefined) user.bio = bio.trim();
  if (targetRole !== undefined) user.targetRole = targetRole.trim();
  if (experienceLevel !== undefined) user.experienceLevel = experienceLevel.trim() || 'beginner';
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl.trim();
  if (language !== undefined) user.language = language.trim() || 'vi';
  if (skills !== undefined) {
    user.skills = Array.isArray(skills)
      ? skills.map((item) => item.trim()).filter(Boolean)
      : skills
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
  }

  await user.save();
  return res.json({ message: 'Cập nhật hồ sơ thành công.', user: serializeUser(user) });
});

router.get('/practice-history', authRequired, async (req, res) => {
  const user = req.user!;
  const limit = Math.min(Number(req.query.limit ?? 20), 50);
  const sessions = await getRecentPracticeSessions(user._id.toString(), limit);
  return res.json({ sessions: sessions.map(mapSession) });
});

router.post('/goals/:goalKey/claim', authRequired, async (req, res) => {
  const user = req.user!;
  const todayStats = await getTodayPracticeStats(user._id.toString());
  syncGoalsWithStats(user, todayStats);

  try {
    const goal = claimGoalReward(user, String(req.params.goalKey));
    await user.save();
    return res.json({ message: 'Nhận thưởng thành công.', goal, user: serializeUser(user) });
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error ? error.message : 'Không thể nhận thưởng lúc này.'
    });
  }
});

router.post('/exchange-xp', authRequired, async (req, res) => {
  const user = req.user!;
  const XP_COST = 500;

  if (user.totalXp < XP_COST) {
    return res.status(400).json({ message: 'Không đủ điểm kinh nghiệm (XP) để đổi lượt phỏng vấn.' });
  }

  user.totalXp -= XP_COST;
  user.remainingInterviews = (user.remainingInterviews || 0) + 1;
  await user.save();

  return res.json({
    message: 'Đổi lượt phỏng vấn thành công!',
    user: serializeUser(user)
  });
});

export default router;
