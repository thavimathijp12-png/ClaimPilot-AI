import React, { useRef } from 'react';

/**
 * Reusable accessible Tabs component with full keyboard arrow navigation,
 * badge counters, icon support, and multiple visual variants.
 */
export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'underline', // 'underline' | 'pills'
  size = 'md', // 'sm' | 'md'
  className = '',
}) {
  const tabListRef = useRef(null);

  const handleKeyDown = (e, index) => {
    const enabledTabs = tabs.filter((t) => !t.disabled);
    const currentIndex = enabledTabs.findIndex((t) => t.id === tabs[index].id);

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextTab = enabledTabs[(currentIndex + 1) % enabledTabs.length];
      if (nextTab) onChange(nextTab.id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevTab =
        enabledTabs[(currentIndex - 1 + enabledTabs.length) % enabledTabs.length];
      if (prevTab) onChange(prevTab.id);
    } else if (e.key === 'Home') {
      e.preventDefault();
      if (enabledTabs.length > 0) onChange(enabledTabs[0].id);
    } else if (e.key === 'End') {
      e.preventDefault();
      if (enabledTabs.length > 0) onChange(enabledTabs[enabledTabs.length - 1].id);
    }
  };

  const isUnderline = variant === 'underline';

  return (
    <div
      ref={tabListRef}
      role="tablist"
      aria-orientation="horizontal"
      className={`flex items-center gap-1 ${
        isUnderline
          ? 'border-b border-slate-200'
          : 'bg-slate-100 p-1 rounded-xl border border-slate-200'
      } ${className}`}
    >
      {tabs.map((tab, idx) => {
        const isActive = tab.id === activeTab;
        const Icon = tab.icon;

        if (isUnderline) {
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && onChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`group relative flex items-center gap-2 font-medium transition-all duration-150 focus:outline-none ${
                size === 'sm' ? 'py-2 px-3 text-xs' : 'py-3 px-4 text-sm'
              } ${
                tab.disabled
                  ? 'opacity-40 cursor-not-allowed text-slate-400'
                  : isActive
                  ? 'text-primary-600 font-semibold'
                  : 'text-slate-600 hover:text-navy hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              {Icon && (
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-navy'
                  }`}
                />
              )}
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge !== null && (
                <span
                  className={`ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
              {/* Active Underline Indicator */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full shadow-sm" />
              )}
            </button>
          );
        }

        // Pill variant
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`flex items-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none ${
              size === 'sm' ? 'py-1.5 px-3 text-xs' : 'py-2 px-3.5 text-sm'
            } ${
              tab.disabled
                ? 'opacity-40 cursor-not-allowed text-slate-400'
                : isActive
                ? 'bg-white text-navy font-semibold shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-navy hover:bg-slate-200/60'
            }`}
          >
            {Icon && (
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-primary-600' : 'text-slate-400'
                }`}
              />
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge !== null && (
              <span
                className={`ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 border border-primary-200'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
