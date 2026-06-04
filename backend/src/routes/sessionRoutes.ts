import { Router } from 'express';
import { Types } from 'mongoose';
import { env, logger } from '../config/env.js';
import { authRequired } from '../middleware/auth.js';
import { buildRealtimeInstructions, generateSessionSummaryJSON } from '../services/aiService.js';
import { Session } from '../models/Session.js';
import { SessionMemory } from '../models/SessionMemory.js';
import { LearnerProfile } from '../models/LearnerProfile.js';
import { Persona, seedPersonas } from '../models/Persona.js';

const router = Router();

// Seed personas khi module load
seedPersonas().catch((e) => logger.error('Seed personas error: ' + e));

const normalizeDifficulty = (v: unknown): 'easy' | 'medium' | 'hard' =>
  v === 'easy' || v === 'medium' || v === 'hard' ? v : 'medium';

const normalizePracticeType = (v: unknown): 'interview' | 'presentation' =>
  v === 'presentation' ? 'presentation' : 'interview';

/**
 * POST /api/sessions/start
 * Tạo Session, load Profile + Persona + lịch sử, xin ephemeral key từ OpenAI Realtime.
 */
router.post('/start', authRequired, async (req, res) => {
  const user = req.user!;
  const mode       = normalizePracticeType(req.body.mode);
  const difficulty = normalizeDifficulty(req.body.difficulty);
  const topic      = String(req.body.topic ?? 'Luyện tập SpeakAI').trim() || 'Luyện tập SpeakAI';

  // Chọn persona theo mode
  const personaKey = mode === 'interview' ? 'hr_linh' : 'coach_mark';

  try {
    // 1. Load Persona
    let persona = await Persona.findOne({ key: personaKey });
    if (!persona) {
      await seedPersonas();
      persona = await Persona.findOne({ key: personaKey });
    }
    const personaData = {
      name: persona?.name ?? 'SpeakAI Coach',
      role: persona?.role ?? 'coach',
      personalityPrompt: persona?.personalityPrompt ?? '',
    };

    // 2. Load LearnerProfile (fallback về User data)
    const learnerProfile = await LearnerProfile.findOne({ userId: user._id });
    const profileData = {
      name:       user.name,
      targetRole: learnerProfile?.targetRole ?? user.targetRole ?? '',
      skills:     learnerProfile?.skills?.length ? learnerProfile.skills : (user.skills ?? []),
      strengths:  learnerProfile?.strengths ?? [],
      weaknesses: learnerProfile?.weaknesses ?? [],
      goals:      learnerProfile?.goals ?? [],
    };

    // 3. Load 3 SessionMemory gần nhất cùng personaKey
    const lastSessions = await SessionMemory.find({ userId: user._id, personaKey })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    // 4. Build system instructions
    const instructions = buildRealtimeInstructions({
      persona: personaData,
      profile: profileData,
      lastSessions: lastSessions.map((s) => ({
        date:  s.date as Date,
        mode:  s.mode,
        topic: s.topic,
        scores: s.scores as { overall: number },
        improvements:     s.improvements ?? [],
        promisedNextTime: s.promisedNextTime ?? [],
      })),
      mode,
      topic,
      difficulty,
    });

    // 5. Tạo Session document
    const session = await Session.create({
      userId:     user._id,
      personaKey,
      mode,
      difficulty,
      topic,
      status:     'active',
    });

    // 6. Trả về instructions và voice để Frontend tự cấu hình WebRTC qua Data Channel
    // (Bỏ qua Ephemeral Token vì lỗi 404 Invalid URL của OpenAI)
    return res.json({
      sessionId:    session._id.toString(),
      personaKey,
      personaName:  personaData.name,
      profileName:  profileData.name,
      instructions,
      voice:        persona?.voice || 'shimmer',
      isFirstSession: lastSessions.length === 0,
    });
  } catch (error: any) {
    logger.error(`[sessions/start] ${error.message}`);
    return res.status(500).json({ message: error.message || 'Lỗi server khi mở phòng.' });
  }
});

