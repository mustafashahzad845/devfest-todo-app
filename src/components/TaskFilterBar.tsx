import React from 'react';
import { Search, X, Filter, ArrowUpDown, Trash2, Download } from 'lucide-react';
import { TaskPriority, TaskSortBy, TaskStatusFilter, Task } from '../types/task';

interface TaskFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: TaskStatusFilter;
  onStatusChange: (status: TaskStatusFilter) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  selectedPriority: TaskPriority | 'all';
  onPriorityChange: (priority: TaskPriority | 'all') => void;
  sortBy: TaskSortBy;
  onSortChange: (sort: TaskSortBy) => void;
  tasks: Task[];
  onClearCompleted: () => void;
  onExportTasks: () => void;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  selectedCategory,
  onCategoryChange,
  categories,
  selectedPriority,
  onPriorityChange,
  sortBy,
  onSortChange,
  tasks,
  onClearCompleted,
  onExportTasks,
}) => {
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-3 mb-6 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
      {/* Top Row: Search and Status Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks by title, description, or tag..."
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-9 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {(['all', 'active', 'completed'] as TaskStatusFilter[]).map((tab) => {
            const count =
              tab === 'all'
                ? tasks.length
                : tab === 'active'
                ? tasks.filter((t) => !t.completed).length
                : tasks.filter((t) => t.completed).length;

            const isActive = statusFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => onStatusChange(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Row: Category, Priority, Sort & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-slate-800/60 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-300">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">
                All Categories
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-300">
            <span className="text-slate-400">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => onPriorityChange(e.target.value as TaskPriority | 'all')}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer capitalize"
            >
              <option value="all" className="bg-slate-900 text-slate-200">
                All Priorities
              </option>
              <option value="urgent" className="bg-slate-900 text-rose-400">
                Urgent
              </option>
              <option value="high" className="bg-slate-900 text-amber-400">
                High
              </option>
              <option value="medium" className="bg-slate-900 text-indigo-400">
                Medium
              </option>
              <option value="low" className="bg-slate-900 text-slate-400">
                Low
              </option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as TaskSortBy)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="created_desc" className="bg-slate-900 text-slate-200">
                Newest First
              </option>
              <option value="created_asc" className="bg-slate-900 text-slate-200">
                Oldest First
              </option>
              <option value="due_asc" className="bg-slate-900 text-slate-200">
                Due Date
              </option>
              <option value="priority_desc" className="bg-slate-900 text-slate-200">
                Highest Priority
              </option>
              <option value="title_asc" className="bg-slate-900 text-slate-200">
                Title (A-Z)
              </option>
            </select>
          </div>
        </div>

        {/* Action buttons: Clear Completed & Export */}
        <div className="flex items-center gap-2 ml-auto">
          {completedCount > 0 && (
            <button
              onClick={onClearCompleted}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-medium transition-colors"
              title="Delete all finished tasks"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Done ({completedCount})</span>
            </button>
          )}

          <button
            onClick={onExportTasks}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Export tasks as JSON file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};
