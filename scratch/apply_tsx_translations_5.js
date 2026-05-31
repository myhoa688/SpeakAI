const fs = require('fs');
const tsxPath = 'E:/speak/DOANCOSO/doancoso/frontend/src/pages/InterviewSessionPage.tsx';
let content = fs.readFileSync(tsxPath, 'utf8');

if (!content.includes("useTranslation")) {
    content = content.replace("import { useEffect", "import { useTranslation } from 'react-i18next';\nimport { useEffect");
}
if (!content.includes("const { t } = useTranslation();")) {
    content = content.replace("export function InterviewSessionPage() {", "export function InterviewSessionPage() {\n  const { t } = useTranslation();");
}

const map = [
    ['Ph?ng v?n', '{t(\'session.title\', "Ph?ng v?n")}'],
    ['Hoàn thành', '{t(\'session.finish\', "Hoàn thành")}'],
    ['G?i ý & B?i c?nh', '{t(\'session.hintsContext\', "G?i ý & B?i c?nh")}'],
    ['Vai trò', '{t(\'session.role\', "Vai trò")}'],
    ['Kinh nghi?m', '{t(\'session.experience\', "Kinh nghi?m")}'],
    ['Linh v?c', '{t(\'session.domain\', "Linh v?c")}'],
    ['Hu?ng tr? l?i', '{t(\'session.suggestedFocus\', "Hu?ng tr? l?i")}'],
    ['M?c dích câu h?i', '{t(\'session.questionPurpose\', "M?c dích câu h?i")}'],
    ['Nh?n phím Space d? nói', '{t(\'session.pressSpace\', "Nh?n phím Space d? nói")}'],
    ['Ho?c b?m vào dây', '{t(\'session.orClickHere\', "Ho?c b?m vào dây")}'],
    ['Nh?p câu tr? l?i (Enter d? g?i)...', '{t(\'session.typeReply\', "Nh?p câu tr? l?i (Enter d? g?i)...")}'],
    ['Ðang t?i d? li?u phiên...', '{t(\'session.loading\', "Ðang t?i d? li?u phiên...")}']
];

for(const [s, r] of map) {
    content = content.replaceAll(s, r);
}
fs.writeFileSync(tsxPath, content);
console.log("Session translations applied.");
