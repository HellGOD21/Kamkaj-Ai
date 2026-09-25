import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  FileSpreadsheet,
  FileUser,
  Languages,
  Train,
  GraduationCap,
  Video,
  MessageSquareText,
  ArrowRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { ActionType } from '../types';

interface CommandBarProps {
  onExecute: (prompt: string, explicitType?: ActionType) => void;
  isLoading: boolean;
  selectedLang: string;
}

export const STARTER_PROMPTS: Array<{
  id: string;
  type: ActionType;
  icon: any;
  label: string;
  prompt: string;
  badge: string;
  color: string;
}> = [
  {
    id: 'p-invoice',
    type: 'invoice',
    icon: FileSpreadsheet,
    label: 'Create an invoice for my client',
    prompt: 'Create an invoice for client Sunrise Tech for ₹35,000 for mobile app design and GST tax',
    badge: 'Small Business / Freelancers',
    color: 'from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'p-resume',
    type: 'resume',
    icon: FileUser,
    label: 'Create a resume for a fresher',
    prompt: 'Create a high-scoring ATS resume for a fresher BTech Computer Science graduate looking for software developer roles in India',
    badge: 'Jobs & Campus Placements',
    color: 'from-blue-500/20 to-indigo-500/10 text-blue-300 border-blue-500/30',
  },
  {
    id: 'p-marathi',
    type: 'regional_explain',
    icon: Languages,
    label: 'Explain this question in Marathi',
    prompt: 'Explain what is Compound Interest and Mutual Fund SIP in simple Marathi with everyday examples',
    badge: 'Regional Education (मराठी)',
    color: 'from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/30',
  },
  {
    id: 'p-travel',
    type: 'travel_cheap',
    icon: Train,
    label: 'Find cheapest way to travel tomorrow',
    prompt: 'Find the cheapest way to travel from Pune to Goa tomorrow comparing IRCTC Tatkal train, sleeper bus, and carpool',
    badge: 'Rupee-Saver Transit',
    color: 'from-cyan-500/20 to-blue-500/10 text-cyan-300 border-cyan-500/30',
  },
  {
    id: 'p-exam',
    type: 'exam_prep',
    icon: GraduationCap,
    label: 'Turn these notes into exam questions',
    prompt: 'Turn these notes on Indian Constitution Fundamental Rights (Articles 12-35) into UPSC/SSC practice MCQs and flashcards',
    badge: 'UPSC / SSC / College',
    color: 'from-purple-500/20 to-pink-500/10 text-purple-300 border-purple-500/30',
  },
  {
    id: 'p-reel',
    type: 'reel_creator',
    icon: Video,
    label: 'Make a reel from this video / topic',
    prompt: 'Make an engaging 45-second viral reel script on 3 Indian money hacks college students must know with visual cues and teleprompter',
    badge: 'Creators & Reels',
    color: 'from-rose-500/20 to-red-500/10 text-rose-300 border-rose-500/30',
  },
  {
    id: 'p-whatsapp',
    type: 'whatsapp_msg',
    icon: MessageSquareText,
    label: 'Write a professional WhatsApp message',
    prompt: 'Write a professional yet polite WhatsApp message to a client following up on an overdue payment of ₹25,000 with UPI payment option',
    badge: 'Workplace & Deals',
    color: 'from-green-500/20 to-emerald-500/10 text-green-300 border-green-500/30',
  },
];

