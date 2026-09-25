import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Copy,
  CheckCircle,
  Eye,
  Clock,
  Film,
  Maximize2,
  Minimize2,
  Sliders,
  Share2,
} from 'lucide-react';
import { ReelData } from '../../types';

interface ReelRendererProps {
  initialData: ReelData;
}

export const ReelRenderer: React.FC<ReelRendererProps> = ({ initialData }) => {
  const [data] = useState<ReelData>(initialData);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1.5);
  const [fontSize, setFontSize] = useState(24);
  const [isMirrored, setIsMirrored] = useState(false);
  const [isCaptionCopied, setIsCaptionCopied] = useState(false);

  const prompterContentRef = useRef<HTMLDivElement>(null);
  const scrollAnimRef = useRef<number | null>(null);

  // Auto-scroll animation for teleprompter
  useEffect(() => {
    if (!isPlaying || !isTeleprompterOpen) {
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
      return;
    }

    const scrollLoop = () => {
      if (prompterContentRef.current) {
        prompterContentRef.current.scrollTop += scrollSpeed * 0.8;
      }
      scrollAnimRef.current = requestAnimationFrame(scrollLoop);
    };

    scrollAnimRef.current = requestAnimationFrame(scrollLoop);

    return () => {
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
    };
  }, [isPlaying, isTeleprompterOpen, scrollSpeed]);

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(data.caption);
    setIsCaptionCopied(true);
    setTimeout(() => setIsCaptionCopied(false), 2000);
  };

  const handleResetPrompter = () => {
    if (prompterContentRef.current) {
      prompterContentRef.current.scrollTop = 0;
    }
    setIsPlaying(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            {data.niche}
          </span>
          <span className="text-slate-400">Duration: ~{data.estimatedDuration}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Open Teleprompter Button */}
          <button
            onClick={() => setIsTeleprompterOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold shadow transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Open Teleprompter Mode</span>
          </button>

          <button
            onClick={handleCopyCaption}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            {isCaptionCopied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCaptionCopied ? 'Caption Copied' : 'Copy Caption'}</span>
          </button>
        </div>
      </div>

      {/* 3-Second Hook Spotlight Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/40 via-red-950/20 to-slate-900 border-2 border-rose-500/40 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h2 className="text-xs font-black uppercase tracking-wider text-rose-300">
              The Critical First 3-Second Hook (Zero-Scroll Rule)
            </h2>
          </div>
          <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            {data.trendingAudioMood}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Visual Action
            </span>
            <p className="text-slate-200 font-medium">{data.hook3Seconds.visualCue}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
              Verbal Script
            </span>
            <p className="text-white font-semibold italic">“{data.hook3Seconds.verbalScript}”</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
              On-Screen Bold Text
            </span>
            <p className="text-amber-200 font-bold">{data.hook3Seconds.onScreenText}</p>
          </div>
        </div>
      </div>

      {/* Shot-by-Shot Timeline */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Film className="w-4 h-4 text-rose-400" />
          <span>Shot-by-Shot Production Blueprint:</span>
        </h3>

        <div className="space-y-2.5">
          {data.scenes.map((scene, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row gap-4 justify-between items-start"
            >
              {/* Left Column: Timestamp & Camera */}
              <div className="w-full md:w-48 shrink-0 space-y-1">
                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  <Clock className="w-3 h-3" />
                  {scene.timestamp}
                </span>
                <p className="text-[11px] text-slate-400 font-medium">Angle: {scene.cameraAngle}</p>
                {scene.onScreenText && (
                  <div className="text-[10px] font-bold text-amber-300 bg-amber-950/30 px-2 py-1 rounded border border-amber-500/20 mt-1">
                    Text: {scene.onScreenText}
                  </div>
                )}
              </div>

              {/* Middle Column: Script & Visuals */}
              <div className="flex-1 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Spoken Words:</span>
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    “{scene.verbalScript}”
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Visual Action:</span>
                  <p className="text-slate-300">{scene.visualAction}</p>
                </div>
              </div>

              {/* Right Column: B-Roll / SFX Tip */}
              <div className="w-full md:w-56 shrink-0 bg-slate-850 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                <span className="font-semibold text-rose-300 block mb-0.5">B-Roll & Sound Cue:</span>
                <p>{scene.bRollTip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Caption & Hashtags Container */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Instagram / YouTube Ready Caption:
          </h4>
          <button
            onClick={handleCopyCaption}
            className="text-xs text-rose-400 hover:text-white font-medium flex items-center gap-1"
          >
            {isCaptionCopied ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{isCaptionCopied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <p className="text-xs text-slate-300 whitespace-pre-line bg-slate-850 p-3 rounded-lg border border-slate-800 font-sans">
          {data.caption}
        </p>
      </div>

      {/* MODAL: FULL-SCREEN INTERACTIVE TELEPROMPTER */}
      {isTeleprompterOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-6">
          {/* Prompter Header Controls */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs text-slate-300">
            <div className="flex items-center gap-4">
              <span className="font-bold text-white text-sm flex items-center gap-1.5">
                <Video className="w-4 h-4 text-rose-500" />
                Teleprompter Active
              </span>

              {/* Speed Slider */}
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span>Speed: {scrollSpeed}x</span>
                <input
                  type="range"
                  min="0.5"
                  max="3.5"
                  step="0.25"
                  value={scrollSpeed}
                  onChange={(e) => setScrollSpeed(parseFloat(e.target.value))}
                  className="w-24 accent-rose-500 cursor-pointer"
                />
              </div>

              {/* Font Size */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setFontSize(Math.max(16, fontSize - 2))}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize(Math.min(48, fontSize + 2))}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700"
                >
                  A+
                </button>
              </div>

              {/* Mirror toggle for physical prompter glass */}
              <button
                onClick={() => setIsMirrored(!isMirrored)}
                className={`px-2 py-1 rounded text-xs transition ${
                  isMirrored ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Mirror Text
              </button>
            </div>

            <button
              onClick={() => {
                setIsTeleprompterOpen(false);
                setIsPlaying(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium"
            >
              Exit Prompter
            </button>
          </div>

          {/* Prompter Scrolling Canvas */}
          <div
            ref={prompterContentRef}
            className={`flex-1 overflow-y-auto py-20 px-8 sm:px-24 flex flex-col items-center select-none no-scrollbar transition ${
              isMirrored ? '-scale-x-100' : ''
            }`}
          >
            <div
              style={{ fontSize: `${fontSize}px` }}
              className="max-w-3xl text-center font-bold text-white tracking-normal leading-relaxed whitespace-pre-line py-12"
            >
              {data.teleprompterText || data.caption}
            </div>
          </div>

          {/* Prompter Bottom Floating Controller */}
          <div className="flex items-center justify-center gap-4 pt-3 border-t border-slate-800">
            <button
              onClick={handleResetPrompter}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart</span>
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-sm font-bold shadow-lg transition active:scale-95"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              <span>{isPlaying ? 'Pause Scroll' : 'Start Auto-Scroll'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
