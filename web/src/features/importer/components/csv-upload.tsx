'use client';

import React, { useState, useRef } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

interface CSVUploadProps {
  onFileSelect: (file: File) => void;
  error: string | null;
}

export function CSVUpload({ onFileSelect, error }: CSVUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
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
        onFileSelect(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onButtonClick();
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div 
        tabIndex={0}
        role="button"
        aria-label="Upload CSV File Dropzone"
        aria-describedby="upload-description"
        className={`w-full max-w-2xl border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 relative cursor-pointer focus-ring
          ${isDragActive 
            ? 'border-confirm bg-confirm/5 scale-[1.01] shadow-neon-glow' 
            : 'border-line bg-panel hover:border-confirm/50 hover:bg-panel2 shadow-neon-card'
          }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        onKeyDown={handleKeyDown}
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
          <div className="bg-confirm/10 p-4 rounded-full mb-6 animate-float" style={{ color: '#4FD1C5' }}>
            <Upload size={36} aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#F3F1EA', fontFamily: "'Space Grotesk', sans-serif" }}>Upload your CSV file</h3>
          <p id="upload-description" className="text-sm mb-6 max-w-sm mx-auto" style={{ color: '#9AA4B1' }}>
            Drag and drop your file here, or click to browse. Only valid CSV format is accepted.
          </p>
          <button 
            type="button" 
            tabIndex={-1} // Handled by outer container tabIndex
            className="px-6 py-3 font-semibold rounded-xl transition-all duration-300 shadow-lg cursor-pointer"
            style={{
              background: '#4FD1C5',
              color: '#0A0D12',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onButtonClick();
            }}
          >
            Select CSV File
          </button>
        </div>
      </div>

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
