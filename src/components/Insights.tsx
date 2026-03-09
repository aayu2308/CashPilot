import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  ArrowLeft,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Target,
  Lightbulb,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Insights() {
  const { token } = useAuth();
  const [insights, setInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/dashboard/insights', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setInsights(data);
    } catch (e) {
      console.error("Failed to fetch insights");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Consulting AI Advisor...</p>
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
          <h1 className="text-xl font-bold text-slate-900">Smart Insights</h1>
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary" />
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">AI Recommendation</span>
          </div>
          <p className="text-sm font-bold text-slate-700 leading-relaxed">
            Based on your spending patterns, you could save an additional ₹2,400 this month by reducing "Dining Out" by 15%.
          </p>
        </div>
      </div>

      {/* Insights List */}
      <div className="px-6 space-y-4">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "p-6 rounded-[32px] border flex flex-col gap-4 shadow-sm",
              insight.type === 'positive' ? "bg-emerald-50 border-emerald-100" :
              insight.type === 'warning' ? "bg-rose-50 border-rose-100" :
              "bg-blue-50 border-blue-100"
            )}
          >
            <div className="flex items-center justify-between">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                insight.type === 'positive' ? "bg-emerald-500/10 text-emerald-600" :
                insight.type === 'warning' ? "bg-rose-500/10 text-rose-600" :
                "bg-blue-500/10 text-blue-600"
              )}>
                {insight.type === 'positive' ? <TrendingUp className="w-6 h-6" /> : 
                 insight.type === 'warning' ? <TrendingDown className="w-6 h-6" /> : 
                 <Zap className="w-6 h-6" />}
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full",
                insight.type === 'positive' ? "bg-emerald-500/10 text-emerald-600" :
                insight.type === 'warning' ? "bg-rose-500/10 text-rose-600" :
                "bg-blue-500/10 text-blue-600"
              )}>
                {insight.type}
              </span>
            </div>
            <p className="text-base font-bold text-slate-800 leading-relaxed">
              {insight.text}
            </p>
            <div className="pt-4 border-t border-black/5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actionable Insight</span>
              <button className="text-xs font-bold text-primary flex items-center gap-1">
                Learn More <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
