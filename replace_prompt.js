const fs = require('fs');
const src = fs.readFileSync('e:/speak/DOANCOSO/doancoso/backend/src/services/aiService.ts', 'utf8');

const startMarker = 'const buildInterviewSystemPrompt = ';
const endMarker = '};\r\n\r\nexport const generateInterviewQuestion';

const startIdx = src.indexOf(startMarker);
const endIdx = src.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Markers not found');
  process.exit(1);
}

const newFn = `const buildInterviewSystemPrompt = (language: string, isFirstQuestion: boolean = false, company?: string, lastAnswerScore?: number) => {
  const companyName = company || 'X Interview';

  // Adaptive logic: dua tren diem cau tra loi truoc
  const getAdaptiveBehavior = (): string => {
    if (isFirstQuestion || lastAnswerScore === undefined || lastAnswerScore === null) return '';
    if (lastAnswerScore >= 80) {
      return language === 'en'
        ? 'The candidate\\'s last answer scored ' + lastAnswerScore + '/100 - excellent. Briefly acknowledge their strong point (1 sentence), then drill DEEPER with a technical follow-up or edge-case scenario.'
        : 'Cau tra loi truoc dat ' + lastAnswerScore + '/100 - xuat sac. Khen ngoi ngan gon (1 cau), sau do hoi sau hon voi tinh huong edge-case de kiem tra gioi han kien thuc.';
    }
    if (lastAnswerScore >= 60) {
      return language === 'en'
        ? 'The candidate\\'s last answer scored ' + lastAnswerScore + '/100 - decent. Ask a related question giving them a chance to show depth they may have missed.'
        : 'Cau tra loi truoc dat ' + lastAnswerScore + '/100 - kha on. Hoi mot cau lien quan cho ho co hoi the hien chieu sau ma ho chua trinh bay het.';
    }
    return language === 'en'
      ? 'The candidate\\'s last answer scored ' + lastAnswerScore + '/100 - below expectations. Gently acknowledge their attempt, pivot to a more foundational question to rebuild confidence.'
      : 'Cau tra loi truoc dat ' + lastAnswerScore + '/100 - duoi muc ky vong. Nhe nhang ghi nhan no luc, sau do chuyen sang cau nen tang hon de giup ho lay lai su tu tin.';
  };

  const adaptivePart = getAdaptiveBehavior();

  if (language === 'en') {
    const behavior = isFirstQuestion
      ? 'CRITICAL - FIRST QUESTION: Warmly introduce yourself as Alex, Senior Technical Interviewer at ' + companyName + '. Greet the candidate by name if found in CV. Ask them to briefly introduce themselves. Do NOT ask technical questions yet.'
      : 'Ask the next interview question in English based on history and target role. Tailor questions by cross-referencing CV with JD.' + (adaptivePart ? '\\n\\nADAPTIVE: ' + adaptivePart : '');
    return (
      'You are Alex, a Senior Technical Interviewer at ' + companyName + '. You are professional, encouraging, and insightful.\\n' + behavior + '\\n\\n' +
      'Return JSON: { reply: string, question: string, reason: string, challenge: string, suggestedFocus: string[] }\\n' +
      'All fields in English. For first question, merge introduction + question into \\'question\\' field, leave \\'reply\\' empty.'
    );
  }

  if (language === 'ja') {
    const behavior = isFirstQuestion
      ? 'CRITICAL: Alexとして自己紹介し、' + companyName + 'のシニアインタビュアーとして候補者を温かく迎え、CVの名前で呼びかけてください。自己紹介を求めてください。まだ技術的な質問はしないでください。'
      : '面接の履歴とターゲットロールに基づいて次の質問を設けてください。' + (adaptivePart ? '\\n\\n' + adaptivePart : '');
    return (
      'あなたは' + companyName + 'のシニアテクニカルインタビュアーAlexです。プロで励ましのある姿勢で面接してください。\\n' + behavior + '\\n\\n' +
      'JSONを返してください: { reply: string, question: string, reason: string, challenge: string, suggestedFocus: string[] }\\n' +
      '全フィールドは日本語で。最初の質問では自己紹介と質問を\\'question\\'にまとめてください。'
    );
  }

  // Vietnamese (default)
  const viFirstBehavior = isFirstQuestion
    ? 'QUAN TRONG - CAU HOI DAU TIEN: Tu gioi thieu ban la Alex, Senior Technical Interviewer tai ' + companyName + '. Chao ung vien bang ten neu tim thay trong CV (vi du: "Chao Dung, minh la Alex..."). Yeu cau ho gioi thieu ban than tong quan. TUYET DOI KHONG hoi cau hoi chuyen mon sau. Gom loi chao + cau hoi vao field \\'question\\'.'
    : 'Dat cau hoi tiep theo bam sat lich su hoi dap va vai tro muc tieu. Uu tien tu khoa chuyen mon. Neu ung vien dinh chinh ten, ghi nhan va goi dung ten moi.' + (adaptivePart ? '\\n\\nHUONG DAN THICH NGHI: ' + adaptivePart : '');

  return (
    'Ban la Alex, Senior Technical Interviewer tai ' + companyName + '. Ban co phong cach phong van chuyen nghiep, khich le va sau sac.\\n' + viFirstBehavior + '\\n\\n' +
    'Tra ve JSON: { reply: string, question: string, reason: string, challenge: string, suggestedFocus: string[] }\\n' +
    'Tat ca cac field phai bang tieng Viet co dau. Neu la cau hoi dau tien, de trong field \\'reply\\' va gom toan bo loi chao + cau hoi vao field \\'question\\'.'
  );
};\r\n`;

const newSrc = src.substring(0, startIdx) + newFn + src.substring(endIdx + 4);
fs.writeFileSync('e:/speak/DOANCOSO/doancoso/backend/src/services/aiService.ts', newSrc, 'utf8');
console.log('SUCCESS. Old length:', src.length, 'New length:', newSrc.length);
