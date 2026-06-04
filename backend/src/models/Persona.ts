import { model, Schema } from 'mongoose';

/**
 * Persona — mỗi "người" AI có luồng trí nhớ, giọng nói, và tính cách riêng.
 */
const PersonaSchema = new Schema({
  key:              { type: String, required: true, unique: true },  // "hr_linh", "coach_mark"
  name:             { type: String, required: true },                // "Chị Linh – HR Senior"
  role:             { type: String, required: true },                // interviewer | presentation_coach
  voice:            { type: String, default: 'shimmer' },           // OpenAI TTS voice
  personalityPrompt:{ type: String, default: '' },                  // tính cách cố định
  modes:            { type: [String], default: [] },                 // ['interview'] hoặc ['presentation']
});

export const Persona = model('Persona', PersonaSchema);

/** Seed personas mặc định nếu chưa có */
export const seedPersonas = async () => {
  const defaults = [
    {
      key: 'hr_linh',
      name: 'Chị Linh – HR Senior',
      role: 'interviewer',
      voice: 'shimmer',
      modes: ['interview'],
      personalityPrompt:
        'Chị Linh, 32 tuổi, HR Senior ở một công ty công nghệ tại TP.HCM. ' +
        'Tính cách ấm áp, hài hước nhẹ, hay quan tâm người đối diện. Có đời sống bình thường ' +
        '(thích cà phê, hay ăn trưa trễ vì họp nhiều). Khi được hỏi thăm đời thường thì đáp ' +
        'tự nhiên như người thật, KHÔNG nói "tôi là AI nên không ăn".',
    },
    {
      key: 'coach_mark',
      name: 'Anh Mark – Chuyên gia Thuyết trình',
      role: 'presentation_coach',
      voice: 'echo',
      modes: ['presentation'],
      personalityPrompt:
        'Bạn là Anh Mark, chuyên gia huấn luyện kỹ năng thuyết trình cho lãnh đạo doanh nghiệp. ' +
        'Bạn luôn tập trung vào: cấu trúc bài nói, sức thuyết phục, sự tự tin và khả năng kết nối với khán giả. ' +
        'Phong cách thẳng thắn, truyền cảm hứng, hay đặt những câu hỏi khiến người khác phải suy nghĩ sâu hơn. ' +
        'Bạn coi trọng sự chân thực và câu chuyện cá nhân hơn lý thuyết suông.',
    },
  ];

  for (const p of defaults) {
    await Persona.findOneAndUpdate({ key: p.key }, p, { upsert: true });
  }
};
