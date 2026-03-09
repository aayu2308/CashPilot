import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target, 
  Zap, 
  Plus,
  Calendar,
  IndianRupee,
  ArrowRight,
  Flame,
  ChevronRight,
  X,
  CreditCard,
  ShoppingBag,
  Utensils,
  Car,
  Home as HomeIcon,
  MoreHorizontal
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

const COLORS = ['#2563EB', '#38BDF8', '#F59E0B', '#22C55E', '#EF4444'];

export default function Dashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState<'idle' | 'success' | 'already'>( 'idle');

  useEffect(() => {
    fetchStats();
    fetchGoals();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data);
      
      // Fetch AI Insights
      const insightsRes = await fetch('/api/dashboard/insights', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const insightsData = await insightsRes.json();
      setInsights(insightsData);
    } catch (e) {
      console.error("Failed to fetch dashboard data", e);
    }
  };

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/goals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setGoals(data);
    } catch (e) {
      console.error("Failed to fetch goals", e);
    }
  };

  const handleCheckIn = async (didSpend: boolean) => {
    try {
      const res = await fetch('/api/user/checkin', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ didSpend })
      });
      const data = await res.json();
      if (data.message === "Already checked in today") {
        setCheckInStatus('already');
      } else {
        setCheckInStatus('success');
        fetchStats(); // Refresh streak
      }
      setTimeout(() => setCheckInStatus('idle'), 3000);
    } catch (e) {
      console.error("Check-in failed");
    }
  };

  if (!stats) return (
    <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse">Loading your financial world...</p>
    </div>
  );

  return (
    <div className="pb-10">
      {/* Top Area: Greeting & Snapshot */}
      <section className="px-6 pt-8 pb-6 bg-white rounded-b-[40px] shadow-sm mb-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-slate-500 font-medium mb-1">Good Evening,</p>
            <h1 className="text-3xl font-bold text-slate-900">{user?.name || 'Aayush'}</h1>
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-slate-100"
              />
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={175.9}
                initial={{ strokeDashoffset: 175.9 }}
                animate={{ strokeDashoffset: 175.9 - (175.9 * stats.healthScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-primary"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-sm font-bold text-slate-900 leading-none">{stats.healthScore}</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase">Score</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Balance</p>
            <p className="text-lg font-bold text-slate-900">₹{stats.totalSavings.toLocaleString('en-IN')}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today</p>
            <p className="text-lg font-bold text-red-500">₹{stats.totalExpensesToday?.toLocaleString('en-IN') || '0'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saved</p>
            <p className="text-lg font-bold text-emerald-500">₹{stats.totalSavingsMonth?.toLocaleString('en-IN') || '0'}</p>
          </div>
        </div>
      </section>

      {/* Swipeable Financial Cards */}
      <section className="px-6 mb-8">
        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x snap-mandatory">
          <FinancialCard 
            title="Income" 
            value={stats.totalIncome} 
            icon={TrendingUp} 
            gradient="from-blue-600 to-indigo-600"
            trend="+12%"
          />
          <FinancialCard 
            title="Expenses" 
            value={stats.totalExpenses} 
            icon={TrendingDown} 
            gradient="from-red-500 to-rose-600"
            trend="+5%"
          />
          <FinancialCard 
            title="Savings" 
            value={stats.totalSavings} 
            icon={Wallet} 
            gradient="from-emerald-500 to-teal-600"
            trend="+8%"
          />
          <FinancialCard 
            title="Bills" 
            value={stats.upcomingBillsTotal || 0} 
            icon={CreditCard} 
            gradient="from-amber-500 to-orange-600"
            trend="Due"
          />
        </div>
      </section>

      {/* Daily Money Check-in */}
      <section className="px-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Daily Check-in</h3>
            <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-2xl border border-amber-100">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              </motion.div>
              <span className="text-amber-600 text-xs font-bold">{user?.streak || 0} Day Streak</span>
            </div>
          </div>
          
          <p className="text-slate-500 text-sm mb-6 font-medium">Did you spend any money today?</p>
          
          <div className="flex gap-3">
            <button 
              onClick={() => handleCheckIn(true)}
              className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold rounded-2xl transition-all border border-slate-100"
            >
              Yes
            </button>
            <button 
              onClick={() => handleCheckIn(false)}
              className="flex-1 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all"
            >
              No
            </button>
          </div>

          <AnimatePresence>
            {checkInStatus !== 'idle' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center p-6 text-center"
              >
                <div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-emerald-600 fill-emerald-600" />
                  </div>
                  <p className="font-bold text-slate-900">
                    {checkInStatus === 'success' ? 'Streak Updated! +10 Points' : 'Already Checked In!'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Cash Flow Chart */}
      <section className="px-6 mb-8">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Cash Flow</h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">In</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Out</span>
              </div>
            </div>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyTrend}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B8" opacity={0.1} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#94A3B8', fontWeight: 600}} 
                  tickFormatter={(val) => val.split('-')[1]}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontSize: '12px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#2563EB" 
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                  strokeWidth={3} 
                  animationDuration={1500}
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#EF4444" 
                  fillOpacity={1} 
                  fill="url(#colorExpense)" 
                  strokeWidth={3} 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Smart Insights Swipeable */}
      <section className="px-6 mb-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Smart Insights</h3>
        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x snap-mandatory">
          {insights.map((insight, i) => (
            <motion.div 
              key={i}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "min-w-[280px] p-5 rounded-[28px] border snap-center flex flex-col gap-3 shadow-sm",
                insight.type === 'positive' ? "bg-emerald-50 border-emerald-100" :
                insight.type === 'warning' ? "bg-rose-50 border-rose-100" :
                "bg-blue-50 border-blue-100"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center",
                insight.type === 'positive' ? "bg-emerald-500/10 text-emerald-600" :
                insight.type === 'warning' ? "bg-rose-500/10 text-rose-600" :
                "bg-blue-500/10 text-blue-600"
              )}>
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                {insight.text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Goals Section */}
      <section className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Goals</h3>
          <button className="text-primary text-sm font-bold flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {goals.slice(0, 2).map((goal) => (
            <motion.div 
              key={goal.id}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900">{goal.name}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    ₹{goal.current_amount.toLocaleString()} / ₹{goal.target_amount.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-primary">
                    {Math.round((goal.current_amount / goal.target_amount) * 100)}%
                  </p>
                </div>
              </div>
              <div className="h-3 bg-slate-50 rounded-full overflow-hidden mb-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(goal.current_amount / goal.target_amount) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                Estimated: 4 Months Left
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsExpenseModalOpen(true)}
        className="fixed bottom-28 right-6 w-16 h-16 bg-primary text-white rounded-full shadow-[0_10px_30px_rgba(37,99,235,0.4)] flex items-center justify-center z-40"
      >
        <Plus className="w-8 h-8" />
      </motion.button>

      {/* Expense Modal */}
      <AnimatePresence>
        {isExpenseModalOpen && (
          <ExpenseModal 
            onClose={() => setIsExpenseModalOpen(false)} 
            onSuccess={() => {
              setIsExpenseModalOpen(false);
              fetchStats();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FinancialCard({ title, value, icon: Icon, gradient, trend }: any) {
  return (
    <motion.div 
      whileTap={{ scale: 0.95 }}
      className={cn(
        "min-w-[160px] p-5 rounded-[32px] text-white snap-center relative overflow-hidden shadow-lg",
        `bg-gradient-to-br ${gradient}`
      )}
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
      <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-xl font-black mb-2">₹{value.toLocaleString('en-IN')}</h4>
      <span className="text-[10px] font-bold px-2 py-1 bg-white/20 rounded-full backdrop-blur-md">
        {trend}
      </span>
    </motion.div>
  );
}

function ExpenseModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const { token } = useAuth();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { name: 'Food', icon: Utensils, color: 'bg-orange-100 text-orange-600' },
    { name: 'Shopping', icon: ShoppingBag, color: 'bg-blue-100 text-blue-600' },
    { name: 'Transport', icon: Car, color: 'bg-purple-100 text-purple-600' },
    { name: 'Rent', icon: HomeIcon, color: 'bg-emerald-100 text-emerald-600' },
    { name: 'Other', icon: MoreHorizontal, color: 'bg-slate-100 text-slate-600' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'expense',
          category,
          amount: parseFloat(amount),
          description,
          date: new Date().toISOString().split('T')[0]
        })
      });
      if (res.ok) onSuccess();
    } catch (e) {
      console.error("Failed to add expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-4"
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-slate-900">Add Expense</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">₹</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-10 pr-4 text-2xl font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all border",
                    category === cat.name 
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                      : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Notes</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this for?"
              className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-medium focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || !amount || !category}
            className="w-full py-5 bg-primary text-white font-bold rounded-3xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
          >
            {isSubmitting ? 'Adding...' : 'Confirm Expense'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
