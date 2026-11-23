import React, { useState } from 'react';
import { useToast } from '../hooks/useToast';
import {
  HelpCircle,
  BookOpen,
  Workflow,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
  FileCheck,
  Sparkles,
  UserCheck,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';

export function HelpPage() {
  const toast = useToast();

  const [expandedFaq, setExpandedFaq] = useState(0);

  // Contact Support Form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Technical Issue');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const faqs = [
    {
      q: 'What is ClaimPilot AI and how does it assist claims operations?',
      a: 'ClaimPilot AI is a specialized enterprise platform engineered to streamline healthcare claim intake, automate document classification, simulate intelligent OCR extraction, and execute 24+ automated data quality checks via DataGuard IQ prior to human clinical adjudication.'
    },
    {
      q: 'Does ClaimPilot AI automatically approve claims without human intervention?',
      a: 'Never. In accordance with strict clinical governance, AI extractions and quality scores are strictly decision-support suggestions. Final adjudication decisions (Approve, Reject, or Request Correction) require mandatory affirmative action by an authorized human clinical reviewer.'
    },
    {
      q: 'What does a "Duplicate Warning" signify in DataGuard IQ?',
      a: 'A duplicate warning indicates a potential temporal or procedural overlap—such as multiple encounters within a short timeframe or duplicate procedure codes. A duplicate warning reflects potential administrative overlap requiring human verification, not proof of fraud.'
    },
    {
      q: 'Which document formats are supported for OCR ingestion?',
      a: 'ClaimPilot AI supports PDF, PNG, and JPG formats up to 15MB. It handles CMS-1500 universal forms, hospital UB-04 ledgers, operative notes, emergency room triage forms, and outpatient prescriptions.'
    },
    {
      q: 'How does the human-in-the-loop AI Extraction Review workflow work?',
      a: 'Operators review split-screen OCR results where the original document is shown side-by-side with extracted fields. Operators can click any field to see its bounding box, edit values directly, resolve low confidence flags, and mark the document as verified.'
    }
  ];

  const handleSendTicket = (e) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      toast.warning('Incomplete Request', 'Please fill in both a subject and message.');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast.success('Inquiry Submitted', 'Support ticket logged with reference #CP-TICK-' + Math.floor(1000 + Math.random() * 9000));
      setTicketSubject('');
      setTicketMessage('');
    }, 600);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Base & Operational Support"
        description="Comprehensive guides for healthcare claims intake, DataGuard IQ quality scoring, and human adjudication procedures."
      />

      {/* Workflow Step-by-Step Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-subtle space-y-4">
        <h2 className="text-sm font-bold text-navy flex items-center gap-2">
          <Workflow className="w-4 h-4 text-primary-600" />
          The ClaimPilot 5-Stage Healthcare Adjudication Lifecycle
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
            <span className="w-5 h-5 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-[10px] mb-2">1</span>
            <p className="font-bold text-navy">Claim Ingestion</p>
            <p className="text-[11px] text-slate-500">Electronic portal registration and policy cross-referencing.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
            <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-[10px] mb-2">2</span>
            <p className="font-bold text-navy">Document Intake</p>
            <p className="text-[11px] text-slate-500">Upload bills, discharge notes, operative reports, and Rx.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
            <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-[10px] mb-2">3</span>
            <p className="font-bold text-navy">AI OCR Review</p>
            <p className="text-[11px] text-slate-500">Split-screen optical verification with confidence metrics.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] mb-2">4</span>
            <p className="font-bold text-navy">DataGuard IQ</p>
            <p className="text-[11px] text-slate-500">24 automated integrity and calculation consistency checks.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] mb-2">5</span>
            <p className="font-bold text-navy">Adjudication</p>
            <p className="text-[11px] text-slate-500">Licensed clinical reviewer approves, denies, or requests fixes.</p>
          </div>
        </div>
      </div>

      {/* Grid: FAQs & Contact Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive FAQ Accordion (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200/90 shadow-subtle space-y-4">
          <h2 className="text-sm font-bold text-navy flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-600" />
            Frequently Asked Operational Questions
          </h2>

          <div className="space-y-3 pt-2">
            {faqs.map((faq, index) => {
              const isExpanded = expandedFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 overflow-hidden transition-all text-xs"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isExpanded ? null : index)}
                    className="w-full p-3.5 text-left font-bold text-navy bg-slate-50/70 hover:bg-slate-100/70 flex items-center justify-between gap-3 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="p-3.5 bg-white text-slate-600 leading-relaxed border-t border-slate-100 text-[11px] sm:text-xs">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Contact Support Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-navy flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-primary-600" />
              Contact Operations Helpdesk
            </h2>
            <p className="text-xs text-content-muted mb-4">
              Submit a support inquiry or escalate a complex adjudication edge-case.
            </p>

            <form onSubmit={handleSendTicket} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inquiry Category
                </label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:border-primary-500"
                >
                  <option value="Technical Issue">Technical Platform Issue</option>
                  <option value="Clinical Rule Exception">DataGuard Rule Exception</option>
                  <option value="OCR Inaccuracy">OCR Recognition Correction</option>
                  <option value="Compliance Request">HIPAA Compliance Audit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g., Assistance with CMS-1500 multi-procedure line item"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Inquiry Description
                </label>
                <textarea
                  rows={4}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Provide relevant claim references, dates of service, or hospital identifiers..."
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Transmitting Ticket...' : 'Submit Support Ticket'}</span>
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            24/7 Clinical Support Hotline: (800) 555-CLAIM • SLA: &lt; 15 mins
          </div>
        </div>
      </div>
    </div>
  );
}

