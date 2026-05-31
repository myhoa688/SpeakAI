import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Briefcase, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { INDUSTRY_GROUPS, EXPERIENCE_LEVELS, type IndustryItem } from '../data/industries';
import './OnboardingPage.css';

type Step = 1 | 2 | 3;

export function OnboardingPage() {
  const navigate = useNavigate();
  const { refreshMe } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('');
  const [selectedExperience, setSelectedExperience] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');

  const activeGroup = INDUSTRY_GROUPS.find((g) => g.value === selectedGroup);

  const filteredGroups = INDUSTRY_GROUPS.filter((g) =>
    searchText
      ? g.label.toLowerCase().includes(searchText.toLowerCase()) ||
        g.industries.some((i) =>
          i.label.toLowerCase().includes(searchText.toLowerCase()) ||
          i.specializations.some((s) => s.label.toLowerCase().includes(searchText.toLowerCase()))
        )
      : true
  );

  const getIndustriesForDisplay = (): IndustryItem[] => {
    if (!searchText) return activeGroup?.industries ?? [];
    // Khi search: hiển thị industries từ tất cả groups match
    return INDUSTRY_GROUPS.flatMap((g) =>
      g.industries.filter(
        (i) =>
          i.label.toLowerCase().includes(searchText.toLowerCase()) ||
          i.specializations.some((s) => s.label.toLowerCase().includes(searchText.toLowerCase()))
      )
    );
  };

  const industriesForDisplay = getIndustriesForDisplay();
  const activeIndustry = industriesForDisplay.find((i) => i.value === selectedIndustry);

  const handleGroupSelect = (groupValue: string) => {
    setSelectedGroup(groupValue);
    setSelectedIndustry('');
    setSelectedSpecialization('');
    setSearchText('');
  };

  const handleIndustrySelect = (industryValue: string) => {
    setSelectedIndustry(industryValue);
    setSelectedSpecialization('');
  };

  const handleContinue = () => {
    if (!selectedIndustry) {
      setError('Vui lòng chọn nghề của bạn.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleComplete = async () => {
    if (!selectedExperience) {
      setError('Vui lòng chọn mức kinh nghiệm của bạn.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const groupLabel = INDUSTRY_GROUPS.find((g) => g.value === selectedGroup)?.label ?? selectedGroup;
      await api.post('/onboarding', {
        industryGroup: groupLabel,
        industry: selectedIndustry,
        specialization: selectedSpecialization,
        experienceLevel: selectedExperience
      });

      // Refresh user data từ server để cập nhật onboardingCompleted
      await refreshMe();

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="onboarding-shell">
      <div className="onboarding-card">
        {/* Header */}
        <div className="onboarding-header">
          <h1>Hãy cho chúng tôi biết thêm về bạn</h1>
          <p className="muted-text">Giúp chúng tôi cá nhân hóa trải nghiệm phỏng vấn cho bạn</p>

          {/* Step indicator */}
          <div className="xi-stepper">
            <div className="xi-step-line">
              <div className="xi-step-line-progress" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
            </div>
            <div className={`xi-step ${step >= 1 ? 'completed' : ''} ${step === 1 ? 'active' : ''}`}>
              <div className="xi-step-circle">{step > 1 ? '✓' : '1'}</div>
              <span>Ngành nghề</span>
            </div>
            <div className={`xi-step ${step >= 2 ? 'completed' : ''} ${step === 2 ? 'active' : ''}`}>
              <div className="xi-step-circle">{step > 2 ? '✓' : '2'}</div>
              <span>Kinh nghiệm</span>
            </div>
            <div className={`xi-step ${step === 3 ? 'active' : ''}`}>
              <div className="xi-step-circle">3</div>
              <span>Hoàn thành</span>
            </div>
          </div>
        </div>

        {/* Step 1: Ngành nghề */}
        {step === 1 && (
          <div className="onboarding-body">
            <h2>Bạn đang làm trong ngành nào?</h2>
            <p className="muted-text">Chọn ngành nghề và vị trí của bạn để nhận gợi ý phù hợp</p>

            <input
              className="onboarding-search"
              type="text"
              placeholder="🔍  Tìm kiếm ngành, nghề, vị trí..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                if (e.target.value) {
                  setSelectedGroup('');
                }
              }}
            />

            <div className="onboarding-picker">
              {/* Cột 1: Nhóm nghề */}
              <div className="onboarding-col">
                <span className="onboarding-col-label">NHÓM NGHỀ</span>
                <div className="onboarding-col-list">
                  {(searchText ? filteredGroups : INDUSTRY_GROUPS).map((group) => (
                    <button
                      key={group.value}
                      type="button"
                      className={`onboarding-col-item${selectedGroup === group.value ? ' active' : ''}`}
                      onClick={() => handleGroupSelect(group.value)}
                    >
                      {group.label}
                      <ChevronRight size={14} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Cột 2: Nghề */}
              <div className="onboarding-col">
                <span className="onboarding-col-label">NGHỀ</span>
                <div className="onboarding-col-list">
                  {industriesForDisplay.length > 0 ? (
                    industriesForDisplay.map((industry) => (
                      <button
                        key={industry.value}
                        type="button"
                        className={`onboarding-col-item${selectedIndustry === industry.value ? ' active' : ''}`}
                        onClick={() => handleIndustrySelect(industry.value)}
                      >
                        {industry.label}
                      </button>
                    ))
                  ) : (
                    <p className="onboarding-col-empty">
                      {selectedGroup ? 'Chọn nhóm nghề bên trái' : 'Chọn nhóm nghề trước'}
                    </p>
                  )}
                </div>
              </div>

              {/* Cột 3: Vị trí chuyên môn */}
              <div className="onboarding-col">
                <span className="onboarding-col-label">VỊ TRÍ CHUYÊN MÔN</span>
                <div className="onboarding-col-list">
                  {activeIndustry ? (
                    activeIndustry.specializations.map((spec) => (
                      <button
                        key={spec.value}
                        type="button"
                        className={`onboarding-col-item${selectedSpecialization === spec.value ? ' active' : ''}`}
                        onClick={() => setSelectedSpecialization(spec.value)}
                      >
                        {selectedSpecialization === spec.value && (
                          <CheckCircle2 size={14} className="onboarding-check" />
                        )}
                        {spec.label}
                      </button>
                    ))
                  ) : (
                    <p className="onboarding-col-empty">Chọn nghề trước</p>
                  )}
                </div>
              </div>
            </div>

            {/* Selection summary */}
            {selectedIndustry && (
              <div className="onboarding-selection">
                <Briefcase size={16} />
                <span>
                  <strong>{activeIndustry?.label || selectedIndustry}</strong>
                  {selectedSpecialization && ` — ${activeIndustry?.specializations.find(s => s.value === selectedSpecialization)?.label || selectedSpecialization}`}
                </span>
              </div>
            )}

            {error && <p className="error-text">{error}</p>}

            <div className="onboarding-footer">
              <button
                type="button"
                className={`primary-button${!selectedIndustry ? ' disabled' : ''}`}
                onClick={handleContinue}
                disabled={!selectedIndustry}
              >
                Tiếp tục →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Kinh nghiệm */}
        {step === 2 && (
          <div className="onboarding-body">
            <h2>Kinh nghiệm của bạn?</h2>
            <p className="muted-text">Giúp chúng tôi đề xuất câu hỏi phù hợp với trình độ của bạn</p>

            <div className="onboarding-exp-list">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  className={`onboarding-exp-item${selectedExperience === level.value ? ' active' : ''}`}
                  onClick={() => setSelectedExperience(level.value)}
                >
                  <div className="onboarding-exp-radio">
                    <span className={`onboarding-radio-dot${selectedExperience === level.value ? ' active' : ''}`} />
                  </div>
                  <div className="onboarding-exp-copy">
                    <strong>{level.label}</strong>
                    <span>{level.sublabel}</span>
                  </div>
                  {selectedExperience === level.value && (
                    <CheckCircle2 size={20} className="onboarding-check-right" />
                  )}
                </button>
              ))}
            </div>

            {error && <p className="error-text">{error}</p>}

            <div className="onboarding-footer">
              <button
                type="button"
                className="ghost-button"
                onClick={() => { setStep(1); setError(''); }}
              >
                ← Quay lại
              </button>
              <button
                type="button"
                className={`primary-button${!selectedExperience ? ' disabled' : ''}`}
                onClick={() => {
                  if (!selectedExperience) {
                    setError('Vui lòng chọn mức kinh nghiệm của bạn.');
                    return;
                  }
                  setError('');
                  setStep(3);
                }}
                disabled={!selectedExperience}
              >
                Tiếp tục →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Hoàn thành */}
        {step === 3 && (
          <div className="onboarding-body">
            <h2>Hoàn tất thiết lập</h2>
            <p className="muted-text">Thông tin của bạn đã sẵn sàng. Nhấn hoàn thành để bắt đầu trải nghiệm.</p>

            <div className="onboarding-selection">
              <CheckCircle2 size={16} />
              <span>
                <strong>{activeIndustry?.label || selectedIndustry}</strong>
                {selectedSpecialization && ` — ${activeIndustry?.specializations.find(s => s.value === selectedSpecialization)?.label || selectedSpecialization}`}
                {' • '}
                {EXPERIENCE_LEVELS.find(l => l.value === selectedExperience)?.label || selectedExperience}
              </span>
            </div>

            {error && <p className="error-text">{error}</p>}

            <div className="onboarding-footer">
              <button
                type="button"
                className="ghost-button"
                onClick={() => { setStep(2); setError(''); }}
              >
                ← Quay lại
              </button>
              <button
                type="button"
                className={`xi-btn-primary${saving ? ' disabled' : ''}`}
                onClick={handleComplete}
                disabled={saving}
              >
                <GraduationCap size={16} />
                {saving ? 'Đang lưu...' : 'Hoàn thành ✓'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
