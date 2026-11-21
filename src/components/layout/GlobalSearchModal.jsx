import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Shield, File, ArrowRight, X } from 'lucide-react';
import { useClaims } from '../../context/ClaimContext';
import { formatCurrency } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';

export function GlobalSearchModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const { claims, documents } = useClaims();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open parent handler
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const term = searchTerm.toLowerCase().trim();

  const filteredClaims = term
    ? claims.filter(
      c =>
        c.id.toLowerCase().includes(term) ||
        c.claimantName.toLowerCase().includes(term) ||
        c.hospitalName.toLowerCase().includes(term) ||
        c.policyNumber.toLowerCase().includes(term)
    ).slice(0, 5)
    : [];

  const filteredDocs = term
    ? documents.filter(
      d =>
        d.name.toLowerCase().includes(term) ||
        d.category.toLowerCase().includes(term) ||
        d.claimId.toLowerCase().includes(term)
    ).slice(0, 3)
    : [];

  const handleSelectClaim = (claimId) => {
    onClose();
    setSearchTerm('');
    navigate(`/claims/${claimId}`);
  };

  const handleSelectDoc = () => {
    onClose();
    setSearchTerm('');
    navigate('/documents');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-navy/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-dropdown border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search claims by ID, claimant, hospital or documents... (e.g. 8910 or Sterling)"
            autoFocus
            className="w-full text-sm bg-transparent border-0 focus:outline-none placeholder:text-slate-400 text-slate-900"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Search Results Area */}
        <div className="max-h-96 overflow-y-auto p-2">
          {!searchTerm ? (
            <div className="p-6 text-center text-xs text-slate-400">
              <p className="font-medium text-slate-600 mb-1">Quick Search across Claims & Documents</p>
              <p>Type a claim ID (e.g., CLM-2026-8910), patient name, hospital, or policy number.</p>
            </div>
          ) : filteredClaims.length === 0 && filteredDocs.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No matching claims or documents found for <span className="font-semibold text-slate-700">"{searchTerm}"</span>.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredClaims.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Healthcare Claims
                  </div>
                  <div className="space-y-1 mt-1">
                    {filteredClaims.map((claim) => (
                      <div
                        key={claim.id}
                        onClick={() => handleSelectClaim(claim.id)}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-md bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-navy truncate">
                              {claim.id} — {claim.claimantName}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {claim.hospitalName} • {formatCurrency(claim.claimAmount)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <StatusBadge status={claim.status} size="sm" />
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredDocs.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Attached Documents
                  </div>
                  <div className="space-y-1 mt-1">
                    {filteredDocs.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={handleSelectDoc}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                            <File className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-navy truncate">{doc.name}</p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {doc.category} • Linked to {doc.claimId}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={doc.status} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with mouse or keyboard</span>
          <span>ClaimPilot Global Index</span>
        </div>
      </div>
    </div>
  );
}

