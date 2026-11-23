import React, { useEffect } from 'react';
import { Keyboard } from 'lucide-react';
import { Modal } from './Modal';

export function KeyboardShortcutsModal({ isOpen, onClose }) {
  const shortcutGroups = [
    {
      title: 'Global Navigation',
      items: [
        { keys: ['⌘', 'K'], label: 'Open Global Search' },
        { keys: ['?'], label: 'Show Keyboard Shortcuts' },
        { keys: ['ESC'], label: 'Close Active Modal / Dropdown' },
      ],
    },
    {
      title: 'Quick Module Navigation',
      items: [
        { keys: ['G', 'D'], label: 'Navigate to Dashboard' },
        { keys: ['G', 'C'], label: 'Navigate to Claims Management' },
        { keys: ['G', 'O'], label: 'Navigate to Document Repository' },
        { keys: ['G', 'Q'], label: 'Navigate to DataGuard IQ Engine' },
        { keys: ['G', 'E'], label: 'Navigate to AI Extraction Review' },
        { keys: ['G', 'A'], label: 'Navigate to Clinical Approvals Queue' },
        { keys: ['G', 'H'], label: 'Navigate to Audit Activity History' },
        { keys: ['G', 'R'], label: 'Navigate to Reports & Analytics' },
        { keys: ['G', 'S'], label: 'Navigate to System Settings' },
      ],
    },
    {
      title: 'Operational Shortcuts',
      items: [
        { keys: ['N'], label: 'Register New Claim Intake' },
        { keys: ['U'], label: 'Open Document Upload Modal' },
      ],
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Navigation & Operational Shortcuts"
      subtitle="Accelerate your claims adjudication workflow with hotkeys"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5 text-xs">
        {shortcutGroups.map((group, idx) => (
          <div key={idx} className="space-y-2">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {group.title}
            </h4>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-slate-50/40 overflow-hidden">
              {group.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="text-slate-700 font-medium">{item.label}</span>
                  <div className="flex items-center gap-1">
                    {item.keys.map((k, kIdx) => (
                      <kbd
                        key={kIdx}
                        className="px-2 py-0.5 text-[11px] font-mono font-semibold text-slate-600 bg-white border border-slate-200 rounded shadow-xs"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
