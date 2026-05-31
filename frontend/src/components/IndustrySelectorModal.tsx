import React, { useState, useEffect } from 'react';
import { Search, X, Check, ChevronRight } from 'lucide-react';
import { INDUSTRY_DATA, IndustryCategory, SubCategory, Specialization } from '../data/industryData';
import './IndustrySelectorModal.css';

interface IndustrySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIndustry: string;
  onApply: (industryName: string) => void;
}

export function IndustrySelectorModal({ isOpen, onClose, selectedIndustry, onApply }: IndustrySelectorModalProps) {
  const [activeCategory, setActiveCategory] = useState<IndustryCategory | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<SubCategory | null>(null);
  
  // Track selected name (we only allow single selection to match current API, but UI looks like checkbox for extensibility)
  const [currentSelection, setCurrentSelection] = useState<string>(selectedIndustry);
  const [searchTerm, setSearchTerm] = useState('');

  // Reset internal state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentSelection(selectedIndustry);
      // Optional: Auto-expand the category/subcategory that contains the selected industry
      if (selectedIndustry && selectedIndustry !== 'Tất cả') {
        let found = false;
        for (const cat of INDUSTRY_DATA) {
          for (const sub of cat.subcategories) {
            if (sub.specializations.some(spec => spec.name === selectedIndustry)) {
              setActiveCategory(cat);
              setActiveSubcategory(sub);
              found = true;
              break;
            }
          }
          if (found) break;
        }
      } else {
        setActiveCategory(null);
        setActiveSubcategory(null);
      }
      setSearchTerm('');
    }
  }, [isOpen, selectedIndustry]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(currentSelection);
    onClose();
  };

  const handleClear = () => {
    setCurrentSelection('');
    onApply('');
    onClose();
  };

  return (
    <div className="ind-modal-overlay" onClick={onClose}>
      <div className="ind-modal-container" onClick={e => e.stopPropagation()}>
        <div className="ind-modal-header">
          <h2>Chọn ngành nghề</h2>
          <button className="ind-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="ind-search-bar">
          <Search size={18} className="ind-search-icon" />
          <input 
            type="text" 
            placeholder="Tìm kiếm ngành nghề..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="ind-modal-body">
          {/* Column 1: Categories */}
          <div className="ind-col">
            <div className="ind-col-header">NHÓM NGÀNH</div>
            <div className="ind-list">
              {INDUSTRY_DATA.map(cat => (
                <div 
                  key={cat.id} 
                  className={`ind-list-item ${activeCategory?.id === cat.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCategory(cat);
                    setActiveSubcategory(null); // Reset subcategory when category changes
                  }}
                >
                  <span className="ind-item-name">{cat.name}</span>
                  <ChevronRight size={16} className="ind-arrow" />
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Subcategories */}
          <div className="ind-col">
            <div className="ind-col-header">NGÀNH NGHỀ</div>
            <div className="ind-list">
              {!activeCategory ? (
                <div className="ind-empty-state">
                  <span className="ind-empty-arrow">&larr;</span> Chọn nhóm nghề
                </div>
              ) : (
                activeCategory.subcategories.map(sub => (
                  <div 
                    key={sub.id} 
                    className={`ind-list-item ${activeSubcategory?.id === sub.id ? 'active' : ''}`}
                    onClick={() => setActiveSubcategory(sub)}
                  >
                    <span className="ind-item-name">{sub.name}</span>
                    <ChevronRight size={16} className="ind-arrow" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3: Specializations */}
          <div className="ind-col ind-col-last">
            <div className="ind-col-header">VỊ TRÍ CHUYÊN MÔN</div>
            <div className="ind-list">
              {!activeSubcategory ? (
                <div className="ind-empty-state">
                  <span className="ind-empty-arrow">&larr;</span> Chọn nghề
                </div>
              ) : (
                activeSubcategory.specializations.map(spec => (
                  <label key={spec.id} className="ind-checkbox-item">
                    <input 
                      type="checkbox" 
                      checked={currentSelection === spec.name}
                      onChange={() => {
                        if (currentSelection === spec.name) {
                          setCurrentSelection('Tất cả');
                        } else {
                          setCurrentSelection(spec.name);
                        }
                      }}
                    />
                    <div className="ind-checkbox-box">
                      {currentSelection === spec.name && <Check size={12} />}
                    </div>
                    <span className="ind-item-name">{spec.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="ind-modal-footer">
          <button className="ind-clear-btn" onClick={handleClear}>
            Bỏ chọn tất cả
          </button>
          <button className="ind-apply-btn" onClick={handleApply}>
            Áp dụng <Check size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
