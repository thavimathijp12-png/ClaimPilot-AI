import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

export function getInitials(name = '') {
  if (!name) return 'CP';

  // Clean professional credentials and medical prefixes
  const cleaned = name
    .replace(/^Dr\.?\s+/i, '')
    .replace(/,\s*(RN|MD|DO|NP|PA|PhD|BSN|MSN|Esq).*$/i, '')
    .trim();

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (name[0] || 'U').toUpperCase();
}

export function Avatar({
  src,
  alt = '',
  name = '',
  initials,
  size = 'md',
  role,
  className = '',
}) {
  const [hasError, setHasError] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const displayInitials = initials || getInitials(name || alt);

  // Size styling presets
  const sizeMap = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-7 h-7 sm:w-8 sm:h-8 text-xs',
    md: 'w-9 h-9 sm:w-10 sm:h-10 text-xs sm:text-sm',
    lg: 'w-12 h-12 text-sm sm:text-base',
    xl: 'w-16 h-16 text-lg sm:text-xl font-bold',
  };

  const currentSizeClass = sizeMap[size] || sizeMap.md;

  // Blue / Teal medical gradient styling with subtle border
  const getGradientStyle = () => {
    const norm = (role || name || '').toLowerCase();
    if (norm.includes('reviewer') || norm.includes('jenkins') || displayInitials === 'SJ') {
      return 'bg-gradient-to-tr from-primary-600 via-primary-700 to-teal-500 border-teal-200/50 shadow-xs';
    }
    if (norm.includes('operator') || norm.includes('chen') || displayInitials === 'MC') {
      return 'bg-gradient-to-tr from-teal-600 to-primary-600 border-teal-200/50 shadow-xs';
    }
    if (norm.includes('admin') || norm.includes('vance') || displayInitials === 'EV') {
      return 'bg-gradient-to-tr from-navy via-deepNavy to-primary-700 border-primary-200/40 shadow-xs';
    }
    return 'bg-gradient-to-tr from-primary-600 to-teal-500 border-primary-200/40 shadow-xs';
  };

  // If no source provided or loading failed, display the initials fallback avatar
  if (!src || hasError) {
    return (
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-bold text-white tracking-wider border select-none flex-shrink-0',
          getGradientStyle(),
          currentSizeClass,
          className
        )}
        title={name || alt}
        aria-label={name || alt || 'User Avatar'}
        role="img"
      >
        <span>{displayInitials}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || name || 'User Avatar'}
      onError={() => setHasError(true)}
      className={cn(
        'rounded-full object-cover border border-slate-200 flex-shrink-0 select-none',
        currentSizeClass,
        className
      )}
    />
  );
}
