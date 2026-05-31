import { useState, useRef, useCallback, useEffect } from 'react';

export type RecordingState = 'idle' | 'recording' | 'paused' | 'recorded';

export function useAudioRecorder() {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [volumeSamples, setVolumeSamples] = useState<{time: number, value: number}[]>([]);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerInterval = useRef<number | null>(null);
  const volumeInterval = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const volumeDataRef = useRef<{time: number, value: number}[]>([]);

  const clearTimer = () => {
    if (timerInterval.current) {
      window.clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    if (volumeInterval.current) {
      window.clearInterval(volumeInterval.current);
      volumeInterval.current = null;
    }
  };

  const startTimer = () => {
    clearTimer();
    timerInterval.current = window.setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunks.current = [];
      volumeDataRef.current = [];

      // Setup AudioContext for volume tracking
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setVolumeSamples([...volumeDataRef.current]);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(console.error);
        }
      };

      mediaRecorder.current.start(200); // collect chunks every 200ms
      
      const startTime = Date.now();
      volumeInterval.current = window.setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        // Normalize value between 0 and 1
        const value = Math.min(1, average / 128);
        volumeDataRef.current.push({
          time: (Date.now() - startTime) / 1000,
          value
        });
      }, 200);

      setRecordingState('recording');
      setDurationSeconds(0);
      setAudioBlob(null);
      setAudioUrl(null);
      setVolumeSamples([]);
      setError(null);
      startTimer();
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      setError('Không thể truy cập microphone. Vui lòng cấp quyền và thử lại.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.pause();
      setRecordingState('paused');
      clearTimer();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'paused') {
      mediaRecorder.current.resume();
      setRecordingState('recording');
      startTimer();
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && (mediaRecorder.current.state === 'recording' || mediaRecorder.current.state === 'paused')) {
      mediaRecorder.current.stop();
      setRecordingState('recorded');
      clearTimer();
    }
  };

  const resetRecording = () => {
    if (mediaRecorder.current && (mediaRecorder.current.state === 'recording' || mediaRecorder.current.state === 'paused')) {
      mediaRecorder.current.stop();
    }
    clearTimer();
    setRecordingState('idle');
    setDurationSeconds(0);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setVolumeSamples([]);
    setError(null);
    audioChunks.current = [];
    volumeDataRef.current = [];
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      if (mediaRecorder.current && (mediaRecorder.current.state === 'recording' || mediaRecorder.current.state === 'paused')) {
        mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      }
      // URL.revokeObjectURL is deliberately NOT called here so that the audio Blob URL 
      // can be passed to and played on the Result Page.
    };
  }, []);

  return {
    recordingState,
    durationSeconds,
    audioBlob,
    audioUrl,
    volumeSamples,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording
  };
}