/**
 * POST /api/sessions/:id/webrtc
 * Proxy SDP offer tới OpenAI WebRTC endpoint
 */
router.post('/:id/webrtc', authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    const { sdp } = req.body;

    if (!sdp) {
      return res.status(400).json({ message: 'Thiếu thông tin SDP.' });
    }

    if (!env.openaiApiKey) {
      throw new Error('Chưa cấu hình OPENAI_API_KEY.');
    }

    const model = env.openaiRealtimeModel || 'gpt-realtime';
    const baseUrl = 'https://api.openai.com/v1/realtime/calls';
    
    // Gửi SDP Text nguyên bản tới OpenAI
    const oaiRes = await fetch(`${baseUrl}?model=${model}`, {
      method: 'POST',
      body: sdp,
      headers: {
        'Authorization': `Bearer ${env.openaiApiKey}`,
        'Content-Type': 'application/sdp',
      },
    });

    if (!oaiRes.ok) {
      const errText = await oaiRes.text();
      logger.error(`OpenAI WebRTC Proxy error: ${errText}`);
      throw new Error('Không thể khởi tạo WebRTC với OpenAI.');
    }

    const sdpAnswer = await oaiRes.text();
    return res.status(200).send(sdpAnswer);
  } catch (error: any) {
    logger.error(`[sessions/webrtc] ${error.message}`);
    return res.status(500).send(error.message);
  }
});

/**
 * POST /api/sessions/:id/end
 * Kết thúc phiên, chạy pipeline LLM tóm tắt, lưu SessionMemory.
 * KHÔNG chặn realtime — trả về evaluation ngay sau khi lưu xong.
 */
router.post('/:id/end', authRequired, async (req, res) => {
  const { id } = req.params;
  const { transcript, reason = 'user_stop' } = req.body;

  const sessionId = Array.isArray(id) ? id[0] : id;
  if (!Types.ObjectId.isValid(sessionId)) {
    return res.status(400).json({ message: 'sessionId không hợp lệ.' });
  }

  const session = await Session.findOne({ _id: sessionId, userId: req.user?._id });
  if (!session) {
    return res.status(404).json({ message: 'Không tìm thấy phiên hoặc bạn không có quyền.' });
  }

  // Đánh dấu đã kết thúc
  const endedAt    = new Date();
  const durationSec = Math.round((endedAt.getTime() - (session.startedAt as Date).getTime()) / 1000);
  session.status      = 'ended';
  session.endedAt     = endedAt;
  session.durationSec = durationSec;
  if (transcript) {
    const lines = String(transcript).split('\n').filter(Boolean);
    session.transcript.splice(0);
    for (const l of lines) {
      const who = l.startsWith('Ứng viên:') ? 'user' : 'ai';
      const text = l.replace(/^(Ứng viên|AI):\s*/i, '');
      session.transcript.push({ who, text, at: new Date() });
    }
  }
  await session.save();

  // Tổng kết bằng LLM
  const allText = String(transcript ?? '').trim();
  let evaluation: any = null;

  // Tính voiceMetrics cơ bản
  const userText = (req.body.turns || [])
    .filter((t: any) => t.who === 'user')
    .map((t: any) => t.text)
    .join(' ');
  const wordCount = userText.split(/\s+/).filter(Boolean).length;
  const wpm = durationSec > 0 ? Math.round((wordCount / durationSec) * 60) : 0;
  
  const fillerRegex = /\b(ừ|ờ|ừm|kiểu như|thực ra|nói chung|basically|actually)\b/gi;
  const fillerWords = (userText.match(fillerRegex) || []).length;
  
  // Tính longPauses đơn giản dựa vào khoảng cách giữa các turn (nếu có req.body.turns)
  let longPauses = 0;
  if (req.body.turns && req.body.turns.length > 1) {
    let lastUserTime = 0;
    req.body.turns.forEach((t: any) => {
      if (t.at) {
        const [m, s] = t.at.split(':').map(Number);
        const timeSec = m * 60 + s;
        if (t.who === 'user' && lastUserTime > 0) {
          if (timeSec - lastUserTime > 5) longPauses++;
        }
        if (t.who === 'user') lastUserTime = timeSec;
      }
    });
  }

  const voiceMetrics = { wpm, fillerWords, longPauses };

  try {
    if (allText.length > 20 && allText !== '(Không có transcript)') {
      const summary = await generateSessionSummaryJSON(allText, session.mode, session.topic);

      // Lưu SessionMemory
      const memory = await SessionMemory.create({
        userId:          req.user?._id,
        sessionId:       session._id,
        personaKey:      session.personaKey,
        date:            endedAt,
        mode:            session.mode,
        topic:           session.topic,
        scores:          summary.scores,
        voiceMetrics:    voiceMetrics,
        strengths:       summary.strengths,
        improvements:    summary.improvements,
        promisedNextTime:summary.promisedNextTime,
        summary:         summary.summary,
      });

      evaluation = {
        ...summary,
        durationSec,
        voiceMetrics,
        mode:  session.mode,
        topic: session.topic,
        memoryId: memory._id.toString()
      };
    }
  } catch (err: any) {
    logger.error(`[sessions/:id/end] summarizer error: ${err.message}`);
  }

  return res.json({ success: true, evaluation });
});

