import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, PiggyBank, Percent, ClipboardList, Wallet, BarChart3, BrainCircuit, PlusCircle, Sun, Moon } from 'lucide-react';

import DashboardOverview from './features/DashboardOverview';
import AssetTracker from './features/AssetTracker';
import AccountCategoryManager from './features/AccountCategoryManager';
import DebtTracker from './features/DebtTracker';
import VisualReports from './features/VisualReports';
import AIInsights from './features/AIInsights';

const formatVND = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value).replace(/\s?₫/, ' ₫');
};

const INITIAL_ACCOUNTS = [
  { id: '1', name: 'Vietcombank', balance: 15000000, type: 'Bank' },
  { id: '2', name: 'Techcombank', balance: 8500000, type: 'Bank' },
  { id: '3', name: 'Ví MoMo', balance: 2350000, type: 'E-Wallet' }
];

const INITIAL_CATEGORIES = [
  { id: 'c1', name: 'Thiết yếu', type: 'percentage', value: 50 },
  { id: 'c2', name: 'Sở thích', type: 'percentage', value: 30 },
  { id: 'c3', name: 'Đầu tư', type: 'percentage', value: 20 }
];

const INITIAL_ASSETS = { savings: [], ccq: [], gold: [], stocks: [] };

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [accounts, setAccounts] = useState(() => JSON.parse(localStorage.getItem('fin_v2_accounts')) || INITIAL_ACCOUNTS);
  const [categories, setCategories] = useState(() => JSON.parse(localStorage.getItem('fin_v2_categories')) || INITIAL_CATEGORIES);
  const [assets, setAssets] = useState(() => JSON.parse(localStorage.getItem('fin_v2_assets')) || INITIAL_ASSETS);
  const [debts, setDebts] = useState(() => JSON.parse(localStorage.getItem('fin_v2_debts')) || []);
  const [transactions, setTransactions] = useState(() => JSON.parse(localStorage.getItem('fin_v2_txs')) || []);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTxId, setEditingTxId] = useState(null);
  
  const [newTx, setNewTx] = useState({ 
    desc: '', amount: '', type: 'expense', category: '', account: '', 
    fromAccount: '', toAccount: '',
    date: new Date().toISOString().split('T')[0],
    isAllocated: true, isCounted: true    
  });

  useEffect(() => {
    if (categories.length > 0 && !newTx.category) setNewTx(p => ({ ...p, category: categories[0].name }));
    if (accounts.length > 0 && !newTx.account) {
      setNewTx(p => ({ 
        ...p, account: accounts[0].name, fromAccount: accounts[0].name, toAccount: accounts[1]?.name || accounts[0].name
      }));
    }
  }, [categories, accounts]);

  useEffect(() => { localStorage.setItem('fin_v2_accounts', JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem('fin_v2_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('fin_v2_assets', JSON.stringify(assets)); }, [assets]);
  useEffect(() => { localStorage.setItem('fin_v2_debts', JSON.stringify(debts)); }, [debts]);
  useEffect(() => { localStorage.setItem('fin_v2_txs', JSON.stringify(transactions)); }, [transactions]);

  const financialSummary = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    // TÍNH TOÁN GỐC PHÂN BỔ: Chỉ lấy khoản thu có tích "isAllocated"
    const allocatedIncomeBase = transactions.filter(t => t.type === 'income' && t.isAllocated !== false).reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    const bankBalance = accounts.reduce((sum, acc) => sum + (parseFloat(acc.balance) || 0), 0);
    const savingsBalance = (assets.savings || []).reduce((sum, s) => sum + parseFloat(s.principal || 0), 0);
    const ccqValue = (assets.ccq || []).reduce((sum, c) => sum + (parseFloat(c.units || 0) * parseFloat(c.currentNav || 0)), 0);
    const goldValue = (assets.gold || []).reduce((sum, g) => sum + (parseFloat(g.quantity || 0) * parseFloat(g.currentPrice || 0)), 0);
    const stockValue = (assets.stocks || []).reduce((sum, st) => sum + (parseFloat(st.units || 0) * parseFloat(st.currentPrice || 0)), 0);
    const pendingDebts = debts.filter(d => d.type === 'debt' && d.status === 'pending').reduce((sum, d) => sum + d.amount, 0);
    const pendingLoans = debts.filter(d => d.type === 'loan' && d.status === 'pending').reduce((sum, d) => sum + d.amount, 0);

    const netWorth = bankBalance + savingsBalance + ccqValue + goldValue + stockValue + pendingLoans - pendingDebts;

    const categoryAnalysis = categories.map(cat => {
      const catType = cat.type || 'percentage';
      const catValue = parseFloat(cat.value) || 0;
      const dynamicLimit = catType === 'fixed' ? catValue : (catValue / 100) * allocatedIncomeBase;
      
      // TÍNH TOÁN TIÊU HAO HẠN MỨC: Chỉ gom khoản chi có tích "isCounted"
      const spent = transactions.filter(t => t.type === 'expense' && t.category === cat.name && t.isCounted !== false).reduce((sum, t) => sum + t.amount, 0);
      return { ...cat, type: catType, value: catValue, limit: dynamicLimit, spent };
    });

    return { totalIncome, totalExpense, allocatedIncomeBase, netWorth, bankBalance, categoryAnalysis };
  }, [transactions, accounts, assets, debts, categories]);

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!newTx.desc || !newTx.amount) return;
    const numAmount = parseFloat(newTx.amount);

    if (editingTxId) {
      const oldTx = transactions.find(t => t.id === editingTxId);
      if (oldTx) {
        setAccounts(prev => prev.map(acc => {
          let bal = acc.balance;
          if (oldTx.type === 'transfer') {
            if (acc.name === oldTx.fromAccount) bal += oldTx.amount;
            if (acc.name === oldTx.toAccount) bal -= oldTx.amount;
          } else {
            if (acc.name === oldTx.account) bal = oldTx.type === 'income' ? bal - oldTx.amount : bal + oldTx.amount;
          }
          if (newTx.type === 'transfer') {
            if (acc.name === newTx.fromAccount) bal -= numAmount;
            if (acc.name === newTx.toAccount) bal += numAmount;
          } else {
            if (acc.name === newTx.account) bal = newTx.type === 'income' ? bal + numAmount : bal - numAmount;
          }
          return { ...acc, balance: bal };
        }));
      }
      setTransactions(prev => prev.map(t => t.id === editingTxId ? { ...t, ...newTx, amount: numAmount } : t));
    } else {
      if (newTx.type === 'transfer') {
        setAccounts(prev => prev.map(acc => {
          if (acc.name === newTx.fromAccount) return { ...acc, balance: acc.balance - numAmount };
          if (acc.name === newTx.toAccount) return { ...acc, balance: acc.balance + numAmount };
          return acc;
        }));
      } else {
        setAccounts(prev => prev.map(acc => {
          if (acc.name === newTx.account) return { ...acc, balance: newTx.type === 'income' ? acc.balance + numAmount : acc.balance - numAmount };
          return acc;
        }));
      }
      setTransactions(prev => [{ id: 'tx_' + Date.now(), ...newTx, amount: numAmount }, ...prev]);
    }

    setIsTxModalOpen(false);
    setEditingTxId(null);
    setNewTx({ 
      desc: '', amount: '', type: 'expense', category: categories[0]?.name || '', account: accounts[0]?.name || '', 
      fromAccount: accounts[0]?.name || '', toAccount: accounts[1]?.name || accounts[0]?.name || '',
      date: new Date().toISOString().split('T')[0], isAllocated: true, isCounted: true
    });
  };

  const handleOpenEditModal = (tx) => {
    setEditingTxId(tx.id);
    setNewTx({ 
      ...tx, 
      amount: tx.amount.toString(),
      isAllocated: tx.isAllocated ?? true,
      isCounted: tx.isCounted ?? true
    });
    setIsTxModalOpen(true);
  };

  const handleDeleteTransaction = (id) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    if (window.confirm(`Xóa bản ghi "${tx.desc}" và hoàn tác dòng tiền?`)) {
      setAccounts(prev => prev.map(acc => {
        if (tx.type === 'transfer') {
          if (acc.name === tx.fromAccount) return { ...acc, balance: acc.balance + tx.amount };
          if (acc.name === tx.toAccount) return { ...acc, balance: acc.balance - tx.amount };
        } else {
          if (acc.name === tx.account) return { ...acc, balance: tx.type === 'income' ? acc.balance - tx.amount : acc.balance + tx.amount };
        }
        return acc;
      }));
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div className={`min-h-screen flex font-sans antialiased transition-colors duration-300 ${isDarkMode ? 'bg-[#050505] text-[#E2E8F0]' : 'bg-[#F4F6F8] text-[#1E293B]'}`}>
      
      {/* SIDEBAR */}
      <aside className={`w-64 border-r p-6 flex flex-col justify-between ${isDarkMode ? 'bg-[#0D0D0D] border-[#1F1F1F]' : 'bg-white border-slate-200'}`}>
        <div>
          <div className="flex items-center justify-between mb-8 px-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#4F46E5] rounded-xl text-white shadow-md"><Wallet size={18} /></div>
              <span className={`font-black text-sm tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>FINTECHLOCAL</span>
            </div>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-1.5 rounded-lg border ${isDarkMode ? 'bg-[#1F1F1F] border-[#333] text-yellow-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>

          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: 'Bảng Điều Hành Chính', icon: PieChart },
              { id: 'reports', label: 'Báo Cáo Trực Quan Pro', icon: BarChart3 },
              { id: 'ai_insights', label: 'Phân Tích & Dự Báo AI', icon: BrainCircuit },
              { id: 'assets', label: 'Sàn Đầu Tư Tài Sản (API)', icon: PiggyBank },
              { id: 'allocation', label: 'Cơ Cấu Vốn & Hạn Mức %', icon: Percent },
              { id: 'debts', label: 'Sổ Quản Lý Công Nợ', icon: ClipboardList },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setCurrentTab(tab.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold transition-all ${currentTab === tab.id ? 'bg-[#4F46E5] text-white shadow-lg shadow-indigo-500/20' : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-[#161616]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                  <Icon size={15} /> {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 font-mono text-center tracking-widest">PREMIUM FINTECH UI</div>
      </aside>

      {/* MAIN VIEW */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 rounded-2xl border ${isDarkMode ? 'bg-[#0D0D0D] border-[#1F1F1F]' : 'bg-white border-slate-100'}`}>
            <div>
              <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Tài sản ròng (Net Worth)</span>
              <span className={`text-2xl font-black font-mono tracking-tight tabular-nums ${isDarkMode ? 'text-[#38BDF8]' : 'text-[#4F46E5]'}`}>{formatVND(financialSummary.netWorth)}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Tổng số dư tài khoản</span>
              <span className={`text-2xl font-black font-mono tracking-tight tabular-nums ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{formatVND(financialSummary.bankBalance)}</span>
            </div>
            <div className="flex sm:justify-end">
              <button onClick={() => { setEditingTxId(null); setIsTxModalOpen(true); }} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#4F46E5] to-[#0D9488] text-white text-xs font-black rounded-xl transition-all shadow-lg">
                <PlusCircle size={15} /> Ghi dòng tiền mới
              </button>
            </div>
          </div>

          {currentTab === 'dashboard' && <DashboardOverview financialSummary={financialSummary} transactions={transactions} onDeleteTx={handleDeleteTransaction} onEditTx={handleOpenEditModal} isDarkMode={isDarkMode} />}
          {currentTab === 'reports' && <VisualReports transactions={transactions} categories={categories} isDarkMode={isDarkMode} />}
          {currentTab === 'ai_insights' && <AIInsights transactions={transactions} accounts={accounts} isDarkMode={isDarkMode} />}
          {currentTab === 'assets' && <AssetTracker assets={assets} setAssets={setAssets} isDarkMode={isDarkMode} />}
          {currentTab === 'allocation' && <AccountCategoryManager accounts={accounts} setAccounts={setAccounts} categories={categories} setCategories={setCategories} allocatedIncomeBase={financialSummary.allocatedIncomeBase} isDarkMode={isDarkMode} />}
          {currentTab === 'debts' && <DebtTracker debts={debts} setDebts={setDebts} isDarkMode={isDarkMode} />}
        </div>
      </main>

      {/* MODAL INPUT / EDIT TRANSACTION */}
      {isTxModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md p-6 rounded-2xl border space-y-4 shadow-2xl ${isDarkMode ? 'bg-[#0D0D0D] border-[#222]' : 'bg-white border-slate-200'}`}>
            <h3 className={`font-black text-sm tracking-wide border-b pb-3 ${isDarkMode ? 'text-white border-[#222]' : 'text-slate-900 border-slate-100'}`}>
              {editingTxId ? 'Cập Nhật Biến Động Giao Dịch' : 'Khai báo Biến Động Dòng Tiền'}
            </h3>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Kiểu dòng tiền</label>
                <div className={`flex p-1 rounded-xl border ${isDarkMode ? 'bg-[#121212] border-[#222]' : 'bg-slate-50 border-slate-200'}`}>
                  <button type="button" onClick={() => setNewTx(p=>({...p, type: 'expense'}))} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${newTx.type === 'expense' ? (isDarkMode ? 'bg-[#F06543] text-white' : 'bg-white text-[#F06543] shadow-xs') : 'text-slate-400'}`}>Khoản Chi</button>
                  <button type="button" onClick={() => setNewTx(p=>({...p, type: 'income'}))} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${newTx.type === 'income' ? (isDarkMode ? 'bg-[#0F9D58] text-white' : 'bg-white text-[#0F9D58] shadow-xs') : 'text-slate-400'}`}>Khoản Thu</button>
                  <button type="button" onClick={() => setNewTx(p=>({...p, type: 'transfer'}))} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${newTx.type === 'transfer' ? (isDarkMode ? 'bg-[#4F46E5] text-white' : 'bg-white text-[#4F46E5] shadow-xs') : 'text-slate-400'}`}>Điều Chuyển</button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Nội dung</label>
                  <input type="text" value={newTx.desc} onChange={(e)=>setNewTx(p=>({...p, desc: e.target.value}))} className={`w-full p-2.5 rounded-xl text-xs font-bold border ${isDarkMode ? 'bg-[#161616] border-[#333] text-white focus:border-[#4F46E5]' : 'bg-white border-slate-300 text-slate-900'}`} required/>
                </div>
                <div>
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Ngày</label>
                  <input type="date" value={newTx.date} onChange={(e)=>setNewTx(p=>({...p, date: e.target.value}))} className={`w-full p-2.5 rounded-xl text-xs font-mono border ${isDarkMode ? 'bg-[#161616] border-[#333] text-white' : 'bg-white border-slate-300 text-slate-900'}`} required/>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Số tiền (VND)</label>
                <input 
                  type="text" 
                  value={newTx.amount ? parseInt(newTx.amount, 10).toLocaleString('vi-VN') : ''} 
                  onChange={(e) => setNewTx(p => ({ ...p, amount: e.target.value.replace(/\D/g, '') }))} 
                  placeholder="0"
                  className={`w-full p-3 rounded-xl text-xl font-black font-mono text-right border ${isDarkMode ? 'bg-[#161616] border-[#333] text-[#38BDF8]' : 'bg-slate-50 border-slate-300 text-slate-900'}`} 
                  required
                />
              </div>

              {newTx.type === 'transfer' ? (
                <div className={`grid grid-cols-2 gap-3 p-3 rounded-xl border ${isDarkMode ? 'bg-[#121212] border-[#222]' : 'bg-slate-50 border-slate-200'}`}>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 block mb-1">Ví Nguồn (-)</label>
                    <select value={newTx.fromAccount} onChange={(e)=>setNewTx(p=>({...p, fromAccount: e.target.value}))} className={`w-full p-2 rounded-lg text-xs font-bold border ${isDarkMode ? 'bg-[#161616] border-[#333] text-white' : 'bg-white border-slate-300'}`}>
                      {accounts.map(acc => <option key={acc.id} value={acc.name}>{acc.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 block mb-1">Ví Đích (+)</label>
                    <select value={newTx.toAccount} onChange={(e)=>setNewTx(p=>({...p, toAccount: e.target.value}))} className={`w-full p-2 rounded-lg text-xs font-bold border ${isDarkMode ? 'bg-[#161616] border-[#333] text-white' : 'bg-white border-slate-300'}`}>
                      {accounts.map(acc => <option key={acc.id} value={acc.name}>{acc.name}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {newTx.type === 'expense' && (
                    <div>
                      <label className="text-[11px] font-extrabold text-slate-400 block mb-1">Hạng mục</label>
                      <select value={newTx.category} onChange={(e)=>setNewTx(p=>({...p, category: e.target.value}))} className={`w-full p-2.5 rounded-xl text-xs font-bold border ${isDarkMode ? 'bg-[#161616] border-[#333] text-white' : 'bg-white border-slate-300'}`}>
                        {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div className={newTx.type === 'income' ? 'col-span-2' : ''}>
                    <label className="text-[11px] font-extrabold text-slate-400 block mb-1">Tài khoản</label>
                    <select value={newTx.account} onChange={(e)=>setNewTx(p=>({...p, account: e.target.value}))} className={`w-full p-2.5 rounded-xl text-xs font-bold border ${isDarkMode ? 'bg-[#161616] border-[#333] text-white' : 'bg-white border-slate-300'}`}>
                      {accounts.map(acc => <option key={acc.id} value={acc.name}>{acc.name}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* BỘ LỌC TÍCH CHỌN VÀO BÁO CÁO (XỬ LÝ CORE YÊU CẦU CỦA BẠN) */}
              {newTx.type === 'income' && (
                <div className={`flex items-center gap-2.5 p-3 rounded-xl border ${isDarkMode ? 'bg-[#121212] border-[#222]' : 'bg-slate-50 border-slate-200'}`}>
                  <input 
                    type="checkbox" 
                    id="isAllocatedCheckbox"
                    checked={newTx.isAllocated ?? true}
                    onChange={(e) => setNewTx(p => ({ ...p, isAllocated: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-300 dark:border-[#333] text-[#0F9D58] focus:ring-[#0F9D58] bg-transparent"
                  />
                  <label htmlFor="isAllocatedCheckbox" className={`text-xs font-bold select-none cursor-pointer ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Tính vào gốc phân bổ % các quỹ hạn mức
                  </label>
                </div>
              )}

              {newTx.type === 'expense' && (
                <div className={`flex items-center gap-2.5 p-3 rounded-xl border ${isDarkMode ? 'bg-[#121212] border-[#222]' : 'bg-slate-50 border-slate-200'}`}>
                  <input 
                    type="checkbox" 
                    id="isCountedCheckbox"
                    checked={newTx.isCounted ?? true}
                    onChange={(e) => setNewTx(p => ({ ...p, isCounted: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-300 dark:border-[#333] text-[#F06543] focus:ring-[#F06543] bg-transparent"
                  />
                  <label htmlFor="isCountedCheckbox" className={`text-xs font-bold select-none cursor-pointer ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Tính vào báo cáo & trừ vào trần hạn mức quỹ
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setIsTxModalOpen(false)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold ${isDarkMode ? 'bg-[#1F1F1F] text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Hủy</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#4F46E5] text-white rounded-xl text-xs font-black shadow-md">Xác Nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}