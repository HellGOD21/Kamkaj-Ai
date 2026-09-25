import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Copy,
  CheckCircle,
  Share2,
  Sparkles,
  BookOpen,
  Languages,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { RegionalExplainData } from '../../types';

interface RegionalExplainerRendererProps {
  initialData: RegionalExplainData;
  onReExplainInLanguage?: (targetLanguage: string) => void;
}

export const RegionalExplainerRenderer: React.FC<RegionalExplainerRendererProps> = ({
  initialData,
  onReExplainInLanguage,
}) => {
  const [data, setData] = useState<RegionalExplainData>(initialData);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showHinglish, setShowHinglish] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Web Speech API Text-to-Speech
  const handlePlayVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(data.nativeExplanation);
    
    // Choose appropriate voice or language code
    if (data.targetLanguage.toLowerCase().includes('marathi')) {
      utterance.lang = 'mr-IN';
    } else if (data.targetLanguage.toLowerCase().includes('hindi')) {
      utterance.lang = 'hi-IN';
    } else if (data.targetLanguage.toLowerCase().includes('tamil')) {
      utterance.lang = 'ta-IN';
    } else if (data.targetLanguage.toLowerCase().includes('telugu')) {
      utterance.lang = 'te-IN';
    } else if (data.targetLanguage.toLowerCase().includes('bengali')) {
      utterance.lang = 'bn-IN';
    } else if (data.targetLanguage.toLowerCase().includes('gujarati')) {
      utterance.lang = 'gu-IN';
    } else {
      utterance.lang = 'hi-IN';
    }

    utterance.rate = 0.95; // Slightly slower for crisp comprehension

    utterance.onend = () => {
      setIsPlayingAudio(false);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handleCopy = () => {
    const textToCopy = `${data.nativeScriptTitle}\n\n${data.nativeExplanation}\n\nKEY TAKEAWAYS:\n${data.simpleEnglishSummary.map((s) => `• ${s}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `*${data.nativeScriptTitle}*

${data.nativeExplanation}

_Explained in simple ${data.targetLanguage} via KaamKaj AI_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const indianLanguages = ['Marathi', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Gujarati'];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-slate-400 shrink-0 font-medium">Re-explain in:</span>
          {indianLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => onReExplainInLanguage?.(lang)}
              className={`px-2.5 py-1 rounded-md font-medium transition shrink-0 ${
                data.targetLanguage.toLowerCase() === lang.toLowerCase()
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* TTS Listen Button */}
          <button
            onClick={handlePlayVoice}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              isPlayingAudio
                ? 'bg-red-500/20 text-red-300 border border-red-500 animate-pulse'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isPlayingAudio ? 'Stop Voice' : `Listen (${data.targetLanguage})`}</span>
          </button>

          <button
            onClick={() => setShowHinglish(!showHinglish)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
              showHinglish
                ? 'bg-slate-700 text-white border-slate-600'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            {showHinglish ? 'Hide English Script' : 'Roman Script (Phonetic)'}
          </button>

          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Copy Text"
          >
            {isCopied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
            title="Share on WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Native Language Explainer Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-[#0f172a] rounded-2xl border border-amber-500/20 p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
            {data.targetLanguage} Explanation
          </span>
          <span className="text-xs text-slate-400">Concept: {data.originalConcept}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-100 tracking-tight leading-snug">
          {data.nativeScriptTitle}
        </h1>

        {/* Native Script Text */}
        <div className="mt-4 p-5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-50 text-base sm:text-lg leading-relaxed whitespace-pre-line font-serif">
          {data.nativeExplanation}
        </div>

        {/* Optional Hinglish / Roman Script Transliteration */}
        {showHinglish && data.hinglishPhonetic && (
          <div className="mt-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-sm leading-relaxed italic">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1 not-italic">
              Phonetic Roman Transliteration:
            </span>
            {data.hinglishPhonetic}
          </div>
        )}

        {/* Key Everyday Indian Analogies */}
        {data.localAnalogies && data.localAnalogies.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Everyday Indian Analogies (रोजच्या जीवनातील उदाहरणे):</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.localAnalogies.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1"
                >
                  <p className="font-bold text-amber-300 text-sm">{item.title}</p>
                  <p className="text-slate-300 leading-relaxed">{item.comparison}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Vocabulary Table */}
        {data.keyVocabulary && data.keyVocabulary.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Key Terms & Vocabulary (महत्त्वाचे शब्द):</span>
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-800/90 text-slate-300 font-semibold border-b border-slate-700">
                    <th className="py-2.5 px-3">English Term</th>
                    <th className="py-2.5 px-3 text-amber-300">{data.targetLanguage} Term</th>
                    <th className="py-2.5 px-3">Meaning / अर्थ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                  {data.keyVocabulary.map((v, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-white">{v.englishTerm}</td>
                      <td className="py-2.5 px-3 font-bold text-amber-300">{v.nativeTerm}</td>
                      <td className="py-2.5 px-3 text-slate-300">{v.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* English 3-Bullet Summary */}
        {data.simpleEnglishSummary && data.simpleEnglishSummary.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Quick Summary in Simple English:
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {data.simpleEnglishSummary.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
