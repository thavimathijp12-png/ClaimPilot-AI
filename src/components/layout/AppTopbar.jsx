import React, { useState } from 'react';
import { Menu, Search, Plus, Keyboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumbs } from './Breadcrumbs';
import { NotificationDropdown } from './NotificationDropdown';
import { UserProfileDropdown } from './UserProfileDropdown';
import { GlobalSearchModal } from './GlobalSearchModal';

export function AppTopbar({ onToggleSidebar, onOpenShortcuts, sidebarOpen = false }) {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/90 shadow-subtle px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Section: Mobile Menu & Breadcrumbs */}
        <div className="min-w-0 flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-navy hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
            aria-controls="app-sidebar"
            aria-expanded={sidebarOpen}
          >
            <Menu className="w-5 h-5" />
          </button>

          <Breadcrumbs />
        </div>

        {/* Right Section: Search, Action, Notifications, User Profile */}
        <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-3.5">
          {/* Global Search Button / Trigger */}
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            aria-label="Search claims and documents"
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors group"
            title="Search claims, documents, and rules (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            <span className="hidden md:inline text-slate-500 font-normal">Search claims, docs...</span>
            <kbd className="hidden lg:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Keyboard Shortcuts Trigger Button */}
          <button
            type="button"
            onClick={onOpenShortcuts}
            className="hidden sm:flex items-center justify-center w-8 h-8 text-slate-400 hover:text-navy hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            title="Keyboard Shortcuts (?)"
            aria-label="View keyboard shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Quick Create Claim Button */}
          <button
            type="button"
            onClick={() => navigate('/claims?action=create')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-primary-500/20"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New Claim</span>
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Notifications Dropdown */}
          <NotificationDropdown />

          {/* User Profile Dropdown */}
          <UserProfileDropdown />
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
}

