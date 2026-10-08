import React from 'react';
import { 
  LayoutDashboard, 
  Sun, 
  Moon, 
  AlertTriangle, 
  Users, 
  RotateCcw,
  Package
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface NavbarProps {
  activeTab: 'dashboard' | 'morning' | 'evening' | 'damage' | 'dsr';
  setActiveTab: (tab: 'dashboard' | 'morning' | 'evening' | 'damage' | 'dsr') => void;
  totalStockValue: number;
  totalDamageStockValue: number;
  activeDispatchesCount: number;
  onResetData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  totalStockValue,
  totalDamageStockValue,
  activeDispatchesCount,
  onResetData,
}) => {
  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg leading-tight tracking-wide text-white">স্টক ও ডিএসআর সেলস</h1>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded border border-emerald-500/30">
                  ম্যানেজমেন্ট
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">বিতরণ, ফেরত, ড্যামেজ ও বাকি হিসাব</p>
            </div>
          </div>

          {/* Quick Snapshot Badge */}
          <div className="hidden md:flex items-center space-x-4 bg-slate-800/80 px-3.5 py-1.5 rounded-lg border border-slate-700/60 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">বিক্রয়যোগ্য স্টক:</span>
              <span className="font-bold text-emerald-400 text-sm">{formatCurrency(totalStockValue)}</span>
            </div>
            <div className="h-3 w-px bg-slate-700"></div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">ড্যামেজ স্টক:</span>
              <span className="font-bold text-rose-400 text-sm">{formatCurrency(totalDamageStockValue)}</span>
            </div>
            {activeDispatchesCount > 0 && (
              <>
                <div className="h-3 w-px bg-slate-700"></div>
                <div className="flex items-center gap-1 text-amber-400 font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span>মাঠে সক্রিয় DSR: {activeDispatchesCount}</span>
                </div>
              </>
            )}
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-2">
            {onResetData && (
              <button 
                onClick={onResetData} 
                title="ডেমো ডাটা রিসেট করুন"
                className="text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-2 rounded-lg transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">ডাটা রিসেট</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-none pt-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>ড্যাশবোর্ড ও স্টক মূল্য</span>
          </button>

          <button
            onClick={() => setActiveTab('morning')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'morning'
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-700'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-300" />
            <span>সকালে: পণ্য বিতরণ (স্টক বিয়োগ)</span>
          </button>

          <button
            onClick={() => setActiveTab('evening')}
            className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'evening'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-700'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-300" />
            <span>দিনশেষে: ফেরত ও ডিএসআর সামারি</span>
            {activeDispatchesCount > 0 && (
              <span className="ml-1 bg-amber-500 text-slate-900 font-bold text-xs px-1.5 py-0.2 rounded-full">
                {activeDispatchesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('damage')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'damage'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-700'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-300" />
            <span>ড্যামেজ স্টক ও স্টকে যোগ</span>
          </button>

          <button
            onClick={() => setActiveTab('dsr')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'dsr'
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-700'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-teal-300" />
            <span>ডিএসআর ও বাকির খাতা</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
