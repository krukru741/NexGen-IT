import React, { useRef, useEffect } from 'react';
import { Send, Lightbulb, Loader2 } from 'lucide-react';
import { TicketLog } from '../../types';
import { Button, Card, Spinner } from '../ui';

interface TicketCommentsProps {
  logs: TicketLog[];
  newComment: string;
  aiSuggestion: string | null;
  isGettingSuggestion: boolean;
  onCommentChange: (comment: string) => void;
  onPostComment: () => void;
  onGetAiHelp: () => void;
}

export const TicketComments: React.FC<TicketCommentsProps> = ({
  logs,
  newComment,
  aiSuggestion,
  isGettingSuggestion,
  onCommentChange,
  onPostComment,
  onGetAiHelp,
}) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogColor = (type: string) => {
    switch (type) {
      case 'STATUS_CHANGE': return 'bg-blue-50 border-blue-200';
      case 'COMMENT': return 'bg-gray-50 border-gray-200';
      case 'SYSTEM': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card variant="bordered">
      <div className="p-6 border-b border-gray-100 bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900">Activity & Comments</h3>
      </div>
      
      <div className="p-6">
        {/* Activity Log */}
        <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${getLogColor(log.type)}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-semibold text-gray-900">{log.userName}</span>
                <span className="text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700">{log.message}</p>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>

        {/* AI Suggestion */}
        {aiSuggestion && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-purple-900 mb-2">AI Suggestion</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{aiSuggestion}</p>
              </div>
            </div>
          </div>
        )}

        {/* Comment Input */}
        <div className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            rows={3}
          />
          <div className="flex gap-3">
            <Button
              onClick={onPostComment}
              disabled={!newComment.trim()}
              icon={<Send className="w-4 h-4" />}
            >
              Post Comment
            </Button>
            <Button
              onClick={onGetAiHelp}
              variant="secondary"
              loading={isGettingSuggestion}
              icon={<Lightbulb className="w-4 h-4" />}
            >
              Get AI Help
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
