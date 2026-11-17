import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import Tooltip from './Tooltip';

/**
 * Standard clinical dictionary of common medical billing codes and descriptions.
 */
const CLINICAL_CODE_DICTIONARY = {
  // ICD-10 Diagnoses
  I10: { type: 'diagnosis', desc: 'Essential (primary) hypertension' },
  'E11.9': { type: 'diagnosis', desc: 'Type 2 diabetes mellitus without complications' },
  'M54.5': { type: 'diagnosis', desc: 'Low back pain, unspecified' },
  'J45.909': { type: 'diagnosis', desc: 'Unspecified asthma, uncomplicated' },
  'K21.9': { type: 'diagnosis', desc: 'Gastro-esophageal reflux disease without esophagitis' },
  'Z00.00': { type: 'diagnosis', desc: 'Encounter for general adult medical examination' },
  'I21.9': { type: 'diagnosis', desc: 'Acute myocardial infarction, unspecified' },
  'S82.801A': { type: 'diagnosis', desc: 'Fracture of unspecified lower leg, initial encounter' },

  // CPT / HCPCS Procedures
  '99213': { type: 'procedure', desc: 'Office outpatient visit, low complexity, 20-29 min' },
  '99214': { type: 'procedure', desc: 'Office outpatient visit, moderate complexity, 30-39 min' },
  '99285': { type: 'procedure', desc: 'Emergency department visit, high severity/immediate threat' },
  '71045': { type: 'procedure', desc: 'Radiologic examination, chest; single view' },
  '80053': { type: 'procedure', desc: 'Comprehensive metabolic panel (CMP blood test)' },
  '85025': { type: 'procedure', desc: 'Complete blood count (CBC) with automated differential' },
  '93000': { type: 'procedure', desc: 'Electrocardiogram, routine ECG with at least 12 leads' },

  // Revenue Codes
  '0250': { type: 'revenue', desc: 'Pharmacy - General Classification' },
  '0300': { type: 'revenue', desc: 'Laboratory - General Classification' },
  '0450': { type: 'revenue', desc: 'Emergency Room - General Classification' },
  '0110': { type: 'revenue', desc: 'Room & Board - Private (Medical/Surgical)' },
};

/**
 * Reusable CodeBadge component for formatted ICD-10, CPT, HCPCS and Revenue code representation.
 * Includes clinical description tooltips and one-click copy to clipboard.
 */
export default function CodeBadge({
  code,
  description,
  type = 'auto', // 'diagnosis' | 'procedure' | 'revenue' | 'drg' | 'auto'
  copyable = true,
  showDescription = false,
  className = '',
}) {
  const [copied, setCopied] = useState(false);

  if (!code) return null;

  const lookup = CLINICAL_CODE_DICTIONARY[code] || {};
  const resolvedDesc = description || lookup.desc;
  const resolvedType =
    type === 'auto'
      ? lookup.type || (code.match(/^[A-Z][0-9]/) ? 'diagnosis' : 'procedure')
      : type;

  // Category styling
  const styleVariants = {
    diagnosis: 'bg-indigo-50 text-indigo-700 border-indigo-200/90 hover:bg-indigo-100/70',
    procedure: 'bg-teal-50 text-teal-700 border-teal-200/90 hover:bg-teal-100/70',
    revenue: 'bg-amber-50 text-amber-800 border-amber-200/90 hover:bg-amber-100/70',
    drg: 'bg-purple-50 text-purple-700 border-purple-200/90 hover:bg-purple-100/70',
  }[resolvedType] || 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/60';

  const typeLabels = {
    diagnosis: 'ICD-10-CM',
    procedure: 'CPT/HCPCS',
    revenue: 'REV-CODE',
    drg: 'MS-DRG',
  }[resolvedType] || 'CODE';

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!copyable) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const badgeContent = (
    <span
      onClick={copyable ? handleCopy : undefined}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border font-mono text-xs font-semibold tracking-tight transition-colors ${
        copyable ? 'cursor-pointer active:scale-95 select-none' : ''
      } ${styleVariants} ${className}`}
    >
      <span className="text-[9px] font-sans font-bold uppercase tracking-wider opacity-60">
        {typeLabels}
      </span>
      <span>{code}</span>
      {copyable && (
        <span className="opacity-50 hover:opacity-100 transition-opacity ml-0.5">
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
        </span>
      )}
    </span>
  );

  const tooltipText = resolvedDesc
    ? `${code}: ${resolvedDesc} ${copyable ? '(Click to copy)' : ''}`
    : `${typeLabels} ${code} ${copyable ? '(Click to copy)' : ''}`;

  return (
    <div className="inline-flex items-center gap-2">
      <Tooltip content={tooltipText} position="top">
        {badgeContent}
      </Tooltip>
      {showDescription && resolvedDesc && (
        <span className="text-xs text-slate-600 truncate max-w-xs">{resolvedDesc}</span>
      )}
    </div>
  );
}
