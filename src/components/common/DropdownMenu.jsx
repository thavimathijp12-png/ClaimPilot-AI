import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

/**
 * Reusable DropdownMenu component for contextual table row actions and header menus.
 * Features click-outside detection, keyboard arrow navigation, and danger variant styling.
 */
export default function DropdownMenu({
  trigger,
  items = [],
  align = 'right',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);
  const menuRef = useRef(null);

  const toggleOpen = (e) => {
    e?.stopPropagation();
    setIsOpen((prev) => !prev);
    setFocusedIndex(-1);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    const selectableItems = items.filter((item) => !item.divider && !item.disabled);

    if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % selectableItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + selectableItems.length) % selectableItems.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < selectableItems.length) {
        const item = selectableItems[focusedIndex];
        if (item.onClick) {
          item.onClick();
        }
        closeMenu();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger */}
      <div onClick={toggleOpen}>
        {trigger ? (
          trigger
        ) : (
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={isOpen}
            className="p-1.5 text-slate-400 hover:text-navy hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Menu dropdown */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          className={`absolute z-50 mt-1 min-w-[180px] bg-white rounded-xl shadow-lg border border-slate-200/90 py-1 text-xs focus:outline-none animate-in fade-in-0 zoom-in-95 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return (
                <div
                  key={`divider-${index}`}
                  className="my-1 border-t border-slate-100"
                />
              );
            }

            const Icon = item.icon;
            const isDanger = item.danger;
            const isDisabled = item.disabled;

            return (
              <button
                key={item.id || `item-${index}`}
                role="menuitem"
                type="button"
                disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled) {
                    item.onClick?.();
                    closeMenu();
                  }
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left font-medium transition-colors ${
                  isDisabled
                    ? 'opacity-40 cursor-not-allowed text-slate-400'
                    : isDanger
                    ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-navy'
                }`}
              >
                {Icon && (
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isDanger ? 'text-red-500' : 'text-slate-400'
                    }`}
                  />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
