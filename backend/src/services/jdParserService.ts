import { env, logger } from '../config/env.js';
import { aiClient } from '../config/ai.js';
import { z } from 'zod';

/**
 * Phân tích CV thuần túy (không có JD) để extract thông tin vai trò và kỹ năng.
 * Dùng khi user chỉ upload CV mà không cung cấp mô tả công việc.
 */
export const analyzeCvOnly = async (cvText: string) => {
  logger.info(`[analyzeCvOnly] CV length: ${cvText.length} chars`);
  
  if (!aiClient) {
    throw new Error('AI service not configured');
  }

  if (!cvText || cvText.length < 30) {
    logger.warn('[analyzeCvOnly] CV text too short or empty, returning fallback');
    return {
      jobTitle: 'Vị trí Ứng tuyển',
      matchingSkills: [],
      missingSkills: [],
      suggestedFocus: ['Kinh nghiệm làm việc thực tế', 'Kỹ năng chuyên môn'],
      overallMatch: 'N/A'
    };
  }

  try {
    const response = await aiClient.chat.completions.create({
      model: env.openaiTextModel,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Bạn là một chuyên gia phân tích hồ sơ nhân sự (CV/Resume).
Đọc kỹ nội dung CV và trả về JSON:
{
  "jobTitle": "Chức danh/vai trò chính mà ứng viên đang hướng đến hoặc đang làm gần nhất (VD: Business Development Executive, Marketing Manager)",
  "matchingSkills": ["kỹ năng nổi bật 1", "kỹ năng 2", "kỹ năng 3"],
  "missingSkills": ["kỹ năng phổ biến cho vị trí này mà CV chưa đề cập 1", "kỹ năng 2"],
  "suggestedFocus": ["chủ đề cần hỏi sâu 1", "chủ đề 2"],
  "overallMatch": "Đánh giá tổng quan năng lực (ví dụ: CV rõ ràng, kinh nghiệm phù hợp)"
}
QUAN TRỌNG: jobTitle phải lấy từ thông tin TRONG CV, không được bịa đặt. Chỉ trả về JSON, không giải thích gì thêm.`
        },
        {
          role: 'user',
          content: `--- NỘI DUNG CV ---\n${cvText.slice(0, 4000)}`
        }
      ]
    });

    const raw = response.choices[0]?.message?.content ?? '{}';
    logger.info(`[analyzeCvOnly] AI response: ${raw.slice(0, 200)}`);
    return JSON.parse(raw);
  } catch (error) {
    logger.error(`[analyzeCvOnly] Error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      jobTitle: 'Vị trí Ứng tuyển',
      matchingSkills: [],
      missingSkills: [],
      suggestedFocus: ['Kinh nghiệm làm việc thực tế', 'Xử lý tình huống'],
      overallMatch: 'N/A'
    };
  }
};

export const parseJobDescription = async (jdText: string | undefined) => {
  if (!aiClient) {
    throw new Error('AI service not configured');
  }

  if (!jdText || jdText.trim().length === 0) {
    logger.warn('[parseJobDescription] JD text is empty or undefined, returning fallback');
    return {
      jobTitle: 'Vị trí chung',
      requiredSkills: ['Kỹ năng chuyên môn', 'Giao tiếp'],
      experienceLevel: 'junior',
      keyResponsibilities: ['Hoàn thành công việc được giao'],
      focusAreas: ['Chuyên môn cơ bản', 'Làm việc nhóm']
    };
  }

  try {
    const response = await aiClient.chat.completions.create({
      model: env.openaiTextModel,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Bạn là một hệ thống phân tích Job Description (JD) chuyên nghiệp.
Phân tích văn bản JD và trả về cấu trúc JSON duy nhất:
{
  "jobTitle": "Chức danh cụ thể (ví dụ: Senior Frontend Engineer, Marketing Manager)",
  "requiredSkills": ["kỹ năng cốt lõi 1", "kỹ năng 2"],
  "experienceLevel": "junior" | "mid" | "senior",
  "keyResponsibilities": ["trách nhiệm 1", "trách nhiệm 2"],
  "focusAreas": ["chủ đề phỏng vấn sâu 1", "chủ đề phỏng vấn sâu 2"]
}
Chỉ trả về JSON, không thêm bất kỳ văn bản nào khác.`
        },
        {
          role: 'user',
          content: jdText.slice(0, 5000)
        }
      ]
    });

    const raw = response.choices[0]?.message?.content ?? '{}';
    return JSON.parse(raw);
  } catch (error) {
    logger.error(`[parseJobDescription] Error: ${error instanceof Error ? error.message : String(error)}`);
    // Fallback if parsing fails
    return {
      jobTitle: 'Vị trí chung',
      requiredSkills: ['Kỹ năng chuyên môn', 'Giao tiếp'],
      experienceLevel: 'junior',
      keyResponsibilities: ['Hoàn thành công việc được giao'],
      focusAreas: ['Chuyên môn cơ bản', 'Làm việc nhóm']
    };
  }
};

export const analyzeCvAndJd = async (cvText: string, jdText: string) => {
  logger.info(`[analyzeCvAndJd] cvText length: ${cvText.length} chars, preview: ${cvText.slice(0, 100)}`);
  if (!aiClient) {
    throw new Error('AI service not configured');
  }

  try {
    const response = await aiClient.chat.completions.create({
      model: env.openaiTextModel,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Bạn là một chuyên gia Tuyển dụng và Phỏng vấn.
Phân tích độ phù hợp giữa CV của ứng viên và Job Description (JD).
Trả về cấu trúc JSON duy nhất:
{
  "jobTitle": "Tên vị trí ứng tuyển",
  "matchingSkills": ["kỹ năng CV khớp với JD 1", "kỹ năng khớp 2"],
  "missingSkills": ["kỹ năng JD yêu cầu nhưng CV chưa rõ 1", "kỹ năng thiếu 2"],
  "suggestedFocus": ["Gợi ý trọng tâm phỏng vấn 1", "Gợi ý 2"],
  "overallMatch": "Đánh giá mức độ phù hợp (ví dụ: 75%)"
}
Chỉ trả về JSON, không giải thích gì thêm.`
        },
        {
          role: 'user',
          content: `--- JOB DESCRIPTION ---\n${jdText.slice(0, 3000)}\n\n--- CANDIDATE CV ---\n${cvText.slice(0, 3000)}`
        }
      ]
    });

    const raw = response.choices[0]?.message?.content ?? '{}';
    return JSON.parse(raw);
  } catch (error) {
    logger.error(`[analyzeCvAndJd] Error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      jobTitle: 'Vị trí Ứng tuyển',
      matchingSkills: ['Các kỹ năng cơ bản'],
      missingSkills: ['Cần xác nhận thêm trong phỏng vấn'],
      suggestedFocus: ['Kinh nghiệm làm việc thực tế', 'Xử lý tình huống'],
      overallMatch: 'N/A'
    };
  }
};

export const generateInterviewSetQuestions = async (
  jdText: string,
  company: string,
  role: string,
  industry: string,
  difficulty: 'easy' | 'medium' | 'hard',
  questionCount: number = 12
) => {
  logger.info(`[generateInterviewSetQuestions] JD length: ${jdText.length}, Count: ${questionCount}`);
  if (!aiClient) {
    throw new Error('AI service not configured');
  }

  try {
    const response = await aiClient.chat.completions.create({
      model: env.openaiTextModel,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Bạn là một chuyên gia tuyển dụng cấp cao. Hãy tạo một bộ gồm ${questionCount} câu hỏi phỏng vấn dựa trên Mô tả công việc (JD) cho vị trí "${role}" tại công ty "${company}" thuộc ngành "${industry}". Độ khó tổng thể: ${difficulty}.
Bộ câu hỏi cần bao gồm tỷ lệ hợp lý giữa các loại: chuyên môn (technical), tình huống (behavioral), và chung (general).

Trả về một JSON object duy nhất có cấu trúc nghiêm ngặt sau:
{
  "questions": [
    {
      "question": "Nội dung câu hỏi...",
      "guidance": "Gợi ý hoặc hướng dẫn trả lời cho ứng viên...",
      "sampleAnswer": "Câu trả lời mẫu chi tiết...",
      "difficulty": "easy" | "medium" | "hard",
      "tags": ["tag1", "tag2", "tag3"],
      "analysis": {
        "interviewerEvaluation": ["tiêu chí 1", "tiêu chí 2"],
        "answerStructure": {
          "open": "Cách mở đầu hiệu quả...",
          "points": ["Ý chính 1 cần có", "Ý chính 2 cần có"],
          "close": "Cách chốt lại vấn đề..."
        },
        "importantTips": [
          { "priority": "HIGH", "content": "Mẹo quan trọng 1" },
          { "priority": "MEDIUM", "content": "Mẹo 2" }
        ],
        "followUpQuestions": ["Câu hỏi phụ 1", "Câu hỏi phụ 2"],
        "commonMistakes": ["Lỗi thường gặp 1", "Lỗi thường gặp 2"]
      }
    }
  ]
}
QUAN TRỌNG: CHỈ trả về định dạng JSON hợp lệ theo đúng cấu trúc trên, KHÔNG thêm bất kỳ văn bản nào khác. Hãy chắc chắn có đủ ${questionCount} phần tử trong mảng "questions".`
        },
        {
          role: 'user',
          content: `--- THÔNG TIN ---
Công ty: ${company}
Vai trò: ${role}
Ngành nghề: ${industry}

--- JOB DESCRIPTION ---
${jdText.slice(0, 5000)}`
        }
      ]
    });

    const raw = response.choices[0]?.message?.content ?? '{"questions":[]}';
    const parsed = JSON.parse(raw);
    return parsed.questions || [];
  } catch (error) {
    logger.error(`[generateInterviewSetQuestions] Error: ${error instanceof Error ? error.message : String(error)}`);
    throw new Error('Không thể sinh câu hỏi từ JD lúc này. Vui lòng thử lại sau.');
  }
};

