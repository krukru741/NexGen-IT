import React from 'react';
import { TicketCategory, TicketPriority } from '../../types';
import { Input, Select, Card } from '../ui';

interface TicketFormProps {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  errors: {
    title?: string;
    description?: string;
  };
  touched: {
    title?: boolean;
    description?: boolean;
  };
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: TicketCategory) => void;
  onPriorityChange: (value: TicketPriority) => void;
  onBlur: (field: 'title' | 'description') => void;
}

export const TicketForm: React.FC<TicketFormProps> = ({
  title,
  description,
  category,
  priority,
  errors,
  touched,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
  onPriorityChange,
  onBlur,
}) => {
  return (
    <Card variant="bordered">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h2 className="text-base font-bold text-gray-900">Ticket Information</h2>
        <p className="text-xs text-gray-500">Provide details about your support request</p>
      </div>
      <div className="p-4 space-y-4">
        <Input
          label="Title"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onBlur={() => onBlur('title')}
          error={touched.title ? errors.title : undefined}
          placeholder="Brief summary of the issue"
          required
          fullWidth
          className="py-2"
        />

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description || ''}
            onChange={(e) => onDescriptionChange(e.target.value)}
            onBlur={() => onBlur('description')}
            placeholder="Detailed description of the issue..."
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none ${
              touched.description && errors.description
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            rows={4}
          />
          {touched.description && errors.description && (
            <p className="mt-1 text-xs text-red-600">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Category"
            options={Object.values(TicketCategory).map(cat => ({
              value: cat,
              label: cat
            }))}
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as TicketCategory)}
            required
            fullWidth
            className="py-2"
          />

          <Select
            label="Priority"
            options={Object.values(TicketPriority).map(pri => ({
              value: pri,
              label: pri
            }))}
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value as TicketPriority)}
            required
            fullWidth
            className="py-2"
          />
        </div>
      </div>
    </Card>
  );
};
