import { useState } from "react";
import "./SessionResult.css";

export type SessionEvaluation = {
  mode:  string;
  topic: string;
  durationSec?: number;
  scores: {
    overall:  number;
    troiChay: number;
    cauTruc:  number;
    tuTin:    number;
    noiDung:  number;
  };
  strengths:        string[];
  improvements:     string[];
  promisedNextTime: string[];
  summary:          string;
  trend?:           number[];   // điểm overall các buổi trước (từ /progress)
  memoryId?:        string;
};

const RING = 2 * Math.PI * 54;

function fmtDuration(sec?: number) {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}p ${s.toString().padStart(2, "0")}s`;
}

export default function SessionResult({
  ev, onRetry, onClose,
}: {
  ev: SessionEvaluation;
  onRetry:  () => void;
  onClose:  () => void;
}) {
  const metrics = [
    { label: "Trôi chảy",  v: ev.scores.troiChay },
    { label: "Cấu trúc",   v: ev.scores.cauTruc  },
    { label: "Tự tin",     v: ev.scores.tuTin    },
    { label: "Nội dung",   v: ev.scores.noiDung  },
  ];

  const trend  = ev.trend ?? [];
  const maxVal = Math.max(...trend, 10);

  const dashOffset = RING * (1 - (ev.scores.overall / 10));

  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const toggleCheck = async (index: number) => {
    const newChecked = { ...checkedItems, [index]: !checkedItems[index] };
    setCheckedItems(newChecked);

    if (ev.memoryId) {
      try {
        const completedPromises = Object.keys(newChecked)
          .filter(k => newChecked[Number(k)])
          .map(Number);
        await api.patch(`/sessions/memory/${ev.memoryId}/plan`, { completedPromises });
      } catch (err) {
        console.error("Failed to update plan status:", err);
      }
    }
  };

  return (
    <div className="sr-backdrop" onClick={onClose}>
      <div className="sr-root" onClick={(e) => e.stopPropagation()}>

        <header className="sr-head">
          <div>
            <h1>Kết thúc &amp; Đánh giá</h1>
            <p>
              {ev.mode === "interview" ? "Phỏng vấn" : "Thuyết trình"} ·{" "}
              {ev.topic} · {fmtDuration(ev.durationSec)}
            </p>
          </div>
          <button className="sr-close" onClick={onClose} aria-label="Đóng">✕</button>
        </header>

        {/* Summary */}
        {ev.summary && <p className="sr-summary">{ev.summary}</p>}

        <section className="sr-top">
          {/* Vòng điểm tổng */}
          <div className="sr-ring-card">
            <svg viewBox="0 0 120 120" className="sr-ring">
              <circle cx="60" cy="60" r="54" className="sr-ring-bg" />
              <circle
                cx="60" cy="60" r="54"
                className="sr-ring-fg"
                strokeDasharray={RING}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div className="sr-ring-label">
              <small>Overall</small>
              <strong>
                {ev.scores.overall.toFixed(1)}
                <span> / 10</span>
              </strong>
            </div>
          </div>

          {/* 4 chỉ số */}
          <div className="sr-metrics">
            {metrics.map((m) => (
              <div className="sr-metric" key={m.label}>
                <span className="sr-metric-label">{m.label}</span>
                <div className="sr-bar">
                  <i style={{ width: `${m.v * 10}%` }} />
                </div>
                <b>{m.v.toFixed(1)}</b>
              </div>
            ))}
          </div>
        </section>

        <section className="sr-mid">
          {/* Điểm mạnh & Cần cải thiện */}
          <div className="sr-card">
            <h2>👍 Điểm mạnh</h2>
            <ul className="sr-list green">
              {ev.strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div className="sr-card">
            <h2>👎 Cần cải thiện</h2>
            <ul className="sr-list amber">
              {ev.improvements.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        </section>

        {/* Tiến bộ */}
        {trend.length > 1 && (
          <div className="sr-card sr-chart-card">
            <h2>📈 Tiến bộ theo thời gian (overall)</h2>
            <svg viewBox="0 0 280 70" className="sr-chart" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline
                points={trend.map((v, i) =>
                  `${(i / (trend.length - 1)) * 280},${70 - (v / maxVal) * 60}`
                ).join(" ")}
                className="sr-line"
              />
            </svg>
          </div>
        )}

        {/* Kế hoạch lần sau */}
        {ev.promisedNextTime.length > 0 && (
          <section className="sr-plan">
            <h2>✅ Kế hoạch cho buổi tới</h2>
            <ul>
              {ev.promisedNextTime.map((p, i) => (
                <li key={i}>
                  <input 
                    type="checkbox" 
                    id={`pt${i}`} 
                    checked={!!checkedItems[i]} 
                    onChange={() => toggleCheck(i)} 
                  />
                  <label htmlFor={`pt${i}`} style={{ textDecoration: checkedItems[i] ? 'line-through' : 'none', opacity: checkedItems[i] ? 0.6 : 1, cursor: 'pointer' }}>
                    {p}
                  </label>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="sr-actions">
          <button className="sr-btn ghost" onClick={onRetry}>Luyện lại</button>
          <button className="sr-btn primary" onClick={onClose}>Đã hiểu, đóng</button>
        </div>

      </div>
    </div>
  );
}
