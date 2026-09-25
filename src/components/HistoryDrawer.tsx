import React, { useState } from 'react';
import {
  X,
  Trash2,
  Clock,
  Search,
  FileSpreadsheet,
  FileUser,
  Languages,
  Train,
  GraduationCap,
  Video,
  MessageSquareText,
  ChevronRight,
} from 'lucide-react';
import { ActionResult, ActionType } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: ActionResult[];
  onSelect: (item: ActionResult) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onSelect,
  onDelete,
  onClearAll,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const getTypeIcon = (type: ActionType) => {
    switch (type) {
      case 'invoice':
        return FileSpreadsheet;
      case 'resume':
        return FileUser;
      case 'regional_explain':
        return Languages;
      case 'travel_cheap':
        return Train;
      case 'exam_prep':
        return GraduationCap;
      case 'reel_creator':
        return Video;
      case 'whatsapp_msg':
        return MessageSquareText;
      default:
        return MessageSquareText;
    }
  };

  const filtered = items.filter(
    (item) =>
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.prompt?.toLowerCase().includes(search.toLowerCase()) ||
      item.type?.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col justify-between shadow-2xl p-5">
        {/* Top Header */}
        <div className="space-y-3 pb-3 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <h2 className="font-bold text-white text-base">Saved Actions & History</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search previous results..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-850 text-xs text-white placeholder-slate-500 pl-8 pr-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-slate-700"
            />
          </div>
        </div>

        {/* List of past results */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 no-scrollbar">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs space-y-1">
              <p>No actions saved yet.</p>
              <p>Execute any task from the top bar to save it here.</p>
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = getTypeIcon(item.type);
              return (
                <div
                  key={item.id}
                  className="group relative p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition flex items-start gap-3 cursor-pointer"
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-750 text-orange-400 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {item.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-500">• {formatTime(item.timestamp)}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200 truncate mt-0.5">{item.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{item.prompt}</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 transition absolute right-2 top-3"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Actions */}
        {items.length > 0 && (
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">{items.length} items stored</span>
            <button
              onClick={onClearAll}
              className="text-red-400 hover:text-red-300 font-medium transition"
            >
              Clear All History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
