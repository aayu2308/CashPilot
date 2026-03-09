import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  Calendar, 
  ChevronRight, 
  Trophy, 
  ArrowLeft,
  X,
  IndianRupee,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Goals() {
  const { token } = useAuth();
  const [goals, setGoals] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/goals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setGoals(data);
    } catch (e) {
      console.error("Failed to fetch goals");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Calculating Dreams...</p>
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
          <h1 className="text-xl font-bold text-slate-900">Financial Goals</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-gradient-to-br from-primary to-secondary p-6 rounded-[32px] text-white shadow-xl shadow-primary/20">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-amber-300" />
            <span className="text-xs font-bold uppercase tracking-widest text-white/80">Total Saved</span>
          </div>
          <h2 className="text-3xl font-black mb-1">₹{goals.reduce((acc, g) => acc + g.current_amount, 0).toLocaleString()}</h2>
          <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Across {goals.length} active goals</p>
        </div>
      </div>

      {/* Goals List */}
      <div className="px-6 space-y-6">
        {goals.length > 0 ? (
          goals.map((goal, i) => {
            const progress = Math.round((goal.current_amount / goal.target_amount) * 100);
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-slate-50 rounded-[20px] flex items-center justify-center">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-slate-900">{goal.name}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Target: ₹{goal.target_amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-primary">{progress}%</span>
                  </div>
                </div>

                <div className="h-4 bg-slate-50 rounded-full overflow-hidden mb-4 p-1">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      ₹{goal.monthly_contribution.toLocaleString()}/mo
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Due: {goal.deadline || 'No Deadline'}
                  </span>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No goals set yet</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-4 text-primary font-bold text-sm uppercase tracking-widest underline underline-offset-4"
            >
              Start Dreaming
            </button>
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <AddGoalModal 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => {
              setIsModalOpen(false);
              fetchGoals();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AddGoalModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    monthly_contribution: '',
    deadline: '',
    category: 'Savings'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          target_amount: parseFloat(formData.target_amount),
          monthly_contribution: parseFloat(formData.monthly_contribution)
        })
      });
      if (res.ok) onSuccess();
    } catch (e) {
      console.error("Failed to add goal");
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
          <h3 className="text-2xl font-bold text-slate-900">New Goal</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Goal Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. New Bike, Trip to Bali"
              className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-primary/20 transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target (₹)</label>
              <input 
                type="number" 
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                placeholder="0"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly (₹)</label>
              <input 
                type="number" 
                value={formData.monthly_contribution}
                onChange={(e) => setFormData({ ...formData, monthly_contribution: e.target.value })}
                placeholder="0"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Deadline</label>
            <input 
              type="date" 
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-primary/20 transition-all"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-primary text-white font-bold rounded-3xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
          >
            {isSubmitting ? 'Creating Dream...' : 'Set Goal'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
