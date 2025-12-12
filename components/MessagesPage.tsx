import React, { useState, useMemo } from 'react';
import { Mail, Trash2, Eye, EyeOff, Search, Filter } from 'lucide-react';
import { db } from '../services/mockDatabase';
import { useAuth } from '../hooks';

export const MessagesPage: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return null;
  }
  const [messages, setMessages] = useState(db.getMessages());
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter messages for current user (support staff)
  const myMessages = useMemo(() => {
    return messages
      .filter(m => m.to === currentUser.id)
      .filter(m => {
        if (filterStatus === 'unread') return !m.read;
        if (filterStatus === 'read') return m.read;
        return true;
      })
      .filter(m => {
        if (!searchQuery) return true;
        return (
          m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.fromName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.message.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [messages, currentUser.id, filterStatus, searchQuery]);

  const unreadCount = messages.filter(m => m.to === currentUser.id && !m.read).length;

  const handleSelectMessage = (id: string) => {
    setSelectedMessage(id);
    const message = messages.find(m => m.id === id);
    if (message && !message.read) {
      db.markAsRead(id);
      setMessages(db.getMessages());
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      db.deleteMessage(id);
      setMessages(db.getMessages());
      if (selectedMessage === id) {
        setSelectedMessage(null);
      }
    }
  };

  const handleToggleRead = (id: string) => {
    const message = messages.find(m => m.id === id);
    if (!message) return;
    
    if (message.read) {
      // Mark as unread - need to update the message
      const updatedMessages = messages.map(m => 
        m.id === id ? { ...m, read: false } : m
      );
      localStorage.setItem('nexgen_messages', JSON.stringify(updatedMessages));
      setMessages(updatedMessages);
    } else {
      db.markAsRead(id);
      setMessages(db.getMessages());
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const selectedMsg = messages.find(m => m.id === selectedMessage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
          <p className="text-gray-500">Support requests from employees</p>
        </div>
        {unreadCount > 0 && (
          <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold">
            {unreadCount} Unread
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search messages..."
            className="pl-10 pr-4 py-2 text-sm w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilterStatus('read')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'read'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Read
          </button>
        </div>
      </div>

      {/* Messages Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {myMessages.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No messages found</p>
              </div>
            ) : (
              myMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleSelectMessage(message.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedMessage === message.id
                      ? 'bg-blue-50 border-l-4 border-l-blue-600'
                      : 'hover:bg-gray-50'
                  } ${!message.read ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className={`text-sm font-semibold ${!message.read ? 'text-blue-900' : 'text-gray-900'}`}>
                      {message.fromName}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(message.timestamp)}</span>
                  </div>
                  <p className={`text-sm ${!message.read ? 'font-semibold text-gray-900' : 'text-gray-600'} truncate`}>
                    {message.subject}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-1">{message.message}</p>
                  {!message.read && (
                    <div className="mt-2">
                      <span className="inline-block px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                        New
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {selectedMsg ? (
            <div className="space-y-6">
              {/* Message Header */}
              <div className="flex items-start justify-between pb-4 border-b">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedMsg.subject}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>From: <strong>{selectedMsg.fromName}</strong></span>
                    <span>•</span>
                    <span>{new Date(selectedMsg.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleRead(selectedMsg.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={selectedMsg.read ? 'Mark as unread' : 'Mark as read'}
                  >
                    {selectedMsg.read ? (
                      <EyeOff className="w-5 h-5 text-gray-600" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(selectedMsg.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete message"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Message Body */}
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedMsg.message}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Mail className="w-16 h-16 mb-4" />
              <p className="text-lg">Select a message to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
