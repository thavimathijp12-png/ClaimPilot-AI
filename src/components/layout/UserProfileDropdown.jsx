import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../common/Avatar';
import { User, Settings, LogOut, Check, ChevronDown, RefreshCw, Lock, LayoutDashboard } from 'lucide-react';
import { cn } from '../../utils/cn';

export function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { currentUser, switchRole, logout, lockSession, demoAccounts } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSelect = (roleCode) => {
    switchRole(roleCode);
    setIsOpen(false);
    const destination =
      roleCode === 'admin'
        ? '/admin/dashboard'
        : roleCode === 'operator'
          ? '/operator/dashboard'
          : '/reviewer/dashboard';
    navigate(destination);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  if (!currentUser) return null;

  const roleCode = (currentUser.roleCode || '').toLowerCase();
  const isAdmin = roleCode === 'admin';
  const homePath = currentUser.dashboardPath ||
    (isAdmin ? '/admin/dashboard' : roleCode === 'operator' ? '/operator/dashboard' : '/reviewer/dashboard');

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        aria-label="User account menu"
      >
        <Avatar
          src={currentUser.avatar}
          name={currentUser.name}
          role={currentUser.role}
          size="sm"
          className="w-7 h-7 sm:w-8 sm:h-8"
        />
        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-bold text-navy truncate max-w-[130px] leading-tight">
            {currentUser.name}
          </span>
          <span className="text-[10px] text-primary-600 font-semibold truncate leading-tight">
            {currentUser.role}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-dropdown border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* User Summary Header */}
          <div className="p-4 bg-slate-50/80 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <Avatar
                src={currentUser.avatar}
                name={currentUser.name}
                role={currentUser.role}
                size="md"
                className="w-10 h-10 object-cover"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-navy truncate">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 truncate font-mono">{currentUser.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-primary-100 text-primary-700 rounded-full">
                  {currentUser.role}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200/60 leading-tight">
              {currentUser.department}
            </p>
          </div>

          {/* Quick Role Switcher for Admin only */}
          {isAdmin && (
            <div className="p-3 border-b border-slate-100 bg-slate-50/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 text-primary-600" />
                  Role View Switcher (Admin)
                </span>
              </div>
              <div className="space-y-1">
                {(demoAccounts || []).map((account) => {
                  const isActive = (account.roleCode || '').toLowerCase() === roleCode;
                  return (
                    <button
                      key={account.roleCode}
                      type="button"
                      onClick={() => handleRoleSelect(account.roleCode)}
                      className={cn(
                        'w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary-700 font-semibold'
                          : 'text-slate-700 hover:bg-white'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={account.avatar}
                          name={account.name}
                          role={account.role}
                          size="xs"
                          className="w-5 h-5 text-[8px]"
                        />
                        <span>{account.role}</span>
                      </div>
                      {isActive && <Check className="w-3.5 h-3.5 text-primary-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Menu Actions */}
          <div className="p-2 space-y-0.5">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate(homePath);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-navy rounded-lg transition-colors text-left"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span>My Role Dashboard</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-navy rounded-lg transition-colors text-left"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>System Settings & Profile</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                lockSession();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-800 rounded-lg transition-colors text-left font-medium"
            >
              <Lock className="w-4 h-4 text-amber-500" />
              <span>Lock Workstation (HIPAA)</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
