import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ClaimPilot UI Runtime Error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Something went wrong</h2>
          <p className="text-sm text-slate-500 max-w-md mb-6">
            An unexpected error occurred while loading this view. Try reloading the portal.
          </p>
          <div className="bg-slate-100 text-left p-3 rounded-lg text-xs font-mono text-slate-700 max-w-lg w-full mb-6 overflow-x-auto border border-slate-200">
            {this.state.error?.message || 'Unknown runtime error'}
          </div>
          <button
            type="button"
            onClick={this.handleReload}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Application</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
