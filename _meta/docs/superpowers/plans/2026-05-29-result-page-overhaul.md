# [Question Result UI Overhaul & Audio Fix] Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the audio playback bug (prevent URL revocation), suppress AI hallucinations for silent audio, and completely redesign the `QuestionResultPage` UI to match the user's provided sample screenshots (Dark mode, custom waveform player, 2-column layout, metrics cards).

**Architecture:** 
1. **Audio State:** Remove `URL.revokeObjectURL` from the recording hook's unmount cleanup so the audio blob persists across page navigations.
2. **AI Service:** Add a filter in `transcribeAudioSafely` to drop known Whisper hallucinations (like "Tôi là GPT") when the user submits a silent recording.
3. **UI Layout:** Use CSS Grid for the 2-column layout. Implement a custom CSS-based fake waveform player for the audio. Redesign metric cards to match the vibrant styling in the mockup.

**Tech Stack:** React, Tailwind-like inline styles/CSS, Node.js (Backend)

## User Review Required

> [!IMPORTANT]
> - Do you want the "Waveform" in the audio player to be randomly generated visual bars, or just a static image for now? I plan to use CSS bars to simulate a nice waveform.
> - The right column has "Khóa học đề xuất" (Recommended Courses) and "Bài viết đề xuất" (Recommended Articles). Since these might not have actual APIs yet, I will hardcode these blocks just to match the visual design in your screenshot. Is that okay?

---

### Task 1: Fix Audio Playback Revocation

**Files:**
- Modify: `frontend/src/hooks/useAudioRecorder.ts`

- [ ] **Step 1: Remove `URL.revokeObjectURL` on unmount**

In `useAudioRecorder.ts`, modify the cleanup effect to NOT revoke the `audioUrl` on unmount, because the component unmounts when navigating to the results page.

```typescript
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      if (mediaRecorder.current && (mediaRecorder.current.state === 'recording' || mediaRecorder.current.state === 'paused')) {
        mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      }
      // REMOVED URL.revokeObjectURL(audioUrl) so it survives route change
    };
  }, []); // Remove audioUrl from deps to avoid stale closures if needed
```

- [ ] **Step 2: Commit**
```bash
git add frontend/src/hooks/useAudioRecorder.ts
git commit -m "fix: prevent audio blob URL from being revoked on navigation"
```

### Task 2: Suppress Silent Audio Hallucinations

**Files:**
- Modify: `backend/src/services/aiService.ts`

- [ ] **Step 1: Add hallucination filter in `transcribeAudioSafely`**

```typescript
// Inside transcribeAudioSafely, after getting transcript:
      let transcriptText = normalizeText(transcript);
      
      // Filter out common Whisper hallucinations for silent audio
      const lowerText = transcriptText.toLowerCase();
      if (
        lowerText.includes('tôi là gpt') || 
        lowerText.includes('cảm ơn các bạn đã theo dõi') ||
        lowerText.includes('amara.org') ||
        lowerText.includes('subtitles by') ||
        lowerText.includes('bài thuyết trình hoặc câu trả lời')
      ) {
        transcriptText = ''; // Consider it silent
      }

      return {
        transcript: transcriptText,
        warningMessage: transcriptText === '' ? 'Không phát hiện được giọng nói rõ ràng. Hãy đảm bảo micro của bạn hoạt động tốt.' : ''
      };
```

- [ ] **Step 2: Commit**
```bash
git add backend/src/services/aiService.ts
git commit -m "fix: filter out Whisper AI hallucinations on silent audio"
```

### Task 3: Overhaul QuestionResultPage UI

**Files:**
- Modify: `frontend/src/pages/QuestionResultPage.tsx`

- [ ] **Step 1: Rewrite layout to match sample design**

Replace the entire return statement with the new 2-column grid.
Key components to build:
1. Header box with date and difficulty.
2. Audio Player box with fake waveform and purple play button.
3. Big Score card with 4 metrics (NỘI DUNG, SỰ TỰ TIN, TỐC ĐỘ NÓI, ĐỘ RÕ RÀNG).
4. Transcript card on the right side.
5. AI Feedback block (Tóm tắt, Những điều bạn làm tốt, Điểm cần cải thiện).
6. Suggestions block (Khóa học đề xuất).

- [ ] **Step 2: Commit**
```bash
git add frontend/src/pages/QuestionResultPage.tsx
git commit -m "feat: redesign question result page UI to match mockups"
```
