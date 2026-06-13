import React from 'react';
import { BrainCircuit, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AIInsights({ transactions, accounts, isDarkMode }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-base font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Phân Tích & Dự Báo AI</h2>
        <p className="text-xs text-slate-400">Thuật toán máy học phân tích hành vi tiêu dùng và cảnh báo rủi ro thanh khoản.</p>
      </div>

      {/* Khối Core AI Engine Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* THÔNG BÁO CHỈNH SỬA TÂM LÝ CHI TIÊU - MÀU CORAL */}
        <div className={`p-5 rounded-2xl border transition-all flex gap-4 ${isDarkMode ? 'bg-[#140E0C] border-[#381B15]' : 'bg-[#FDF2F0] border-orange-100'}`}>
          <div className="text-[#F06543] shrink-0"><AlertCircle size={20} /></div>
          <div className="space-y-1">
            <h4 className={`text-xs font-black uppercase tracking-wide text-[#F06543]`}>Cảnh báo rò rỉ ngân sách</h4>
            <p className={`text-xs leading-relaxed font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Tần suất chi tiêu vào nhóm mục <span className="font-black">Cà phê & Ăn uống</span> đang tăng hơn 18% so với chu kỳ tháng trước. AI khuyến nghị bạn nên gộp các giao dịch nhỏ để kiểm soát độ trễ dòng tiền.
            </p>
          </div>
        </div>

        {/* THÔNG BÁO THU NHẬP AN TOÀN - MÀU PASTEL EMERALD */}
        <div className={`p-5 rounded-2xl border transition-all flex gap-4 ${isDarkMode ? 'bg-[#0A1810] border-[#133A24]' : 'bg-[#E6F4EA]/60 border-emerald-100'}`}>
          <div className="text-[#0F9D58] shrink-0"><CheckCircle2 size={20} /></div>
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wide text-[#0F9D58]">Tối ưu hóa điểm thanh khoản</h4>
            <p className={`text-xs leading-relaxed font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Dòng vốn lưu động tại các tài khoản ngân hàng đang duy trì ở trạng thái tối ưu. Bạn có thể trích toán khoảng <span className="font-mono font-bold">2.500.000 ₫</span> sang quỹ đầu tư cổ phiếu hoặc chứng chỉ quỹ để gia tăng lãi suất kép.
            </p>
          </div>
        </div>

      </div>

      {/* Thẻ mô phỏng dự báo tương lai */}
      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0D0D0D] border-[#1F1F1F]' : 'bg-white border-slate-100 shadow-xs'} space-y-4`}>
        <div className="flex items-center gap-2 text-[#4F46E5] dark:text-[#38BDF8]">
          <Sparkles size={16} />
          <h3 className={`font-black text-xs uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>Dự báo điểm tài chính cá nhân (30 ngày tiếp theo)</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed font-medium">
          Dựa trên hành vi tích lũy lịch sử, hệ thống dự phóng tài sản ròng (Net Worth) của bạn có xu hướng tăng trưởng ổn định ổn định đạt trạng thái thặng dư nếu trần chi tiêu cố định không vượt ngưỡng kiểm soát cấu trúc vốn.
        </p>
      </div>
    </div>
  );
}