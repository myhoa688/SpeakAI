# AI Interview Practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng tính năng luyện phỏng vấn AI với thời gian thực (Real-time transcription) qua WebSocket và chấm điểm chi tiết bằng Groq (LLaMA-3 & Whisper).

**Architecture:** Sử dụng React Context và MediaRecorder ở Frontend để thu âm và gửi chunk qua Socket.IO. Ở Backend, Express kết hợp Socket.IO nhận audio chunk, gọi Groq Whisper để trả về text tức thì. Khi kết thúc, LLaMA-3 đánh giá toàn diện các tiêu chí (logic, ngữ pháp, độ tự tin, từ thừa) và lưu vào MongoDB.

**Tech Stack:** React, Socket.IO Client, Express, Mongoose, Socket.IO, Groq API (OpenAI SDK), Zod.

## User Review Required

> [!IMPORTANT]
> - Vui lòng kiểm tra kỹ cấu trúc Model MongoDB để đảm bảo đủ thông tin bạn cần.
> - Việc sử dụng Socket.IO yêu cầu cài đặt thêm các packages: `socket.io` (cho Backend) và `socket.io-client` (cho Frontend).

## Open Questions

> [!WARNING]
> - File ghi âm của ứng viên sau khi bóc băng xong sẽ được lưu tạm ở Backend thư mục `/uploads` rồi xóa sau khi phân tích xong để tiết kiệm dung lượng nhé?
> - Các biểu đồ radar/cột đánh giá trên MyPage sẽ sử dụng thư viện `recharts` đã có sẵn ở Frontend.

## Proposed Changes

### Database Models & Configurations
#### [NEW] [InterviewSession.ts](file:///e:/speak/DOANCOSO/doancoso/backend/src/models/InterviewSession.ts)
Mongoose schema cho phiên phỏng vấn (InterviewSession) lưu tổng quan.
#### [NEW] [InterviewResponse.ts](file:///e:/speak/DOANCOSO/doancoso/backend/src/models/InterviewResponse.ts)
Mongoose schema cho chi tiết câu trả lời (InterviewResponse).
#### [NEW] [socket.ts](file:///e:/speak/DOANCOSO/doancoso/backend/src/config/socket.ts)
Cấu hình Socket.IO server.

### Backend Services & Controllers
#### [NEW] [interviewService.ts](file:///e:/speak/DOANCOSO/doancoso/backend/src/services/interviewService.ts)
Xử lý logic kết nối Groq (Sinh câu hỏi từ CV/JD, Đánh giá câu trả lời).
#### [NEW] [interviewController.ts](file:///e:/speak/DOANCOSO/doancoso/backend/src/controllers/interviewController.ts)
REST APIs cho Interview (Tạo session, Nộp bài, Lấy kết quả).
#### [NEW] [interviewRoutes.ts](file:///e:/speak/DOANCOSO/doancoso/backend/src/routes/interviewRoutes.ts)
Express routes mapping tới controller.
#### [MODIFY] [server.ts](file:///e:/speak/DOANCOSO/doancoso/backend/src/server.ts)
Tích hợp Socket.IO và Interview routes.

### Frontend Components & Pages
#### [NEW] [InterviewSetup.tsx](file:///e:/speak/DOANCOSO/doancoso/frontend/src/pages/InterviewSetup.tsx)
Giao diện upload CV/JD và bắt đầu phỏng vấn.
#### [NEW] [InterviewRoom.tsx](file:///e:/speak/DOANCOSO/doancoso/frontend/src/pages/InterviewRoom.tsx)
Giao diện gọi Video/Audio mô phỏng, thu âm qua MediaRecorder và streaming tới Socket.IO để nhận Real-time transcription.
#### [NEW] [InterviewResult.tsx](file:///e:/speak/DOANCOSO/doancoso/frontend/src/pages/InterviewResult.tsx)
Hiển thị báo cáo đánh giá (Radar chart, WPM, Feedback) bằng Recharts.

---

## Task Breakdown

