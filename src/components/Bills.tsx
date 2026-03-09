import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Clock,
  Tv,
  Wifi,
  Zap,
  Smartphone,
  Home,
  Music
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, cn } from '../lib/utils';

export default function Bills() {
  const { token } = useAuth();
  const [bills, setBills] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    // Mock data for now as we don't have full CRUD for these yet
    setBills([
      { id: 1, name: 'Rent', amount: 15000, due_date: '2026-03-10', status: 'unpaid', category: 'Home' },
      { id: 2, name: 'Electricity', amount: 1200, due_date: '2026-03-15', status: 'unpaid', category: 'Utility' },
      { id: 3, name: 'Internet', amount: 800, due_date: '2026-03-05', status: 'paid', category: 'Utility' },
    ]);
    setSubscriptions([
      { id: 1, name: 'Netflix', amount: 499, billing_cycle: 'monthly', next_billing: '2026-03-20', category: 'Entertainment' },
      { id: 2, name: 'Spotify', amount: 119, billing_cycle: 'monthly', next_billing: '2026-03-25', category: 'Entertainment' },
      { id: 3, name: 'Amazon Prime', amount: 1499, billing_cycle: 'yearly', next_billing: '2026-08-12', category: 'Shopping' },
    ]);
  }, []);

  const getIcon = (category: string) => {
    switch (category) {
      case 'Entertainment': return Tv;
      case 'Utility': return Zap;
      case 'Home': return Home;
      case 'Shopping': return Smartphone;
      default: return CreditCard;
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 pb-20 lg:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight">Bills & Subscriptions</h2>
          <p className="text-text-secondary-light text-xs lg:text-sm">Never miss a payment. Track your recurring obligations.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 lg:flex-none px-4 lg:px-6 py-3 bg-white border border-slate-200 text-text-primary-light font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-xs lg:text-sm">
            <Plus className="w-4 h-4" /> Add Bill
          </button>
          <button className="flex-1 lg:flex-none btn-primary flex items-center justify-center gap-2 py-3 lg:py-2.5 text-xs lg:text-sm">
            <Plus className="w-4 h-4" /> Add Subscription
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Upcoming Bills */}
        <div className="space-y-5 lg:space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base lg:text-lg font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Upcoming Bills
            </h3>
            <span className="text-[10px] font-bold text-text-secondary-light uppercase tracking-wider">3 Pending</span>
          </div>

          <div className="space-y-3 lg:space-y-4">
            {bills.map((bill) => {
              const Icon = getIcon(bill.category);
              return (
                <motion.div 
                  key={bill.id}
                  whileHover={{ x: 5 }}
                  className="glass-card p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center",
                      bill.status === 'paid' ? "bg-success-light/10 text-success-light" : "bg-accent/10 text-accent"
                    )}>
                      <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
                    </div>
                    <div>
                      <p className="text-sm lg:text-base font-bold">{bill.name}</p>
                      <p className="text-[10px] lg:text-xs text-text-secondary-light">Due on {bill.due_date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm lg:text-base font-bold">{formatCurrency(bill.amount)}</p>
                    <span className={cn(
                      "text-[9px] lg:text-[10px] font-bold uppercase tracking-wider",
                      bill.status === 'paid' ? "text-success-light" : "text-accent"
                    )}>
                      {bill.status}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Subscriptions */}
        <div className="space-y-5 lg:space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base lg:text-lg font-bold flex items-center gap-2">
              <Music className="w-5 h-5 text-secondary" /> Active Subscriptions
            </h3>
            <span className="text-[10px] font-bold text-text-secondary-light uppercase tracking-wider">Total: {formatCurrency(2117)}/mo</span>
          </div>

          <div className="space-y-3 lg:space-y-4">
            {subscriptions.map((sub) => {
              const Icon = getIcon(sub.category);
              return (
                <motion.div 
                  key={sub.id}
                  whileHover={{ x: 5 }}
                  className="glass-card p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center">
                      <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
                    </div>
                    <div>
                      <p className="text-sm lg:text-base font-bold">{sub.name}</p>
                      <p className="text-[10px] lg:text-xs text-text-secondary-light">Next: {sub.next_billing}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm lg:text-base font-bold">{formatCurrency(sub.amount)}</p>
                    <span className="text-[9px] lg:text-[10px] font-bold text-text-secondary-light uppercase tracking-wider">
                      {sub.billing_cycle}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="glass-card p-5 lg:p-6 bg-red-500/5 border-red-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-600">Subscription Waste Detector</h4>
                <p className="text-xs text-text-secondary-light mt-1 leading-relaxed">
                  You spend <span className="font-bold text-text-primary-light">₹2,117/month</span> on subscriptions. That's <span className="font-bold text-text-primary-light">₹25,404 per year</span>. 
                  Consider canceling unused services to save more!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
