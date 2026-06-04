export interface Specialization {
  id: string;
  name: string;
}

export interface SubCategory {
  id: string;
  name: string;
  specializations: Specialization[];
}

export interface IndustryCategory {
  id: string;
  name: string;
  subcategories: SubCategory[];
}

export const INDUSTRY_DATA: IndustryCategory[] = [
  {
    id: 'KINH_DOANH',
    name: 'KINH DOANH/BÁN HÀNG',
    subcategories: [
      {
        id: 'ban_le',
        name: 'Bán lẻ/Bán sỉ',
        specializations: [
          { id: 'nv_ban_hang', name: 'Nhân viên bán hàng' },
          { id: 'cua_hang_truong', name: 'Cửa hàng trưởng' },
          { id: 'giam_sat_ban_hang', name: 'Giám sát bán hàng' },
          { id: 'quan_ly_khu_vuc', name: 'Quản lý khu vực (Area Manager)' }
        ]
      },
      {
        id: 'ban_hang_ky_thuat',
        name: 'Bán hàng kỹ thuật (B2B)',
        specializations: [
          { id: 'ky_su_ban_hang', name: 'Kỹ sư bán hàng (Sales Engineer)' },
          { id: 'chuyen_vien_phat_trien_thi_truong', name: 'Chuyên viên phát triển thị trường' },
          { id: 'key_account_manager', name: 'Key Account Manager' }
        ]
      },
      {
        id: 'kinh_doanh_du_an',
        name: 'Kinh doanh dự án',
        specializations: [
          { id: 'nv_phat_trien_du_an', name: 'Nhân viên phát triển dự án' },
          { id: 'giam_doc_du_an', name: 'Giám đốc dự án' }
        ]
      },
      {
        id: 'xuat_nhap_khau',
        name: 'Xuất nhập khẩu',
        specializations: [
          { id: 'nhan_vien_xnk', name: 'Nhân viên Xuất nhập khẩu' },
          { id: 'nhan_vien_chung_tu', name: 'Nhân viên Chứng từ' },
          { id: 'nhan_vien_mua_hang', name: 'Nhân viên Thu mua (Purchasing)' }
        ]
      }
    ]
  },
  {
    id: 'MARKETING',
    name: 'MARKETING/PR/QUẢNG CÁO',
    subcategories: [
      {
        id: 'digital_marketing',
        name: 'Digital Marketing',
        specializations: [
          { id: 'chuyen_vien_digital', name: 'Chuyên viên Digital Marketing' },
          { id: 'performance_marketing', name: 'Performance Marketing' },
          { id: 'seo_sem', name: 'Chuyên viên SEO/SEM' },
          { id: 'social_media', name: 'Chuyên viên Social Media' },
          { id: 'ecommerce_specialist', name: 'Chuyên viên Thương mại điện tử' }
        ]
      },
      {
        id: 'pr_event',
        name: 'PR/Sự kiện',
        specializations: [
          { id: 'chuyen_vien_pr', name: 'Chuyên viên Quan hệ công chúng (PR)' },
          { id: 'to_chuc_su_kien', name: 'Nhân viên Tổ chức sự kiện' },
          { id: 'truyen_thong_noi_bo', name: 'Chuyên viên Truyền thông nội bộ' }
        ]
      },
      {
        id: 'content_creative',
        name: 'Nội dung & Sáng tạo',
        specializations: [
          { id: 'content_creator', name: 'Sáng tạo nội dung (Content Creator)' },
          { id: 'copywriter', name: 'Copywriter' },
          { id: 'designer', name: 'Graphic Designer' },
          { id: 'video_editor', name: 'Video Editor' },
          { id: 'art_director', name: 'Art Director' }
        ]
      },
      {
        id: 'brand_management',
        name: 'Quản trị thương hiệu',
        specializations: [
          { id: 'brand_executive', name: 'Chuyên viên Quản trị thương hiệu' },
          { id: 'brand_manager', name: 'Brand Manager' }
        ]
      }
    ]
  },
  {
    id: 'CSKH',
    name: 'CHĂM SÓC KHÁCH HÀNG/VẬN HÀNH',
    subcategories: [
      {
        id: 'cskh',
        name: 'Chăm sóc khách hàng',
        specializations: [
          { id: 'tong_dai_vien', name: 'Tổng đài viên (Telesales/CSKH)' },
          { id: 'chuyen_vien_cskh', name: 'Chuyên viên Chăm sóc khách hàng' },
          { id: 'truong_nhom_cskh', name: 'Trưởng nhóm CSKH' }
        ]
      },
      {
        id: 'van_hanh',
        name: 'Vận hành',
        specializations: [
          { id: 'dieu_phoi_vien', name: 'Điều phối viên' },
          { id: 'quan_ly_van_hanh', name: 'Quản lý vận hành (Operations Manager)' },
          { id: 'chuyen_vien_kho', name: 'Chuyên viên Quản lý kho' }
        ]
      },
      {
        id: 'logistics',
        name: 'Logistics/Chuỗi cung ứng',
        specializations: [
          { id: 'nhan_vien_logistics', name: 'Nhân viên Logistics' },
          { id: 'nhan_vien_giao_nhan', name: 'Nhân viên Giao nhận' },
          { id: 'quan_ly_chuoi_cung_ung', name: 'Quản lý Chuỗi cung ứng (Supply Chain)' }
        ]
      }
    ]
  },
  {
    id: 'NHAN_SU',
    name: 'NHÂN SỰ/HÀNH CHÍNH/PHÁP CHẾ',
    subcategories: [
      {
        id: 'nhan_su',
        name: 'Nhân sự (HR)',
        specializations: [
          { id: 'chuyen_vien_tuyen_dung', name: 'Chuyên viên Tuyển dụng' },
          { id: 'chuyen_vien_cb', name: 'Chuyên viên C&B (Tiền lương & Phúc lợi)' },
          { id: 'chuyen_vien_daotao', name: 'Chuyên viên Đào tạo (L&D)' },
          { id: 'hr_manager', name: 'Trưởng phòng Nhân sự' },
          { id: 'hr_business_partner', name: 'HR Business Partner (HRBP)' }
        ]
      },
      {
        id: 'hanh_chinh',
        name: 'Hành chính',
        specializations: [
          { id: 'le_tan', name: 'Lễ tân' },
          { id: 'nhan_vien_hanh_chinh', name: 'Nhân viên Hành chính' },
          { id: 'thu_ky', name: 'Thư ký/Trợ lý Giám đốc' }
        ]
      },
      {
        id: 'phap_che',
        name: 'Pháp chế/Luật',
        specializations: [
          { id: 'luat_su', name: 'Luật sư/Trợ lý Luật sư' },
          { id: 'phap_che_doanh_nghiep', name: 'Chuyên viên Pháp chế' },
          { id: 'chuyen_vien_so_huu_tri_tue', name: 'Chuyên viên Sở hữu trí tuệ' }
        ]
      }
    ]
  },
  {
    id: 'IT',
    name: 'CÔNG NGHỆ THÔNG TIN',
    subcategories: [
      {
        id: 'software',
        name: 'Phát triển Phần mềm',
        specializations: [
          { id: 'frontend_dev', name: 'Lập trình viên Frontend' },
          { id: 'backend_dev', name: 'Lập trình viên Backend' },
          { id: 'fullstack_dev', name: 'Lập trình viên Fullstack' },
          { id: 'mobile_dev', name: 'Lập trình viên Mobile (iOS/Android)' },
          { id: 'game_dev', name: 'Lập trình viên Game' }
        ]
      },
      {
        id: 'data_ai',
        name: 'Data & Trí tuệ nhân tạo (AI)',
        specializations: [
          { id: 'data_analyst', name: 'Data Analyst (Phân tích dữ liệu)' },
          { id: 'data_engineer', name: 'Data Engineer (Kỹ sư dữ liệu)' },
          { id: 'data_scientist', name: 'Data Scientist (Nhà khoa học dữ liệu)' },
          { id: 'ai_engineer', name: 'AI/Machine Learning Engineer' }
        ]
      },
      {
        id: 'qa_qc',
        name: 'Kiểm thử (QA/QC)',
        specializations: [
          { id: 'manual_tester', name: 'Manual Tester' },
          { id: 'automation_tester', name: 'Automation Tester' },
          { id: 'qa_manager', name: 'QA Manager' }
        ]
      },
      {
        id: 'system_network',
        name: 'Hệ thống/Mạng/Bảo mật',
        specializations: [
          { id: 'system_admin', name: 'Quản trị hệ thống (System Admin)' },
          { id: 'network_engineer', name: 'Kỹ sư Mạng' },
          { id: 'devops_engineer', name: 'DevOps/Cloud Engineer' },
          { id: 'security_engineer', name: 'Kỹ sư Bảo mật/An toàn thông tin' }
        ]
      },
      {
        id: 'product_management',
        name: 'Quản lý Sản phẩm/Dự án',
        specializations: [
          { id: 'product_owner', name: 'Product Owner' },
          { id: 'product_manager', name: 'Product Manager' },
          { id: 'project_manager', name: 'Project Manager (PM)' },
          { id: 'scrum_master', name: 'Scrum Master' },
          { id: 'business_analyst', name: 'Business Analyst (BA)' }
        ]
      },
      {
        id: 'ui_ux',
        name: 'Thiết kế UI/UX',
        specializations: [
          { id: 'ui_designer', name: 'UI Designer' },
          { id: 'ux_researcher', name: 'UX Researcher' },
          { id: 'product_designer', name: 'Product Designer' }
        ]
      }
    ]
  },
  {
    id: 'TAI_CHINH',
    name: 'TÀI CHÍNH/NGÂN HÀNG/BẢO HIỂM',
    subcategories: [
      {
        id: 'ngan_hang',
        name: 'Ngân hàng',
        specializations: [
          { id: 'gd_vien', name: 'Giao dịch viên' },
          { id: 'quan_he_khach_hang_cn', name: 'Quan hệ khách hàng cá nhân' },
          { id: 'quan_he_khach_hang_dn', name: 'Quan hệ khách hàng doanh nghiệp' },
          { id: 'tham_dinh', name: 'Chuyên viên Thẩm định/Định giá' },
          { id: 'thu_hoi_no', name: 'Chuyên viên Xử lý nợ' }
        ]
      },
      {
        id: 'ke_toan',
        name: 'Kế toán/Kiểm toán',
        specializations: [
          { id: 'ke_toan_tong_hop', name: 'Kế toán tổng hợp' },
          { id: 'ke_toan_thue', name: 'Kế toán thuế' },
          { id: 'ke_toan_truong', name: 'Kế toán trưởng' },
          { id: 'kiem_toan_vien', name: 'Kiểm toán viên' }
        ]
      },
      {
        id: 'tai_chinh',
        name: 'Tài chính/Đầu tư',
        specializations: [
          { id: 'phien_tich_tai_chinh', name: 'Chuyên viên Phân tích tài chính (FA)' },
          { id: 'moi_gioi_chung_khoan', name: 'Môi giới chứng khoán' },
          { id: 'chuyen_vien_dau_tu', name: 'Chuyên viên Đầu tư' }
        ]
      },
      {
        id: 'bao_hiem',
        name: 'Bảo hiểm',
        specializations: [
          { id: 'tu_van_bao_hiem', name: 'Tư vấn viên Bảo hiểm' },
          { id: 'tham_dinh_bao_hiem', name: 'Thẩm định viên Bảo hiểm' },
          { id: 'giai_quyet_boi_thuong', name: 'Chuyên viên Giải quyết bồi thường' }
        ]
      }
    ]
  },
  {
    id: 'XAY_DUNG',
    name: 'XÂY DỰNG/SẢN XUẤT/KỸ THUẬT',
    subcategories: [
      {
        id: 'xay_dung',
        name: 'Xây dựng/Kiến trúc',
        specializations: [
          { id: 'ky_su_xay_dung', name: 'Kỹ sư Xây dựng' },
          { id: 'kien_truc_su', name: 'Kiến trúc sư' },
          { id: 'giam_sat_thi_cong', name: 'Giám sát thi công' },
          { id: 'ky_su_mep', name: 'Kỹ sư MEP' },
          { id: 'qa_qc_da', name: 'Quản lý QA/QC Dự án' }
        ]
      },
      {
        id: 'san_xuat',
        name: 'Sản xuất/Nhà máy',
        specializations: [
          { id: 'quan_doc', name: 'Quản đốc xưởng' },
          { id: 'ky_su_san_xuat', name: 'Kỹ sư Sản xuất' },
          { id: 'nhan_vien_kcs', name: 'Nhân viên Kiểm tra chất lượng (KCS/QA/QC)' },
          { id: 'bao_tri_may_moc', name: 'Kỹ sư Bảo trì' }
        ]
      },
      {
        id: 'co_khi',
        name: 'Cơ khí/Ô tô',
        specializations: [
          { id: 'ky_su_co_khi', name: 'Kỹ sư Cơ khí' },
          { id: 'ky_su_o_to', name: 'Kỹ sư Ô tô' },
          { id: 'tho_co_khi', name: 'Thợ Cơ khí/Hàn/Tiện' }
        ]
      },
      {
        id: 'dien_dien_tu',
        name: 'Điện/Điện tử/Tự động hóa',
        specializations: [
          { id: 'ky_su_dien', name: 'Kỹ sư Điện' },
          { id: 'ky_su_dien_tu', name: 'Kỹ sư Điện tử' },
          { id: 'ky_su_tu_dong_hoa', name: 'Kỹ sư Tự động hóa' }
        ]
      }
    ]
  },
  {
    id: 'Y_TE',
    name: 'Y TẾ/GIÁO DỤC/DỊCH VỤ',
    subcategories: [
      {
        id: 'y_te',
        name: 'Y tế/Chăm sóc sức khỏe',
        specializations: [
          { id: 'bac_si', name: 'Bác sĩ' },
          { id: 'dieu_duong', name: 'Điều dưỡng/Y tá' },
          { id: 'duoc_si', name: 'Dược sĩ' },
          { id: 'ky_thuat_vien_y_te', name: 'Kỹ thuật viên Y tế' }
        ]
      },
      {
        id: 'giao_duc',
        name: 'Giáo dục/Đào tạo',
        specializations: [
          { id: 'giao_vien', name: 'Giáo viên/Giảng viên' },
          { id: 'tro_giang', name: 'Trợ giảng (TA)' },
          { id: 'tu_van_tuyen_sinh', name: 'Tư vấn tuyển sinh' },
          { id: 'quan_ly_giao_duc', name: 'Quản lý giáo dục' }
        ]
      },
      {
        id: 'nha_hang_khach_san',
        name: 'Nhà hàng/Khách sạn/Du lịch',
        specializations: [
          { id: 'quan_ly_nha_hang', name: 'Quản lý Nhà hàng/Khách sạn' },
          { id: 'bep_truong', name: 'Bếp trưởng/Đầu bếp' },
          { id: 'phuc_vu', name: 'Nhân viên Phục vụ/Pha chế' },
          { id: 'huong_dan_vien', name: 'Hướng dẫn viên du lịch' }
        ]
      },
      {
        id: 'dich_vu_lam_dep',
        name: 'Dịch vụ Làm đẹp/Spa',
        specializations: [
          { id: 'ky_thuat_vien_spa', name: 'Kỹ thuật viên Spa' },
          { id: 'tu_van_tham_my', name: 'Tư vấn Thẩm mỹ' },
          { id: 'quan_ly_spa', name: 'Quản lý Spa/Salon' }
        ]
      }
    ]
  },
  {
    id: 'NGHE_THUAT_GIAI_TRI',
    name: 'NGHỆ THUẬT/GIẢI TRÍ/TRUYỀN THÔNG',
    subcategories: [
      {
        id: 'nghe_thuat',
        name: 'Nghệ thuật & Biểu diễn',
        specializations: [
          { id: 'dien_vien', name: 'Diễn viên' },
          { id: 'ca_si', name: 'Ca sĩ/Nhạc sĩ' },
          { id: 'dao_dien', name: 'Đạo diễn/Biên đạo' }
        ]
      },
      {
        id: 'truyen_thong',
        name: 'Báo chí & Truyền thông',
        specializations: [
          { id: 'nha_bao', name: 'Nhà báo/Phóng viên' },
          { id: 'bien_tap_vien', name: 'Biên tập viên (BTV)' },
          { id: 'mc', name: 'MC/Người dẫn chương trình' },
          { id: 'phong_vien', name: 'Phóng viên/Biên dịch viên' }
        ]
      }
    ]
  }
];
