import React, { useState } from 'react';
import {
  X,
  Check,
  IndianRupee,
  Sparkles,
  TrendingUp,
  Zap,
  ShieldCheck,
  Building,
  Users,
  Target,
  Rocket,
} from 'lucide-react';

interface MonetizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan?: (planId: string) => void;
}

export const MonetizationModal: React.FC<MonetizationModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
}) => {
  const [usersCount, setUsersCount] = useState<number>(10000);
  const [planPrice, setPlanPrice] = useState<number>(199);

  if (!isOpen) return null;

  const monthlyGross = (usersCount * planPrice);
  const monthlyLakhs = (monthlyGross / 100000).toFixed(2);
  const annualCrores = ((monthlyGross * 12) / 10000000).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-emerald-500/20 text-orange-300 border border-orange-500/30 text-xs font-semibold">
            <Rocket className="w-3.5 h-3.5 text-orange-400" />
            <span>Google India Play Accelerator 2026 Strategy</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Plans & Indian Monetization Blueprint
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            How KaamKaj AI converts millions of everyday Indian mobile users into sustainable, high-margin monthly SaaS subscribers.
          </p>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* FREE TIER */}
          <div className="p-5 rounded-2xl bg-slate-850/80 border border-slate-750 flex flex-col justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Starter</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-white">₹0</span>
                <span className="text-xs text-slate-400">/ forever</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Hook everyday users with instant value on WhatsApp & mobile web.
              </p>

              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>5–10 tasks/month free quota</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Basic GST invoices with UPI QR</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Fresher ATS resume builder</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Marathi & Hindi explanations</span>
                </li>
                <li className="flex items-center gap-2 text-slate-500">
                  <span className="w-3.5 text-center">✕</span>
                  <span>Light non-intrusive affiliate ads</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                onSelectPlan?.('free');
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs border border-slate-700 transition"
            >
              Current Active Tier
            </button>
          </div>

          {/* PRO TIER (FEATURED) */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-b from-orange-950/40 to-slate-900 border-2 border-orange-500/80 shadow-xl shadow-orange-500/10 flex flex-col justify-between gap-4">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold uppercase tracking-wider shadow">
              Most Popular In India
            </span>

            <div>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Pro Individual</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-white">₹199</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                For job seekers, students, creators, and freelancers.
              </p>

              <ul className="mt-4 space-y-2 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span className="font-semibold text-white">Unlimited daily tasks</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>Full Teleprompter & Reel studio</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>Priority Indian TTS Audio</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>Zero advertisements</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>Interview questions predictor</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                onSelectPlan?.('pro');
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition active:scale-95"
            >
              Upgrade to Pro (₹199/mo)
            </button>
          </div>

          {/* CREATOR / BUSINESS TIER */}
          <div className="p-5 rounded-2xl bg-slate-850/80 border border-slate-750 flex flex-col justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Creator / Vyapar</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-white">₹499</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                For agencies, shops, coaching centers, and power creators.
              </p>

              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-white">Bulk content & batch tasks</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Multi-client invoice ledger</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Custom brand watermarks & logos</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Auto WhatsApp payment follow-ups</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Dedicated fast API lane</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                onSelectPlan?.('business');
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
            >
              Choose Business (₹499/mo)
            </button>
          </div>
        </div>

        {/* Interactive Revenue Simulator (Directly from User Brief) */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Interactive Startup Revenue Simulator</span>
              </h3>
              <p className="text-xs text-slate-400">
                Test the unit economics from your brief: “10,000 paying users × ₹199/month = ₹19.9 lakh/month”
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                ₹{monthlyLakhs} Lakhs
              </span>
              <span className="text-xs text-slate-400 block">per month (₹{annualCrores} Cr ARR)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300 font-medium">
                <span>Paying Subscribers:</span>
                <span className="font-bold text-white">{usersCount.toLocaleString('en-IN')} users</span>
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={usersCount}
                onChange={(e) => setUsersCount(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1,000</span>
                <span>10,000 (Target)</span>
                <span>50,000</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300 font-medium">
                <span>Average Monthly Plan:</span>
                <span className="font-bold text-white">₹{planPrice} / month</span>
              </div>
              <input
                type="range"
                min="99"
                max="499"
                step="50"
                value={planPrice}
                onChange={(e) => setPlanPrice(parseInt(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>₹99</span>
                <span>₹199 (Sweetspot)</span>
                <span>₹499</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
