import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, ShieldAlert, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'DataGuard IQ Issue Flagged',
      message: 'Claim CLM-2026-8912 has missing signature in triage ledger.',
      time: '12m ago',
      type: 'warning',
      read: false,
      link: '/dataguard',
    },
    {
      id: 'notif-2',
      title: 'AI Extraction Ready for Review',
      message: 'Simulated OCR completed for Metropolitan Memorial Hospital.',
      time: '45m ago',
      type: 'extraction',
      read: false,
      link: '/extraction',
    },
    {
      id: 'notif-3',
      title: 'Adjudication Finalized',
      message: 'Claim CLM-2026-8911 approved by Sarah Jenkins, RN ($3,240.00).',
      time: '2h ago',
      type: 'success',
      read: true,
      link: '/claims/CLM-2026-8911',
    },
    {
      id: 'notif-4',
      title: 'New Claim Ingested',
      message: 'CLM-2026-8917 registered from emergency department intake.',
      time: '3h ago',
      type: 'claim',
      read: true,
      link: '/claims/CLM-2026-8917',
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleItemClick = (notif) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'warning':
        return <ShieldAlert className="w-4 h-4 text-amber-600" />;
      case 'extraction':
        return <Sparkles className="w-4 h-4 text-teal-600" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <FileText className="w-4 h-4 text-primary-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-500 hover:text-navy hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-dropdown border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-navy">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary-100 text-primary-700 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-[11px] text-primary-600 hover:underline flex items-center gap-1 font-medium"
              >
                <Check className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={cn(
                  'p-3 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-colors text-left',
                  !n.read && 'bg-primary-50/20'
                )}
              >
                <div className="p-2 rounded-lg bg-slate-100 flex-shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={cn('text-xs font-semibold truncate', n.read ? 'text-slate-700' : 'text-navy')}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 border-t border-slate-100 bg-slate-50/60 text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/activity');
              }}
              className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
            >
              View Full Audit Activity Log
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