/**
 * GET /api/sessions/memory/context?personaKey=hr_linh
 * Lấy ngữ cảnh hội thoại cho màn "Xem trước" trước khi mở phòng.
 */
router.get('/memory/context', authRequired, async (req, res) => {
  const personaKey = String(req.query.personaKey ?? 'hr_linh');
  const userId = req.user!._id;

  const [profile, lastSessions] = await Promise.all([
    LearnerProfile.findOne({ userId }).lean(),
    SessionMemory.find({ userId, personaKey }).sort({ createdAt: -1 }).limit(3).lean(),
  ]);

  // Tính trend điểm overall
  const trend = [...lastSessions].reverse().map((s) => (s.scores as any)?.overall ?? 0);

  return res.json({ profile, lastSessions, trend });
});

/**
 * GET /api/sessions/progress?personaKey=hr_linh&metric=overall
 * Trả về time-series điểm để vẽ biểu đồ.
 */
router.get('/progress', authRequired, async (req, res) => {
  const personaKey = String(req.query.personaKey ?? '');
  const metric     = String(req.query.metric ?? 'overall');
  const userId     = req.user!._id;

  const filter: Record<string, unknown> = { userId };
  if (personaKey) filter.personaKey = personaKey;

  const memories = await SessionMemory.find(filter)
    .sort({ createdAt: 1 })
    .limit(30)
    .lean();

  const points = memories.map((m) => ({
    date:  (m.date as Date).toISOString(),
    value: (m.scores as any)?.[metric] ?? 0,
    topic: m.topic,
    mode:  m.mode,
  }));

  return res.json({ points });
});

/**
 * PATCH /api/sessions/memory/:id/plan
 * Cập nhật trạng thái completed (hoàn thành) của kế hoạch
 */
router.patch('/memory/:id/plan', authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    const { completedPromises } = req.body;
    
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID không hợp lệ.' });
    }

    const memory = await SessionMemory.findOne({ _id: id, userId: req.user?._id });
    if (!memory) {
      return res.status(404).json({ message: 'Không tìm thấy bộ nhớ phiên.' });
    }

    memory.completedPromises = completedPromises || [];
    await memory.save();

    return res.json({ success: true, completedPromises: memory.completedPromises });
  } catch (error: any) {
    logger.error(`[sessions/memory/plan] ${error.message}`);
    return res.status(500).json({ message: error.message || 'Lỗi cập nhật plan.' });
  }
});

export default router;
