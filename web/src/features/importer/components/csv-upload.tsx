'use client';

import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, FileSpreadsheet, X, ArrowUpRight } from 'lucide-react';

interface CSVUploadProps {
  onFileSelect: (file: File) => void;
  error: string | null;
}

export function CSVUpload({ onFileSelect, error }: CSVUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        setLocalFile(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setLocalFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProceed = () => {
    if (localFile) {
      onFileSelect(localFile);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col items-center w-full animate-fade-in">
      {!localFile ? (
        <div 
          tabIndex={0}
          role="button"
          aria-label="Upload CSV File Dropzone"
          aria-describedby="upload-description"
          className={`w-full max-w-2xl border-2 border-dashed rounded-2xl p-12 sm:p-16 text-center transition-all duration-300 relative cursor-pointer focus-ring group
            ${isDragActive 
              ? 'border-confirm bg-confirm/5 scale-[1.01] shadow-neon-glow' 
              : 'border-line bg-panel hover:border-confirm/40 hover:bg-panel2 shadow-neon-card'
            }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              onButtonClick();
            }
          }}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            id="csv-file-input"
            className="sr-only" 
            accept=".csv"
            onChange={handleChange}
          />
          
          <div className="flex flex-col items-center">
            <div className="bg-confirm/10 p-4 rounded-full mb-6 group-hover:scale-105 transition-transform duration-300" style={{ color: '#4FD1C5' }}>
              <Upload size={36} aria-hidden="true" className="animate-float" />
            </div>
            <h3 className="text-xl font-bold mb-2 tracking-tight" style={{ color: '#F3F1EA', fontFamily: "'Space Grotesk', sans-serif" }}>Upload your CSV file</h3>
            <p id="upload-description" className="text-sm mb-6 max-w-sm mx-auto" style={{ color: '#9AA4B1' }}>
              Drag and drop your file here, or click to browse. Only valid CSV format is accepted.
            </p>
            <button 
              type="button" 
              tabIndex={-1}
              className="px-6 py-3 font-semibold rounded-xl transition-all duration-300 shadow-md group-hover:shadow-lg cursor-pointer"
              style={{
                background: '#4FD1C5',
                color: '#0A0D12',
              }}
            >
              Select CSV File
            </button>
          </div>
        </div>
      ) : (
        <div 
          className="w-full max-w-2xl border rounded-2xl p-6 sm:p-8 bg-panel2 shadow-neon-card animate-slide-up"
          style={{ borderColor: '#212B34' }}
        >
          <div className="flex items-center justify-between gap-4 border-b pb-6 mb-6" style={{ borderColor: '#212B34' }}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-confirm/10 p-3 rounded-xl" style={{ color: '#4FD1C5' }}>
                <FileSpreadsheet size={24} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-base truncate" style={{ color: '#F3F1EA' }}>{localFile.name}</h4>
                <p className="text-xs mt-0.5" style={{ color: '#9AA4B1' }}>{formatFileSize(localFile.size)}</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={clearFile}
              className="p-2 rounded-lg border hover:bg-ink transition-colors focus-ring cursor-pointer"
              style={{ borderColor: '#212B34', color: '#9AA4B1' }}
              aria-label="Remove selected file"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button 
              type="button"
              onClick={clearFile}
              className="px-5 py-2.5 rounded-xl font-medium border hover:bg-ink transition-colors focus-ring cursor-pointer text-sm"
              style={{ borderColor: '#212B34', color: '#9AA4B1' }}
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleProceed}
              className="px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg focus-ring cursor-pointer flex items-center justify-center gap-1.5 text-sm"
              style={{
                background: '#4FD1C5',
                color: '#0A0D12',
              }}
            >
              Analyze & Preview
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div 
          className="flex items-center gap-3 border px-5 py-4 rounded-xl mt-6 w-full max-w-2xl"
          style={{
            background: 'rgba(255, 122, 69, 0.1)',
            borderColor: 'rgba(255, 122, 69, 0.2)',
            color: '#F3F1EA'
          }}
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle size={20} style={{ color: '#FF7A45' }} className="shrink-0" aria-hidden="true" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}

export default CSVUpload;
