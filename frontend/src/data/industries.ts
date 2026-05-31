// Dữ liệu ngành nghề phân 3 cấp: Nhóm nghề → Nghề → Vị trí chuyên môn

export interface IndustrySpecialization {
  label: string;
  value: string;
}

export interface IndustryItem {
  label: string;
  value: string;
  specializations: IndustrySpecialization[];
}

export interface IndustryGroup {
  label: string;
  value: string;
  industries: IndustryItem[];
}

export const INDUSTRY_GROUPS: IndustryGroup[] = [
  {
    label: 'CÔNG NGHỆ THÔNG TIN',
    value: 'CONG_NGHE_THONG_TIN',
    industries: [
      {
        label: 'Software Engineering',
        value: 'Software Engineering',
        specializations: [
          { label: 'Frontend Developer', value: 'Frontend Developer' },
          { label: 'Backend Developer', value: 'Backend Developer' },
          { label: 'Fullstack Developer', value: 'Fullstack Developer' },
          { label: 'Mobile Developer (iOS/Android)', value: 'Mobile Developer' },
          { label: 'DevOps / Cloud Engineer', value: 'DevOps Engineer' }
        ]
      },
      {
        label: 'Artificial Intelligence (AI)',
        value: 'Artificial Intelligence (AI)',
        specializations: [
          { label: 'Machine Learning Engineer', value: 'Machine Learning Engineer' },
          { label: 'AI Researcher', value: 'AI Researcher' },
          { label: 'NLP Engineer', value: 'NLP Engineer' },
          { label: 'Computer Vision Engineer', value: 'Computer Vision Engineer' }
        ]
      },
      {
        label: 'Data Science',
        value: 'Data Science',
        specializations: [
          { label: 'Data Analyst', value: 'Data Analyst' },
          { label: 'Data Engineer', value: 'Data Engineer' },
          { label: 'Data Scientist', value: 'Data Scientist' },
          { label: 'BI Developer', value: 'BI Developer' }
        ]
      },
      {
        label: 'Information Security',
        value: 'Information Security',
        specializations: [
          { label: 'Penetration Tester', value: 'Penetration Tester' },
          { label: 'Security Analyst', value: 'Security Analyst' },
          { label: 'SOC Analyst', value: 'SOC Analyst' }
        ]
      },
      {
        label: 'IT Project Management',
        value: 'IT Project Management',
        specializations: [
          { label: 'Project Manager', value: 'Project Manager' },
          { label: 'Scrum Master', value: 'Scrum Master' },
          { label: 'Product Owner', value: 'Product Owner' }
        ]
      },
      {
        label: 'QA / Testing',
        value: 'QA Testing',
        specializations: [
          { label: 'Manual Tester', value: 'Manual Tester' },
          { label: 'Automation Tester', value: 'Automation Tester' },
          { label: 'QA Lead', value: 'QA Lead' }
        ]
      }
    ]
  },
  {
    label: 'MARKETING/PR/QUẢNG CÁO',
    value: 'MARKETING_PR_QUANG_CAO',
    industries: [
      {
        label: 'Digital Marketing',
        value: 'Digital Marketing',
        specializations: [
          { label: 'Performance Marketing', value: 'Performance Marketing' },
          { label: 'Content Marketing', value: 'Content Marketing' },
          { label: 'SEO Specialist', value: 'SEO Specialist' },
          { label: 'Social Media Manager', value: 'Social Media Manager' },
          { label: 'Email Marketing', value: 'Email Marketing' }
        ]
      },
      {
        label: 'Brand Marketing',
        value: 'Brand Marketing',
        specializations: [
          { label: 'Brand Manager', value: 'Brand Manager' },
          { label: 'Brand Strategist', value: 'Brand Strategist' }
        ]
      },
      {
        label: 'Public Relations',
        value: 'Public Relations',
        specializations: [
          { label: 'PR Manager', value: 'PR Manager' },
          { label: 'PR Specialist', value: 'PR Specialist' }
        ]
      }
    ]
  },
  {
    label: 'CHĂM SÓC KHÁCH HÀNG/VẬN HÀNH',
    value: 'CHAM_SOC_KHACH_HANG',
    industries: [
      {
        label: 'Customer Service',
        value: 'Customer Service',
        specializations: [
          { label: 'Customer Success Manager', value: 'Customer Success Manager' },
          { label: 'Customer Support Specialist', value: 'Customer Support Specialist' },
          { label: 'Account Manager', value: 'Account Manager' }
        ]
      },
      {
        label: 'Operations',
        value: 'Operations',
        specializations: [
          { label: 'Operations Manager', value: 'Operations Manager' },
          { label: 'Business Analyst', value: 'Business Analyst' },
          { label: 'Process Improvement Specialist', value: 'Process Improvement Specialist' }
        ]
      }
    ]
  },
  {
    label: 'NHÂN SỰ/HÀNH CHÍNH/PHÁP CHẾ',
    value: 'NHAN_SU_HANH_CHINH',
    industries: [
      {
        label: 'Human Resources',
        value: 'Human Resources',
        specializations: [
          { label: 'Talent Acquisition', value: 'Talent Acquisition' },
          { label: 'HR Business Partner', value: 'HR Business Partner' },
          { label: 'Learning & Development', value: 'Learning & Development' },
          { label: 'Compensation & Benefits', value: 'Compensation & Benefits' }
        ]
      },
      {
        label: 'Legal & Compliance',
        value: 'Legal Compliance',
        specializations: [
          { label: 'Legal Counsel', value: 'Legal Counsel' },
          { label: 'Compliance Officer', value: 'Compliance Officer' }
        ]
      }
    ]
  },
  {
    label: 'TÀI CHÍNH/KẾ TOÁN/KIỂM TOÁN',
    value: 'TAI_CHINH_KE_TOAN',
    industries: [
      {
        label: 'Finance',
        value: 'Finance',
        specializations: [
          { label: 'Financial Analyst', value: 'Financial Analyst' },
          { label: 'Financial Controller', value: 'Financial Controller' },
          { label: 'Investment Analyst', value: 'Investment Analyst' }
        ]
      },
      {
        label: 'Accounting',
        value: 'Accounting',
        specializations: [
          { label: 'Accountant', value: 'Accountant' },
          { label: 'Chief Accountant', value: 'Chief Accountant' },
          { label: 'Auditor', value: 'Auditor' }
        ]
      }
    ]
  },
  {
    label: 'KINH DOANH/BÁN HÀNG',
    value: 'KINH_DOANH_BAN_HANG',
    industries: [
      {
        label: 'Sales',
        value: 'Sales',
        specializations: [
          { label: 'Sales Representative', value: 'Sales Representative' },
          { label: 'Sales Manager', value: 'Sales Manager' },
          { label: 'Business Development', value: 'Business Development' },
          { label: 'Key Account Manager', value: 'Key Account Manager' }
        ]
      },
      {
        label: 'E-commerce',
        value: 'E-commerce',
        specializations: [
          { label: 'E-commerce Manager', value: 'E-commerce Manager' },
          { label: 'Marketplace Specialist', value: 'Marketplace Specialist' }
        ]
      }
    ]
  },
  {
    label: 'THIẾT KẾ/SÁNG TẠO',
    value: 'THIET_KE_SANG_TAO',
    industries: [
      {
        label: 'UI/UX Design',
        value: 'UI UX Design',
        specializations: [
          { label: 'UI Designer', value: 'UI Designer' },
          { label: 'UX Designer', value: 'UX Designer' },
          { label: 'Product Designer', value: 'Product Designer' }
        ]
      },
      {
        label: 'Graphic Design',
        value: 'Graphic Design',
        specializations: [
          { label: 'Graphic Designer', value: 'Graphic Designer' },
          { label: 'Motion Designer', value: 'Motion Designer' }
        ]
      }
    ]
  }
];

export const EXPERIENCE_LEVELS = [
  { label: 'Mới tốt nghiệp', sublabel: '0 - 1 năm', value: 'fresher' },
  { label: 'Junior', sublabel: '1 - 3 năm', value: 'junior' },
  { label: 'Mid-level', sublabel: '3 - 5 năm', value: 'mid' },
  { label: 'Senior', sublabel: '5+ năm', value: 'senior' }
];
