const fs = require('fs');

function applyToAdminPackages() {
    const tsxPath = 'E:/speak/DOANCOSO/doancoso/frontend/src/pages/AdminPackagesPage.tsx';
    let content = fs.readFileSync(tsxPath, 'utf8');

    if (!content.includes("useTranslation")) {
        content = content.replace("import { useEffect", "import { useTranslation } from 'react-i18next';\nimport { useEffect");
    }
    if (!content.includes("const { t } = useTranslation();")) {
        content = content.replace("export function AdminPackagesPage() {", "export function AdminPackagesPage() {\n  const { t } = useTranslation();");
    }
    const map = [
        ['Qu?n lý Gói D?ch v?', '{t(\'adminPackages.title\', "Qu?n lý Gói D?ch v?")}'],
        ['Thêm Gói M?i', '{t(\'adminPackages.addNew\', "Thêm Gói M?i")}'],
        ['Gói n?p lu?t', '{t(\'adminPackages.creditType\', "Gói n?p lu?t")}'],
        ['Gói cao c?p', '{t(\'adminPackages.premiumType\', "Gói cao c?p")}'],
        ['VNÐ', '{t(\'adminPackages.currency\', "VNÐ")}'],
        ['lu?t', '{t(\'adminPackages.attemptsLabel\', "lu?t")}'],
        ['ngày', '{t(\'adminPackages.daysLabel\', "ngày")}'],
        ['Ph? bi?n', '{t(\'adminPackages.badgePopular\', "Ph? bi?n")}'],
        ['H?t h?n (Ðang ?n)', '{t(\'adminPackages.statusExpired\', "H?t h?n (Ðang ?n)")}'],
        ['Ho?t d?ng', '{t(\'adminPackages.statusActive\', "Ho?t d?ng")}'],
        ['Vô hi?u', '{t(\'adminPackages.statusInactive\', "Vô hi?u")}'],
        ['Ch?nh s?a gói', '{t(\'adminPackages.editTitle\', "Ch?nh s?a gói")}'],
        ['Thêm gói m?i', '{t(\'adminPackages.createTitle\', "Thêm gói m?i")}'],
        ['Tên gói', '{t(\'adminPackages.formName\', "Tên gói")}'],
        ['Màu s?c', '{t(\'adminPackages.formColor\', "Màu s?c")}'],
        ['Giá bán (VNÐ)', '{t(\'adminPackages.formPrice\', "Giá bán (VNÐ)")}'],
        ['Giá g?c (VNÐ)', '{t(\'adminPackages.formOriginalPrice\', "Giá g?c (VNÐ)")}'],
        ['Th?i h?n hi?n th?', '{t(\'adminPackages.formPeriod\', "Th?i h?n hi?n th?")}'],
        ['S? lu?t ph?ng v?n c?ng thêm', '{t(\'adminPackages.formAttempts\', "S? lu?t ph?ng v?n c?ng thêm")}'],
        ['Tính nang (M?i dòng 1 tính nang)', '{t(\'adminPackages.formFeatures\', "Tính nang (M?i dòng 1 tính nang)")}'],
        ['Hi?n th? badge N?i b?t', '{t(\'adminPackages.formPopularDesc\', "Hi?n th? badge N?i b?t")}'],
        ['Kích ho?t', '{t(\'adminPackages.formActive\', "Kích ho?t")}'],
        ['Hi?n th? gói này', '{t(\'adminPackages.formActiveDesc\', "Hi?n th? gói này")}'],
        ['H?y', '{t(\'adminPackages.cancel\', "H?y")}'],
        ['Luu gói', '{t(\'adminPackages.saveChanges\', "Luu gói")}'],
        ["'Ch?nh s?a gói'", "t('adminPackages.editTitle', 'Ch?nh s?a gói')"],
        ["'Thêm gói m?i'", "t('adminPackages.createTitle', 'Thêm gói m?i')"]
    ];
    for(const [s, r] of map) {
        content = content.replaceAll(s, r);
    }
    fs.writeFileSync(tsxPath, content);
}

applyToAdminPackages();
console.log('Applied AdminPackages');
