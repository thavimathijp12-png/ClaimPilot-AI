import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';
import { KeyboardShortcutsModal } from '../common/KeyboardShortcutsModal';
import SessionLockModal from '../common/SessionLockModal';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const navigate = useNavigate();

  // Global keyboard shortcuts listener
  useEffect(() => {
    let pendingG = false;
    let timer = null;

    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      // '?' opens shortcuts modal
      if ((e.key === '?' || (e.shiftKey && e.key === '/')) && !isInput) {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
        return;
      }

      if (isInput) return;

      // Handle 'G' sequence chords
      if (e.key.toLowerCase() === 'g' && !e.ctrlKey && !e.metaKey) {
        pendingG = true;
        clearTimeout(timer);
        timer = setTimeout(() => {
          pendingG = false;
        }, 1200);
        return;
      }

      if (pendingG) {
        pendingG = false;
        clearTimeout(timer);
        const k = e.key.toLowerCase();
        if (k === 'd') { e.preventDefault(); navigate('/dashboard'); }
        else if (k === 'c') { e.preventDefault(); navigate('/claims'); }
        else if (k === 'o') { e.preventDefault(); navigate('/documents'); }
        else if (k === 'q') { e.preventDefault(); navigate('/dataguard'); }
        else if (k === 'e') { e.preventDefault(); navigate('/extraction'); }
        else if (k === 'a') { e.preventDefault(); navigate('/approvals'); }
        else if (k === 'h') { e.preventDefault(); navigate('/activity'); }
        else if (k === 'r') { e.preventDefault(); navigate('/reports'); }
        else if (k === 's') { e.preventDefault(); navigate('/settings'); }
        return;
      }

      // Single-key hotkeys
      if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        navigate('/claims?action=create');
      } else if (e.key.toLowerCase() === 'u' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        navigate('/documents');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all">
        {/* Topbar */}
        <AppTopbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenShortcuts={() => setShortcutsOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      {/* HIPAA Workstation Session Lock Modal */}
      <SessionLockModal />
    </div>
  );
}
