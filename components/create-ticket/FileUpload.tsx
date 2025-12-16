import React, { useCallback } from 'react';
import { Paperclip, X } from 'lucide-react';
import { Card } from '../ui';

interface FileUploadProps {
  files: File[];
  onFilesAdd: (files: File[]) => void;
  onFileRemove: (index: number) => void;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onFilesAdd,
  onFileRemove,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesAdd(Array.from(e.target.files));
    }
  };

  return (
    <Card variant="bordered">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h2 className="text-base font-bold text-gray-900">Attachments</h2>
        <p className="text-xs text-gray-500">Upload screenshots or relevant files</p>
      </div>
      <div className="p-4">
        {/* Drag & Drop Zone */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <Paperclip className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-xs text-gray-600 mb-1">
            Drag files here, or{' '}
            <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
              browse
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
              />
            </label>
          </p>
          <p className="text-[10px] text-gray-500">
            Supported: Images, PDF, Word, Text (Max 10MB each)
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-semibold text-gray-700">
              Attached Files ({files.length})
            </p>
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Paperclip className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onFileRemove(index)}
                  className="p-1 hover:bg-red-100 rounded transition-colors flex-shrink-0"
                  title="Remove file"
                >
                  <X className="w-3 h-3 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
