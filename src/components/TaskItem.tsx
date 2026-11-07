import React, { useState } from 'react';
import {
  Check,
  Calendar,
  Tag,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, TaskPriority } from '../types/task';

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; bg: string; text: string; border: string }
> = {
  urgent: {
    label: 'Urgent',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
  },
  high: {
    label: 'High',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  medium: {
    label: 'Medium',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
  },
  low: {
    label: 'Low',
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/20',
  },
};

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const priority = task.priority || 'medium';
  const priorityStyle = PRIORITY_CONFIG[priority];

  // Calculate Due Date Status
  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;
  const isDueToday = !task.completed && task.dueDate && task.dueDate === todayStr;

  const handleCheckboxClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUpdating) return;

    if (!task.completed) {
      // Fire confetti burst!
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
      });
    }

    try {
      setIsUpdating(true);
      await onToggle(task);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      try {
        setIsDeleting(true);
        await onDelete(task.id);
      } catch (err) {
        setIsDeleting(false);
      }
    }
  };

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate + 'T00:00:00').toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-200 ${
        task.completed
          ? 'bg-slate-900/30 border-slate-800/60 opacity-70'
          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="p-4 flex items-start gap-3.5">
        {/* Custom Animated Checkbox */}
        <button
          onClick={handleCheckboxClick}
          disabled={isUpdating}
          aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-all duration-150 shrink-0 ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500 text-slate-950 scale-100 shadow-sm shadow-emerald-500/20'
              : 'border-slate-600 hover:border-indigo-400 bg-slate-950/50'
          }`}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => onEdit(task)}
              className={`text-sm sm:text-base font-medium cursor-pointer transition-colors select-none ${
                task.completed
                  ? 'line-through text-slate-500'
                  : 'text-slate-100 group-hover:text-white'
              }`}
            >
              {task.title}
            </h3>

            {/* Quick Actions (visible on hover / mobile always) */}
            <div className="flex items-center gap-1 shrink-0 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className="p-1 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-md transition-colors"
                title="Edit task"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Description Preview or Expanded */}
          {task.description && (
            <div className="mt-1">
              <p
                className={`text-xs text-slate-400 transition-all ${
                  expanded ? 'whitespace-pre-line' : 'line-clamp-2'
                }`}
              >
                {task.description}
              </p>
              {task.description.length > 120 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="mt-1 text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                >
                  {expanded ? (
                    <>
                      <span>Show less</span> <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <span>Show more</span> <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Metadata Badges (Category, Priority, Due Date) */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px]">
            {/* Category */}
            {task.category && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 font-medium">
                <Tag className="w-3 h-3 text-slate-400" />
                {task.category}
              </span>
            )}

            {/* Priority */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md border font-medium ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
            >
              {priorityStyle.label}
            </span>

            {/* Due Date */}
            {formattedDueDate && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium border ${
                  isOverdue
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    : isDueToday
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700/60'
                }`}
              >
                {isOverdue ? (
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                ) : (
                  <Calendar className="w-3 h-3 text-slate-400" />
                )}
                <span>
                  {isOverdue
                    ? `Overdue (${formattedDueDate})`
                    : isDueToday
                    ? 'Due Today'
                    : formattedDueDate}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
