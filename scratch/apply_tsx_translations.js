const fs = require('fs');

function applyToDashboard() {
    const tsxPath = 'E:/speak/DOANCOSO/doancoso/frontend/src/pages/DashboardPage.tsx';
    let content = fs.readFileSync(tsxPath, 'utf8');

    if (!content.includes("useTranslation")) {
        content = content.replace("import { useEffect", "import { useTranslation } from 'react-i18next';\nimport { useEffect");
    }
    if (!content.includes("const { t } = useTranslation();")) {
        content = content.replace("export function DashboardPage() {", "export function DashboardPage() {\n  const { t } = useTranslation();");
    }

    const map = [
        ['<p className="eyebrow">T?ng quan luy?n t?p</p>', '<p className="eyebrow">{t(\'dashboard.overviewDesc\')}</p>'],
        ['<h3>T?ng quan luy?n t?p</h3>', '<h3>{t(\'dashboard.welcome\', { name: user?.name || t(\'dashboard.welcomeFallback\') })}</h3>'],
        ['Toàn b? ti?n d? trong m?t noi', '{t(\'dashboard.overviewDesc\')}'],
        ['Trung tâm luy?n t?p', '{t(\'dashboard.practiceCenter\', "Trung tâm luy?n t?p")}'],
        ['Uu tiên hôm nay là "Ði?m danh hôm nay". Hoàn t?t d? gi? nh?p\\n            luy?n t?p trong ngày.', '{t(\'dashboard.todayPriority\', "Uu tiên hôm nay là \\"Ði?m danh hôm nay\\". Hoàn t?t d? gi? nh?p luy?n t?p trong ngày.")}'],
        ['M? phòng tho?i ho?c ghi âm m?t\\n                    phiên m?i.', '{t(\'dashboard.practiceNowDesc\', "M? phòng tho?i ho?c ghi âm m?t phiên m?i.")}'],
        ['Luy?n ngay', '{t(\'dashboard.startNow\')}'],
        ['Phân tích CV', '{t(\'dashboard.cvAnalysis\', "Phân tích CV")}'],
        ['Sinh câu h?i và l? trình luy?n t?p t?\\n                    h? so.', '{t(\'dashboard.cvAnalysisDesc\', "Sinh câu h?i và l? trình luy?n t?p t? h? so.")}'],
        ['Hoàn thi?n h? so', '{t(\'dashboard.completeProfile\', "Hoàn thi?n h? so")}'],
        ['C?p nh?t ng? c?nh d? AI cá nhân\\n                    hóa t?t hon.', '{t(\'dashboard.completeProfileDesc\', "C?p nh?t ng? c?nh d? AI cá nhân hóa t?t hon.")}'],
        ['<p className="eyebrow">M?c tiêu hôm nay</p>', '<p className="eyebrow">{t(\'dashboard.goalsToday\', "M?c tiêu hôm nay")}</p>'],
        ["'Ðã hoàn t?t m?i m?c tiêu'", "t('dashboard.allGoalsCompleted', 'Ðã hoàn t?t m?i m?c tiêu')"],
        ["'Hoàn t?t'", "t('dashboard.completed', 'Hoàn t?t')"],
        ['Ðã nh?n', '{t(\'dashboard.claimed\', "Ðã nh?n")}'],
        ['M?c tiêu ngày', '{t(\'dashboard.dailyGoals\', "M?c tiêu ngày")}'],
        ['Danh sách c?n hoàn thành', '{t(\'dashboard.todoList\', "Danh sách c?n hoàn thành")}'],
        ['nhi?m v? m?', '{t(\'dashboard.openTasks\', "nhi?m v? m?")}'],
        ['S?n sàng', '{t(\'dashboard.ready\', "S?n sàng")}'],
        ['Ðang làm', '{t(\'dashboard.inProgress\', "Ðang làm")}'],
        ['Nh?n thu?ng', '{t(\'dashboard.claimReward\', "Nh?n thu?ng")}'],
        ['Nhìn nhanh', '{t(\'dashboard.quickGlance\', "Nhìn nhanh")}'],
        ['Tr?ng thái tu?n này', '{t(\'dashboard.weeklyStatus\', "Tr?ng thái tu?n này")}'],
        ['Phiên dã luu', '{t(\'dashboard.totalSessions\', "Phiên dã luu")}'],
        ['Phút hôm nay', '{t(\'dashboard.minutesToday\', "Phút hôm nay")}'],
        ['Ði?m g?n dây', '{t(\'dashboard.recentScore\', "Ði?m g?n dây")}'],
        ['L?ch s? luy?n t?p', '{t(\'dashboard.interviewHistory\', "L?ch s? luy?n t?p")}'],
        ['Các phiên th?c hành g?n nh?t', '{t(\'dashboard.recentSessions\', "Các phiên th?c hành g?n nh?t")}'],
        ['Chi ti?t', '{t(\'dashboard.viewDetails\', "Chi ti?t")}'],
        ['Chua có d? li?u luy?n t?p', '{t(\'dashboard.noData\', "Chua có d? li?u luy?n t?p")}'],
        ['B?t d?u phiên luy?n t?p d?u tiên c?a b?n ngay hôm nay.', '{t(\'dashboard.startFirstSession\', "B?t d?u phiên luy?n t?p d?u tiên c?a b?n ngay hôm nay.")}']
    ];
    for(const [s, r] of map) {
        content = content.replaceAll(s, r);
    }
    fs.writeFileSync(tsxPath, content);
}

