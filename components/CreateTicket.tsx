import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketCategory, TicketPriority, TicketStatus } from '../types';
import { analyzeTicketDraft, improveTicketDescription } from '../services/geminiService';
import { Sparkles, Loader2, Send, Paperclip, X, Wand2, FileText, Save, Trash2, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { ToastContainer, Toast } from './Toast';
import { useAuth, useTickets } from '../hooks';
import { STORAGE_KEYS, VALIDATION_RULES, FILE_UPLOAD } from '../utils/constants';

const DRAFT_KEY = STORAGE_KEYS.DRAFT;

// Validation constants
const VALIDATION = {
  TITLE_MAX: VALIDATION_RULES.TITLE_MAX_LENGTH,
  DESCRIPTION_MAX: VALIDATION_RULES.DESCRIPTION_MAX_LENGTH,
  FILE_SIZE_MAX: FILE_UPLOAD.MAX_FILES,
  ALLOWED_FILE_TYPES: FILE_UPLOAD.ALLOWED_TYPES,
  ALLOWED_EXTENSIONS: FILE_UPLOAD.ALLOWED_EXTENSIONS
};

export const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { createTicket } = useTickets();

  if (!currentUser) {
    return null;
  }

  const userId = currentUser.id;
  const userName = currentUser.name;
  const onCancel = () => navigate(-1);
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>(TicketCategory.OTHER);
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.LOW);
  const [files, setFiles] = useState<File[]>([]);
  
  // UI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showDraftAlert, setShowDraftAlert] = useState(false);
  
  // Validation State
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    files?: string;
  }>({});
  const [touched, setTouched] = useState<{
    title?: boolean;
    description?: boolean;
  }>({});

  // Toast State
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Toast Helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Validation Functions
  const validateTitle = (value: string): string | null => {
    if (!value.trim()) return 'Title is required';
    if (value.length > VALIDATION.TITLE_MAX) 
      return `Title must be ${VALIDATION.TITLE_MAX} characters or less`;
    return null;
  };

  const validateDescription = (value: string): string | null => {
    if (!value.trim()) return 'Description is required';
    if (value.length > VALIDATION.DESCRIPTION_MAX) 
      return `Description must be ${VALIDATION.DESCRIPTION_MAX} characters or less`;
    return null;
  };

  const validateFile = (file: File): string | null => {
    if (file.size > VALIDATION.FILE_SIZE_MAX) {
      return `File "${file.name}" exceeds 10MB limit`;
    }
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    // Type-safe check: cast to readonly array for includes check
    if (!(VALIDATION.ALLOWED_EXTENSIONS as readonly string[]).includes(extension)) {
      return `File type "${extension}" is not allowed. Allowed: ${VALIDATION.ALLOWED_EXTENSIONS.join(', ')}`;
    }
    return null;
  };

  // Real-time validation
  useEffect(() => {
    if (touched.title) {
      const error = validateTitle(title);
      setErrors(prev => ({ ...prev, title: error || undefined }));
    }
  }, [title, touched.title]);

  useEffect(() => {
    if (touched.description) {
      const error = validateDescription(description);
      setErrors(prev => ({ ...prev, description: error || undefined }));
    }
  }, [description, touched.description]);

  // Load Draft on Mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.title || parsed.description) {
            setTitle(parsed.title || '');
            setDescription(parsed.description || '');
            setCategory(parsed.category || TicketCategory.OTHER);
            setPriority(parsed.priority || TicketPriority.LOW);
            setShowDraftAlert(true);
            showToast('Draft restored from previous session', 'info');
        }
      } catch (e) {
        console.error("Failed to load draft");
      }
    }
  }, [showToast]);

  // Save Draft on Change (Debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (title || description) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, description, category, priority }));
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [title, description, category, priority]);

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setTitle('');
    setDescription('');
    setCategory(TicketCategory.OTHER);
    setPriority(TicketPriority.LOW);
    setShowDraftAlert(false);
    setErrors({});
    setTouched({});
    showToast('Draft cleared', 'info');
  };

  const handleAIAnalyze = async () => {
    if (description.length < 10) {
      showToast('Please enter at least 10 characters in the description', 'warning');
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeTicketDraft(description);
      if (analysis) {
        setCategory(analysis.category);
        setPriority(analysis.priority);
        if (!title) setTitle(analysis.summary);
        showToast('AI analysis complete! Category and priority auto-filled', 'success');
      }
    } catch (error) {
      showToast('AI analysis failed. Please try again.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAIRefine = async () => {
    if (description.length < 10) {
      showToast('Please enter at least 10 characters to refine', 'warning');
      return;
    }
    
    setIsRefining(true);
    try {
      const improved = await improveTicketDescription(description);
      if (improved) {
        setDescription(improved);
        showToast('Description improved by AI', 'success');
      }
    } catch (error) {
      showToast('AI refinement failed. Please try again.', 'error');
    } finally {
      setIsRefining(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ title: true, description: true });
    
    // Validate all fields
    const titleError = validateTitle(title);
    const descError = validateDescription(description);
    
    if (titleError || descError) {
      setErrors({
        title: titleError || undefined,
        description: descError || undefined
      });
      showToast('Please fix the errors before submitting', 'error');
      return;
    }

    // In a real app, upload files here and get URLs
    const mockAttachmentUrls = files.map(f => URL.createObjectURL(f));
    
    createTicket({
      title,
      description,
      category,
      priority,
      status: TicketStatus.OPEN,
      requesterId: userId,
      requesterName: userName,
      tags: [],
      attachments: mockAttachmentUrls
    });
    localStorage.removeItem(DRAFT_KEY);
    showToast('Ticket submitted successfully!', 'success');
    
    // Navigate to my tickets after creation
    setTimeout(() => navigate('/my-tickets'), 1000);
  };

  // Drag & Drop Handlers
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles: File[] = Array.from(e.dataTransfer.files);
      const validFiles: File[] = [];
      
      newFiles.forEach((file: File) => {
        const error = validateFile(file);
        if (error) {
          showToast(error, 'error');
        } else {
          validFiles.push(file);
        }
      });
      
      if (validFiles.length > 0) {
        setFiles(prev => [...prev, ...validFiles]);
        showToast(`${validFiles.length} file(s) added`, 'success');
      }
    }
  }, [showToast]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: File[] = Array.from(e.target.files);
      const validFiles: File[] = [];
      
      newFiles.forEach((file: File) => {
        const error = validateFile(file);
        if (error) {
          showToast(error, 'error');
        } else {
          validFiles.push(file);
        }
      });
      
      if (validFiles.length > 0) {
        setFiles(prev => [...prev, ...validFiles]);
        showToast(`${validFiles.length} file(s) added`, 'success');
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    showToast('File removed', 'info');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Mock Suggestions based on keywords
  const showSuggestions = description.toLowerCase().includes('printer') || 
                          description.toLowerCase().includes('vpn') ||
                          description.toLowerCase().includes('password');

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit(e as any);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, description, category, priority, files]);

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 pb-10">
        {/* Main Form */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white flex justify-between items-center">
                  <div>
                      <h2 className="text-xl font-bold text-gray-900">Create New Support Ticket</h2>
                      <p className="text-sm text-gray-500 mt-1">Submit a request and we'll help you fix it.</p>
                      <p className="text-xs text-gray-400 mt-1">💡 Tip: Press Ctrl+Enter to submit</p>
                  </div>
                  {showDraftAlert && (
                      <div className="hidden sm:flex items-center text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 animate-fade-in">
                          <Save className="w-3 h-3 mr-1.5" /> Draft restored
                          <button onClick={clearDraft} className="ml-2 hover:text-amber-800" aria-label="Clear draft">
                            <X className="w-3 h-3"/>
                          </button>
                      </div>
                  )}
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Title */}
                  <div>
                      <div className="flex justify-between items-center mb-1">
                        <label htmlFor="ticket-title" className="block text-sm font-medium text-gray-700">
                          Ticket Subject <span className="text-red-500">*</span>
                        </label>
                        <span className={`text-xs ${title.length > VALIDATION.TITLE_MAX ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                          {title.length}/{VALIDATION.TITLE_MAX}
                        </span>
                      </div>
                      <input
                          id="ticket-title"
                          type="text"
                          required
                          className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow ${
                            errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Brief summary of the issue (e.g., Cannot access Corporate VPN)"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          onBlur={() => setTouched(prev => ({ ...prev, title: true }))}
                          aria-describedby={errors.title ? "title-error" : undefined}
                          aria-invalid={!!errors.title}
                      />
                      {errors.title && (
                        <p id="title-error" className="mt-1 text-xs text-red-600 flex items-center" role="alert">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {errors.title}
                        </p>
                      )}
                  </div>

                  {/* Description */}
                  <div>
                      <div className="flex justify-between items-center mb-2">
                          <label htmlFor="ticket-description" className="block text-sm font-medium text-gray-700">
                            Detailed Description <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center space-x-3">
                              <span className={`text-xs ${description.length > VALIDATION.DESCRIPTION_MAX ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                                {description.length}/{VALIDATION.DESCRIPTION_MAX}
                              </span>
                              <button
                                  type="button"
                                  onClick={handleAIRefine}
                                  disabled={isRefining || description.length < 10}
                                  className="flex items-center text-xs text-purple-600 hover:text-purple-700 disabled:opacity-50 transition-colors"
                                  aria-label="Improve writing with AI"
                              >
                                  {isRefining ? <Loader2 className="w-3 h-3 mr-1 animate-spin"/> : <Wand2 className="w-3 h-3 mr-1"/>}
                                  Improve Writing
                              </button>
                          </div>
                      </div>
                      <div className="relative">
                          <textarea
                              id="ticket-description"
                              required
                              className={`w-full h-48 p-4 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed ${
                                errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="Please include error messages, steps to reproduce, and what you were doing when the issue occurred..."
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              onBlur={() => setTouched(prev => ({ ...prev, description: true }))}
                              aria-describedby={errors.description ? "description-error" : "description-help"}
                              aria-invalid={!!errors.description}
                          />
                          <button
                              type="button"
                              onClick={handleAIAnalyze}
                              disabled={isAnalyzing || description.length < 10}
                              className="absolute bottom-4 right-4 flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium rounded-md hover:bg-blue-100 transition-all disabled:opacity-50"
                              aria-label="Auto-fill category and priority with AI"
                          >
                              {isAnalyzing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                              Auto-Fill Details
                          </button>
                      </div>
                      {errors.description && (
                        <p id="description-error" className="mt-1 text-xs text-red-600 flex items-center" role="alert">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {errors.description}
                        </p>
                      )}
                      {!errors.description && (
                        <p id="description-help" className="mt-1 text-xs text-gray-500">
                          Provide as much detail as possible to help us resolve your issue quickly.
                        </p>
                      )}
                  </div>

                  {/* Attachments Dropzone */}
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Attachments (Optional)
                      </label>
                      <div 
                          onDragOver={onDragOver}
                          onDragLeave={onDragLeave}
                          onDrop={onDrop}
                          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50'}`}
                          role="button"
                          tabIndex={0}
                          aria-label="Upload files"
                      >
                          <div className="flex flex-col items-center justify-center">
                              <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                                  <Paperclip className={`w-6 h-6 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                              </div>
                              <p className="text-sm text-gray-600">
                                  <label htmlFor="file-upload" className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                                    Upload a file
                                  </label> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Images, PDFs, Docs up to 10MB
                              </p>
                              <input 
                                  id="file-upload"
                                  type="file" 
                                  className="hidden" 
                                  multiple 
                                  onChange={handleFileInput}
                                  accept={VALIDATION.ALLOWED_EXTENSIONS.join(',')}
                                  aria-label="Choose files to upload"
                              />
                          </div>
                      </div>

                      {/* File List */}
                      {files.length > 0 && (
                          <div className="mt-4 space-y-2" role="list" aria-label="Uploaded files">
                              {files.map((file, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100" role="listitem">
                                      <div className="flex items-center flex-1 min-w-0">
                                          <FileText className="w-4 h-4 text-blue-500 mr-3 flex-shrink-0" />
                                          <div className="flex flex-col min-w-0">
                                              <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
                                              <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                                          </div>
                                      </div>
                                      <button 
                                          type="button" 
                                          onClick={() => removeFile(index)} 
                                          className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-red-500 ml-2 flex-shrink-0"
                                          aria-label={`Remove ${file.name}`}
                                      >
                                          <X className="w-4 h-4" />
                                      </button>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>

                  {/* Mobile Actions */}
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100 lg:hidden">
                      <button
                          type="button"
                          onClick={onCancel}
                          className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                          Cancel
                      </button>
                      <button
                          type="submit"
                          className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center shadow-sm"
                      >
                          <Send className="w-4 h-4 mr-2" />
                          Submit Ticket
                      </button>
                  </div>
              </form>
          </div>
        </div>

        {/* Sidebar (Context & Settings) */}
        <div className="w-full lg:w-80 space-y-6">
           {/* Classification Card */}
           <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-gray-500"/> Ticket Details
              </h3>
              
              <div className="space-y-4">
                  <div>
                      <label htmlFor="ticket-category" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                        Category
                      </label>
                      <select
                          id="ticket-category"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          value={category}
                          onChange={(e) => setCategory(e.target.value as TicketCategory)}
                          aria-label="Select ticket category"
                      >
                          {Object.values(TicketCategory).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                  </div>

                  <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                        Priority
                      </label>
                      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Select priority level">
                          {Object.values(TicketPriority).map(p => (
                              <button
                                  key={p}
                                  type="button"
                                  onClick={() => setPriority(p)}
                                  className={`px-2 py-2 text-xs font-medium rounded-lg border transition-all
                                      ${priority === p 
                                          ? p === TicketPriority.CRITICAL ? 'bg-red-50 border-red-200 text-red-700 ring-1 ring-red-500'
                                          : p === TicketPriority.HIGH ? 'bg-orange-50 border-orange-200 text-orange-700 ring-1 ring-orange-500'
                                          : 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-500'
                                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                      }`}
                                  role="radio"
                                  aria-checked={priority === p}
                                  aria-label={`Priority: ${p}`}
                              >
                                  {p}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
           </div>

           {/* Smart Suggestions (Mock) */}
           {showSuggestions && (
               <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-xl border border-blue-100 animate-fade-in">
                  <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center">
                      <HelpCircle className="w-4 h-4 mr-2"/> Suggested Solutions
                  </h3>
                  <div className="space-y-3">
                      <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                          <span className="text-xs font-semibold text-blue-600 block mb-1">Article #104</span>
                          <p className="text-sm text-gray-800 font-medium leading-tight">Troubleshooting VPN Connection Timeouts</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                           <span className="text-xs font-semibold text-blue-600 block mb-1">Article #82</span>
                           <p className="text-sm text-gray-800 font-medium leading-tight">How to reset your domain password</p>
                      </div>
                      <p className="text-xs text-center text-gray-500 mt-2">Does this solve your issue?</p>
                  </div>
               </div>
           )}

           {/* Desktop Actions */}
           <div className="hidden lg:flex flex-col gap-3">
               <button
                  type="button"
                  onClick={(e) => handleSubmit(e as any)}
                  className="w-full px-4 py-3 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md transition-all flex items-center justify-center"
              >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Ticket
              </button>
              <div className="flex gap-3">
                  <button
                      type="button"
                      onClick={clearDraft}
                      className="flex-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100"
                      aria-label="Clear draft"
                  >
                      <Trash2 className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                      type="button"
                      onClick={onCancel}
                      className="flex-[3] px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                      Cancel
                  </button>
              </div>
           </div>
        </div>
      </div>
    </>
  );
};