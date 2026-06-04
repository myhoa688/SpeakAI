import { useEffect, useRef, useState } from "react";

/** Trả về mức âm lượng micro 0..1 để orb phản hồi. */
export function useMicLevel(active: boolean) {
  const [level, setLevel] = useState(0);
  const raf = useRef<number>();
  useEffect(() => {
    if (!active) { setLevel(0); return; }
    let ctx: AudioContext, stream: MediaStream, analyser: AnalyserNode;
    (async () => {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      ctx = new AudioContext();
      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length / 255;
        setLevel((p) => p * 0.7 + avg * 0.3); // smoothing
        raf.current = requestAnimationFrame(tick);
      };
      tick();
    })().catch(() => {});
    return () => {
      cancelAnimationFrame(raf.current!);
      stream?.getTracks().forEach((t) => t.stop());
      ctx?.close();
    };
  }, [active]);
  return level;
}

/** Đồng hồ mm:ss khi đang chạy. */
export function useCallTimer(running: boolean) {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    if (!running) { setSec(0); return; }
    const id = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
