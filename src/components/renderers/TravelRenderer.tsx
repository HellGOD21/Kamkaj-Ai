import React, { useState } from 'react';
import {
  Train,
  Bus,
  Car,
  Plane,
  Clock,
  IndianRupee,
  Share2,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Zap,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { TravelData, TravelOption } from '../../types';

interface TravelRendererProps {
  initialData: TravelData;
}

export const TravelRenderer: React.FC<TravelRendererProps> = ({ initialData }) => {
  const [data] = useState<TravelData>(initialData);
  const [sortBy, setSortBy] = useState<'price' | 'duration'>('price');

  const getModeIcon = (mode: string) => {
    const lower = mode.toLowerCase();
    if (lower.includes('train') || lower.includes('tatkal')) return Train;
    if (lower.includes('bus')) return Bus;
    if (lower.includes('car') || lower.includes('blabla')) return Car;
    return Plane;
  };

  const sortedOptions = [...data.options].sort((a, b) => {
    if (sortBy === 'price') return a.estimatedFare - b.estimatedFare;
    return a.duration.localeCompare(b.duration);
  });

  const handleShareWhatsApp = () => {
    const text = `*Cheapest Travel Plan: ${data.origin} to ${data.destination} (${data.travelDate})*

${data.options
  .map(
    (o) =>
      `• *${o.mode}*: ~₹${o.estimatedFare.toLocaleString('en-IN')} (${o.duration}) - ${o.serviceName}`
  )
  .join('\n')}

*Recommendation:* ${data.cheapestRecommendation}

_Found via KaamKaj AI Rupee-Saver Travel_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Route & Header Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Smart Transit Matrix
            </span>
            <span className="text-xs text-slate-400">Date: {data.travelDate}</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xl sm:text-2xl font-extrabold text-white">
            <span>{data.origin}</span>
            <ArrowRight className="w-5 h-5 text-cyan-400" />
            <span>{data.destination}</span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            <span className="text-emerald-400 font-semibold">AI Recommendation: </span>
            {data.cheapestRecommendation}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setSortBy('price')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                sortBy === 'price' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cheapest First
            </button>
            <button
              onClick={() => setSortBy('duration')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                sortBy === 'duration' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Fastest First
            </button>
          </div>

          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Tatkal Window Alert Banner */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300">IRCTC Tatkal Booking Rule: </span>
          <span>{data.tatkalRulesAndTimings}</span>
        </div>
      </div>

      {/* Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {sortedOptions.map((opt) => {
          const Icon = getModeIcon(opt.mode);
          const isCheapest = opt.estimatedFare === Math.min(...data.options.map((o) => o.estimatedFare));

          return (
            <div
              key={opt.id}
              className={`p-4 rounded-xl bg-slate-900/90 border transition flex flex-col justify-between gap-3 ${
                isCheapest
                  ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/5 bg-slate-900'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 border border-slate-700">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{opt.mode}</h3>
                      <p className="text-[11px] text-slate-400">{opt.serviceName}</p>
                    </div>
                  </div>

                  {opt.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                        opt.badge.toLowerCase().includes('cheapest')
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      }`}
                    >
                      {opt.badge}
                    </span>
                  )}
                </div>

                {/* Price & Duration */}
                <div className="flex items-center justify-between mt-3 py-2 px-3 rounded-lg bg-slate-850 border border-slate-800">
                  <div className="flex items-center gap-1 text-slate-200">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-semibold">{opt.duration}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-white">
                      ₹{opt.estimatedFare.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">est. fare/seat</span>
                  </div>
                </div>

                {/* Pros & Cons */}
                <div className="mt-2.5 space-y-1 text-[11px]">
                  {opt.pros.map((p, pIdx) => (
                    <p key={pIdx} className="text-emerald-400 flex items-center gap-1.5">
                      <span>✓</span>
                      <span>{p}</span>
                    </p>
                  ))}
                  {opt.cons.map((c, cIdx) => (
                    <p key={cIdx} className="text-slate-400 flex items-center gap-1.5">
                      <span>✕</span>
                      <span>{c}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Booking Tip & Direct Link */}
              <div className="pt-2.5 border-t border-slate-800 text-[11px]">
                <p className="text-amber-300/90 mb-2">
                  <span className="font-semibold text-amber-200">Hack: </span>
                  {opt.bookingTip}
                </p>
                <a
                  href={
                    opt.mode.toLowerCase().includes('train')
                      ? 'https://www.irctc.co.in'
                      : opt.mode.toLowerCase().includes('bus')
                      ? 'https://www.redbus.in'
                      : opt.mode.toLowerCase().includes('car')
                      ? 'https://www.blablacar.in'
                      : 'https://www.google.com/travel/flights'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 font-semibold border border-cyan-500/20 transition"
                >
                  <span>{opt.bookingUrlText}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Indian Travel Hacks List */}
      {data.indianTravelHacks && data.indianTravelHacks.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
          <h4 className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Essential Indian Travel Hacks:</span>
          </h4>
          <ul className="space-y-1.5 text-slate-300">
            {data.indianTravelHacks.map((hack, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold shrink-0">#{idx + 1}</span>
                <span>{hack}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
