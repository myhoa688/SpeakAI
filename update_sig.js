const fs = require('fs');
const file = 'e:/speak/DOANCOSO/doancoso/backend/src/services/aiService.ts';
let src = fs.readFileSync(file, 'utf8');

src = src.replace(
  /export const generateInterviewQuestion = async \(input: \{\r?\n  difficulty: 'easy' \| 'medium' \| 'hard';\r?\n  targetRole: string;\r?\n  topic\?: string;\r?\n  history: Array<\{ question: string; answer: string \}>;\r?\n  cvSummary\?: string;\r?\n  language\?: string;\r?\n  jobDescription\?: string;\r?\n  company\?: string;\r?\n\}\) => \{/,
  `export const generateInterviewQuestion = async (input: {
  difficulty: 'easy' | 'medium' | 'hard';
  targetRole: string;
  topic?: string;
  history: Array<{ question: string; answer: string }>;
  cvSummary?: string;
  language?: string;
  jobDescription?: string;
  company?: string;
  lastAnswerScore?: number;
}) => {`
);

src = src.replace(
  /content: buildInterviewSystemPrompt\(language, isFirstQuestion, input\.company\)/,
  'content: buildInterviewSystemPrompt(language, isFirstQuestion, input.company, input.lastAnswerScore)'
);

fs.writeFileSync(file, src, 'utf8');
console.log('Done replacement in aiService');
