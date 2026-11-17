import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Modal } from './Modal';
import { cn } from '../../utils/cn';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary', // 'primary', 'success', 'danger', 'warning'
  requireText = false,
  textLabel = 'Reason / Justification',
  textPlaceholder = 'Please enter detailed notes...',
  textRequired = false,
  isLoading = false,
}) {
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (textRequired && !inputText.trim()) {
      setError(`A ${textLabel.toLowerCase()} is mandatory to proceed.`);
      return;
    }
    setError('');
    onConfirm(inputText.trim());
    setInputText('');
  };

  const handleClose = () => {
    setInputText('');
    setError('');
    onClose();
  };

  const config = {
    primary: {
      icon: AlertCircle,
      iconBg: 'bg-primary-50 text-primary-600 border-primary-200',
      confirmBtn: 'bg-primary-600 hover:bg-primary-700 text-white',
    },
    success: {
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    danger: {
      icon: AlertCircle,
      iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
      confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
  }[variant] || {
    icon: AlertCircle,
    iconBg: 'bg-primary-50 text-primary-600 border-primary-200',
    confirmBtn: 'bg-primary-600 hover:bg-primary-700 text-white',
  };

  const Icon = config.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="max-w-md"
      title={title}
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5',
              config.confirmBtn
            )}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={cn('p-2 rounded-lg border flex-shrink-0', config.iconBg)}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-0.5">
            {message}
          </div>
        </div>

        {requireText && (
          <div className="mt-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {textLabel} {textRequired && <span className="text-rose-500">*</span>}
            </label>
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (error) setError('');
              }}
              placeholder={textPlaceholder}
              className={cn(
                'w-full text-xs p-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors resize-none',
                error ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-white'
              )}
            />
            {error && <p className="text-[11px] text-rose-600 mt-1 font-medium">{error}</p>}
          </div>
        )}
      </div>
    </Modal>
  );
}