function applyToProfile() {
    const tsxPath = 'E:/speak/DOANCOSO/doancoso/frontend/src/pages/ProfilePage.tsx';
    let content = fs.readFileSync(tsxPath, 'utf8');

    if (!content.includes("useTranslation")) {
        content = content.replace("import { useEffect", "import { useTranslation } from 'react-i18next';\nimport { useEffect");
    }
    if (!content.includes("const { t } = useTranslation();")) {
        content = content.replace("export function ProfilePage() {", "export function ProfilePage() {\n  const { t } = useTranslation();");
    }

    const map = [
        ["['M?i b?t d?u', 'So c?p', 'Trung c?p', 'Nng cao']", "[t('profilePage.expBeginner', 'M?i b?t d?u'), t('profilePage.expJunior', 'So c?p'), t('profilePage.expMid', 'Trung c?p'), t('profilePage.expSenior', 'Nâng cao')]"],
        ['T?ng quan AI', '{t(\'profilePage.aiOverview\', "T?ng quan AI")}'],
        ['H? so phân tích', '{t(\'profilePage.analyzedProfile\', "H? so phân tích")}'],
        ['Vai trò m?c tiêu', '{t(\'profilePage.targetRole\', "Vai trò m?c tiêu")}'],
        ['Chua xác d?nh', '{t(\'profilePage.undefined\', "Chua xác d?nh")}'],
        ['M?c kinh nghi?m', '{t(\'profilePage.expLevel\', "M?c kinh nghi?m")}'],
        ['K? nang', '{t(\'profilePage.skills\', "K? nang")}'],
        ['Tr?ng thái', '{t(\'profilePage.status\', "Tr?ng thái")}'],
        ['Luy?n ngay', '{t(\'profilePage.practiceNow\', "Luy?n ngay")}'],
        ['M? Phòng CV', '{t(\'profilePage.openCvRoom\', "M? Phòng CV")}'],
        ['Ng? c?nh AI', '{t(\'profilePage.aiContext\', "Ng? c?nh AI")}'],
        ['Ng? c?nh hi?n t?i', '{t(\'profilePage.currentContext\', "Ng? c?nh hi?n t?i")}'],
        ['H? so cá nhân hóa', '{t(\'profilePage.personalizedProfile\', "H? so cá nhân hóa")}'],
        ['Vai trò', '{t(\'profilePage.role\', "Vai trò")}'],
        ['Chua c?p nh?t', '{t(\'profilePage.notUpdated\', "Chua c?p nh?t")}'],
        ['Kinh nghi?m', '{t(\'profilePage.experience\', "Kinh nghi?m")}'],
        ['K? nang n?i b?t', '{t(\'profilePage.topSkills\', "K? nang n?i b?t")}'],
        ['Tóm t?t AI', '{t(\'profilePage.aiSummary\', "Tóm t?t AI")}'],
        ['Ch?nh s?a', '{t(\'profilePage.edit\', "Ch?nh s?a")}'],
        ['Thông tin h? so', '{t(\'profilePage.profileInfo\', "Thông tin h? so")}'],
        ['H? so SpeakAI', '{t(\'profilePage.speakAiProfile\', "H? so SpeakAI")}'],
        ['H? tên', '{t(\'profilePage.fullName\', "H? tên")}'],
        ['V? trí m?c tiêu', '{t(\'profilePage.targetPosition\', "V? trí m?c tiêu")}'],
        ['Ví d?: Frontend Intern', '{t(\'profilePage.roleExample\', "Ví d?: Frontend Intern")}'],
        ['React, TypeScript, Giao ti?p', '{t(\'profilePage.skillsExample\', "React, TypeScript, Giao ti?p")}'],
        ['Gi?i thi?u', '{t(\'profilePage.bio\', "Gi?i thi?u")}'],
        ['Mô t? ng?n v? m?c tiêu, th? m?nh và lo?i co h?i b?n dang hu?ng t?i', '{t(\'profilePage.bioPlaceholder\', "Mô t? ng?n v? m?c tiêu, th? m?nh và lo?i co h?i b?n dang hu?ng t?i")}'],
        ['Ðang luu...', '{t(\'profilePage.saving\', "Ðang luu...")}'],
        ['Luu thay d?i', '{t(\'profilePage.saveChanges\', "Luu thay d?i")}'],
        ['Tình tr?ng hi?n t?i', '{t(\'profilePage.currentStatus\', "Tình tr?ng hi?n t?i")}'],
        ['Ch? s? cá nhân', '{t(\'profilePage.personalStats\', "Ch? s? cá nhân")}'],
        ['Chu?i ngày', '{t(\'profilePage.streak\', "Chu?i ngày")}'],
        ['ngày', '{t(\'profilePage.days\', "ngày")}'],
        ['Nang lu?ng', '{t(\'profilePage.energy\', "Nang lu?ng")}'],
        ['T?ng XP', '{t(\'profilePage.totalXp\', "T?ng XP")}'],
        ['C?p hi?n t?i', '{t(\'profilePage.currentLevel\', "C?p hi?n t?i")}'],
        ['C?p', '{t(\'profilePage.level\', "C?p")}'],
        ['Uu tiên ti?p theo', '{t(\'profilePage.nextPriority\', "Uu tiên ti?p theo")}'],
        ["'Ðã có vai trò m?c tiêu.'", "t('profilePage.hasRole', 'Ðã có vai trò m?c tiêu.')"],
        ["'Thêm vai trò m?c tiêu d? AI d?t câu h?i dúng hu?ng.'", "t('profilePage.noRole', 'Thêm vai trò m?c tiêu d? AI d?t câu h?i dúng hu?ng.')"],
        ["'B? k? nang dã d? rõ.'", "t('profilePage.hasSkills', 'B? k? nang dã d? rõ.')"],
        ["'Nên thêm ít nh?t 3 k? nang n?i b?t.'", "t('profilePage.noSkills', 'Nên thêm ít nh?t 3 k? nang n?i b?t.')"],
        ["'Ðã có mô t? b?i c?nh cá nhân.'", "t('profilePage.hasBio', 'Ðã có mô t? b?i c?nh cá nhân.')"],
        ["'B? sung ph?n gi?i thi?u d? AI ph?n h?i sát hon.'", "t('profilePage.noBio', 'B? sung ph?n gi?i thi?u d? AI ph?n h?i sát hon.')"],
        ['K? nang hi?n có', '{t(\'profilePage.existingSkills\', "K? nang hi?n có")}'],
        ['Chua có k? nang nào.', '{t(\'profilePage.noSkillsYet\', "Chua có k? nang nào.")}']
    ];
    for(const [s, r] of map) {
        content = content.replaceAll(s, r);
    }
    fs.writeFileSync(tsxPath, content);
}

applyToDashboard();
applyToProfile();
console.log('Applied Dash and Profile');
