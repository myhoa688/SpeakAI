import { useEffect, useRef, useState, useMemo } from "react";
import { Icon } from "./icons";
import { useMicLevel, useCallTimer } from "./hooks";
import { api } from "../lib/api";
import type { Difficulty, PracticeType } from "../types";
import SessionResult, { type SessionEvaluation } from "./SessionResult";
import "./RealtimeCoach.css";

type Turn = { who: "user" | "ai"; text: string; at: string };

export function RealtimePracticeRoom() {
  const [practiceType, setPracticeType] = useState<PracticeType>("interview");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [topic, setTopic] = useState("Giới thiệu dự án nổi bật của bạn");

  const [running, setRunning]         = useState(false);
  const [micOff, setMicOff]           = useState(false);
  const [drawerOpen, setDrawerOpen]   = useState(true);
  const [speaker, setSpeaker]         = useState<"user" | "ai" | null>(null);
  const [turns, setTurns]             = useState<Turn[]>([]);
  const [error, setError]             = useState("");
  const [isEnding, setIsEnding]       = useState(false);
  const [evaluation, setEvaluation]   = useState<SessionEvaluation | null>(null);

  const turnsRef = useRef<Turn[]>([]);

  // Lưu sessionId trả về từ backend để dùng khi end
  const sessionIdRef = useRef<string | null>(null);

  const level = useMicLevel(running && !micOff);
  const timer = useCallTimer(running);

  const pcRef              = useRef<RTCPeerConnection | null>(null);
  const audioElRef         = useRef<HTMLAudioElement | null>(null);
  const dcRef              = useRef<RTCDataChannel | null>(null);
  const isComponentMounted = useRef(true);

  useEffect(() => {
    isComponentMounted.current = true;
    return () => {
      isComponentMounted.current = false;
      stopRoom();
    };
  }, []);

  // Phím tắt
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && !running && !evaluation) { e.preventDefault(); startRoom(); }
      if (e.key.toLowerCase() === "m") setMicOff((v) => !v);
      if (e.key === "Escape" && !evaluation) endSession();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, evaluation]);

  const appendTurn = (who: "user" | "ai", text: string) => {
    if (!text) return;
    const normalized = text.trim();
    if (!normalized) return;
    const now = new Date();
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    const newTurn = { who, text: normalized, at: `${mm}:${ss}` };
    setTurns((cur) => {
      const next = [...cur, newTurn];
      turnsRef.current = next;
      return next;
    });
  };

  const initWebRTC = async () => {
    try {
      setSpeaker(null);
      setError("");

      // 1. Gọi /api/sessions/start — nhận sessionId + cấu hình
      const startRes = await api.post("/sessions/start", {
        mode: practiceType,
        difficulty,
        topic,
      });

      const { sessionId, instructions, voice, personaName, isFirstSession } = startRes.data;
      sessionIdRef.current = sessionId;

      if (personaName) {
        console.log(`[SpeakAI] Persona: ${personaName}`);
      }

      // 2. Tạo RTCPeerConnection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      pc.ontrack = (e) => {
        if (audioElRef.current) {
          audioElRef.current.srcObject = e.streams[0];
          setSpeaker("ai");
        }
      };

      // 3. Thêm microphone
      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      ms.getTracks().forEach((t) => pc.addTrack(t, ms));

      // Lấy cấu hình Prompt
      const sessionInstructions = [
        instructions,
        "Quy tắc bổ sung: Đóng vai hoàn toàn, không nhắc đến AI.",
      ].join("\n");
      const sessionVoice = voice || "shimmer";

      const greetingInstructions = isFirstSession
        ? [
            instructions,
            "---",
            "LƯU Ý CỰC KỲ QUAN TRỌNG TỪ HỆ THỐNG:",
            "ĐÂY LÀ LƯỢT NÓI ĐẦU TIÊN CỦA BẠN. Hãy nói 1-2 câu CHÀO HỎI THẬT TỰ NHIÊN:",
            "1. Gọi tên người dùng.",
            "2. Hỏi thăm sức khỏe hoặc cảm xúc của họ hôm nay (ví dụ: 'Hôm nay Khang khỏe không?').",
            "3. CHƯA VỘI BẮT ĐẦU BÀI TẬP. Hãy để họ trả lời câu hỏi xã giao trước!",
            "- BẮT BUỘC NÓI TIẾNG VIỆT."
          ].join("\n")
        : [
            instructions,
            "---",
            "LƯU Ý CỰC KỲ QUAN TRỌNG TỪ HỆ THỐNG:",
            "HÃY NÓI 1-2 CÂU CHÀO MỞ ĐẦU:",
            "1. Gọi tên người dùng.",
            "2. Hỏi thăm xem hôm nay họ thế nào (ví dụ: 'Chào Khang, hôm nay bạn thấy thế nào?').",
            "3. NẾU trong hồ sơ có ghi chú về buổi trước, hãy nhắc nhẹ. NẾU KHÔNG CÓ, tuyệt đối KHÔNG ĐƯỢC TỰ BỊA RA CHỦ ĐỀ.",
            "4. CHƯA VỘI BẮT ĐẦU BÀI TẬP. Hãy để họ trả lời câu hỏi xã giao trước!",
            "- BẮT BUỘC NÓI TIẾNG VIỆT."
          ].join("\n");

      // 4. Data channel nhận events và gửi cấu hình
      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;
      
      dc.addEventListener("open", () => {
        console.log("[SpeakAI] Data Channel opened, sending minimal session.update...");
        // Chỉ gửi cấu hình cơ bản, loại bỏ các trường rủi ro gây lỗi Beta
        dc.send(JSON.stringify({
          type: "session.update",
          session: {
            instructions: sessionInstructions,
            voice: sessionVoice,
            input_audio_transcription: { model: "whisper-1" }
          }
        }));
      });

      let greetingSent = false;
      let sessionUpdated = false;

      const sendGreeting = () => {
        if (greetingSent || dc.readyState !== "open") return;
        greetingSent = true;
        console.log("[SpeakAI] Triggering AI greeting...");
        
        // Hủy mọi response ngẫu nhiên do VAD bắt tiếng ồn nền
        dc.send(JSON.stringify({ type: "response.cancel" }));

        dc.send(JSON.stringify({
          type: "response.create",
          response: {
            instructions: greetingInstructions
          }
        }));
        setSpeaker("ai");
      };

      dc.addEventListener("message", (e) => {
        try {
          const msg = JSON.parse(e.data);
          
          // Debug on UI
          if (msg.type.includes("transcript") || msg.type.includes("item.done") || msg.type.includes("input_audio_transcription.completed")) {
            setEvents((prev) => [...prev, { type: msg.type, data: msg }].slice(-15));
            console.log("[SpeakAI] Event:", msg.type, msg);
          }

          if (msg.type === "error") {
            console.error("[SpeakAI] OpenAI Error:", JSON.stringify(msg.error, null, 2));
          }

          // OpenAI xác nhận cấu hình → gửi lời chào ngay lập tức (KHÔNG DELAY)
          if (msg.type === "session.updated" || msg.type === "session.created") {
            console.log("[SpeakAI] Session configured, sending greeting...");
            sendGreeting();
          }

          // Aggressive transcript extraction for AI
          if (msg.type === "response.audio_transcript.done" || msg.type === "response.output_audio_transcript.done") {
            appendTurn("ai", msg.transcript);
          }
          if (msg.type === "response.output_item.done" && msg.item?.role === "assistant") {
            const transcript = msg.item?.content?.[0]?.transcript;
            if (transcript) appendTurn("ai", transcript);
          }

          // Aggressive transcript extraction for User
          if (msg.type === "conversation.item.input_audio_transcription.completed" || msg.type.endsWith("transcription.completed")) {
            const text = msg.transcript || msg.text || msg.item?.content?.[0]?.transcript;
            if (text) appendTurn("user", text);
          }
          if (msg.type.startsWith("conversation.item.") && msg.item?.role === "user") {
            const transcript = msg.item?.content?.[0]?.transcript;
            if (transcript) appendTurn("user", transcript);
          }
          if (msg.type.startsWith("conversation.item.") && msg.transcript) {
            appendTurn("user", msg.transcript);
          }

          // AI nói xong → chuyển lượt về user
          if (msg.type === "response.done") {
            setSpeaker("user");
          }
          // AI bắt đầu nói
          if (msg.type === "response.audio_transcript.delta" || msg.type === "response.output_audio_transcript.delta" || msg.type === "response.output_item.added") {
            setSpeaker("ai");
          }
        } catch (err) { 
          console.error("[SpeakAI] Error processing message:", err);
        }
      });

      // 5. Kết nối tới OpenAI Realtime qua Proxy Backend
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpRes = await api.post(`/sessions/${sessionId}/webrtc`, {
        sdp: offer.sdp
      });

      const answer = { type: "answer" as RTCSdpType, sdp: sdpRes.data };
      await pc.setRemoteDescription(answer);

      setSpeaker("ai"); // AI sẽ nói trước
      setRunning(true);
    } catch (err: any) {
      setError(err.message || "Không thể khởi tạo phòng thoại.");
      stopRoom();
    }
  };

  const [events, setEvents] = useState<any[]>([]);

  const startRoom = () => {
    setTurns([]);
    setEvents([]);
    turnsRef.current = [];
    setEvaluation(null);
    sessionIdRef.current = null;
    setRunning(true);
    initWebRTC();
  };

  const endSession = async () => {
    if (!running) return;
    
    try {
      setIsEnding(true);

      // 1. Lấy transcript hiện tại TRƯỚC khi đóng kết nối
      const currentTurns = [...turnsRef.current];
      const allText = currentTurns
        .map((m) => `${m.who === "user" ? "Ứng viên" : "AI"}: ${m.text}`)
        .join("\n");

      // 2. Đóng WebRTC connection
      stopRoom();

      // 3. Kiểm tra xem người dùng đã nói chưa
      const userTurns = currentTurns.filter(m => m.who === "user");
      if (userTurns.length === 0) {
        setEvaluation({
          mode: practiceType,
          topic: topic,
          durationSec: 0,
          scores: { overall: 0, troiChay: 0, cauTruc: 0, tuTin: 0, noiDung: 0 },
          strengths: ["(Chưa có dữ liệu)"],
          improvements: ["Bạn chưa nói gì nên AI không thể đánh giá."],
          promisedNextTime: ["Bắt đầu một phiên luyện tập mới và thử nói điều gì đó."],
          summary: "Phiên kết thúc quá sớm hoặc hệ thống chưa ghi nhận được giọng nói của bạn."
        });
        setIsEnding(false);
        return;
      }

      // 4. Gọi API kết thúc phiên
      if (sessionIdRef.current) {
        try {
          const res = await api.post(`/sessions/${sessionIdRef.current}/end`, {
            transcript: allText || "(Không có transcript)",
            turns: currentTurns,
            reason: "user_stop",
          });

          if (res.data?.evaluation) {
            // Lấy thêm trend từ /progress
            try {
              const progressRes = await api.get(
                `/sessions/progress?personaKey=${practiceType === "interview" ? "hr_linh" : "coach_mark"}&metric=overall`
              );
              const trend = (progressRes.data?.points ?? []).map((p: any) => p.value);
              setEvaluation({ ...res.data.evaluation, trend });
            } catch {
              setEvaluation(res.data.evaluation);
            }
          } else {
            // Fallback: tạo evaluation tối thiểu nếu backend không trả (thường do quá ngắn)
            setEvaluation({
              scores: { troiChay: 0, cauTruc: 0, tuTin: 0, noiDung: 0, overall: 0 },
              voiceMetrics: { wpm: 0, fillerWords: 0, longPauses: 0 },
              strengths: ["(Chưa có dữ liệu hội thoại)"],
              improvements: ["Vui lòng nói chuyện với AI để nhận đánh giá chi tiết."],
              promisedNextTime: [],
              summary: "Phiên luyện tập bị huỷ hoặc quá ngắn, không đủ dữ liệu để đánh giá.",
              durationSec: 0,
              mode: practiceType,
              topic,
            });
          }
        } catch (apiErr: any) {
          console.error("[SpeakAI] End session API error:", apiErr);
          // Vẫn hiện evaluation tối thiểu khi API lỗi
          setEvaluation({
            scores: { troiChay: 0, cauTruc: 0, tuTin: 0, noiDung: 0, overall: 0 },
            voiceMetrics: { wpm: 0, fillerWords: 0, longPauses: 0 },
            strengths: ["(Lỗi kết nối)"],
            improvements: ["Có lỗi khi tổng kết phiên, vui lòng thử lại sau."],
            promisedNextTime: [],
            summary: "Đã xảy ra lỗi khi cố gắng lưu và tổng kết phiên hội thoại này.",
            durationSec: 0,
            mode: practiceType,
            topic,
          });
        }
      }
    } catch (err: any) {
      setError(err.message || "Lỗi khi kết thúc phiên.");
    } finally {
      setIsEnding(false);
    }
  };

  const stopRoom = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setRunning(false);
    setSpeaker(null);
  };

  // Đồng bộ mute với WebRTC
  useEffect(() => {
    if (!pcRef.current) return;
    const sender = pcRef.current.getSenders().find((s) => s.track?.kind === "audio");
    if (sender?.track) sender.track.enabled = !micOff;
  }, [micOff]);

  let coachState: "idle" | "connecting" | "listening" | "speaking" = "idle";
  if (running) {
    if (!speaker) coachState = "connecting";
    else if (speaker === "ai") coachState = "speaking";
    else coachState = "listening";
  }

  const STATE_LABEL: Record<string, string> = {
    connecting: "Đang kết nối…",
    idle: "Sẵn sàng — nhấn để bắt đầu",
    listening: "Đang nghe bạn nói…",
    speaking: "AI Coach đang nói…",
  };

  const onToggleMic = () => {
    if (!running) {
      startRoom();
    } else {
      setMicOff((v) => !v);
    }
  };

  const micActive = running && !micOff;

  const deduplicatedTurns = useMemo(() => {
    const seen = new Set<string>();
    const out: Turn[] = [];
    for (const t of turns) {
      const key = `${t.who}:${t.text}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(t);
    }
    return out;
  }, [turns]);

  const lastTurn = deduplicatedTurns.length > 0 ? deduplicatedTurns[deduplicatedTurns.length - 1] : null;
  const liveCaption = lastTurn ? lastTurn.text : "";

  return (
    <div className="coach" data-state={coachState} data-show-log={drawerOpen}>
      {/* ---- Sân khấu giữa ---- */}
      <main className="coach__stage">
        <span className="coach__status-pill" data-state={coachState} style={{ position: 'absolute', top: '0px', right: '24px' }}>
          <span className="dot" />
          {STATE_LABEL[coachState]}
        </span>
        <span className="coach__eyebrow">Realtime · WebRTC · AI Coaching</span>
        <h1 className="coach__title">Luyện nói với AI coach chuyên nghiệp</h1>

        <div className="coach__orb-wrap">
          <span className="coach__ring" />
          <span className="coach__ring" style={{ animationDelay: "0.6s" }} />
          <div className="coach__orb">AI</div>
        </div>

        <p className="coach__caption">
          {lastTurn ? (
            <>
              <b>{lastTurn.who === "user" ? "Bạn: " : "AI Coach: "}</b>
              {liveCaption}
            </>
          ) : (
            STATE_LABEL[coachState]
          )}
        </p>
        {error && (
          <p style={{ color: "var(--danger)", fontSize: "14px", marginTop: "8px" }}>{error}</p>
        )}

        <div className="coach__controls">
          <button
            className="coach__mic"
            data-active={micActive}
            onClick={onToggleMic}
            disabled={isEnding}
          >
            <span className="wave"><i /><i /><i /></span>
            {isEnding ? "Đang tổng kết..." : (!running ? "Nhấn để bắt đầu" : (micOff ? "Micro đang tắt (M)" : "Bạn đang nói (M)"))}
          </button>
          <button className="coach__end" onClick={endSession} title="Kết thúc phiên (Esc)" disabled={!running || isEnding}>
            <Icon.End />
          </button>
        </div>
      </main>

      {/* Transcript drawer toggle */}
      <button
        className="coach__drawer-tab"
        onClick={() => setDrawerOpen((v) => !v)}
        title={drawerOpen ? "Ẩn hội thoại" : "Hiện hội thoại"}
      >
        {drawerOpen ? "»" : "«"}
      </button>

      {/* ---- Sidebar hội thoại ---- */}
      <aside className="coach__aside">
        <div className="coach__aside-head">
          <h3>Dòng hội thoại</h3>
          <span className="coach__turn-count">{deduplicatedTurns.length} lượt</span>
        </div>

        <div className="coach__messages">
          {deduplicatedTurns.map((m, i) => (
            <div key={i} className="coach__msg" data-role={m.who}>
              <div className="coach__msg-meta">
                <span className="who">{m.who === "ai" ? "AI Coach" : "Bạn"}</span>
                <span>{m.at}</span>
              </div>
              <div className="coach__bubble">{m.text}</div>
            </div>
          ))}
        </div>

        {events.length > 0 && (
          <details className="coach__debug">
            <summary>⚙ RAW WEBRTC EVENTS ({events.length})</summary>
            <pre>
              {events.map((e, i) => (
                <div key={i}>{e.type} | {JSON.stringify(e.data).slice(0, 100)}...</div>
              ))}
            </pre>
          </details>
        )}
      </aside>

      <audio ref={audioElRef} autoPlay style={{ display: "none" }} />

      {/* Session Result overlay */}
      {evaluation && (
        <SessionResult
          ev={evaluation}
          onRetry={() => { setEvaluation(null); startRoom(); }}
          onClose={() => setEvaluation(null)}
        />
      )}
    </div>
  );
}
