import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Target, 
  Zap,
  User as UserIcon,
  TrendingUp,
  Bell,
  Search,
  LogOut
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/' },
    { icon: ArrowRightLeft, label: 'Transactions', path: '/transactions' },
    { icon: Target, label: 'Goals', path: '/goals' },
    { icon: Zap, label: 'Insights', path: '/insights' },
    { icon: UserIcon, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col shadow-sm">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">CashPilot</span>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group",
                  location.pathname === item.path
                    ? "bg-primary text-white shadow-xl shadow-primary/25 translate-x-1"
                    : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                )}
              >
                <item.icon className={cn("w-6 h-6 transition-transform duration-300 group-hover:scale-110", location.pathname === item.path ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                <span className="font-semibold text-base">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-100">
          <button
            onClick={logout}
            className="flex items-center gap-4 px-5 py-4 w-full text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300 group"
          >
            <LogOut className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="font-semibold text-base">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header - Hidden on mobile home as per snapshot requirements, but kept for other pages */}
        <header className={cn(
          "h-16 lg:h-24 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 z-30 sticky top-0 transition-all",
          location.pathname === '/' && "hidden lg:flex"
        )}>
          <div className="flex items-center gap-4">
            <div className="lg:hidden w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <div className="hidden sm:flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-2xl w-80 lg:w-[400px] border border-slate-100 focus-within:border-primary/30 focus-within:bg-white transition-all">
              <Search className="w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search transactions, goals..." 
                className="bg-transparent border-none focus:outline-none text-sm w-full font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
            <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 shadow-sm">
              <span className="text-amber-600 text-sm font-bold flex items-center gap-1.5">
                <span className="text-lg">🔥</span> {user?.streak || 0}
              </span>
            </div>
            
            <button className="relative p-3 text-slate-500 hover:bg-slate-50 rounded-2xl transition-all group">
              <Bell className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center gap-4 pl-4 lg:pl-8 border-l border-slate-100">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-primary/20 ring-2 ring-white">
                {user?.name?.[0]}
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                <p className="text-xs font-medium text-slate-500">Premium Member</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={cn(
          "flex-1 overflow-y-auto custom-scrollbar relative",
          location.pathname === '/' ? "p-0 lg:p-10" : "p-6 lg:p-10",
          "pb-32 lg:pb-10" // Extra padding for mobile bottom nav
        )}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
          <nav className="bg-white/90 backdrop-blur-2xl border border-white/20 px-4 py-3 flex justify-between items-center rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-black/5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl transition-all duration-500 group",
                    isActive ? "text-primary" : "text-slate-400"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <item.icon className={cn(
                    "w-6 h-6 transition-all duration-300",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} />
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                    isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </main>
    </div>
  );
}
