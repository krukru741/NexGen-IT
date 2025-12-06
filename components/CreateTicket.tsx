import React from 'react';
import { TicketCategory, TicketPriority, Ticket } from '../types';
import { analyzeTicketDraft } from '../services/geminiService';
import { Sparkles, Loader2, Send } from 'lucide-react';

interface CreateTicketProps {
  userId: string;
  userName: string;
  onSubmit: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const CreateTicket: React.FC<CreateTicketProps> = ({ userId, userName, onSubmit, onCancel }) => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState<TicketCategory>(TicketCategory.OTHER);
  const [priority, setPriority] = React.useState<TicketPriority>(TicketPriority.LOW);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [aiAnalysisDone, setAiAnalysisDone] = React.useState(false);

  const handleAIAnalyze = async () => {
    if (description.length < 10) return;
    
    setIsAnalyzing(true);
    const analysis = await analyzeTicketDraft(description);
    if (analysis) {
      setCategory(analysis.category);
      setPriority(analysis.priority);
      if (!title) setTitle(analysis.summary);
      setAiAnalysisDone(true);
    }
    setIsAnalyzing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      category,
      priority,
      status: 'OPEN' as any,
      requesterId: userId,
      requesterName: userName,
      tags: []
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
        <h2 className="text-xl font-bold text-gray-900">Create New Support Ticket</h2>
        <p className="text-sm text-gray-500 mt-1">Describe your issue and we'll route it to the right technician.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description of Issue</label>
          <div className="relative">
            <textarea
              required
              className="w-full h-32 p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Please describe the technical issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => {
                  if(description.length > 10 && !aiAnalysisDone && !isAnalyzing) {
                      // Optional: Auto trigger on blur if user hasn't clicked button
                  }
              }}
            />
            <button
              type="button"
              onClick={handleAIAnalyze}
              disabled={isAnalyzing || description.length < 5}
              className="absolute bottom-3 right-3 flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-medium rounded-md hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-sm"
            >
              {isAnalyzing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
              {isAnalyzing ? 'Analyzing...' : 'AI Auto-Fill'}
            </button>
          </div>
          {aiAnalysisDone && (
            <p className="text-xs text-green-600 mt-2 flex items-center animate-pulse">
              <Sparkles className="w-3 h-3 mr-1" />
              Category and Priority suggested by Gemini AI
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Title</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g., Cannot access Email"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory)}
            >
              {Object.values(TicketCategory).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
            >
              {Object.values(TicketPriority).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Ticket
          </button>
        </div>
      </form>
    </div>
  );
};
