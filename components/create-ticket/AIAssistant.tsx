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
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <h2 className="text-base font-bold text-gray-900">AI Assistant</h2>
        </div>
        <p className="text-xs text-gray-600 mt-0.5">
          Get AI-powered suggestions to improve your ticket
        </p>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={onAnalyze}
            disabled={!canAnalyze || isAnalyzing}
            loading={isAnalyzing}
            variant="secondary"
            icon={<Sparkles className="w-3 h-3" />}
            fullWidth
            size="sm"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Ticket'}
          </Button>
          <Button
            onClick={onRefine}
            disabled={!canAnalyze || isRefining}
            loading={isRefining}
            variant="secondary"
            icon={<Wand2 className="w-3 h-3" />}
            fullWidth
            size="sm"
          >
            {isRefining ? 'Refining...' : 'Improve Description'}
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-blue-900 mb-1">
            💡 AI Features
          </h4>
          <ul className="text-xs text-blue-800 space-y-0.5">
            <li>• <strong>Analyze Ticket</strong>: Get category and priority suggestions</li>
            <li>• <strong>Improve Description</strong>: Enhance clarity and detail</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};