### Task 1: Cài đặt Dependencies và Thiết lập Socket.IO Backend
**Files:**
- Modify: `backend/package.json`
- Modify: `frontend/package.json`
- Create: `backend/src/config/socket.ts`
- Modify: `backend/src/server.ts`

- [ ] **Step 1: Cài đặt socket.io ở backend và frontend**
```bash
cd backend && npm install socket.io
cd ../frontend && npm install socket.io-client
```

- [ ] **Step 2: Cấu hình Socket.IO Server**
Tạo file `backend/src/config/socket.ts` để khởi tạo io object.

- [ ] **Step 3: Tích hợp Socket.IO vào Express Server**
Sửa file `backend/src/server.ts` để sử dụng `http.createServer` bọc lấy app Express và truyền vào `setupSocket(server)`.


### Task 2: Tạo Database Models cho Phỏng vấn
**Files:**
- Create: `backend/src/models/InterviewSession.ts`
- Create: `backend/src/models/InterviewResponse.ts`

- [ ] **Step 1: Tạo InterviewSession Schema**
Định nghĩa fields: userId, jobTitle, industry, cvUrl, jdText, questions (array của {question, purpose}), status, overallScore.

- [ ] **Step 2: Tạo InterviewResponse Schema**
Định nghĩa fields: sessionId (Ref), questionIndex, audioUrl, transcript, durationInSeconds, metrics (wpm, fillerWordCount), evaluation (logicScore, grammarScore, relevanceScore, detailedFeedback, suggestedAnswer).


### Task 3: Xây dựng AI Service & Controller (Backend)
**Files:**
- Create: `backend/src/services/interviewService.ts`
- Create: `backend/src/controllers/interviewController.ts`
- Create: `backend/src/routes/interviewRoutes.ts`

- [ ] **Step 1: Viết hàm generateQuestions trong interviewService**
Nhận text từ CV (dùng pdf-parse) và JD, gửi vào `aiClient` (Groq LLaMA) yêu cầu định dạng JSON chứa 5 câu hỏi. Dùng zod parse.

- [ ] **Step 2: Viết hàm evaluateAnswer trong interviewService**
Nhận transcript đầy đủ, gửi vào LLaMA yêu cầu chấm điểm 3 tiêu chí và feedback. Đếm filler words.

- [ ] **Step 3: Tạo controller và routes**
Viết các route POST `/setup` và GET `/:id/result`. Tích hợp route vào `server.ts`.


### Task 4: Xử lý Real-time Whisper Transcribe qua WebSocket
**Files:**
- Modify: `backend/src/config/socket.ts`

- [ ] **Step 1: Lắng nghe event `audio_chunk`**
Khi client emit `audio_chunk` kèm theo base64 audio data.

- [ ] **Step 2: Gọi Groq Whisper**
Chuyển base64 thành buffer (có file type), dùng `aiClient.audio.transcriptions.create` (model whisper-large-v3) để lấy text.

- [ ] **Step 3: Emit `transcript_chunk` về Frontend**
Phát lại text ngay lập tức cho client đó.


### Task 5: Xây dựng Giao diện Frontend (React)
**Files:**
- Create: `frontend/src/pages/InterviewSetup.tsx`
- Create: `frontend/src/pages/InterviewRoom.tsx`
- Create: `frontend/src/pages/InterviewResult.tsx`

- [ ] **Step 1: Giao diện Setup**
Form tải CV và nhập JD. Gọi API `/setup` và lấy ID session.

- [ ] **Step 2: Giao diện InterviewRoom (Cốt lõi)**
Dùng `useRef` lưu `MediaRecorder`. Cắt chunk 1500ms. Kết nối socket.io tới backend. Nhận `transcript_chunk` và in ra màn hình. Quản lý trạng thái "Đang nói" và "Đang xử lý".

- [ ] **Step 3: Giao diện Result**
Lấy dữ liệu từ API và vẽ biểu đồ Radar Recharts cho điểm số. In ra điểm WPM và từ thừa.
