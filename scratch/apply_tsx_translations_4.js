const fs = require('fs');

function applyToSession() {
    const tsxPath = 'E:/speak/DOANCOSO/doancoso/frontend/src/pages/InterviewSessionPage.tsx';
    let content = fs.readFileSync(tsxPath, 'utf8');

    if (!content.includes("useTranslation")) {
        content = content.replace("import { useEffect", "import { useTranslation } from 'react-i18next';\nimport { useEffect");
    }
    if (!content.includes("const { t } = useTranslation();")) {
        content = content.replace("export function InterviewSessionPage() {", "export function InterviewSessionPage() {\n  const { t } = useTranslation();");
    }
    const map = [
        ['<Joyride', '{(Joyride as any)({'],
        ['/>', '})}'],
        ['styles={{', 'styles: {'],
        ['}}', '} as any'],
        ['<Joyride\\n          steps={tourSteps}\\n          run={runTour}\\n          continuous={true}\\n          showProgress={true}\\n          showSkipButton={false}\\n          disableOverlayClose={true}\\n          spotlightPadding={8}\\n          tooltipComponent={CustomTooltip}\\n          locale={{ back: \\'+? Previous\\', close: \\'?A3ng\\', last: \\'B_t  u\\', next: \\'Tip theo\\', skip: \\'B? qua\\' \\n}}\\n          styles={{\\n            options: {\\n              primaryColor: \\'#6366f1\\',\\n              backgroundColor: \\'#1e1b2e\\',\\n              textColor: \\'#fff\\',\\n              arrowColor: \\'#1a1625\\',\\n            },\\n            overlay: {\\n              backgroundColor: \\'rgba(0, 0, 0, 0.5)\\',\\n            },\\n            spotlight: {\\n            }\\n          }}\\n          callback={handleTourCallback}\\n        />', '{(Joyride as any)({\\n          steps: tourSteps,\\n          run: runTour,\\n          continuous: true,\\n          showSkipButton: false,\\n          disableOverlayClose: true,\\n          spotlightPadding: 8,\\n          tooltipComponent: CustomTooltip,\\n          locale: { back: t(\\'session.tourPrevious\\'), close: t(\\'session.tourClose\\'), last: t(\\'session.tourStart\\'), next: t(\\'session.tourNext\\'), skip: t(\\'session.tourSkip\\') },\\n          styles: {\\n            options: {\\n              primaryColor: \\'#6366f1\\',\\n              backgroundColor: \\'#1e1b2e\\',\\n              textColor: \\'#fff\\',\\n              arrowColor: \\'#1a1625\\',\\n            },\\n            overlay: {\\n              backgroundColor: \\'rgba(0, 0, 0, 0.5)\\',\\n            },\\n            spotlight: {\\n            }\\n          } as any,\\n          callback: handleTourCallback\\n        })}']
    ];
    // We can just use multi_replace_file_content for Joyride directly in a bit, or let's do the string replace.
    // Actually, I'll just replace the Joyride part manually since it spans multiple lines.
    
    // Replace translations
    const tMap = [
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
    for(const [s, r] of tMap) {
        content = content.replaceAll(s, r);
    }
    fs.writeFileSync(tsxPath, content);
}

applyToSession();
console.log('Applied Session');
