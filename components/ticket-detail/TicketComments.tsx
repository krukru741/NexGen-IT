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
      case 'STATUS_CHANGE': return 'bg-blue-50/50 border-blue-100';
      case 'COMMENT': return 'bg-gray-50/50 border-gray-100';
      case 'SYSTEM': return 'bg-green-50/50 border-green-100';
      default: return 'bg-gray-50/50 border-gray-100';
    }
  };

  return (
    <Card variant="bordered" className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-2">
        <Send className="w-3.5 h-3.5 text-blue-600" />
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Activity Log</h3>
        <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-gray-200">
          {logs.length}
        </span>
      </div>
      
      <div className="p-3 flex-1 flex flex-col min-h-0">
        {/* Activity Log */}
        <div className="space-y-2 mb-3 overflow-y-auto flex-1 h-full min-h-[200px] max-h-[300px] pr-1">
          {logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-xs italic">
              No activity yet.
            </div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={`p-2 rounded border ${getLogColor(log.type)}`}
              >
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-[11px] font-bold text-gray-800">{log.userName}</span>
                  <span className="text-[9px] text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 leading-tight">{log.message}</p>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>

        {/* AI Suggestion */}
        {aiSuggestion && (
          <div className="mb-3 p-2 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded">
            <div className="flex items-start gap-1.5">
              <Lightbulb className="w-3 h-3 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-[11px] font-bold text-purple-900 mb-0.5">AI Suggestion</h4>
                <p className="text-[10px] text-gray-700 whitespace-pre-wrap leading-tight">{aiSuggestion}</p>
              </div>
            </div>
          </div>
        )}

        {/* Comment Input */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <textarea
            value={newComment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Type a message..."
            className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none bg-gray-50 focus:bg-white transition-colors"
            rows={2}
          />
          <div className="flex justify-between items-center">
            <Button
              onClick={onGetAiHelp}
              variant="ghost"
              size="sm"
              loading={isGettingSuggestion}
              className="text-[10px] h-7 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              icon={<Lightbulb className="w-3 h-3" />}
            >
              AI Help
            </Button>
            <Button
              onClick={onPostComment}
              disabled={!newComment.trim()}
              className="h-7 px-3 text-xs"
              icon={<Send className="w-3 h-3" />}
              size="sm"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
