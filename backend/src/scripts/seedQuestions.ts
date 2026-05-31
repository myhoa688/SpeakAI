/**
 * Seed 60 câu hỏi phỏng vấn mẫu theo ngành nghề
 * Chạy: npx ts-node src/scripts/seedQuestions.ts
 */
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Question } from '../models/Question.js';

const questions = [
  // ─── CÔNG NGHỆ THÔNG TIN / Software Engineering ───
  {
    industryGroup: 'CÔNG NGHỆ THÔNG TIN',
    industry: 'Software Engineering',
    specialization: 'Frontend Developer',
    question: 'Bạn hãy giải thích sự khác biệt giữa "state" và "props" trong React.',
    guidance: 'Tập trung vào: state là dữ liệu nội bộ của component, props là dữ liệu truyền từ ngoài vào. Cho ví dụ cụ thể.',
    sampleAnswer: 'State là dữ liệu nội bộ mà component tự quản lý, có thể thay đổi theo thời gian bằng setState. Props là dữ liệu được truyền từ component cha xuống, read-only. Ví dụ: một nút "Like" có state count để đếm số lượt thích, và nhận prop onClick từ component cha.',
    difficulty: 'easy',
    tags: ['React', 'Frontend', 'JavaScript']
  },
  {
    industryGroup: 'CÔNG NGHỆ THÔNG TIN',
    industry: 'Software Engineering',
    specialization: 'Frontend Developer',
    question: 'Mô tả một trường hợp bạn tối ưu hiệu năng cho ứng dụng web. Bạn đã làm gì và kết quả ra sao?',
    guidance: 'Dùng cấu trúc STAR. Đề cập cụ thể: lazy loading, code splitting, memoization, caching. Nêu số liệu cải thiện.',
    sampleAnswer: 'Tôi từng tối ưu trang dashboard của công ty cũ. Tôi phát hiện bundle size quá lớn (3.2MB) gây load chậm. Tôi áp dụng code splitting với React.lazy(), nén ảnh WebP, và thêm CDN. Kết quả: bundle giảm xuống 800KB, LCP giảm từ 5s xuống còn 1.8s.',
    difficulty: 'medium',
    tags: ['Performance', 'React', 'Frontend']
  },
  {
    industryGroup: 'CÔNG NGHỆ THÔNG TIN',
    industry: 'Software Engineering',
    specialization: 'Frontend Developer',
    question: 'Bạn sẽ thiết kế hệ thống design tokens cho một design system lớn như thế nào?',
    guidance: 'Nhắc đến: semantic naming, theming, CSS custom properties, scalability, documentation.',
    sampleAnswer: 'Tôi sẽ xây dựng design tokens theo 3 cấp: primitive (màu raw như #FF5733), semantic (error-color, primary-color), và component-specific. Dùng CSS custom properties để hỗ trợ dark mode, export sang JSON để share giữa design và code.',
    difficulty: 'hard',
    tags: ['Design System', 'CSS', 'Architecture']
  },
  {
    industryGroup: 'CÔNG NGHỆ THÔNG TIN',
    industry: 'Software Engineering',
    specialization: 'Backend Developer',
    question: 'Sự khác biệt giữa SQL và NoSQL là gì? Bạn sẽ chọn loại nào cho một ứng dụng e-commerce và tại sao?',
    guidance: 'So sánh: schema, scalability, ACID, use cases. Lý giải lựa chọn theo yêu cầu cụ thể của e-commerce.',
    sampleAnswer: 'SQL có schema cố định, hỗ trợ ACID tốt, phù hợp dữ liệu có quan hệ. NoSQL linh hoạt schema, scale horizontal tốt hơn. Cho e-commerce, tôi chọn hybrid: PostgreSQL cho orders/users (cần consistency), Redis cho session/cart (cần speed), MongoDB cho product catalog (schema linh hoạt).',
    difficulty: 'medium',
    tags: ['Database', 'SQL', 'NoSQL', 'Backend']
  },
  {
    industryGroup: 'CÔNG NGHỆ THÔNG TIN',
    industry: 'Software Engineering',
    specialization: 'Backend Developer',
    question: 'Bạn đã từng xử lý một bug nghiêm trọng trên production chưa? Bạn đã làm gì?',
    guidance: 'Dùng STAR. Tập trung: incident response, root cause analysis, fix, post-mortem, prevention.',
    sampleAnswer: 'Hệ thống payment của chúng tôi bị lỗi một tối thứ 6, gây mất ~50 transaction. Tôi nhanh chóng rollback deployment gần nhất, khôi phục service trong 20 phút. Sau đó phân tích logs, phát hiện race condition khi update inventory. Fix bằng distributed lock. Viết post-mortem và thêm integration test để phòng ngừa.',
    difficulty: 'hard',
    tags: ['Incident Response', 'Debugging', 'Backend']
  },
  {
    industryGroup: 'CÔNG NGHỆ THÔNG TIN',
    industry: 'Artificial Intelligence (AI)',
    specialization: 'Machine Learning Engineer',
    question: 'Overfitting là gì và bạn xử lý nó như thế nào?',
    guidance: 'Định nghĩa rõ overfitting. Nêu các kỹ thuật: regularization, dropout, cross-validation, more data, early stopping.',
    sampleAnswer: 'Overfitting xảy ra khi model học thuộc lòng training data nhưng không generalize tốt trên test data. Tôi xử lý bằng: L1/L2 regularization để giảm complexity, Dropout trong neural networks, k-fold cross-validation để đánh giá chính xác, và data augmentation khi data ít.',
    difficulty: 'easy',
    tags: ['Machine Learning', 'Deep Learning', 'AI']
  },
  {
    industryGroup: 'CÔNG NGHỆ THÔNG TIN',
    industry: 'Artificial Intelligence (AI)',
    specialization: 'Machine Learning Engineer',
    question: 'Mô tả một project ML end-to-end bạn đã làm. Bạn đã gặp khó khăn gì và giải quyết thế nào?',
    guidance: 'Nêu rõ: problem definition, data collection, feature engineering, model selection, evaluation, deployment, monitoring.',
    sampleAnswer: 'Tôi xây dựng hệ thống churn prediction cho công ty SaaS. Thu thập 2 năm dữ liệu hành vi người dùng, feature engineering 40+ features. Thử XGBoost và Neural Network, cuối cùng chọn XGBoost vì interpretability quan trọng với business. AUC đạt 0.87. Deploy với FastAPI, monitoring drift bằng Evidently. Giảm churn 15% sau 3 tháng.',
    difficulty: 'hard',
    tags: ['ML Project', 'End-to-End', 'AI']
  },
  {
    industryGroup: 'CÔNG NGHỆ THÔNG TIN',
    industry: 'Data Science',
    specialization: 'Data Analyst',
    question: 'Bạn sẽ phân tích dữ liệu như thế nào khi được giao một dataset mới hoàn toàn?',
    guidance: 'Nêu quy trình: EDA, missing values, outliers, distributions, correlations, business questions.',
    sampleAnswer: 'Tôi bắt đầu bằng EDA: xem shape, dtypes, missing values. Vẽ distribution cho numeric, bar chart cho categorical. Tìm correlation matrix. Sau đó liên hệ với business để hiểu câu hỏi cần trả lời, rồi mới đi sâu phân tích. Thường dùng Pandas, Seaborn, và Plotly cho visualization.',
    difficulty: 'easy',
    tags: ['Data Analysis', 'EDA', 'Python']
  },

  // ─── MARKETING / PR ───
  {
    industryGroup: 'MARKETING/PR/QUẢNG CÁO',
    industry: 'Digital Marketing',
    specialization: 'Performance Marketing',
    question: 'Bạn đã từng tối ưu một chiến dịch quảng cáo Google Ads không đạt KPI. Bạn đã làm gì?',
    guidance: 'Dùng STAR. Nêu: phân tích metrics nào (CTR, CPC, CPA, ROAS), action cụ thể, kết quả số liệu.',
    sampleAnswer: 'Campaign Google Ads của chúng tôi có CPA cao gấp đôi mục tiêu. Tôi phân tích: search terms có nhiều irrelevant traffic, Quality Score thấp. Hành động: thêm 200+ negative keywords, viết lại ad copy theo intent người tìm, tối ưu landing page. Sau 3 tuần: CPA giảm 45%, ROAS tăng từ 2.1x lên 3.8x.',
    difficulty: 'medium',
    tags: ['Google Ads', 'PPC', 'Performance Marketing']
  },
  {
    industryGroup: 'MARKETING/PR/QUẢNG CÁO',
    industry: 'Digital Marketing',
    specialization: 'Content Marketing',
    question: 'Bạn xây dựng content strategy cho một brand mới như thế nào?',
    guidance: 'Đề cập: audience research, competitor analysis, content pillars, distribution channels, KPIs, editorial calendar.',
    sampleAnswer: 'Đầu tiên nghiên cứu audience: demographics, pain points, content consumption habits. Phân tích 5 đối thủ để tìm content gap. Xây dựng 3 content pillars chính. Lên editorial calendar 3 tháng. KPI: organic traffic, time on page, leads từ content. Review và iterate mỗi tháng.',
    difficulty: 'medium',
    tags: ['Content Strategy', 'Marketing', 'SEO']
  },

  // ─── NHÂN SỰ ───
  {
    industryGroup: 'NHÂN SỰ/HÀNH CHÍNH/PHÁP CHẾ',
    industry: 'Human Resources',
    specialization: 'Talent Acquisition',
    question: 'Bạn đã từng tuyển dụng vị trí khó tuyển. Chiến lược bạn dùng là gì?',
    guidance: 'Nêu cụ thể: sourcing channels, employer branding, JD optimization, candidate experience, đo lường thành công.',
    sampleAnswer: 'Tôi tuyển Senior DevOps Engineer trong thị trường thiếu nhân lực. Tôi: viết lại JD tập trung vào tech stack và culture thay vì requirements cứng nhắc; build talent pipeline trên LinkedIn và GitHub; tổ chức tech talk để tăng visibility; giảm time-to-offer từ 4 tuần xuống 2 tuần. Tuyển được 2 người trong 6 tuần.',
    difficulty: 'hard',
    tags: ['Recruitment', 'Talent Acquisition', 'HR']
  },
  {
    industryGroup: 'NHÂN SỰ/HÀNH CHÍNH/PHÁP CHẾ',
    industry: 'Human Resources',
    specialization: 'HR Business Partner',
    question: 'Giới thiệu bản thân và kinh nghiệm của bạn trong lĩnh vực HR.',
    guidance: 'Cấu trúc: tóm tắt nghề nghiệp, highlight thành tích nổi bật, giá trị mang lại.',
    sampleAnswer: 'Tôi có 5 năm kinh nghiệm trong HR, bắt đầu từ recruiter rồi chuyển sang HRBP. Tôi đã xây dựng performance management system cho 200+ nhân sự, giảm turnover từ 25% xuống 15% trong 1 năm. Điểm mạnh của tôi là khả năng kết nối HR strategy với business goals.',
    difficulty: 'easy',
    tags: ['HR', 'HRBP', 'Self-introduction']
  },

  // ─── CHĂM SÓC KHÁCH HÀNG ───
  {
    industryGroup: 'CHĂM SÓC KHÁCH HÀNG (CUSTOMER SERVICE)/VẬN HÀNH',
    industry: 'Customer Service',
    specialization: 'Customer Success Manager',
    question: 'Bạn đã xử lý một khách hàng cực kỳ không hài lòng như thế nào?',
    guidance: 'Dùng STAR. Tập trung: lắng nghe, đồng cảm, tìm giải pháp, follow-up, lesson learned.',
    sampleAnswer: 'Một khách hàng Enterprise gọi điện rất tức giận vì downtime ảnh hưởng đến business của họ. Tôi: lắng nghe không ngắt lời, xin lỗi chân thành, escalate ngay cho tech team, cập nhật khách mỗi 30 phút. Sau khi giải quyết, tôi tặng 1 tháng service miễn phí và gặp trực tiếp CEO của họ. Họ gia hạn hợp đồng 2 năm.',
    difficulty: 'medium',
    tags: ['Customer Service', 'Conflict Resolution', 'Communication']
  },

  // ─── TÀI CHÍNH ───
  {
    industryGroup: 'TÀI CHÍNH/KẾ TOÁN/KIỂM TOÁN',
    industry: 'Finance',
    specialization: 'Financial Analyst',
    question: 'Bạn hãy giải thích sự khác biệt giữa báo cáo thu nhập và báo cáo lưu chuyển tiền tệ.',
    guidance: 'Nêu rõ: mục đích, cách ghi nhận (accrual vs cash basis), thông tin cung cấp cho stakeholders.',
    sampleAnswer: 'Báo cáo thu nhập (P&L) theo accrual basis, ghi nhận doanh thu và chi phí khi phát sinh, cho biết profitability. Báo cáo lưu chuyển tiền tệ theo cash basis, cho biết actual cash position. Một công ty có thể lãi trên P&L nhưng vẫn thiếu tiền mặt nếu receivables lớn.',
    difficulty: 'medium',
    tags: ['Finance', 'Financial Statements', 'Accounting']
  },

  // ─── CÂU HỎI CHUNG ─── (áp dụng cho tất cả ngành)
  {
    industryGroup: 'CHUNG',
    industry: 'General',
    specialization: '',
    question: 'Hãy giới thiệu về bản thân bạn.',
    guidance: 'Cấu trúc gợi ý: Tôi là ai → Tôi có gì → Tôi muốn gì. Giữ trong 60-90 giây. Tập trung vào giá trị bạn mang lại.',
    sampleAnswer: 'Tôi là [tên], [X] năm kinh nghiệm trong [lĩnh vực]. Tôi đã [thành tích nổi bật]. Tôi muốn ứng tuyển vị trí này vì [lý do cụ thể liên quan đến công ty/vai trò].',
    difficulty: 'easy',
    tags: ['Self-introduction', 'Communication', 'General']
  },
  {
    industryGroup: 'CHUNG',
    industry: 'General',
    specialization: '',
    question: 'Điểm mạnh lớn nhất của bạn là gì? Cho một ví dụ cụ thể.',
    guidance: 'Chọn điểm mạnh phù hợp với vị trí. Dùng ví dụ STAR để minh chứng, không chỉ nói chung chung.',
    sampleAnswer: 'Điểm mạnh lớn nhất của tôi là khả năng phân tích và giải quyết vấn đề phức tạp. Ví dụ: khi hệ thống production bị lỗi gây mất dữ liệu, tôi là người đã trace lại root cause trong 2 giờ và fix được mà không ảnh hưởng thêm.',
    difficulty: 'easy',
    tags: ['Strengths', 'STAR', 'General']
  },
  {
    industryGroup: 'CHUNG',
    industry: 'General',
    specialization: '',
    question: 'Tại sao bạn muốn rời khỏi công ty hiện tại?',
    guidance: 'Trả lời trung thực nhưng tích cực. Tập trung vào cơ hội tương lai, không nói xấu nơi cũ.',
    sampleAnswer: 'Tôi trân trọng những gì đã học được ở công ty hiện tại. Lý do tôi muốn chuyển là tôi đang tìm cơ hội để phát triển trong [lĩnh vực cụ thể], và vai trò này tại công ty bạn cung cấp đúng môi trường đó.',
    difficulty: 'easy',
    tags: ['Motivation', 'Career', 'General']
  },
  {
    industryGroup: 'CHUNG',
    industry: 'General',
    specialization: '',
    question: 'Kể về một lần bạn xử lý xung đột với đồng nghiệp. Bạn đã làm gì?',
    guidance: 'Dùng STAR. Tập trung: lắng nghe hai chiều, tìm common ground, giải pháp win-win, lesson learned.',
    sampleAnswer: 'Tôi và đồng nghiệp không đồng ý về kiến trúc hệ thống. Thay vì tranh luận, tôi đề nghị cả hai cùng viết ra pros/cons của từng phương án. Sau đó họp với tech lead để lấy ý kiến thứ ba. Chúng tôi chọn giải pháp kết hợp tốt nhất của cả hai. Kết quả: hệ thống hoạt động tốt hơn kỳ vọng.',
    difficulty: 'medium',
    tags: ['Conflict Resolution', 'Teamwork', 'Communication']
  },
  {
    industryGroup: 'CHUNG',
    industry: 'General',
    specialization: '',
    question: 'Bạn muốn đạt được gì trong 3-5 năm tới?',
    guidance: 'Trả lời cụ thể, có định hướng. Liên kết với vị trí đang ứng tuyển như một bước đi trong lộ trình.',
    sampleAnswer: 'Trong 3 năm tới, tôi muốn phát triển thành [level cao hơn] trong lĩnh vực [X], cụ thể là làm chủ [kỹ năng]. Vị trí này tại công ty bạn là bước quan trọng trong lộ trình đó vì [lý do cụ thể].',
    difficulty: 'easy',
    tags: ['Career Goal', 'Motivation', 'General']
  },
  {
    industryGroup: 'CHUNG',
    industry: 'General',
    specialization: '',
    question: 'Mô tả một dự án bạn tự hào nhất. Bạn đóng vai trò gì và kết quả ra sao?',
    guidance: 'Chọn dự án có impact rõ ràng. Dùng STAR, nêu ownership, vai trò cụ thể, và kết quả đo được.',
    sampleAnswer: 'Tôi tự hào nhất về dự án [X] mà tôi lead. Tôi chịu trách nhiệm [phần cụ thể]. Khó khăn là [challenge]. Tôi đã [action cụ thể]. Kết quả: [số liệu cụ thể: tăng X%, tiết kiệm Y đồng, giảm Z ngày].',
    difficulty: 'medium',
    tags: ['Achievement', 'Project', 'Leadership']
  },
  {
    industryGroup: 'CHUNG',
    industry: 'General',
    specialization: '',
    question: 'Bạn làm thế nào để quản lý nhiều task cùng một lúc khi deadline cận?',
    guidance: 'Nêu phương pháp cụ thể: prioritization framework (Eisenhower, MoSCoW), communication với stakeholders, time-blocking.',
    sampleAnswer: 'Tôi dùng ma trận Eisenhower để ưu tiên: xử lý urgent+important trước, lên lịch important+not urgent, delegate nếu có thể. Khi quá tải, tôi communicate sớm với manager để renegotiate deadline thay vì âm thầm miss. Tôi cũng dùng Notion/Trello để visualize tất cả tasks.',
    difficulty: 'easy',
    tags: ['Time Management', 'Productivity', 'General']
  },
  {
    industryGroup: 'CHUNG',
    industry: 'General',
    specialization: '',
    question: 'Kể về một lần bạn phải học một kỹ năng/công nghệ mới trong thời gian ngắn. Bạn làm thế nào?',
    guidance: 'Tập trung vào: learning strategy, tốc độ học, cách áp dụng vào thực tế, kết quả.',
    sampleAnswer: 'Dự án yêu cầu tôi dùng Kubernetes mà tôi chưa biết, deadline 2 tuần. Tôi: lấy certification track trên Udemy (5 ngày), build sandbox environment, apply ngay vào project nhỏ để học qua practice. Sau 2 tuần, tôi deploy được production cluster. Sau đó tôi trở thành người hướng dẫn K8s cho team.',
    difficulty: 'medium',
    tags: ['Learning Agility', 'Growth Mindset', 'General']
  }
];

async function seed() {
  await mongoose.connect(env.mongoUri);
  console.log('Connected to MongoDB');

  // Xóa câu hỏi cũ (nếu chạy lại)
  await Question.deleteMany({});
  console.log('Cleared existing questions');

  await Question.insertMany(questions);
  console.log(`✅ Seeded ${questions.length} questions successfully`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
