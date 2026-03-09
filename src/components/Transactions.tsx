import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Plus,
  Calendar,
  ChevronRight,
  ShoppingBag,
  Utensils,
  Car,
  Home as HomeIcon,
  MoreHorizontal,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Transactions() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTransactions(data);
    } catch (e) {
      console.error("Failed to fetch transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = filter === 'all' || t.type === filter;
    const matchesSearch = t.description?.toLowerCase().includes(search.toLowerCase()) || 
                         t.category?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'food': return Utensils;
      case 'shopping': return ShoppingBag;
      case 'transport': return Car;
      case 'rent': return HomeIcon;
      default: return MoreHorizontal;
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Scanning Ledger...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Header Area */}
      <div className="px-6 pt-8 pb-6 bg-white rounded-b-[40px] shadow-sm mb-6 sticky top-0 z-20 border-b border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-900" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Transactions</h1>
          <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <Filter className="w-6 h-6 text-slate-900" />
          </button>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 focus-within:border-primary/30 focus-within:bg-white transition-all mb-6">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search spending..." 
            className="bg-transparent border-none focus:outline-none text-sm w-full font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {['all', 'income', 'expense'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border",
                filter === f 
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                  : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="px-6 space-y-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((t, i) => {
            const Icon = getCategoryIcon(t.category);
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white p-4 rounded-[28px] shadow-sm border border-slate-100 flex items-center gap-4"
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                  t.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-600"
                )}>
                  {t.type === 'income' ? <ArrowUpRight className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 truncate">{t.description || t.category}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.category} • {t.date}</p>
                </div>

                <div className="text-right">
                  <p className={cn(
                    "font-black text-base",
                    t.type === 'income' ? "text-emerald-500" : "text-slate-900"
                  )}>
                    {t.type === 'income' ? '+' : '-'}₹{t.amount?.toLocaleString('en-IN')}
                  </p>
                  <ChevronRight className="w-4 h-4 text-slate-300 ml-auto mt-1" />
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No records found</p>
          </div>
        )}
      </div>
    </div>
  );
}
