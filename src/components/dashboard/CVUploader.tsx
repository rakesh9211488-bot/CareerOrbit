'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Cloud, X, FileText } from 'lucide-react';
import clsx from 'clsx';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface CVUploaderProps {
  onUpload: (file: File) => Promise<void>;
  isProcessing?: boolean;
  processingMessage?: string;
}

export function CVUploader({
  onUpload,
  isProcessing = false,
  processingMessage = 'Processing your CV...',
}: CVUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      
      if (acceptedFiles.length === 0) {
        setError('Please upload a PDF file');
        return;
      }

      const file = acceptedFiles[0];
      
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are supported');
        return;
      }

      setSelectedFile(file);
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled: isProcessing,
  });

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    
    try {
      setError(null);
      await onUpload(selectedFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={clsx(
          'relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer',
          isDragActive || isHovering
            ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20'
            : 'border-indigo-500/40 bg-indigo-500/5 hover:border-indigo-500/60'
        )}
      >
        <input {...getInputProps()} />

        {!selectedFile ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-indigo-500/20 rounded-lg">
                <Cloud className="w-8 h-8 text-indigo-400" />
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-100">Drag & drop your CV here</p>
              <p className="text-sm text-gray-400 mt-1">or click to browse</p>
            </div>
            <p className="text-xs text-gray-500">PDF files only — no size limit</p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-100">{selectedFile.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            {!isProcessing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-red-400" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div className="space-y-4 p-6 bg-surface border border-gray-700 rounded-lg">
          <ProgressBar isIndeterminate />
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-gray-200 animate-pulse">
              {processingMessage}
            </p>
            <p className="text-xs text-gray-500">This may take a minute...</p>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && !isProcessing && (
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all"
        >
          Analyze & Match Jobs →
        </button>
      )}
    </div>
  );
}
