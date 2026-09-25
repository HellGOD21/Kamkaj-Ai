import React, { useState } from 'react';
import {
  MessageSquareText,
  Share2,
  Copy,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Send,
  Edit3,
} from 'lucide-react';
import { WhatsAppData } from '../../types';

interface WhatsAppMsgRendererProps {
  initialData: WhatsAppData;
}

export const WhatsAppMsgRenderer: React.FC<WhatsAppMsgRendererProps> = ({ initialData }) => {
  const [data] = useState<WhatsAppData>(initialData);
  const [activeTab, setActiveTab] = useState<'polite' | 'firm' | 'hinglish' | 'sms'>('polite');
  const [editedText, setEditedText] = useState<Record<string, string>>({
    polite: data.drafts.politeProfessional?.message || '',
    firm: data.drafts.firmUrgent?.message || '',
    hinglish: data.drafts.friendlyHinglish?.message || '',
    sms: data.drafts.shortSms?.message || '',
  });
  const [isCopied, setIsCopied] = useState(false);

  const getCurrentText = () => {
    return editedText[activeTab] || '';
  };

  const handleTextChange = (val: string) => {
    setEditedText((prev) => ({
      ...prev,
      [activeTab]: val,
    }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentText());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLaunchWhatsApp = () => {
    const encoded = encodeURIComponent(getCurrentText());
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const tabs = [
    { id: 'polite', label: 'Polite & Professional', badge: 'Corporate & Senior' },
    { id: 'firm', label: 'Firm & Direct', badge: 'Overdue / Escalation' },
    { id: 'hinglish', label: 'Friendly Hinglish', badge: 'SME / Creative Partners' },
    { id: 'sms', label: 'Crisp SMS', badge: '< 160 Chars' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Top Controller Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                activeTab === t.id
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            {isCopied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied' : 'Copy Text'}</span>
          </button>

          {/* 1-Click Launch WhatsApp */}
          <button
            onClick={handleLaunchWhatsApp}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Open in WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Editor & Message Card */}
      <div className="bg-slate-900 rounded-2xl border border-green-500/30 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500/15 text-green-300 border border-green-500/30">
                {activeTab === 'polite'
                  ? 'Polite Business Standard'
                  : activeTab === 'firm'
                  ? 'Firm Urgency with Deadlines'
                  : activeTab === 'hinglish'
                  ? 'Indian Conversational Hinglish'
                  : 'Crisp SMS Format'}
              </span>
              <span className="text-xs text-slate-400">Context: {data.context}</span>
            </div>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            {getCurrentText().length} characters
          </span>
        </div>

        {/* WhatsApp Chat Bubble Mockup */}
        <div className="p-4 rounded-2xl bg-[#0b141a] border border-slate-850 bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px]">
          <div className="max-w-xl ml-auto bg-[#005c4b] text-white p-4 rounded-2xl rounded-tr-none shadow-md text-sm leading-relaxed relative">
            <textarea
              value={getCurrentText()}
              onChange={(e) => handleTextChange(e.target.value)}
              className="w-full bg-transparent text-slate-100 placeholder-slate-300 focus:outline-none resize-none font-sans text-sm leading-relaxed"
              rows={8}
            />
            <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-200 mt-1">
              <span>Just now</span>
              <span>✓✓</span>
            </div>
          </div>
        </div>

        {/* Pro Tip */}
        <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-300">Timing & Etiquette Tip: </span>
            <span>
              {activeTab === 'polite'
                ? data.drafts.politeProfessional?.tip
                : activeTab === 'firm'
                ? data.drafts.firmUrgent?.tip
                : activeTab === 'hinglish'
                ? data.drafts.friendlyHinglish?.tip
                : 'Keep under 160 characters to fit standard single-segment telecom SMS in India.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