export const CommandBar: React.FC<CommandBarProps> = ({
  onExecute,
  isLoading,
  selectedLang,
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | ActionType>('all');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API for voice input
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      // Set speech recognition language based on selection
      if (selectedLang === 'Hindi') recognition.lang = 'hi-IN';
      else if (selectedLang === 'Marathi') recognition.lang = 'mr-IN';
      else if (selectedLang === 'Tamil') recognition.lang = 'ta-IN';
      else if (selectedLang === 'Telugu') recognition.lang = 'te-IN';
      else if (selectedLang === 'Bengali') recognition.lang = 'bn-IN';
      else if (selectedLang === 'Gujarati') recognition.lang = 'gu-IN';
      else recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission denied.');
        } else {
          setSpeechError('Could not capture audio.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [selectedLang]);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by this browser. Please type your request.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onExecute(input.trim());
  };

  const handleStarterClick = (item: typeof STARTER_PROMPTS[0]) => {
    setInput(item.prompt);
    onExecute(item.prompt, item.type);
  };

  const filteredPrompts =
    activeFilter === 'all'
      ? STARTER_PROMPTS
      : STARTER_PROMPTS.filter((p) => p.type === activeFilter);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-6 pb-4">
      {/* Hero Badge */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-emerald-500/15 border border-orange-500/30 text-orange-300 text-xs font-semibold mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>India’s Fastest-Growing AI Work & Life Operating System</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          Type or speak. Get the{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400">
            actual result
          </span>
          , not just chat.
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-2xl mx-auto">
          Instant GST invoices with UPI QR, ATS fresher resumes, regional Indian explanations,
          exam question sets, cheapest travel matrix, and viral reel scripts.
        </p>
      </div>

      {/* Main Command Input Box */}
      <div className="relative rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 p-1 shadow-2xl border border-slate-700/80 focus-within:border-orange-500/80 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 bg-[#0d131f] rounded-xl">
          <div className="flex-1 flex items-center gap-3 px-3 py-1">
            <Sparkles className="w-5 h-5 text-orange-400 shrink-0 hidden xs:block" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. 'Create an invoice for ₹15,000' or 'Make a reel on street food'..."
              disabled={isLoading}
              className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none py-2"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0 px-2 sm:px-0">
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleVoice}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                isListening
                  ? 'bg-red-500/20 text-red-300 border border-red-500 animate-pulse'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
              }`}
              title="Speak in English, Hindi, Marathi, etc."
            >
              {isListening ? <Mic className="w-4 h-4 text-red-400 animate-bounce" /> : <Mic className="w-4 h-4 text-orange-400" />}
              <span className="hidden xs:inline">{isListening ? 'Listening...' : 'Speak'}</span>
            </button>

            {/* Execute Button */}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold shadow-md shadow-orange-500/20 active:scale-95 transition"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Result...</span>
                </>
              ) : (
                <>
                  <span>Create Result</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {speechError && (
          <div className="text-[11px] text-red-400 px-4 py-1 flex items-center gap-1">
            <span>⚠️ {speechError}</span>
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar text-xs">
        <span className="text-slate-400 text-[11px] font-medium mr-1 uppercase tracking-wider shrink-0">
          Instant Actions:
        </span>
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 rounded-full whitespace-nowrap transition font-medium ${
            activeFilter === 'all'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          All (7 Tools)
        </button>
        <button
          onClick={() => setActiveFilter('invoice')}
          className={`px-3 py-1 rounded-full whitespace-nowrap transition font-medium ${
            activeFilter === 'invoice'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          🧾 GST Invoices
        </button>
        <button
          onClick={() => setActiveFilter('resume')}
          className={`px-3 py-1 rounded-full whitespace-nowrap transition font-medium ${
            activeFilter === 'resume'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          📄 Fresher Resume
        </button>
        <button
          onClick={() => setActiveFilter('regional_explain')}
          className={`px-3 py-1 rounded-full whitespace-nowrap transition font-medium ${
            activeFilter === 'regional_explain'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          🗣️ Marathi / Regional
        </button>
        <button
          onClick={() => setActiveFilter('travel_cheap')}
          className={`px-3 py-1 rounded-full whitespace-nowrap transition font-medium ${
            activeFilter === 'travel_cheap'
              ? 'bg-cyan-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          🚆 Cheap Travel
        </button>
        <button
          onClick={() => setActiveFilter('exam_prep')}
          className={`px-3 py-1 rounded-full whitespace-nowrap transition font-medium ${
            activeFilter === 'exam_prep'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          📚 Exam Quiz
        </button>
        <button
          onClick={() => setActiveFilter('reel_creator')}
          className={`px-3 py-1 rounded-full whitespace-nowrap transition font-medium ${
            activeFilter === 'reel_creator'
              ? 'bg-rose-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          🎬 Viral Reels
        </button>
        <button
          onClick={() => setActiveFilter('whatsapp_msg')}
          className={`px-3 py-1 rounded-full whitespace-nowrap transition font-medium ${
            activeFilter === 'whatsapp_msg'
              ? 'bg-green-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          💬 WhatsApp
        </button>
      </div>

      {/* Starter Prompts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-1">
        {filteredPrompts.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleStarterClick(item)}
              disabled={isLoading}
              className={`group text-left p-3 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800/90 hover:border-slate-700 transition flex flex-col justify-between gap-2.5 shadow-sm active:scale-[0.99]`}
            >
              <div className="flex items-start justify-between w-full gap-2">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color} border shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 shrink-0">
                  {item.badge}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200 group-hover:text-white transition leading-snug">
                  “{item.label}”
                </p>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {item.prompt}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
