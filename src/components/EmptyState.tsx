import React from 'react';
import { ClipboardList, Plus, Sparkles, FilterX } from 'lucide-react';

interface EmptyStateProps {
  isFiltered: boolean;
  onOpenNewTask: () => void;
  onClearFilters: () => void;
  onQuickAdd: (title: string, category: string, priority: 'low' | 'medium' | 'high' | 'urgent') => void;
}

const TEMPLATE_SUGGESTIONS = [
  {
    title: 'Review quarterly goals & team sync',
    category: 'Work',
    priority: 'high' as const,
  },
  {
    title: 'Weekly grocery shopping & meal prep',
    category: 'Personal',
    priority: 'medium' as const,
  },
  {
    title: 'Deploy and test security rules',
    category: 'Projects',
    priority: 'urgent' as const,
  },
  {
    title: 'Schedule dentist checkup',
    category: 'Personal',
    priority: 'low' as const,
  },
];

export const EmptyState: React.FC<EmptyStateProps> = ({
  isFiltered,
  onOpenNewTask,
  onClearFilters,
  onQuickAdd,
}) => {
  if (isFiltered) {
    return (
      <div className="py-14 text-center px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-400 mb-3">
          <FilterX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">No matching tasks found</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
          Try clearing your search query or adjusting the category and priority filters.
        </p>
        <button
          onClick={onClearFilters}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  return (
    <div className="py-12 text-center px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 space-y-6">
      <div className="space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
          <ClipboardList className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-100">Your task list is empty</h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Start building your personalized, secure to-do list. Add a new task or pick a quick starter below:
        </p>
      </div>

      {/* Primary CTA */}
      <div>
        <button
          onClick={onOpenNewTask}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Your First Task</span>
        </button>
      </div>

      {/* Quick Add Suggestions */}
      <div className="pt-4 border-t border-slate-800/60 max-w-lg mx-auto">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Quick Starters
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
          {TEMPLATE_SUGGESTIONS.map((tpl, i) => (
            <button
              key={i}
              onClick={() => onQuickAdd(tpl.title, tpl.category, tpl.priority)}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800/80 hover:border-slate-700 text-xs text-slate-300 transition-all group flex items-start justify-between gap-2"
            >
              <div>
                <span className="font-medium text-slate-200 group-hover:text-white block">
                  {tpl.title}
                </span>
                <span className="text-[10px] text-slate-500">{tpl.category}</span>
              </div>
              <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0 mt-0.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
