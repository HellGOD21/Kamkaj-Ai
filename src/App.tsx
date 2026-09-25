import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CommandBar, STARTER_PROMPTS } from './components/CommandBar';
import { MonetizationModal } from './components/MonetizationModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { InvoiceRenderer } from './components/renderers/InvoiceRenderer';
import { ResumeRenderer } from './components/renderers/ResumeRenderer';
import { RegionalExplainerRenderer } from './components/renderers/RegionalExplainerRenderer';
import { TravelRenderer } from './components/renderers/TravelRenderer';
import { ExamPrepRenderer } from './components/renderers/ExamPrepRenderer';
import { ReelRenderer } from './components/renderers/ReelRenderer';
import { WhatsAppMsgRenderer } from './components/renderers/WhatsAppMsgRenderer';
import { ActionResult, ActionType } from './types';
import { Sparkles, ArrowUp, RefreshCw, CheckCircle2, Share2 } from 'lucide-react';

const STORAGE_KEY_HISTORY = 'kaamkaj_history_v2';
const STORAGE_KEY_QUOTA = 'kaamkaj_quota_v2';
const MAX_FREE_TASKS = 10;

export default function App() {
  const [activeResult, setActiveResult] = useState<ActionResult | null>(null);
  const [history, setHistory] = useState<ActionResult[]>([]);
  const [freeTasksUsed, setFreeTasksUsed] = useState<number>(2); // Start with 2 used (8 left) for realistic feel
  const [selectedLang, setSelectedLang] = useState<string>('English');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPricingOpen, setIsPricingOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Load persistent history on mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (storedHistory) {
        const parsed = JSON.parse(storedHistory);
        setHistory(parsed);
        if (parsed.length > 0) {
          setActiveResult(parsed[0]);
        }
      } else {
        // Initial default demo: Show a real GST Invoice with UPI QR ready to go!
        const initialDemo: ActionResult = {
          id: 'demo-invoice-1',
          type: 'invoice',
          title: 'GST Tax Invoice & UPI Payment Slip',
          subtitle: 'Generated for freelance & small business transactions in India',
          timestamp: Date.now(),
          prompt: 'Create an invoice for client Sunrise Tech for ₹35,000 for mobile app design and GST tax',
          data: {
            invoiceNumber: 'INV-2026-089',
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            businessName: 'Apex Digital Solutions',
            businessGstin: '27AABCA1234F1Z5',
            businessAddress: 'Plot 42, Hiranandani Tech Park, Powai, Mumbai, MH 400076',
            businessPhone: '+91 98200 12345',
            businessEmail: 'accounts@apexdigital.in',
            clientName: 'Sunrise Enterprises India',
            clientGstin: '29ABCDE5678G1Z9',
            clientAddress: 'Indiranagar 100ft Road, Bengaluru, KA 560038',
            clientPhone: '+91 98450 67890',
            items: [
              { description: 'Full-Stack Web Application & Mobile UI Development', hsnSac: '998314', quantity: 1, rate: 25000, amount: 25000 },
              { description: 'Cloud Deployment, SEO Setup & WhatsApp API Integration', hsnSac: '998313', quantity: 1, rate: 6000, amount: 6000 },
              { description: 'Maintenance & Priority SLA Support (1st Quarter)', hsnSac: '998315', quantity: 1, rate: 4000, amount: 4000 },
            ],
            taxPercent: 18,
            subtotal: 35000,
            taxAmount: 6300,
            totalAmount: 41300,
            upiId: 'apexdigital@okhdfcbank',
            bankDetails: {
              accountName: 'Apex Digital Solutions',
              accountNumber: '50200045892114',
              ifsc: 'HDFC0001234',
              bankName: 'HDFC Bank, Powai Branch',
            },
            notes: 'Payment is due within 7 days. Scan the UPI QR code below for instant zero-charge settlement via GPay, PhonePe, or Paytm.',
          },
        };
        setActiveResult(initialDemo);
        setHistory([initialDemo]);
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify([initialDemo]));
      }

      const storedQuota = localStorage.getItem(STORAGE_KEY_QUOTA);
      if (storedQuota) {
        setFreeTasksUsed(Number(storedQuota));
      }
    } catch (e) {
      console.warn('Could not read from local storage', e);
    }
  }, []);

  const saveToHistory = (newResult: ActionResult) => {
    setHistory((prev) => {
      const updated = [newResult, ...prev.filter((i) => i.id !== newResult.id)].slice(0, 30);
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
      } catch (err) {
        console.warn(err);
      }
      return updated;
    });
  };

  const handleExecute = async (prompt: string, explicitType?: ActionType) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          explicitType,
          language: selectedLang,
        }),
      });

      const json = await res.json();
      if (!json.success || !json.result) {
        throw new Error(json.error || 'Failed to process request');
      }

      const generated = json.result;
      const resultObj: ActionResult = {
        id: 'task-' + Date.now(),
        type: generated.type || explicitType || 'invoice',
        title: generated.title || 'Action Result',
        subtitle: generated.subtitle || '',
        timestamp: Date.now(),
        prompt,
        data: generated.data,
      };

      setActiveResult(resultObj);
      saveToHistory(resultObj);

      // Increment quota count
      const updatedQuota = freeTasksUsed + 1;
      setFreeTasksUsed(updatedQuota);
      localStorage.setItem(STORAGE_KEY_QUOTA, String(updatedQuota));

      // Scroll smoothly to result
      setTimeout(() => {
        const el = document.getElementById('active-result-view');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error('Task execution error:', err);
      setErrorMessage(err.message || 'Something went wrong while generating the result.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareResult = async () => {
    if (!activeResult) return;

    const shareTitle = `${activeResult.title || 'KaamKaj AI Result'} - KaamKaj AI`;
    const shareText = `🚀 ${activeResult.title}\n\nTask: "${activeResult.prompt}"\n${activeResult.subtitle ? `${activeResult.subtitle}\n` : ''}\nGenerated with KaamKaj AI — India's Life & Work Action Assistant.`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        setShareFeedback('Shared!');
        setTimeout(() => setShareFeedback(null), 2500);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return;
        }
        console.warn('Native share failed, copying to clipboard:', err);
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setShareFeedback('Summary Copied!');
      setTimeout(() => setShareFeedback(null), 2500);
    } catch (clipErr) {
      console.error('Clipboard copy failed:', clipErr);
    }
  };

  const handleDeleteHistory = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
      return updated;
    });
    if (activeResult?.id === id) {
      setActiveResult(history.find((i) => i.id !== id) || null);
    }
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY_HISTORY);
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-orange-500/30 selection:text-orange-200">
      {/* Top App Header */}
      <Header
        freeTasksUsed={freeTasksUsed}
        maxFreeTasks={MAX_FREE_TASKS}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNewTask={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        selectedLang={selectedLang}
        onSelectLang={setSelectedLang}
        historyCount={history.length}
      />

      {/* Main Command & Input Area */}
      <main className="flex-1 pb-16">
        <CommandBar
          onExecute={handleExecute}
          isLoading={isLoading}
          selectedLang={selectedLang}
        />

        {/* Error Notification */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto px-4 mt-3">
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center justify-between">
              <span>⚠️ {errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white">
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Active Result Canvas */}
        <section id="active-result-view" className="max-w-5xl mx-auto px-4 mt-6 scroll-mt-8">
          {activeResult ? (
            <div key={activeResult.id} className="space-y-4 animate-fade-slide-up">
              {/* Result Meta Banner */}
              <div className="no-print flex flex-wrap items-center justify-between gap-3 px-2 py-1 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="font-bold text-white uppercase tracking-wider text-[11px] shrink-0">
                    Interactive Working Result
                  </span>
                  <span className="text-slate-500 hidden sm:inline">•</span>
                  <span className="text-slate-400 truncate max-w-xs sm:max-w-md">
                    “{activeResult.prompt}”
                  </span>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    {new Date(activeResult.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {/* Web Share API Button */}
                  <button
                    onClick={handleShareResult}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 shadow-sm ${
                      shareFeedback
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-850 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-slate-600'
                    }`}
                    title="Share this result summary via WhatsApp, Telegram, Twitter, or system apps"
                  >
                    {shareFeedback ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{shareFeedback}</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-orange-400" />
                        <span>Share</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Dynamic Renderer Selection */}
              {activeResult.type === 'invoice' && (
                <InvoiceRenderer
                  initialData={activeResult.data}
                  onSave={(updated) => {
                    const updatedResult = { ...activeResult, data: updated };
                    setActiveResult(updatedResult);
                    saveToHistory(updatedResult);
                  }}
                />
              )}

              {activeResult.type === 'resume' && (
                <ResumeRenderer
                  initialData={activeResult.data}
                  onSave={(updated) => {
                    const updatedResult = { ...activeResult, data: updated };
                    setActiveResult(updatedResult);
                    saveToHistory(updatedResult);
                  }}
                />
              )}

              {activeResult.type === 'regional_explain' && (
                <RegionalExplainerRenderer
                  initialData={activeResult.data}
                  onReExplainInLanguage={(lang) => {
                    setSelectedLang(lang);
                    handleExecute(`Explain "${activeResult.data?.originalConcept || activeResult.prompt}" in ${lang}`, 'regional_explain');
                  }}
                />
              )}

              {activeResult.type === 'travel_cheap' && (
                <TravelRenderer initialData={activeResult.data} />
              )}

              {activeResult.type === 'exam_prep' && (
                <ExamPrepRenderer initialData={activeResult.data} />
              )}

              {activeResult.type === 'reel_creator' && (
                <ReelRenderer initialData={activeResult.data} />
              )}

              {activeResult.type === 'whatsapp_msg' && (
                <WhatsAppMsgRenderer initialData={activeResult.data} />
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800/80 p-8">
              <Sparkles className="w-8 h-8 text-orange-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">Ready for your request</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Select one of the everyday starter actions above or type your own task in any Indian language.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">KaamKaj AI</span>
            <span>• Built for Indian SMBs, Freshers, Students & Creators</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setIsPricingOpen(true)} className="hover:text-white">
              Pricing Model
            </button>
            <button onClick={() => setIsHistoryOpen(true)} className="hover:text-white">
              History
            </button>
            <span className="text-[11px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
              India Play 2026 Ready
            </span>
          </div>
        </div>
      </footer>

      {/* Monetization & Scale Simulator Modal */}
      <MonetizationModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onSelectPlan={(plan) => {
          alert(`Selected plan: ${plan.toUpperCase()}. Upgrade flow connected.`);
        }}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={history}
        onSelect={(item) => setActiveResult(item)}
        onDelete={handleDeleteHistory}
        onClearAll={handleClearAllHistory}
      />
    </div>
  );
}
