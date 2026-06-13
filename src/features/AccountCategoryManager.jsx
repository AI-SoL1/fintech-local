import React, { useState } from 'react';
import { PlusCircle, Edit3, Check, X } from 'lucide-react';

const formatVND = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value).replace(/\s?₫/, ' ₫');
};

export default function AccountCategoryManager({ accounts, setAccounts, categories, setCategories, allocatedIncomeBase, isDarkMode }) {
  const [newAcc, setNewAcc] = useState({ name: '', balance: '', type: 'Bank' });
  const [newCat, setNewCat] = useState({ name: '', type: 'percentage', value: '' });

  // State chỉnh sửa hạn mức quỹ phân bổ inline
  const [editingCatId, setEditingCatId] = useState(null);
  const [editCatForm, setEditCatForm] = useState({ name: '', type: 'percentage', value: '' });

  const handleAddAccount = (e) => {
    e.preventDefault();
    if (!newAcc.name || !newAcc.balance) return;
    setAccounts(prev => [...prev, { id: 'acc_' + Date.now(), name: newAcc.name, balance: parseFloat(newAcc.balance), type: newAcc.type }]);
    setNewAcc({ name: '', balance: '', type: 'Bank' });
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCat.name || !newCat.value) return;
    setCategories(prev => [...prev, { id: 'cat_' + Date.now(), name: newCat.name, type: newCat.type, value: parseFloat(newCat.value) || 0 }]);
    setNewCat({ name: '', type: 'percentage', value: '' });
  };

  const handleStartEditCat = (cat) => {
    setEditingCatId(cat.id);
    setEditCatForm({ name: cat.name, type: cat.type || 'percentage', value: (cat.value || 0).toString() });
  };

  const handleSaveCatEdit = (id) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name: editCatForm.name, type: editCatForm.type, value: parseFloat(editCatForm.value) || 0 } : c));
    setEditingCatId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-base font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Cơ Cấu Vốn & Quy Tắc Hạn Mức %</h2>
        <p className="text-xs text-slate-400">Khởi tạo tài khoản ví và tinh chỉnh hạn mức phân bổ để triệt tiêu lỗi hệ thống.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* VÍ LƯU KÝ */}
        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0D0D0D] border-[#1F1F1F]' : 'bg-white border-slate-100'}`}>
          <h3 className={`font-black text-xs uppercase tracking-wider mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>Tài khoản ví lưu ký</h3>
          <form onSubmit={handleAddAccount} className="grid grid-cols-3 gap-2 mb-4">
            <input type="text" placeholder="Tên ví" value={newAcc.name} onChange={e=>setNewAcc(p=>({...p, name: e.target.value}))} className={`p-2 rounded-xl text-xs font-bold border ${isDarkMode ? 'bg-[#161616] border-[#333] text-white' : 'bg-white border-slate-300'}`} required/>
            <input type="number" placeholder="Số dư" value={newAcc.balance} onChange={e=>setNewAcc(p=>({...p, balance: e.target.value}))} className={`p-2 rounded-xl text-xs font-bold border ${isDarkMode ? 'bg-[#161616] border-[#333] text-white' : 'bg-white border-slate-300'}`} required/>
            <button type="submit" className="bg-[#4F46E5] text-white rounded-xl flex items-center justify-center hover:bg-[#4338CA]"><PlusCircle size={14}/></button>
          </form>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {accounts.map(acc => (
              <div key={acc.id} className={`p-3 rounded-xl border flex justify-between items-center ${isDarkMode ? 'bg-[#141414] border-[#222]' : 'bg-slate-50'}`}>
                <span className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{acc.name}</span>
                <span className="font-mono font-black text-xs text-[#4F46E5] dark:text-[#38BDF8] tabular-nums">{formatVND(acc.balance)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* THIẾT LẬP TRẦN CHI TIÊU - NƠI FIX LỖI TRONG ẢNH */}
        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0D0D0D] border-[#1F1F1F]' : 'bg-white border-slate-100'}`}>
          <h3 className={`font-black text-xs uppercase tracking-wider mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>Thiết lập trần chi tiêu</h3>
          
          <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4">
            <input type="text" placeholder="Tên quỹ" value={newCat.name} onChange={e=>setNewCat(p=>({...p, name: e.target.value}))} className={`p-2 rounded-xl text-xs font-bold border ${isDarkMode ? 'bg-[#161616] border-[#333] text-white' : 'bg-white border-slate-300'}`} required/>
            <select value={newCat.type} onChange={e=>setNewCat(p=>({...p, type: e.target.value}))} className={`p-2 rounded-xl text-xs font-black border ${isDarkMode ? 'bg-[#161616] border-[#333] text-white' : 'bg-white border-slate-300'}`}>
              <option value="percentage">Theo %</option>
              <option value="fixed">Cố định</option>
            </select>
            <input type="number" placeholder="Giá trị" value={newCat.value} onChange={e=>setNewCat(p=>({...p, value: e.target.value}))} className={`p-2 rounded-xl text-xs font-bold border ${isDarkMode ? 'bg-[#161616] border-[#333] text-white' : 'bg-white border-slate-300'}`} required/>
            <button type="submit" className="bg-[#0D9488] text-white rounded-xl flex items-center justify-center hover:bg-[#0F766E]"><PlusCircle size={14}/></button>
          </form>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {categories.map(cat => {
              // AN TOÀN TUYỆT ĐỐI: ÉP KIỂU ĐỂ TRIỆT TIÊU HOÀN TOÀN NaN LỖI TRONG ẢNH
              const catType = cat.type || 'percentage';
              const catValue = parseFloat(cat.value) || 0;
              const computedLimit = catType === 'fixed' ? catValue : (catValue / 100) * (allocatedIncomeBase || 0);

              const isEditing = editingCatId === cat.id;

              return (
                <div key={cat.id} className={`p-3 rounded-xl border flex justify-between items-center transition-all ${isDarkMode ? 'bg-[#141414] border-[#222]' : 'bg-slate-50'}`}>
                  {isEditing ? (
                    /* GIAO DIỆN KHI ẤN SỬA INLINE */
                    <div className="flex gap-1.5 items-center w-full">
                      <input type="text" value={editCatForm.name} onChange={e=>setEditCatForm(p=>({...p, name: e.target.value}))} className="p-1 text-xs font-bold border rounded bg-transparent w-20 text-slate-400" />
                      <select value={editCatForm.type} onChange={e=>setEditCatForm(p=>({...p, type: e.target.value}))} className="p-1 text-[10px] font-bold border rounded bg-transparent text-slate-400">
                        <option value="percentage">%</option>
                        <option value="fixed">Cố định</option>
                      </select>
                      <input type="number" value={editCatForm.value} onChange={e=>setEditCatForm(p=>({...p, value: e.target.value}))} className="p-1 text-xs font-bold border rounded bg-transparent w-16 text-slate-400" />
                      <div className="flex gap-1 ml-auto">
                        <button onClick={() => handleSaveCatEdit(cat.id)} className="p-1 bg-emerald-600 text-white rounded"><Check size={11}/></button>
                        <button onClick={() => setEditingCatId(null)} className="p-1 bg-slate-500 text-white rounded"><X size={11}/></button>
                      </div>
                    </div>
                  ) : (
                    /* GIAO DIỆN HIỂN THỊ CHUẨN ĐÃ FIX HOÀN TOÀN NaN */
                    <>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{cat.name}</span>
                        <button onClick={() => handleStartEditCat(cat)} className="text-slate-400 hover:text-indigo-500">
                          <Edit3 size={11} />
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-black text-xs text-[#F06543] block tabular-nums">{formatVND(computedLimit)}</span>
                        <span className="text-[9px] text-slate-400 font-mono block uppercase">
                          {catType === 'fixed' ? 'Cố định' : `${catValue}% Dòng thu`}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}