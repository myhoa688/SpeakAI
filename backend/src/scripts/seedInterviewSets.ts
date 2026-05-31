import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import { InterviewSet } from '../models/InterviewSet.js';

const sets = [
  {
    title: 'Quản lý Kiểm soát Chất lượng Dự án (QA/QC Project Manager)',
    company: 'Công ty Cổ phần Sản xuất và Kinh doanh VinMetal',
    industry: 'Quản lý QA/QC Dự án',
    category: 'management',
    difficulty: 'hard',
    questionCount: 12,
    durationMinutes: 36,
    tags: ['QA/QC', 'EPC/EPCM', 'Quản lý dự án', 'Quality Control'],
    attemptCount: 1420,
    averageScore: 68,
    jobDescription: `- Quản lý toàn diện công tác kiểm soát chất lượng dự án công nghiệp quy mô lớn theo mô hình EPC/EPCM.
- Trực tiếp quản lý 02 phòng: Kiểm soát chất lượng thiết kế, Kiểm soát chất lượng xây dựng.
- Xây dựng và vận hành hệ thống QA/QC xuyên suốt các giai đoạn: thiết kế, mua sắm, chế tạo, thi công, lắp đặt, chạy thử và bàn giao.
- Kiểm soát các hoạt động QA/QC: PQP, ITP, NCR, FAT/SAT, Punch List, hồ sơ nghiệm thu và hoàn công.
- Điều phối xử lý các vấn đề chất lượng với EPC/EPCM, nhà thầu và các bên liên quan.
- Quản lý, đào tạo và phát triển đội ngũ QA/QC dự án.
- Báo cáo và tham mưu cho Ban Lãnh đạo về các rủi ro và giải pháp chất lượng dự án.`,
  },
  {
    title: 'Quản lý danh mục khách hàng',
    company: 'Techcombank',
    industry: 'Chuyên viên Quan hệ Khách hàng',
    category: 'behavioral',
    difficulty: 'medium',
    questionCount: 12,
    durationMinutes: 30,
    tags: ['Chăm sóc khách hàng', 'Sales', 'Tài chính', 'Giao tiếp'],
    attemptCount: 2150,
    averageScore: 75,
    jobDescription: `- Quản lý, chăm sóc danh mục khách 150 - 200 KHUT được giao định kỳ và đánh giá được hiệu quả danh mục khách hàng.
- Xây dựng kế hoạch và triển khai các hoạt động chăm sóc, tư vấn tài chính nhằm gia tăng gắn kết và khai thác tối đa nhu cầu của khách hàng.
- Nắm bắt xu hướng thị trường, chính sách đối thủ cạnh tranh để tham mưu cải tiến sản phẩm, dịch vụ.
- Chủ động xử lý các khiếu nại, thắc mắc của khách hàng vượt mức mong đợi, đảm bảo trải nghiệm khách hàng xuất sắc.
- Đạt các chỉ tiêu KPI về huy động vốn, thẻ tín dụng, bảo hiểm và các sản phẩm bán lẻ khác theo quy định.`,
  },
  {
    title: 'Chuyên viên định giá',
    company: 'Vietcombank',
    industry: 'Chuyên viên Thẩm định/Định giá',
    category: 'technical',
    difficulty: 'medium',
    questionCount: 12,
    durationMinutes: 30,
    tags: ['Định giá tài sản', 'Bất động sản', 'Phân tích tài chính', 'Thẩm định'],
    attemptCount: 980,
    averageScore: 71,
    jobDescription: `- Thực hiện công tác khảo sát, thu thập thông tin thị trường, đánh giá và lập báo cáo định giá tài sản bảo đảm (Bất động sản, Động sản, Máy móc thiết bị...).
- Phân tích rủi ro và tham mưu cho Hội đồng tín dụng về tính thanh khoản và giá trị thực tế của tài sản.
- Kiểm tra tính hợp pháp, hợp lệ của hồ sơ tài sản bảo đảm theo quy định của pháp luật và của Ngân hàng.
- Cập nhật, xây dựng cơ sở dữ liệu giá tài sản trên địa bàn phụ trách.
- Hỗ trợ giải đáp các vướng mắc liên quan đến nghiệp vụ định giá cho các Chi nhánh/Phòng giao dịch.`,
  },
  {
    title: 'Nhân viên Quan hệ Khách hàng Doanh Nghiệp',
    company: 'Chailease International Leasing Co., Ltd',
    industry: 'Chuyên viên Quan hệ Khách hàng',
    category: 'behavioral',
    difficulty: 'medium',
    questionCount: 12,
    durationMinutes: 30,
    tags: ['B2B Sales', 'Tín dụng doanh nghiệp', 'Đàm phán', 'Cho thuê tài chính'],
    attemptCount: 1850,
    averageScore: 72,
    jobDescription: `- Tìm kiếm khách hàng, liên hệ & gặp gỡ để giới thiệu dịch vụ cho thuê tài chính đến khách hàng (Doanh nghiệp vừa và nhỏ).
- Mở rộng và duy trì quan hệ với các đối tác cung cấp thiết bị, máy móc, phương tiện vận tải.
- Thu thập hồ sơ, phân tích tình hình hoạt động kinh doanh và năng lực tài chính của khách hàng.
- Lập tờ trình thẩm định tín dụng, đề xuất cấp giới hạn tín dụng trình cấp có thẩm quyền phê duyệt.
- Theo dõi tình hình thanh toán, quản lý rủi ro và thu hồi nợ đối với các khách hàng quản lý.`,
  },
  {
    title: 'Luật sư cộng sự',
    company: 'Công ty Luật TNHH Everest',
    industry: 'Luật sư/Trợ lý Luật sư',
    category: 'technical',
    difficulty: 'hard',
    questionCount: 10,
    durationMinutes: 40,
    tags: ['Tố tụng', 'Tư vấn pháp lý', 'Đàm phán', 'Doanh nghiệp'],
    attemptCount: 820,
    averageScore: 65,
    jobDescription: `- Trực tiếp nhận và xử lý các vụ việc tranh chấp pháp lý (Dân sự, Hình sự, Kinh doanh thương mại, Lao động...).
- Đại diện khách hàng tham gia tố tụng tại Tòa án hoặc Trọng tài thương mại.
- Tư vấn pháp luật thường xuyên cho các Khách hàng Doanh nghiệp.
- Soạn thảo, rà soát các loại Hợp đồng thương mại, Hồ sơ pháp lý.
- Nghiên cứu, cập nhật các văn bản pháp luật mới và viết bài chuyên đề pháp lý.`,
  },
  {
    title: 'Trợ lý Luật sư',
    company: 'Công ty Luật TNHH Everest',
    industry: 'Luật sư/Trợ lý Luật sư',
    category: 'technical',
    difficulty: 'easy',
    questionCount: 8,
    durationMinutes: 20,
    tags: ['Nghiên cứu hồ sơ', 'Soạn thảo văn bản', 'Hành chính pháp lý'],
    attemptCount: 1100,
    averageScore: 82,
    jobDescription: `- Hỗ trợ Luật sư trong việc chuẩn bị, sắp xếp và quản lý hồ sơ vụ án/vụ việc.
- Nghiên cứu các quy định của pháp luật, án lệ và thu thập chứng cứ theo sự phân công của Luật sư.
- Soạn thảo các văn bản hành chính, đơn từ pháp lý cơ bản.
- Liên hệ, làm việc với các cơ quan Nhà nước có thẩm quyền (Sở KHĐT, Tòa án, Thi hành án...) để nộp và nhận kết quả hồ sơ.
- Quản lý lịch hẹn, hỗ trợ đón tiếp khách hàng.`,
  }
];

async function seed() {
  await connectDatabase();
  console.log('✅ Connected to MongoDB');

  await InterviewSet.deleteMany({});
  console.log('🗑️  Cleared existing InterviewSets');

  await InterviewSet.insertMany(sets);
  console.log(`🌱 Seeded ${sets.length} InterviewSets`);

  await mongoose.disconnect();
  console.log('✅ Done!');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
