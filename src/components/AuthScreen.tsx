import React from 'react';
import { CheckCircle2, ShieldCheck, Zap, RefreshCw, Layers, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthScreen: React.FC = () => {
  const { signInWithGoogle, error, clearError } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 py-12 bg-slate-950 text-slate-100">
      <div className="max-w-3xl w-full text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase">
          <ShieldCheck className="w-4 h-4" /> Firebase Secure Workspace
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Collaborative task management, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              strictly isolated records.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            Real-time synchronization powered by Google Firebase Firestore. Your tasks are securely isolated so only you can view, create, toggle, and manage your private to-do list.
          </p>
        </div>

        {/* Error message if popup failed */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm max-w-md mx-auto flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-xs underline hover:text-white ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Sign In CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={signInWithGoogle}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-white text-slate-900 font-bold text-base hover:bg-slate-100 shadow-xl shadow-indigo-500/10 transition-all hover:scale-[1.02] active:scale-[0.98] border border-slate-200"
          >
            {/* Google G icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            Sign in with Google
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 text-left">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base mb-1">
              Guaranteed Data Isolation
            </h3>
            <p className="text-slate-400 text-sm">
              Strict Firestore security rules enforce that only your authenticated Google UID can read, write, or delete your tasks.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base mb-1">
              Real-Time Collaboration
            </h3>
            <p className="text-slate-400 text-sm">
              Instant snapshot updates across multiple tabs, phones, and laptops with zero manual refreshing.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base mb-1">
              Priority & Tags
            </h3>
            <p className="text-slate-400 text-sm">
              Organize your tasks with custom categories, due dates, urgency tags, and instant progress tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
