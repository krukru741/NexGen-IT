import React, { useState, useEffect, useCallback } from 'react';
import { TicketCategory, TicketPriority, Ticket } from '../types';
import { analyzeTicketDraft, improveTicketDescription } from '../services/geminiService';
import { Sparkles, Loader2, Send, Paperclip, X, Wand2, FileText, Save, Trash2, HelpCircle, AlertCircle } from 'lucide-react';

interface CreateTicketProps {
  userId: string;
  userName: string;
  onSubmit: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const DRAFT_KEY = 'nexgen_ticket_draft';

export const CreateTicket: React.FC<CreateTicketProps> = ({ userId, userName, onSubmit, onCancel }) => {
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
        }
      } catch (e) {
        console.error("Failed to load draft");
      }
    }
  }, []);

  // Save Draft on Change (Debounced effect equivalent)
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
  };

  const handleAIAnalyze = async () => {
    if (description.length < 10) return;
    
    setIsAnalyzing(true);
    const analysis = await analyzeTicketDraft(description);
    if (analysis) {
      setCategory(analysis.category);
      setPriority(analysis.priority);
      if (!title) setTitle(analysis.summary);
    }
    setIsAnalyzing(false);
  };

  const handleAIRefine = async () => {
    if (description.length < 10) return;
    setIsRefining(true);
    const improved = await improveTicketDescription(description);
    if (improved) {
      setDescription(improved);
    }
    setIsRefining(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, upload files here and get URLs
    const mockAttachmentUrls = files.map(f => URL.createObjectURL(f)); // Temporary blob URLs for demo
    
    onSubmit({
      title,
      description,
      category,
      priority,
      status: 'OPEN' as any,
      requesterId: userId,
      requesterName: userName,
      tags: [],
      attachments: mockAttachmentUrls
    });
    localStorage.removeItem(DRAFT_KEY);
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
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Mock Suggestions based on keywords
  const showSuggestions = description.toLowerCase().includes('printer') || 
                          description.toLowerCase().includes('vpn') ||
                          description.toLowerCase().includes('password');

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 pb-10">
      {/* Main Form */}
      <div className="flex-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Create New Support Ticket</h2>
                    <p className="text-sm text-gray-500 mt-1">Submit a request and we'll help you fix it.</p>
                </div>
                {showDraftAlert && (
                    <div className="hidden sm:flex items-center text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 animate-fade-in">
                        <Save className="w-3 h-3 mr-1.5" /> Draft restored
                        <button onClick={clearDraft} className="ml-2 hover:text-amber-800"><X className="w-3 h-3"/></button>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Subject</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                        placeholder="Brief summary of the issue (e.g., Cannot access Corporate VPN)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* Description */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Detailed Description</label>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={handleAIRefine}
                                disabled={isRefining || description.length < 10}
                                className="flex items-center text-xs text-purple-600 hover:text-purple-700 disabled:opacity-50 transition-colors"
                            >
                                {isRefining ? <Loader2 className="w-3 h-3 mr-1 animate-spin"/> : <Wand2 className="w-3 h-3 mr-1"/>}
                                Improve Writing
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <textarea
                            required
                            className="w-full h-48 p-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed"
                            placeholder="Please include error messages, steps to reproduce, and what you were doing when the issue occurred..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={handleAIAnalyze}
                            disabled={isAnalyzing || description.length < 10}
                            className="absolute bottom-4 right-4 flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium rounded-md hover:bg-blue-100 transition-all disabled:opacity-50"
                        >
                            {isAnalyzing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                            Auto-Fill Details
                        </button>
                    </div>
                </div>

                {/* Attachments Dropzone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Attachments (Optional)</label>
                    <div 
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50'}`}
                    >
                        <div className="flex flex-col items-center justify-center">
                            <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                                <Paperclip className={`w-6 h-6 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                            </div>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium text-blue-600 hover:text-blue-500">Upload a file</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 10MB</p>
                            <input 
                                type="file" 
                                className="hidden" 
                                multiple 
                                onChange={(e) => {
                                    if(e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)])
                                }}
                            />
                        </div>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center">
                                        <FileText className="w-4 h-4 text-blue-500 mr-3" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{file.name}</span>
                                            <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</span>
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => removeFile(index)} 
                                        className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-red-500"
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
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Category</label>
                    <select
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as TicketCategory)}
                    >
                        {Object.values(TicketCategory).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Priority</label>
                    <div className="grid grid-cols-2 gap-2">
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
  );
};