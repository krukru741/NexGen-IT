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
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-2">
        <Paperclip className="w-4 h-4 text-orange-600" />
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Attachments</h2>
        <span className="text-[10px] text-gray-500 font-medium ml-auto">Optional</span>
      </div>
      <div className="p-4">
        {/* Drag & Drop Zone */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
            isDragging
              ? 'border-blue-500 bg-blue-50 scale-[1.01]'
              : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Paperclip className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500 mb-2">
            SVG, PNG, JPG or GIF (max. 10MB)
          </p>
          <label className="inline-flex">
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
            />
            <span className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer hover:underline">
              Browse files
            </span>
          </label>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Attached Files</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-200 group hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onFileRemove(index)}
                    className="p-1.5 hover:bg-red-100 rounded-md transition-colors text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                    title="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
