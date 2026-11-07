import React from 'react';
import { CheckCircle2, LogOut, Radio, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenNewTask: () => void;
  tasksCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewTask, tasksCount }) => {
  const { user, signOutUser, signInWithGoogle } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-slate-100 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                SyncTasks
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-3 h-3" /> Cloud Sync
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Secure Isolated To-Do Workspace
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Real-time Indicator */}
              <div
                title="Real-time Firestore listener active"
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Connected
              </div>

              {/* Add Task Button */}
              <button
                onClick={onOpenNewTask}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>+</span>
                <span className="hidden xs:inline">New Task</span>
              </button>

              {/* User Chip */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-300">
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="hidden lg:block text-left text-xs">
                  <p className="font-medium text-slate-200 truncate max-w-[120px]">
                    {user.displayName || 'User'}
                  </p>
                  <p className="text-slate-400 text-[10px] truncate max-w-[120px]">
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={signOutUser}
                  title="Sign out"
                  className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 shadow transition-colors"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
