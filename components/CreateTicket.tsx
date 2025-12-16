import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketCategory, TicketPriority, TicketStatus } from '../types';
import { analyzeTicketDraft, improveTicketDescription } from '../services/geminiService';
import { Send, Save, Trash2, AlertCircle } from 'lucide-react';
import { ToastContainer, Toast } from './Toast';
import { useAuth, useTickets } from '../hooks';
import { STORAGE_KEYS, VALIDATION_RULES, FILE_UPLOAD } from '../utils/constants';
import { Button, Card } from './ui';
import { TicketForm } from './create-ticket/TicketForm';
import { FileUpload } from './create-ticket/FileUpload';
import { AIAssistant } from './create-ticket/AIAssistant';

const DRAFT_KEY = STORAGE_KEYS.DRAFT;

const VALIDATION = {
  TITLE_MAX: VALIDATION_RULES.TITLE_MAX_LENGTH,
  DESCRIPTION_MAX: VALIDATION_RULES.DESCRIPTION_MAX_LENGTH,
  FILE_SIZE_MAX: FILE_UPLOAD.MAX_FILES,
  ALLOWED_EXTENSIONS: FILE_UPLOAD.ALLOWED_EXTENSIONS
};

export const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { createTicket } = useTickets();

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
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [touched, setTouched] = useState<{ title?: boolean; description?: boolean }>({});

  // Toast State
  const [toasts, setToasts] = useState<Toast[]>([]);

  if (!currentUser) {
    return null;
  }

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Validation
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
    if (!(VALIDATION.ALLOWED_EXTENSIONS as readonly string[]).includes(extension)) {
      return `File type "${extension}" is not allowed`;
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

  // Draft management
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setShowDraftAlert(true);
        setTimeout(() => {
          if (window.confirm('Load saved draft?')) {
            setTitle(draft.title || '');
            setDescription(draft.description || '');
            setCategory(draft.category || TicketCategory.OTHER);
            setPriority(draft.priority || TicketPriority.LOW);
          }
          setShowDraftAlert(false);
        }, 500);
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (title || description) {
      const draft = { title, description, category, priority };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  }, [title, description, category, priority]);

  // AI Functions
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      // Pass combined text for better analysis since the service only takes one string
      const fullText = `${title}\n\n${description}`;
      const analysis = await analyzeTicketDraft(fullText);
      
      if (analysis) {
        if (analysis.category) setCategory(analysis.category);
        if (analysis.priority) setPriority(analysis.priority);
        showToast('Ticket analyzed! Category and Priority updated.', 'success');
      } else {
        showToast('Could not analyze ticket details.', 'warning');
      }
    } catch (error) {
      showToast('Failed to analyze ticket', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRefine = async () => {
    setIsRefining(true);
    try {
      const improved = await improveTicketDescription(description);
      if (improved) {
        setDescription(improved);
        showToast('Description improved!', 'success');
      } else {
        showToast('Could not improve description.', 'warning');
      }
    } catch (error) {
      showToast('Failed to improve description', 'error');
    } finally {
      setIsRefining(false);
    }
  };

  // File handlers
  const handleFilesAdd = (newFiles: File[]) => {
    const validFiles: File[] = [];
    newFiles.forEach(file => {
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
  };

  const handleFileRemove = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    showToast('File removed', 'info');
  };

  // Drag & Drop
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
      handleFilesAdd(Array.from(e.dataTransfer.files));
    }
  }, []);

  // Submit
  const handleSubmit = () => {
    setTouched({ title: true, description: true });
    
    const titleError = validateTitle(title);
    const descError = validateDescription(description);
    
    if (titleError || descError) {
      setErrors({ title: titleError || undefined, description: descError || undefined });
      showToast('Please fix the errors before submitting', 'error');
      return;
    }

    const mockAttachmentUrls = files.map(f => URL.createObjectURL(f));
    
    createTicket({
      title,
      description,
      category,
      priority,
      status: TicketStatus.OPEN,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      tags: [],
      attachments: mockAttachmentUrls
    });
    
    localStorage.removeItem(DRAFT_KEY);
    showToast('Ticket submitted successfully!', 'success');
    setTimeout(() => navigate('/my-tickets'), 1000);
  };

  const handleClearDraft = () => {
    if (window.confirm('Clear all fields?')) {
      setTitle('');
      setDescription('');
      setCategory(TicketCategory.OTHER);
      setPriority(TicketPriority.LOW);
      setFiles([]);
      localStorage.removeItem(DRAFT_KEY);
      showToast('Draft cleared', 'info');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Create Support Ticket</h1>
          <p className="text-sm text-gray-500">Submit a new support request</p>
        </div>
      </div>

      {showDraftAlert && (
        <Card variant="bordered">
          <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 flex items-start">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 mr-3" />
            <p className="text-xs text-yellow-800">Loading saved draft...</p>
          </div>
        </Card>
      )}

      <TicketForm
        title={title}
        description={description}
        category={category}
        priority={priority}
        errors={errors}
        touched={touched}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onCategoryChange={setCategory}
        onPriorityChange={setPriority}
        onBlur={(field) => setTouched(prev => ({ ...prev, [field]: true }))}
      />

      <FileUpload
        files={files}
        onFilesAdd={handleFilesAdd}
        onFileRemove={handleFileRemove}
        isDragging={isDragging}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      />

      <AIAssistant
        title={title}
        description={description}
        isAnalyzing={isAnalyzing}
        isRefining={isRefining}
        onAnalyze={handleAnalyze}
        onRefine={handleRefine}
      />

      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          icon={<Send className="w-4 h-4" />}
          size="md"
        >
          Submit Ticket
        </Button>
        <Button
          onClick={handleClearDraft}
          variant="ghost"
          icon={<Trash2 className="w-4 h-4" />}
          size="md"
        >
          Clear Draft
        </Button>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};