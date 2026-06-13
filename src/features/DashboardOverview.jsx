import React from 'react';
import { Trash2, Edit3, EyeOff } from 'lucide-react';

const formatVND = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value).replace(/\s?₫/, ' ₫');
};

export default function DashboardOverview({ financialSummary, transactions, onDeleteTx, onEditTx, isDarkMode }) {
  const { totalIncome, totalExpense, categoryAnalysis } = financialSummary;

  return (
    <div className="space-y-6">
      {/* Khối thẻ tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0D0D0D] border-[#1F1F1F]' : 'bg-white border-slate-100'}`}>
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Tài Sản Thực Tế</span>
          <div className={`text-xl font-black font-mono tabular-nums ${isDarkMode ? 'text-[#22D3EE]' : 'text-indigo-600'}`}>{formatVND(financialSummary.netWorth)}</div>
        </div>
        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0D0D0D] border-[#1F1F1F]' : 'bg-[#E6F4EA]/40 border-emerald-100/30'}`}>
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Cơ Cấu Thu Nhập</span>
          <div className="text-xl font-black font-mono tabular-nums text-[#0F9D58]">{formatVND(totalIncome)}</div>
        </div>
        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0D0D0D] border-[#1F1F1F]' : 'bg-[#FDF2F0] border-orange-100/30'}`}>
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Tổng Dòng Chi Tiêu</span>
          <div className="text-xl font-black font-mono tabular-nums text-[#F06543]">{formatVND(totalExpense)}</div>
        </div>
      </div>

      {/* Tiến độ quỹ ngân sách */}
      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0D0D0D] border-[#1F1F1F]' : 'bg-white border-slate-100'} space-y-4`}>
        <h3 className="font-black text-xs uppercase tracking-wider text-slate-400">Tiến Độ Trần Quỹ Chi Tiêu</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categoryAnalysis.map(cat => {
            const isOver = cat.spent > cat.limit;
            const percent = cat.limit > 0 ? Math.min((cat.spent / cat.limit) * 100, 100) : 0;
            return (
              <div key={cat.id} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#141414] border-[#222]' : 'bg-[#F8F9FA] border-slate-200/60'}`}>
                <div className="flex justify-between items-start mb-1.5">
                  <span className={`font-black text-xs ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{cat.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono tabular-nums">Trần: {formatVND(cat.limit)}</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-[#222] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${isOver ? 'bg-[#F06543]' : 'bg-[#4F46E5]'}`} style={{ width: `${percent}%` }} />
                </div>
                <div className="flex justify-between text-[10px] font-bold mt-1.5">
                  <span className="text-slate-400 tabular-nums">Đã tiêu: {formatVND(cat.spent)}</span>
                  {isOver ? <span className="text-[#F06543]">Vượt {formatVND(cat.spent - cat.limit)}</span> : <span className="text-[#0F9D58]">Còn {formatVND(cat.limit - cat.spent)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nhật ký dòng tiền */}
      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0D0D0D] border-[#1F1F1F]' : 'bg-white border-slate-100'} space-y-4`}>
        <h3 className={`font-black text-xs uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>Sổ Nhật Ký Ghi Chép Biến Động</h3>
        <div className="overflow-x-auto border rounded-xl dark:border-[#1F1F1F]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b font-extrabold ${isDarkMode ? 'bg-[#121212] border-[#222] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <th className="p-3.5">Ngày</th>
                <th className="p-3.5">Mô tả</th>
                <th className="p-3.5">Tài khoản ví</th>
                <th className="p-3.5">Hạng mục</th>
                <th className="p-3.5 text-right">Số tiền</th>
                <th className="p-3.5 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-bold ${isDarkMode ? 'divide-[#1F1F1F]' : 'divide-slate-100'}`}>
              {transactions.map(tx => {
                // Xác định xem bản ghi này có bị tắt tích chọn báo cáo không
                const isExcluded = (tx.type === 'expense' && tx.isCounted === false) || (tx.type === 'income' && tx.isAllocated === false);

                return (
                  <tr key={tx.id} className={`${isDarkMode ? 'hover:bg-[#121212]' : 'hover:bg-slate-50/80'} ${isExcluded ? 'opacity-65 italic' : ''}`}>
                    <td className="p-3.5 text-slate-400 font-mono tabular-nums">{tx.date}</td>
                    <td className={`p-3.5 font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      <div className="flex items-center gap-1.5">
                        {tx.desc}
                        {isExcluded && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider px-1 bg-slate-500/10 text-slate-400 rounded">
                            <EyeOff size={9}/> Ẩn BC
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-400">{tx.type === 'transfer' ? `${tx.fromAccount} → ${tx.toAccount}` : tx.account}</td>
                    <td className="p-3.5">
                      {tx.type === 'expense' ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${isDarkMode ? 'bg-[#2a1714] text-[#FF8A75]' : 'bg-orange-50 text-[#F06543]'}`}>{tx.category}</span>
                      ) : tx.type === 'income' ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${isDarkMode ? 'bg-[#112419] text-[#69DB93]' : 'bg-emerald-50 text-[#0F9D58]'}`}>Thu nhập</span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${isDarkMode ? 'bg-[#171635] text-[#A5B4FC]' : 'bg-indigo-50 text-indigo-600'}`}>Điều chuyển</span>
                      )}
                    </td>
                    <td className={`p-3.5 text-right font-mono font-black text-sm tabular-nums ${tx.type === 'income' ? 'text-[#0F9D58]' : tx.type === 'expense' ? 'text-[#F06543]' : 'text-slate-400'}`}>
                      {formatVND(tx.amount)}
                    </td>
                    <td className="p-3.5 text-center flex items-center justify-center gap-3">
                      <button onClick={() => onEditTx(tx)} className="text-slate-400 hover:text-indigo-500 transition-colors">
                        <Edit3 size={13} />
                      </button>
                      <button onClick={() => onDeleteTx(tx.id)} className="text-slate-400 hover:text-[#F06543] transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}