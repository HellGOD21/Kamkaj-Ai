import React from 'react';
import { Sparkles, History, IndianRupee, Layers, CheckCircle2, ChevronDown, Zap } from 'lucide-react';

interface HeaderProps {
  freeTasksUsed: number;
  maxFreeTasks: number;
  onOpenPricing: () => void;
  onOpenHistory: () => void;
  onNewTask: () => void;
  selectedLang: string;
  onSelectLang: (lang: string) => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  freeTasksUsed,
  maxFreeTasks,
  onOpenPricing,
  onOpenHistory,
  onNewTask,
  selectedLang,
  onSelectLang,
  historyCount,
}) => {
  const remaining = Math.max(0, maxFreeTasks - freeTasksUsed);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0b0f17]/95 backdrop-blur-md px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNewTask}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 p-0.5 shadow-lg shadow-orange-500/10">
            <div className="w-full h-full bg-[#0b0f17] rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-emerald-400 text-lg">
                क
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                KaamKaj <span className="text-orange-400 font-black">AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30">
                Action-First
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Everyday Work & Life Action Assistant for India
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="relative hidden md:block">
            <select
              value={selectedLang}
              onChange={(e) => onSelectLang(e.target.value)}
              aria-label="Select Assistant Language"
              className="appearance-none bg-slate-900/90 text-xs text-slate-300 border border-slate-700/80 rounded-lg px-3 py-1.5 pr-7 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
            >
              <option value="English">English</option>
              <option value="Hindi">हिंदी (Hindi)</option>
              <option value="Marathi">मराठी (Marathi)</option>
              <option value="Tamil">தமிழ் (Tamil)</option>
              <option value="Telugu">తెలుగు (Telugu)</option>
              <option value="Bengali">বাংলা (Bengali)</option>
              <option value="Gujarati">ગુજરાતી (Gujarati)</option>
              <option value="Hinglish">Hinglish</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* Free Tasks Quota Badge */}
          <div
            onClick={onOpenPricing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition text-xs"
            title="Click to view plans & monetization"
          >
            <Zap className={`w-3.5 h-3.5 ${remaining > 2 ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="text-slate-300 font-medium">
              <span className="font-semibold text-white">{remaining}</span>/{maxFreeTasks} Free
            </span>
          </div>

          {/* Pricing & Business Model Hub */}
          <button
            onClick={onOpenPricing}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-emerald-500/10 hover:from-orange-500/20 hover:to-emerald-500/20 text-orange-300 border border-orange-500/30 text-xs font-semibold transition"
          >
            <IndianRupee className="w-3.5 h-3.5 text-orange-400" />
            <span>Pricing & Growth</span>
          </button>

          {/* History drawer trigger */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center justify-center p-2 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600 transition"
            title="Saved Actions & History"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 text-[9px] font-bold text-white flex items-center justify-center shadow">
                {historyCount}
              </span>
            )}
          </button>

          {/* New Task button */}
          <button
            onClick={onNewTask}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-semibold shadow-md shadow-orange-500/20 transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">New Action</span>
          </button>
        </div>
      </div>
    </header>
  );
};
