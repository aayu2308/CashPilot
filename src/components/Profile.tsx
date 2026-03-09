import React from 'react';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  CreditCard, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  ArrowLeft,
  Flame,
  Trophy,
  Star
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Profile() {
  const { user, logout } = useAuth();

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Personal Info', color: 'bg-blue-50 text-blue-600' },
        { icon: CreditCard, label: 'Payment Methods', color: 'bg-emerald-50 text-emerald-600' },
        { icon: Bell, label: 'Notifications', color: 'bg-amber-50 text-amber-600' },
      ]
    },
    {
      title: 'Security',
      items: [
        { icon: Shield, label: 'Privacy & Security', color: 'bg-indigo-50 text-indigo-600' },
        { icon: Star, label: 'Premium Membership', color: 'bg-purple-50 text-purple-600' },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', color: 'bg-slate-50 text-slate-600' },
      ]
    }
  ];

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Header Area */}
      <div className="px-6 pt-8 pb-10 bg-white rounded-b-[40px] shadow-sm mb-6 sticky top-0 z-20 border-b border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-900" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Profile</h1>
          <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <Settings className="w-6 h-6 text-slate-900" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-[32px] flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-primary/30 ring-4 ring-white">
              {user?.name?.[0]}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-400 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
              <Trophy className="w-5 h-5 text-white fill-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">{user?.name}</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{user?.email}</p>
          
          <div className="flex gap-4 mt-6">
            <div className="flex flex-col items-center bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
              <span className="text-lg font-black text-slate-900">{user?.points || 0}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Points</span>
            </div>
            <div className="flex flex-col items-center bg-amber-50 px-6 py-3 rounded-2xl border border-amber-100">
              <span className="text-lg font-black text-amber-600">{user?.streak || 0}</span>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Sections */}
      <div className="px-6 space-y-8">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{section.title}</h3>
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
              {section.items.map((item, i) => (
                <button 
                  key={i}
                  className={cn(
                    "w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-all group",
                    i !== section.items.length - 1 && "border-b border-slate-50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", item.color)}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-700">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ))}

        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 p-5 bg-rose-50 text-rose-600 font-bold rounded-[32px] border border-rose-100 hover:bg-rose-100 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout Account
        </button>

        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-10">
          CashPilot v1.0.0 • Made with ❤️ for Gen Z
        </p>
      </div>
    </div>
  );
}
