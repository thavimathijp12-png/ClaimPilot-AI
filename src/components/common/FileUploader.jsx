import React, { useState, useRef } from 'react';
import { UploadCloud, File, CheckCircle2, AlertCircle, X, RefreshCw } from 'lucide-react';
import { formatFileSize } from '../../utils/formatters';
import { cn } from '../../utils/cn';

export function FileUploader({
  onUploadComplete,
  acceptedTypes = ['.pdf', '.png', '.jpg', '.jpeg'],
  maxSizeBytes = 15 * 1024 * 1024, // 15MB
  categories = [
    'Hospital Bill',
    'Discharge Summary',
    'Prescription',
    'Claim Form',
    'Other Supporting Documents'
  ],
  claimId = '',
  className = '',
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState(categories[0]);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file) => {
    setError('');
    if (!file) return;

    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedTypes.includes(fileExt)) {
      setError(`Unsupported file format. Please upload PDF, PNG or JPG.`);
      return;
    }

    if (file.size > maxSizeBytes) {
      setError(`File is too large (${formatFileSize(file.size)}). Maximum allowed size is ${formatFileSize(maxSizeBytes)}.`);
      return;
    }

    setSelectedFile(file);
    startSimulatedUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const startSimulatedUpload = (file) => {
    setUploading(true);
    setProgress(10);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setUploading(false);
            setProgress(100);
            if (onUploadComplete) {
              onUploadComplete({
                name: file.name,
                sizeBytes: file.size,
                fileType: file.name.endsWith('.pdf') ? 'PDF' : file.name.endsWith('.png') ? 'PNG' : 'JPG',
                category: category,
                claimId: claimId || 'CLM-2026-8910',
                previewUrl: URL.createObjectURL(file),
              });
            }
          }, 300);
          return 95;
        }
        return prev + 20;
      });
    }, 150);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setProgress(0);
    setUploading(false);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={cn('bg-white p-5 rounded-xl border border-slate-200/90 shadow-subtle', className)}>
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Document Classification Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={uploading}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center',
            dragActive
              ? 'border-primary-500 bg-primary-50/50'
              : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50/50'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-800">
            Click to upload or drag and drop
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Standard medical formats: PDF, PNG, or JPG (max {formatFileSize(maxSizeBytes)})
          </p>
          <span className="mt-3 px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-full">
            Browse Local File
          </span>
        </div>
      ) : (
        <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/60">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center flex-shrink-0">
                <File className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{selectedFile.name}</p>
                <p className="text-[11px] text-slate-500">{formatFileSize(selectedFile.size)} • {category}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              disabled={uploading}
              className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-medium text-slate-600">
                {uploading ? 'Analyzing and uploading document...' : 'Upload complete & ready for verification'}
              </span>
              <span className="font-semibold text-primary-600">{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {!uploading && progress === 100 && (
            <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
              <span className="text-emerald-700 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                OCR Extraction Simulator Ready
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-primary-600 hover:underline flex items-center gap-1 font-medium"
              >
                <RefreshCw className="w-3 h-3" />
                Upload Another
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
