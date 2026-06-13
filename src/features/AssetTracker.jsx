import React, { useState } from 'react';
import { PlusCircle, TrendingUp, DollarSign } from 'lucide-react';

const formatVND = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value).replace(/\s?₫/, ' ₫');
};

export default function AssetTracker({ assets, setAssets, isDarkMode }) {
  const [stockForm, setStockForm] = useState({ name: '', units: '', avgCost: '', currentPrice: '' });

  const handleAddStock = (e) => {
    e.preventDefault();
    if (!stockForm.name || !stockForm.units || !stockForm.avgCost || !stockForm.currentPrice) return;
    
    const newStock = {
      id: 'st_' + Date.now(),
      name: stockForm.name.toUpperCase(),
      units: parseFloat(stockForm.units),
      avgCost: parseFloat(stockForm.avgCost),
      currentPrice: parseFloat(stockForm.currentPrice)
    };

    setAssets(prev => ({
      ...prev,
      stocks: [...(prev.stocks || []), newStock]
    }));

    setStockForm({ name: '', units: '', avgCost: '', currentPrice: '' });
  };

  const currentStocks = assets.stocks || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-base font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Sàn Đầu Tư Tài Sản (API Mockup)</h2>
        <p className="text-xs text-slate-400">Quản lý danh mục đầu tư chứng khoán, kim sản vật, gia tăng tỷ suất sinh lời ròng.</p>
      </div>

      {/* Form nạp cổ phiếu */}
      <form onSubmit={handleAddStock} className={`p-4 rounded-2xl border grid grid-cols-2 sm:grid-cols-5 gap-3 items-end ${isDarkMode ? 'bg-[#0D0D0D] border-[#1F1F1F]' : 'bg-white border-slate-100 shadow-xs'}`}>
        <div>
          <label className="text-[11px] font-extrabold text-slate-400 uppercase block mb-1">Mã CP</label>
          <input type="text" placeholder="FPT, VNM..." value={stockForm.name} onChange={e=>setStockForm(p=>({...p, name: e.target.value}))} className={`w-full p-2 rounded-lg text-xs font-black outline-none border ${isDarkMode ? 'bg-[#161616] border-[#333] text-white' : 'bg-white border-slate-300 text-slate-900'}`} required />
        </div>
        <div>
          <label className="text-[11px] font-extrabold text-slate-400 uppercase block mb-1">Số lượng</label>
          <input type="number" placeholder="0" value={stockForm.units} onChange={e=>setStockForm(p=>({...p, units: e.target.value}))} className={`w-full p-2 rounded-lg text-xs font-bold outline-none border ${isDarkMode ? 'bg-[#161616] border-[#333] text-white' : 'bg-white border-slate-300 text-slate-900'}`} required />
        </div>
        <div>
          <label className="text-[11px] font-extrabold text-slate-400 uppercase block mb-1">Giá vốn (VND)</label>
          <input type="number" placeholder="0" value={stockForm.avgCost} onChange={e=>setStockForm(p=>({...p, avgCost: e.target.value}))} className={`w-full p-2 rounded-lg text-xs font-bold outline-none border ${isDarkMode ? 'bg-[#161616] border-[#333] text-white' : 'bg-white border-slate-300 text-slate-900'}`} required />
        </div>
        <div>
          <label className="text-[11px] font-extrabold text-slate-400 uppercase block mb-1">Giá thị trường</label>
          <input type="number" placeholder="0" value={stockForm.currentPrice} onChange={e=>setStockForm(p=>({...p, currentPrice: e.target.value}))} className={`w-full p-2 rounded-lg text-xs font-bold outline-none border ${isDarkMode ? 'bg-[#161616] border-[#333] text-white' : 'bg-white border-slate-300 text-slate-900'}`} required />
        </div>
        <button type="submit" className="w-full py-2 bg-gradient-to-r from-[#4F46E5] to-[#0D9488] text-white text-xs font-black rounded-lg transition-all col-span-2 sm:col-span-1 flex items-center justify-center gap-1">
          <PlusCircle size={13} /> Khai thác vị thế
        </button>
      </form>

      {/* Danh mục tài sản hiện hữu - Bảng Tabular Figures tinh gọn */}
      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0D0D0D] border-[#1F1F1F]' : 'bg-white border-slate-100 shadow-xs'} space-y-4`}>
        <h3 className={`font-black text-xs uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-900'}`}>Danh Mục Chứng Khoán Sở Hữu</h3>
        <div className={`overflow-x-auto border rounded-xl ${isDarkMode ? 'border-[#1F1F1F]' : 'border-slate-200'}`}>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b font-extrabold ${isDarkMode ? 'bg-[#121212] border-[#222] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <th className="p-3.5">Mã tài sản</th>
                <th className="p-3.5 text-right">Khối lượng</th>
                <th className="p-3.5 text-right">Giá mua trung bình</th>
                <th className="p-3.5 text-right">Giá hiện tại</th>
                <th className="p-3.5 text-right">Tổng giá trị</th>
                <th className="p-3.5 text-right">Hiệu suất Lãi/Lỗ</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-bold ${isDarkMode ? 'divide-[#1F1F1F]' : 'divide-slate-100'}`}>
              {currentStocks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-400 italic">Chưa cấu trúc danh mục đầu tư cổ phiếu.</td>
                </tr>
              ) : (
                currentStocks.map(st => {
                  const totalCost = st.units * st.avgCost;
                  const totalValue = st.units * st.currentPrice;
                  const profitOrLoss = totalValue - totalCost;
                  const isProfit = profitOrLoss >= 0;

                  return (
                    <tr key={st.id} className={isDarkMode ? 'hover:bg-[#121212]' : 'hover:bg-slate-50/50'}>
                      <td className={`p-3.5 font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{st.name}</td>
                      <td className="p-3.5 text-right font-mono tabular-nums">{st.units}</td>
                      <td className="p-3.5 text-right font-mono tabular-nums text-slate-400">{formatVND(st.avgCost)}</td>
                      <td className="p-3.5 text-right font-mono tabular-nums text-slate-500">{formatVND(st.currentPrice)}</td>
                      <td className={`p-3.5 text-right font-mono font-black tabular-nums ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{formatVND(totalValue)}</td>
                      <td className={`p-3.5 text-right font-mono font-black tabular-nums ${isProfit ? 'text-[#0F9D58]' : 'text-[#F06543]'}`}>
                        {isProfit ? '+' : ''}{formatVND(profitOrLoss)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}