import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Tag, AlertCircle, Sparkles } from 'lucide-react';
import { Task, TaskFormData, TaskPriority } from '../types/task';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  editingTask: Task | null;
  existingCategories: string[];
}

const DEFAULT_CATEGORIES = ['Work', 'Personal', 'Projects', 'Errands', 'Urgent'];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTask,
  existingCategories,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState('Personal');
  const [customCategory, setCustomCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);

  const mergedCategories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...existingCategories])
  ).filter(Boolean);

  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setTitle(editingTask.title);
        setDescription(editingTask.description || '');
        setPriority(editingTask.priority || 'medium');
        const cat = editingTask.category || 'Personal';
        if (mergedCategories.includes(cat)) {
          setCategory(cat);
          setCustomCategory('');
        } else {
          setCategory('custom');
          setCustomCategory(cat);
        }
        setDueDate(editingTask.dueDate || '');
      } else {
        // Reset defaults
        setTitle('');
        setDescription('');
        setPriority('medium');
        setCategory('Personal');
        setCustomCategory('');
        setDueDate('');
      }
      setValidationError(null);
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, editingTask]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError('Please enter a task title');
      titleInputRef.current?.focus();
      return;
    }
    if (trimmedTitle.length > 256) {
      setValidationError('Title must be 256 characters or fewer');
      return;
    }
    if (description.length > 2000) {
      setValidationError('Description must be 2000 characters or fewer');
      return;
    }

    const finalCategory =
      category === 'custom'
        ? customCategory.trim().slice(0, 64) || 'General'
        : category;

    try {
      setIsSubmitting(true);
      setValidationError(null);
      await onSubmit({
        title: trimmedTitle,
        description: description.trim(),
        priority,
        category: finalCategory,
        dueDate,
      });
      onClose();
    } catch (err: any) {
      setValidationError(err.message || 'Failed to save task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      onKeyDown={handleKeyDown}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <h2 className="text-base font-semibold text-white">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Title Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Task Title <span className="text-rose-400">*</span>
              </label>
              <span className="text-[10px] text-slate-500">
                {title.length}/256
              </span>
            </div>
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              maxLength={256}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Update security rules and review access control..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Priority Options */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Priority Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'low', label: 'Low', color: 'hover:border-slate-500 text-slate-300' },
                { id: 'medium', label: 'Medium', color: 'hover:border-indigo-500 text-indigo-300' },
                { id: 'high', label: 'High', color: 'hover:border-amber-500 text-amber-300' },
                { id: 'urgent', label: 'Urgent', color: 'hover:border-rose-500 text-rose-300' },
              ].map((item) => {
                const isSelected = priority === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPriority(item.id as TaskPriority)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      isSelected
                        ? item.id === 'urgent'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-semibold'
                          : item.id === 'high'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                          : item.id === 'medium'
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-semibold'
                          : 'bg-slate-700/40 border-slate-500 text-slate-200 font-semibold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category & Due Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1 mb-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" /> Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {mergedCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="custom">+ New Category...</option>
              </select>

              {category === 'custom' && (
                <input
                  type="text"
                  maxLength={64}
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category name"
                  className="mt-2 w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Description Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Notes & Description (Optional)
              </label>
              <span className="text-[10px] text-slate-500">
                {description.length}/2000
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key context, links, or action items..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-colors"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">⌘/Ctrl + Enter</kbd> to save
            </span>
            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
