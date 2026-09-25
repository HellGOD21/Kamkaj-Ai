import React, { useState, useRef } from 'react';
import {
  GraduationCap,
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  Printer,
  BookOpen,
  Layers,
  ChevronRight,
  ChevronLeft,
  Award,
  Download,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExamPrepData, ExamQuestion, Flashcard } from '../../types';
import { exportElementToPdf } from '../../utils/pdfExport';

interface ExamPrepRendererProps {
  initialData: ExamPrepData;
}

export const ExamPrepRenderer: React.FC<ExamPrepRendererProps> = ({ initialData }) => {
  const [data] = useState<ExamPrepData>(initialData);
  const [viewMode, setViewMode] = useState<'quiz' | 'flashcards' | 'notes'>('quiz');

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const examSheetRef = useRef<HTMLDivElement>(null);

  // Flashcards state
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (submittedQuiz) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleCheckQuiz = () => {
    setSubmittedQuiz(true);
    let correctCount = 0;
    data.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    if (correctCount >= Math.ceil(data.questions.length * 0.75)) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setSubmittedQuiz(false);
  };

  const handleDownloadPdf = async () => {
    if (!examSheetRef.current || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const cleanFileName = `ExamPrep_${(data.topic || 'Practice').slice(0, 30).replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      await exportElementToPdf(examSheetRef.current, {
        filename: cleanFileName,
        orientation: 'portrait',
      });
    } catch (err) {
      console.error('Error generating Exam PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const score = data.questions.reduce((acc, q) => {
    return selectedAnswers[q.id] === q.correctIndex ? acc + 1 : acc;
  }, 0);

  const currentFlashcard = data.flashcards[activeCardIdx] || data.flashcards[0];

  const handleNextCard = () => {
    setIsFlipped(false);
    setActiveCardIdx((prev) => (prev + 1) % data.flashcards.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setActiveCardIdx((prev) => (prev - 1 + data.flashcards.length) % data.flashcards.length);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Top Controller Bar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 bg-slate-850 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('quiz')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium transition ${
              viewMode === 'quiz' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Interactive Quiz ({data.questions.length})</span>
          </button>
          <button
            onClick={() => setViewMode('flashcards')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium transition ${
              viewMode === 'flashcards' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Flashcards ({data.flashcards.length})</span>
          </button>
          <button
            onClick={() => setViewMode('notes')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium transition ${
              viewMode === 'notes' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Revision Cheat Sheet</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'quiz' && submittedQuiz && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 font-bold">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-white">
                Score: {score} / {data.questions.length}
              </span>
            </div>
          )}
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold shadow-md shadow-purple-600/20 transition active:scale-95"
            title="Download Exam Question Paper & Solutions as PDF"
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download as PDF'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium border border-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
          {data.examTarget}
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-white mt-1">{data.topic}</h2>
      </div>

      {/* MODE 1: INTERACTIVE QUIZ */}
      {viewMode === 'quiz' && (
        <div className="space-y-4">
          {data.questions.map((q, qIndex) => {
            const isAnswered = selectedAnswers[q.id] !== undefined;
            const selectedOpt = selectedAnswers[q.id];
            const isCorrect = selectedOpt === q.correctIndex;

            return (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-bold text-purple-400">Question {qIndex + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      {q.difficulty}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                      {q.examTag}
                    </span>
                  </div>
                </div>

                <p className="text-sm sm:text-base font-semibold text-slate-100 leading-snug">
                  {q.question}
                </p>

                {/* MCQ Options */}
                <div className="space-y-2 pt-1">
                  {q.options.map((opt, optIndex) => {
                    const isSelected = selectedOpt === optIndex;
                    let optionStyle =
                      'bg-slate-850 hover:bg-slate-800 text-slate-200 border-slate-750';

                    if (submittedQuiz) {
                      if (optIndex === q.correctIndex) {
                        optionStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-semibold';
                      } else if (isSelected) {
                        optionStyle = 'bg-red-950/70 border-red-500 text-red-200';
                      } else {
                        optionStyle = 'bg-slate-900/50 text-slate-500 border-slate-800';
                      }
                    } else if (isSelected) {
                      optionStyle = 'bg-purple-900/40 border-purple-500 text-white font-semibold ring-1 ring-purple-500';
                    }

                    return (
                      <button
                        key={optIndex}
                        onClick={() => handleSelectOption(q.id, optIndex)}
                        disabled={submittedQuiz}
                        className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between transition ${optionStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold flex items-center justify-center border border-slate-700 shrink-0">
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {submittedQuiz && optIndex === q.correctIndex && (
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                        )}
                        {submittedQuiz && isSelected && optIndex !== q.correctIndex && (
                          <XCircle className="w-4 h-4 text-red-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation on submit */}
                {submittedQuiz && (
                  <div
                    className={`p-3 rounded-xl text-xs space-y-1 mt-2 border ${
                      isCorrect
                        ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                        : 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                    }`}
                  >
                    <p className="font-bold flex items-center gap-1.5">
                      {isCorrect ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>
                        {isCorrect ? 'Correct!' : `Correct Answer: Option ${String.fromCharCode(65 + q.correctIndex)}`}
                      </span>
                    </p>
                    <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Quiz Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {!submittedQuiz ? (
              <button
                onClick={handleCheckQuiz}
                disabled={Object.keys(selectedAnswers).length === 0}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm shadow-md transition"
              >
                Submit & Check Answers
              </button>
            ) : (
              <button
                onClick={handleResetQuiz}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: FLASHCARDS FLIP */}
      {viewMode === 'flashcards' && data.flashcards && data.flashcards.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Card {activeCardIdx + 1} of {data.flashcards.length}
            </span>
            <span>Click card to flip</span>
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer min-h-[220px] rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-purple-950/40 border-2 border-purple-500/40 p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-xl hover:border-purple-400 transition transform duration-200"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {isFlipped ? 'Answer & Explanation (Back)' : 'Question / Concept (Front)'}
            </span>

            <div className="my-auto py-4">
              {!isFlipped ? (
                <p className="text-base sm:text-xl font-bold text-white leading-relaxed">
                  {currentFlashcard.front}
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm sm:text-base font-semibold text-purple-100 whitespace-pre-line leading-relaxed">
                    {currentFlashcard.back}
                  </p>
                  {currentFlashcard.mnemonic && (
                    <p className="text-xs text-amber-300 font-medium bg-amber-950/30 p-2 rounded-lg border border-amber-500/30 mt-3 inline-block">
                      💡 {currentFlashcard.mnemonic}
                    </p>
                  )}
                </div>
              )}
            </div>

            <span className="text-[11px] text-slate-400">
              {isFlipped ? 'Tap to flip back' : 'Tap to reveal answer'}
            </span>
          </div>

          {/* Flashcard Nav Controls */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={handlePrevCard}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition"
            >
              Flip Card
            </button>
            <button
              onClick={handleNextCard}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: REVISION CHEAT SHEET */}
      {viewMode === 'notes' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>High-Yield Revision Points:</span>
          </h3>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-200">
            {data.summaryNotes.map((note, idx) => (
              <li key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-850 border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Printable / Downloadable PDF Document Paper */}
      <div
        ref={examSheetRef}
        className="printable-document bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12 font-sans space-y-6 mt-6"
      >
        {/* Document Header */}
        <div className="border-b-2 border-purple-800 pb-4 flex flex-col sm:flex-row justify-between items-start gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800">
              {data.examTarget} • Practice Test Paper
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              {data.topic}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Curated High-Yield Mock Questions & Answer Key • KaamKaj AI
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 shrink-0">
            <p className="font-semibold text-slate-700">Questions: {data.questions.length}</p>
            <p>Time: {data.questions.length * 2} mins</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Section A: Revision Summary */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h2 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-2">
            Section A: Essential Revision Notes
          </h2>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
            {data.summaryNotes.map((note, idx) => (
              <li key={idx} className="leading-relaxed">
                {note}
              </li>
            ))}
          </ul>
        </div>

        {/* Section B: Multiple Choice Questions */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-purple-900 border-b border-slate-200 pb-1">
            Section B: Multiple Choice Questions
          </h2>
          {data.questions.map((q, idx) => (
            <div key={q.id} className="text-xs space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-slate-900 leading-snug">
                  Q{idx + 1}. {q.question}
                </p>
                <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                  {q.examTag}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pl-3">
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="text-slate-700 flex items-baseline gap-1.5">
                    <span className="font-bold text-slate-900 font-mono">
                      ({String.fromCharCode(65 + oIdx)})
                    </span>
                    <span>{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Section C: Official Answer Key & Solutions */}
        <div className="pt-4 border-t-2 border-slate-200 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
            Section C: Official Answer Key & Detailed Explanations
          </h2>
          <div className="space-y-2">
            {data.questions.map((q, idx) => (
              <div key={idx} className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span>Q{idx + 1}: Option ({String.fromCharCode(65 + q.correctIndex)})</span>
                  <span className="text-slate-600 font-normal">
                    — {q.options[q.correctIndex]}
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-600 mt-1 pl-2 border-l-2 border-purple-600">
                  <span className="font-semibold text-slate-800">Explanation: </span>
                  {q.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 flex justify-between text-[10px] text-slate-400">
          <span>KaamKaj AI Shiksha • Exam Practice Pack</span>
          <span>Designed for Indian Competitive & College Exams</span>
        </div>
      </div>
    </div>
  );
};
