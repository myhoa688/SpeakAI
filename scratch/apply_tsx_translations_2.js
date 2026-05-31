const fs = require('fs');

function applyToQuestionBank() {
    const tsxPath = 'E:/speak/DOANCOSO/doancoso/frontend/src/pages/QuestionBankPage.tsx';
    let content = fs.readFileSync(tsxPath, 'utf8');

    if (!content.includes("useTranslation")) {
        content = content.replace("import { useEffect", "import { useTranslation } from 'react-i18next';\nimport { useEffect");
    }
    if (!content.includes("const { t } = useTranslation();")) {
        content = content.replace("export function QuestionBankPage() {", "export function QuestionBankPage() {\n  const { t } = useTranslation();");
    }
    const map = [
        ['Ngân hàng Câu h?i', '{t(\'questionBank.title\', "Ngân hàng Câu h?i")}'],
        ['Tìm ki?m theo tên câu h?i, ch? d?...', '{t(\'questionBank.searchPlaceholder\', "Tìm ki?m theo tên câu h?i, ch? d?...")}'],
        ['L?c theo ngành', '{t(\'questionBank.filterIndustry\', "L?c theo ngành")}'],
        ['M?i ngành ngh?', '{t(\'questionBank.allIndustries\', "M?i ngành ngh?")}'],
        ['T?t c?', '{t(\'questionBank.allIndustries\', "T?t c?")}'],
        ['M?c d?', '{t(\'questionBank.level\', "M?c d?")}'],
        ['D?', '{t(\'questionBank.easy\', "D?")}'],
        ['Trung bình', '{t(\'questionBank.medium\', "Trung bình")}'],
        ['Khó', '{t(\'questionBank.hard\', "Khó")}'],
        ['Tìm th?y', '{t(\'questionBank.found\', "Tìm th?y")}'],
        ['câu h?i', '{t(\'questionBank.questions\', "câu h?i")}'],
        ['Luy?n t?p', '{t(\'questionBank.practiceNow\', "Luy?n t?p")}'],
        ['Top ch? d?', '{t(\'questionBank.topTopics\', "Top ch? d?")}'],
        ['Th?ng kê nhanh', '{t(\'questionBank.quickStats\', "Th?ng kê nhanh")}'],
        ['Ðã th?c hành', '{t(\'questionBank.practiced\', "Ðã th?c hành")}'],
        ['Ði?m trung bình', '{t(\'questionBank.avgScore\', "Ði?m trung bình")}'],
        ['Linh v?c', '{t(\'questionBank.domain\', "Linh v?c")}'],
        ['Làm m?i', '{t(\'questionBank.refresh\', "Làm m?i")}']
    ];
    for(const [s, r] of map) {
        content = content.replaceAll(s, r);
    }
    fs.writeFileSync(tsxPath, content);
}

function applyToPackages() {
    const tsxPath = 'E:/speak/DOANCOSO/doancoso/frontend/src/pages/PackagesPage.tsx';
    let content = fs.readFileSync(tsxPath, 'utf8');

    if (!content.includes("useTranslation")) {
        content = content.replace("import { useEffect", "import { useTranslation } from 'react-i18next';\nimport { useEffect");
    }
    if (!content.includes("const { t } = useTranslation();")) {
        content = content.replace("export function PackagesPage() {", "export function PackagesPage() {\n  const { t } = useTranslation();");
    }
    const map = [
        ['Trang ch?', '{t(\'packages.breadcrumbHome\', "Trang ch?")}'],
        ['Gói d?ch v?', '{t(\'packages.breadcrumbPackage\', "Gói d?ch v?")}'],
        ['Nâng c?p k? nang', '{t(\'packages.badge1\', "Nâng c?p k? nang")}'],
        ['Ð?u tu cho s? nghi?p c?a b?n', '{t(\'packages.title\', "Ð?u tu cho s? nghi?p c?a b?n")}'],
        ['Nâng c?p tr?i nghi?m luy?n t?p ph?ng v?n v?i các gói d?ch v? linh ho?t. Phù h?p cho m?i nhu c?u t? co b?n d?n chuyên sâu.', '{t(\'packages.subtitle\', "Nâng c?p tr?i nghi?m luy?n t?p ph?ng v?n v?i các gói d?ch v? linh ho?t. Phù h?p cho m?i nhu c?u t? co b?n d?n chuyên sâu.")}'],
        ['L?i ích n?i b?t', '{t(\'packages.badge2\', "L?i ích n?i b?t")}'],
        ['M?i tính nang b?n c?n d? thành công', '{t(\'packages.featuresTitle\', "M?i tính nang b?n c?n d? thành công")}'],
        ['Gói n?p lu?t', '{t(\'packages.creditPackages\', "Gói n?p lu?t")}'],
        ['Gói cao c?p', '{t(\'packages.premiumPackages\', "Gói cao c?p")}'],
        ['Mua ngay', '{t(\'packages.buyNow\', "Mua ngay")}'],
        ['Ph? bi?n', '{t(\'packages.popular\', "Ph? bi?n")}'],
        ['VND', '{t(\'packages.currency\', "VND")}'],
        ['lu?t', '{t(\'packages.attemptsUnit\', "lu?t")}'],
        ['lu?t ph?ng v?n', '{t(\'packages.attemptsLabel\', "lu?t ph?ng v?n")}'],
        ['ngày s? d?ng', '{t(\'packages.daysLabel\', "ngày s? d?ng")}'],
        ['Lu?t ph?ng v?n', '{t(\'packages.attemptsIncluded\', "Lu?t ph?ng v?n")}'],
        ['Th?i h?n', '{t(\'packages.validity\', "Th?i h?n")}'],
        ['Ngày', '{t(\'packages.daysUnit\', "Ngày")}'],
        ['Không có gói d?ch v? nào hi?n có.', '{t(\'packages.noPackages\', "Không có gói d?ch v? nào hi?n có.")}'],
        ['Thanh toán thành công! Lu?t luy?n t?p dã du?c c?ng vào tài kho?n c?a b?n.', '{t(\'packages.txSuccess\', "Thanh toán thành công! Lu?t luy?n t?p dã du?c c?ng vào tài kho?n c?a b?n.")}'],
        ['Giao d?ch dã b? h?y.', '{t(\'packages.txCancelled\', "Giao d?ch dã b? h?y.")}'],
        ['Vui lòng dang nh?p d? nâng c?p gói d?ch v?.', '{t(\'packages.requireLogin\', "Vui lòng dang nh?p d? nâng c?p gói d?ch v?.")}']
    ];
    for(const [s, r] of map) {
        content = content.replaceAll(s, r);
    }
    fs.writeFileSync(tsxPath, content);
}

applyToQuestionBank();
applyToPackages();
console.log('Applied QuestionBank and Packages');
