import React, { useState, useRef, useEffect, useId } from 'react';

/**
 * Reusable Tooltip component for clinical codes, field helpers, and action guidance.
 * Supports multiple positions, keyboard focus, and accessible ARIA attributes.
 */
export default function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
  className = '',
  maxWidth = 'max-w-xs',
  disabled = false,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);
  const tooltipId = useId();

  const showTooltip = () => {
    if (disabled || !content) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isVisible) {
        hideTooltip();
      }
    };
    if (isVisible) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isVisible]);

  if (disabled || !content) {
    return <>{children}</>;
  }

  // Positioning classes
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  // Arrow classes
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-navy-950 border-x-transparent border-b-transparent border-[5px]',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-navy-950 border-x-transparent border-t-transparent border-[5px]',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-navy-950 border-y-transparent border-r-transparent border-[5px]',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-navy-950 border-y-transparent border-l-transparent border-[5px]',
  };

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      aria-describedby={isVisible ? tooltipId : undefined}
    >
      {children}
      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md shadow-lg pointer-events-none whitespace-normal transition-opacity duration-150 animate-in fade-in-0 zoom-in-95 ${positionClasses[position]} ${maxWidth}`}
        >
          {content}
          <div className={`absolute w-0 h-0 ${arrowClasses[position]}`} />
        </div>
      )}
    </div>
  );
}
