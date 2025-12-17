import React from 'react';
import { Sparkles, Wand2, Loader2 } from 'lucide-react';
import { Card, Button } from '../ui';

interface AIAssistantProps {
  title: string;
  description: string;
  isAnalyzing: boolean;
  isRefining: boolean;
  onAnalyze: () => void;
  onRefine: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  title,
  description,
  isAnalyzing,
  isRefining,
  onAnalyze,
  onRefine,
}) => {
  const canAnalyze = (title?.trim().length || 0) > 0 && (description?.trim().length || 0) > 0;

  return (
    <Card variant="bordered">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-600" />
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">AI Assistant</h2>
        <span className="ml-auto bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">
          Hyperspeed 2.0
        </span>
      </div>
      <div className="p-4 space-y-4">
        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
          <h4 className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-1.5">
            <Wand2 className="w-3 h-3" /> Available Features
          </h4>
          <ul className="text-xs text-gray-600 space-y-1.5 ml-0.5">
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-blue-400"></span>
              <span><strong>Analyze Ticket</strong>: Auto-detect category & priority</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-purple-400"></span>
              <span><strong>Check Grammar</strong>: Fix errors in title & description</span>
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={onAnalyze}
            disabled={!canAnalyze || isAnalyzing}
            loading={isAnalyzing}
            variant="secondary"
            className="bg-white hover:bg-gray-50 border-gray-200"
            icon={<Sparkles className="w-3.5 h-3.5 text-purple-500" />}
            fullWidth
            size="sm"
          >
            {isAnalyzing ? 'Analyzing Ticket...' : 'Analyze & Categorize'}
          </Button>
          <Button
            onClick={onRefine}
            disabled={!canAnalyze || isRefining}
            loading={isRefining}
            variant="secondary"
            className="bg-white hover:bg-gray-50 border-gray-200"
            icon={<Wand2 className="w-3.5 h-3.5 text-blue-500" />}
            fullWidth
            size="sm"
          >
            {isRefining ? 'Checking Grammar...' : 'Check Grammar'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
