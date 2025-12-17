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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full flex flex-col">
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-600 flex items-center justify-between">
        <h3 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-2">
          <Send className="w-3.5 h-3.5 text-blue-400" />
          Activity Log
        </h3>
        <span className="bg-gray-700 text-gray-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-gray-600">
          {logs.length}
        </span>
      </div>
      
      <div className="p-0 flex-1 flex flex-col min-h-0 bg-gray-50">
        {/* Activity Log */}
        <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[300px]">
          {logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-xs italic p-4">
              No activity yet.
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <tbody className="divide-y divide-gray-200">
                {logs.map((log, index) => (
                  <tr key={index} className="bg-white hover:bg-gray-50">
                    <td className="px-3 py-2 border-b border-gray-200">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-gray-900">{log.userName}</span>
                        <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-1.5 rounded">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className={`text-gray-700 leading-snug ${log.type === 'STATUS_CHANGE' ? 'italic text-blue-700' : ''}`}>
                        {log.message}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div ref={logsEndRef} />
        </div>

        {/* AI Suggestion */}
        {aiSuggestion && (
          <div className="px-3 py-2 bg-purple-50 border-t border-purple-100 border-b border-gray-200">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-[10px] font-bold text-purple-900 mb-0.5 uppercase">AI Suggestion</h4>
                <p className="text-[10px] text-gray-800 whitespace-pre-wrap leading-tight">{aiSuggestion}</p>
              </div>
            </div>
          </div>
        )}

        {/* Comment Input */}
        <div className="p-3 bg-white border-t border-gray-200">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="Type a message or update..."
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none bg-white transition-colors pr-20"
              rows={2}
            />
            <div className="absolute bottom-2 right-2 flex gap-1">
              <Button
                onClick={onGetAiHelp}
                variant="ghost"
                size="sm"
                loading={isGettingSuggestion}
                className="h-6 px-1.5 text-[10px] text-purple-600 hover:bg-purple-50"
                title="Ask AI for help"
              >
                <Lightbulb className="w-3 h-3" />
              </Button>
              <Button
                onClick={onPostComment}
                disabled={!newComment.trim()}
                className="h-6 px-2 text-[10px]"
                size="sm"
              >
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
