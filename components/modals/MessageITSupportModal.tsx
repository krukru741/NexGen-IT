import React, { useState } from 'react';
import { X, Send, User as UserIcon } from 'lucide-react';
import { User } from '../../types';
import { db } from '../../services/mockDatabase';

interface MessageITSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  supportStaff: User;
  currentUser: User;
}

export const MessageITSupportModal: React.FC<MessageITSupportModalProps> = ({ isOpen, onClose, supportStaff, currentUser }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      return;
    }

    setIsSending(true);

    try {
      // Save message to database
      db.addMessage({
        from: currentUser.id,
        fromName: currentUser.name,
        to: supportStaff.id,
        toName: supportStaff.name,
        subject: subject.trim(),
        message: message.trim(),
        read: false
      });
      
      // Reset form
      setSubject('');
      setMessage('');
      
      // Close modal
      onClose();
    } catch (error) {
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Message IT Support</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Support Staff Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center gap-4">
          <img 
            src={supportStaff.avatar} 
            alt={supportStaff.name} 
            className="w-12 h-12 rounded-full object-cover border-2 border-blue-300"
          />
          <div>
            <p className="text-sm text-gray-600">Sending message to:</p>
            <p className="font-semibold text-gray-900">{supportStaff.name}</p>
            <p className="text-xs text-gray-500">{supportStaff.role}</p>
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-5">
          {/* Subject Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Brief description of your issue"
              disabled={isSending}
              required
            />
          </div>

          {/* Message Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              placeholder="Describe your issue or question in detail..."
              rows={8}
              disabled={isSending}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Please provide as much detail as possible to help us assist you better.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending || !subject.trim() || !message.trim()}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
