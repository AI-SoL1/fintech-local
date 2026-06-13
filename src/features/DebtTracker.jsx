import React, { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';

const formatVND = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value).replace(/\s?₫/, ' ₫');
};

export default function DebtTracker({ debts, setDebts, isDarkMode }) {
  const [newDebt, setNewDebt] = useState({ name: '', amount: '', type: 'debt', dueDate: '' });

  const handleAddDebt = (e) => {
    e.preventDefault();
    if (!newDebt.name || !newDebt.amount) return;
    setDebts(prev => [...prev, {
      id: 'debt_' + Date.now(),
      ...newDebt,
      amount: parseFloat(newDebt.amount),
      status: 'pending'
    }]);
    setNewDebt({ name: '', amount: '', type: 'debt', dueDate: '' });
  };

  const handleToggleStatus = (id) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, status: d.status === 'pending' ? 'paid' : 'pending' } : d));
  };

  const handleDeleteDebt = (id) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  const activeDebts = debts.filter(d => d.type === 'debt');
  const activeLoans = debts.filter(d => d.type === 'loan');

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-base font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Sổ Quản Lý Công Nợ Đối Tác</h2>
        <p className="text-xs text-slate-400">Kiểm soát các dòng tiền đi vay hoặc cho vay có thời hạn đáo hạn.</p>
      </div>

      {/* Form thêm nhanh công nợ đồng bộ */}
      <form onSubmit={handleAddDebt} className={`p-4 rounded-2xl border grid grid-cols-1 sm:grid-cols-5 gap-3 items-end transition-all ${isDarkMode ? 'bg-[#0D0D0D] border-[#1F1F1F]' : 'bg-white border-slate-100 shadow-xs'}`}>
        <div>
          <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Đối tác nợ</label>
          <input type="text" placeholder="Tên đối tác" value={newDebt.name} onChange={e=>setNewDebt(p=>({...p, name: e.target.value}))} className={`w-full p-2 rounded-lg text-xs font-bold outline-none border ${isDarkMode ? 'bg-[#161616] border-[#333] text-white' : 'bg-white border-slate-300 text-slate-900'}`} required />
        </div>
        <div>
          <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Số tiền (VND)</label>
          <input 
            type="text" 
            placeholder="0" 
            value={newDebt.amount ? parseInt(newDebt.amount, 10).toLocaleString('vi-VN') : ''} 
            onChange={e => {
              const digits = e.target.value.replace(/\D/g, '');
              setNewDebt(p => ({ ...p, amount: digits }));
            }} 
            className={`w-full p-2 rounded-lg text-xs font-mono font-black text-right outline-none border ${isDarkMode ? 'bg-[#161616] border-[#333] text-[#38BDF8]' : 'bg-white border-slate-300 text-slate-900'}`} 
            required 
          />
        </div>
        <div>
          <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Loại hình công nợ</label>
          <select value={newDebt.type} onChange={e=>setNewDebt(p=>({...p, type: e.target.value}))} className={`w-full p-2 rounded-lg text-xs font-black outline-none border ${isDarkMode ? 'bg-[#161616] border-[#333] text-white' : 'bg-white border-slate-300 text-slate-900'}`}>
            <option value="debt">Tôi đi vay (Phải trả)</option>
            <option value="loan">Tôi cho vay (Cần thu hồi)</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Hạn thanh toán</label>
          <input type="date" value={newDebt.dueDate} onChange={e=>setNewDebt(p=>({...p, dueDate: e.target.value}))} className={`w-full p-2 rounded-lg text-xs font-mono outline-none border ${isDarkMode ? 'bg-[#161616] border-[#333] text-white' : 'bg-white border-slate-300 text-slate-900'}`} />
        </div>
        <button type="submit" className="w-full py-2 bg-slate-900 dark:bg-[#4F46E5] hover:bg-slate-800 dark:hover:bg-[#4338CA] text-white text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1">
          <PlusCircle size={13} /> Ghi nhận nợ
        </button>
      </form>

      {/* Hai cột danh sách hiển thị với hệ màu tâm lý học chuyên sâu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CỘT PHẢI TRẢ - MÀU CAM SAN HÔ DỊU TÂM LÝ */}
        <div className={`p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#0D0D0D] border-[#1F1F1F]' : 'bg-white border-slate-100 shadow-xs'} space-y-4`}>
          <h3 className="font-black text-xs text-[#F06543] uppercase tracking-wider border-b border-slate-100 dark:border-[#222] pb-2">
            Các khoản đang nợ (Phải trả)
          </h3>
          <div className="space-y-3">
            {activeDebts.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-4 text-center">Tuyệt vời, bạn hoàn toàn không có khoản nợ nào!</p>
            ) : (
              activeDebts.map(d => (
                <div key={d.id} className={`p-4 rounded-xl border transition-all ${d.status === 'paid' ? 'opacity-40 border-slate-200 bg-slate-50' : isDarkMode ? 'bg-[#141414] border-[#222]' : 'bg-white border-slate-100 shadow-xs'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`font-black text-xs ${d.status === 'paid' ? 'line-through text-slate-400' : isDarkMode ? 'text-white' : 'text-slate-900'}`}>{d.name}</span>
                      <span className={`text-[9px] font-black ml-2 px-1.5 py-0.5 rounded uppercase ${d.status === 'paid' ? 'bg-slate-200 text-slate-600' : 'bg-orange-50 text-[#F06543] border border-orange-100'}`}>
                        {d.status === 'paid' ? 'Đã thanh toán' : 'Chưa trả'}
                      </span>
                    </div>
                    <span className="font-mono font-black text-sm text-[#F06543] tabular-nums">{formatVND(d.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-dashed border-slate-200 dark:border-[#222] text-[11px]">
                    <span className="text-slate-400 font-mono tabular-nums">Hạn đáo: {d.dueDate || 'Vô thời hạn'}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggleStatus(d.id)} className={`px-2 py-1 rounded-lg font-black text-[10px] transition-all ${d.status === 'paid' ? 'bg-slate-200 text-slate-600' : 'bg-slate-900 dark:bg-[#222] text-white hover:bg-slate-800'}`}>
                        {d.status === 'paid' ? 'Mở lại' : 'Đã trả xong'}
                      </button>
                      <button onClick={() => handleDeleteDebt(d.id)} className="text-slate-400 hover:text-[#F06543] transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CỘT CẦN THU HỒI - MÀU XANH LÁ SÁNG PASTEL */}
        <div className={`p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#0D0D0D] border-[#1F1F1F]' : 'bg-white border-slate-100 shadow-xs'} space-y-4`}>
          <h3 className="font-black text-xs text-[#0F9D58] uppercase tracking-wider border-b border-slate-100 dark:border-[#222] pb-2">
            Khoản cho vay (Cần thu hồi)
          </h3>
          <div className="space-y-3">
            {activeLoans.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-4 text-center">Chưa ghi nhận đối tác nào mượn vốn của bạn.</p>
            ) : (
              activeLoans.map(d => (
                <div key={d.id} className={`p-4 rounded-xl border transition-all ${d.status === 'paid' ? 'opacity-40 border-slate-200 bg-slate-50' : isDarkMode ? 'bg-[#141414] border-[#222]' : 'bg-white border-slate-100 shadow-xs'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`font-black text-xs ${d.status === 'paid' ? 'line-through text-slate-400' : isDarkMode ? 'text-white' : 'text-slate-900'}`}>{d.name}</span>
                      <span className={`text-[9px] font-black ml-2 px-1.5 py-0.5 rounded uppercase ${d.status === 'paid' ? 'bg-slate-200 text-slate-600' : 'bg-emerald-50 text-[#0F9D58] border border-emerald-100'}`}>
                        {d.status === 'paid' ? 'Đã thu hồi' : 'Đang cho vay'}
                      </span>
                    </div>
                    <span className="font-mono font-black text-sm text-[#0F9D58] tabular-nums">{formatVND(d.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-dashed border-slate-200 dark:border-[#222] text-[11px]">
                    <span className="text-slate-400 font-mono tabular-nums">Hạn thu: {d.dueDate || 'Vô thời hạn'}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggleStatus(d.id)} className={`px-2 py-1 rounded-lg font-black text-[10px] transition-all ${d.status === 'paid' ? 'bg-slate-200 text-slate-600' : 'bg-slate-900 dark:bg-[#222] text-white hover:bg-slate-800'}`}>
                        {d.status === 'paid' ? 'Mở lại' : 'Đã thu hồi'}
                      </button>
                      <button onClick={() => handleDeleteDebt(d.id)} className="text-slate-400 hover:text-[#F06543] transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}