import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, TrendingUp } from 'lucide-react';
import { Task } from '../types/task';

interface TaskStatsProps {
  tasks: Task[];
}

export const TaskStats: React.FC<TaskStatsProps> = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = tasks.filter((t) => {
    if (t.completed || !t.dueDate) return false;
    return t.dueDate < todayStr;
  }).length;

  const dueTodayCount = tasks.filter((t) => {
    if (t.completed || !t.dueDate) return false;
    return t.dueDate === todayStr;
  }).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Total Tasks */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">Total Tasks</p>
          <p className="text-2xl font-bold text-white mt-0.5">{total}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <ListTodo className="w-5 h-5" />
        </div>
      </div>

      {/* In Progress */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">In Progress</p>
          <p className="text-2xl font-bold text-amber-400 mt-0.5">{active}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* Completed */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">Completed</p>
          <p className="text-2xl font-bold text-emerald-400 mt-0.5">{completed}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* Completion Rate / Due Alerts */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-400">Completion</p>
          <span className="text-xs font-semibold text-indigo-400">{percentage}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
          {overdueCount > 0 ? (
            <span className="text-rose-400 flex items-center gap-1 font-medium">
              <AlertTriangle className="w-3 h-3" /> {overdueCount} overdue
            </span>
          ) : dueTodayCount > 0 ? (
            <span className="text-amber-400 flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3" /> {dueTodayCount} due today
            </span>
          ) : (
            <span className="text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" /> On track
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
