import React from 'react';
import { AlignJustify, List, Menu } from 'lucide-react';
import Tooltip from './Tooltip';

/**
 * Reusable DensityToggle component allowing users to switch data density modes:
 * - compact: High information density for rapid triage and operations
 * - comfortable: Standard balanced enterprise spacing
 * - spacious: Touch-friendly relaxed layout
 */
export default function DensityToggle({
  density = 'comfortable',
  onChange,
  className = '',
}) {
  const options = [
    {
      id: 'compact',
      label: 'Compact',
      description: 'Compact view: Maximize visible rows on screen',
      icon: List,
    },
    {
      id: 'comfortable',
      label: 'Comfortable',
      description: 'Comfortable view: Standard balanced spacing',
      icon: AlignJustify,
    },
    {
      id: 'spacious',
      label: 'Spacious',
      description: 'Spacious view: Relaxed touch-friendly row height',
      icon: Menu,
    },
  ];

  return (
    <div
      role="group"
      aria-label="Table density selector"
      className={`inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 ${className}`}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isSelected = density === opt.id;

        return (
          <Tooltip key={opt.id} content={opt.description} position="top">
            <button
              type="button"
              onClick={() => onChange(opt.id)}
              aria-pressed={isSelected}
              className={`p-1.5 rounded-md transition-all text-xs font-medium flex items-center gap-1 focus:outline-none ${
                isSelected
                  ? 'bg-white text-navy shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-navy hover:bg-slate-200/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">{opt.label}</span>
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
