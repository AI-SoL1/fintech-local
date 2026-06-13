import React from 'react';
import { BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const formatVND = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value).replace(/\s?₫/, ' ₫');
};

export default function VisualReports({ transactions, categories, isDarkMode }) {
  // Tính toán dữ liệu thống kê nhanh
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-base font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Báo Cáo Trực Quan Pro</h2>
        <p className="text-xs text-slate-400">Trực quan hóa cấu trúc phân bổ dòng tiền và hiệu suất tích lũy ròng.</p>
      </div>

      {/* Tỷ lệ tích lũy - Hiệu ứng Gamification */}
      <div className={`p-6 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#0D0D0D] border-[#1F1F1F]' : 'bg-white border-slate-100 shadow-xs'}`}>
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Chỉ số tích lũy an toàn (Savings Rate)</span>
            <div className={`text-2xl font-black font-mono tabular-nums ${savingsRate >= 20 ? 'text-[#0F9D58]' : 'text-[#F06543]'}`}>
              {savingsRate.toFixed(1)}%
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black ${savingsRate >= 20 ? 'bg-emerald-50 text-[#0F9D58] border border-emerald-100' : 'bg-orange-50 text-[#F06543] border border-orange-100'}`}>
            {savingsRate >= 20 ? 'Đạt chuẩn FinTech' : 'Cần tối ưu chi phí'}
          </div>
        </div>
        <div className={`w-full h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-[#1F1F1F]' : 'bg-slate-100'}`}>
          <div 
            className={`h-full rounded-full transition-all duration-700 ${savingsRate >= 20 ? 'bg-[#0F9D58]' : 'bg-[#F06543]'}`}
            style={{ width: `${Math.max(0, Math.min(savingsRate, 100))}%` }}
          />
        </div>
      </div>

      {/* Phân tích cấu trúc phân bổ cột */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0D0D0D] border-[#1F1F1F]' : 'bg-white border-slate-100 shadow-xs'} space-y-4`}>
          <h3 className={`font-black text-xs uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>Phân rã dòng tiền ra (Chi phí)</h3>
          <div className="space-y-3">
            {categories.map(cat => {
              const spent = transactions.filter(t => t.type === 'expense' && t.category === cat.name).reduce((sum, t) => sum + t.amount, 0);
              const ratio = expense > 0 ? (spent / expense) * 100 : 0;
              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{cat.name}</span>
                    <span className="font-mono tabular-nums text-[#F06543]">{formatVND(spent)} ({ratio.toFixed(0)}%)</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full ${isDarkMode ? 'bg-[#1F1F1F]' : 'bg-slate-100'}`}>
                    <div className="h-full bg-[#F06543] rounded-full" style={{ width: `${ratio}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0D0D0D] border-[#1F1F1F]' : 'bg-white border-slate-100 shadow-xs'} flex flex-col justify-between`}>
          <h3 className={`font-black text-xs uppercase tracking-wider mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>Cân đối dòng thu chi</h3>
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            <div className={`p-4 rounded-xl flex items-center justify-between ${isDarkMode ? 'bg-[#121212]' : 'bg-slate-50'}`}>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-[#0F9D58]"><ArrowUpRight size={16} /></div>
                <span className="text-xs font-bold text-slate-400">Tổng thu nhập</span>
              </div>
              <span className="font-mono font-black text-sm text-[#0F9D58] tabular-nums">{formatVND(income)}</span>
            </div>
            <div className={`p-4 rounded-xl flex items-center justify-between ${isDarkMode ? 'bg-[#121212]' : 'bg-slate-50'}`}>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-500/10 rounded-lg text-[#F06543]"><ArrowDownRight size={16} /></div>
                <span className="text-xs font-bold text-slate-400">Tổng chi tiêu</span>
              </div>
              <span className="font-mono font-black text-sm text-[#F06543] tabular-nums">{formatVND(expense)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}