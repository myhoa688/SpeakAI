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
          { id: 'giam_sat_ban_hang', name: 'Giám sát bán hàng' }
        ]
      },
      {
        id: 'ban_hang_ky_thuat',
        name: 'Bán hàng kỹ thuật',
        specializations: [
          { id: 'ky_su_ban_hang', name: 'Kỹ sư bán hàng (Sales Engineer)' }
        ]
      },
      {
        id: 'kinh_doanh_du_an',
        name: 'Kinh doanh dự án',
        specializations: [
          { id: 'nv_phat_trien_du_an', name: 'Nhân viên phát triển dự án' },
          { id: 'giam_doc_du_an', name: 'Giám đốc dự án' }
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
          { id: 'seo_sem', name: 'Chuyên viên SEO/SEM' }
        ]
      },
      {
        id: 'pr_event',
        name: 'PR/Sự kiện',
        specializations: [
          { id: 'chuyen_vien_pr', name: 'Chuyên viên Quan hệ công chúng (PR)' },
          { id: 'to_chuc_su_kien', name: 'Nhân viên Tổ chức sự kiện' }
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
          { id: 'chuyen_vien_cskh', name: 'Chuyên viên Chăm sóc khách hàng' }
        ]
      },
      {
        id: 'van_hanh',
        name: 'Vận hành',
        specializations: [
          { id: 'dieu_phoi_vien', name: 'Điều phối viên' },
          { id: 'quan_ly_van_hanh', name: 'Quản lý vận hành (Operations Manager)' }
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
          { id: 'chuyen_vien_cb', name: 'Chuyên viên C&B' },
          { id: 'hr_manager', name: 'Trưởng phòng Nhân sự' }
        ]
      },
      {
        id: 'phap_che',
        name: 'Pháp chế/Luật',
        specializations: [
          { id: 'luat_su', name: 'Luật sư/Trợ lý Luật sư' },
          { id: 'phap_che_doanh_nghiep', name: 'Chuyên viên Pháp chế' }
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
        name: 'Phần mềm',
        specializations: [
          { id: 'frontend_dev', name: 'Lập trình viên Frontend' },
          { id: 'backend_dev', name: 'Lập trình viên Backend' },
          { id: 'fullstack_dev', name: 'Lập trình viên Fullstack' },
          { id: 'mobile_dev', name: 'Lập trình viên Mobile' }
        ]
      },
      {
        id: 'data_qa',
        name: 'Data & QA/QC',
        specializations: [
          { id: 'data_analyst', name: 'Chuyên viên Phân tích dữ liệu (DA)' },
          { id: 'qa_tester', name: 'Kỹ sư Kiểm thử (QA/QC/Tester)' }
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
          { id: 'quan_he_khach_hang', name: 'Chuyên viên Quan hệ Khách hàng' },
          { id: 'tham_dinh', name: 'Chuyên viên Thẩm định/Định giá' }
        ]
      },
      {
        id: 'ke_toan',
        name: 'Kế toán/Kiểm toán',
        specializations: [
          { id: 'ke_toan_tong_hop', name: 'Kế toán tổng hợp' },
          { id: 'kiem_toan_vien', name: 'Kiểm toán viên' }
        ]
      }
    ]
  },
  {
    id: 'XAY_DUNG',
    name: 'XÂY DỰNG/SẢN XUẤT',
    subcategories: [
      {
        id: 'xay_dung',
        name: 'Xây dựng',
        specializations: [
          { id: 'ky_su_xay_dung', name: 'Kỹ sư Xây dựng' },
          { id: 'qa_qc_da', name: 'Quản lý QA/QC Dự án' }
        ]
      },
      {
        id: 'san_xuat',
        name: 'Sản xuất',
        specializations: [
          { id: 'quan_doc', name: 'Quản đốc xưởng' },
          { id: 'ky_su_san_xuat', name: 'Kỹ sư Sản xuất' }
        ]
      }
    ]
  }
];
