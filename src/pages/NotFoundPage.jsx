import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        <FileQuestion className="w-8 h-8 stroke-[1.5]" />
      </div>
      <h1 className="text-2xl font-bold text-navy">404 — Page Not Found</h1>
      <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
        The requested healthcare portal resource does not exist or has been relocated.
      </p>
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="mt-6 px-4 py-2 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1.5 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </button>
    </div>
  );
}

