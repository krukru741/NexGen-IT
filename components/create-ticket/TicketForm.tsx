import React from "react";
import { TicketCategory, TicketPriority } from "../../types";
import { Input, Select, Card } from "../ui";
import { FileText, Tag, AlertCircle, Type } from "lucide-react";

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
  onBlur: (field: "title" | "description") => void;
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
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-2">
        <FileText className="w-4 h-4 text-blue-600" />
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          Ticket Information
        </h2>
      </div>
      <div className="p-4 space-y-5">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-gray-400" />
            Ticket Title <span className="text-red-500">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={() => onBlur("title")}
            error={touched.title ? errors.title : undefined}
            placeholder="Brief summary of the issue"
            required
            fullWidth
            className="py-2.5"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-gray-400" />
            Description <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea
              value={description || ""}
              onChange={(e) => onDescriptionChange(e.target.value)}
              onBlur={() => onBlur("description")}
              placeholder="Detailed description of the issue..."
              className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all ${
                touched.description && errors.description
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              rows={5}
            />
            {touched.description && errors.description && (
              <div className="absolute top-3 right-3">
                <AlertCircle className="w-4 h-4 text-red-500" />
              </div>
            )}
          </div>
          {touched.description && errors.description && (
            <p className="text-xs text-red-600 pl-1">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-gray-400" />
              Category <span className="text-red-500">*</span>
            </label>
            <Select
              options={Object.values(TicketCategory).map((cat) => ({
                value: cat,
                label: cat,
              }))}
              value={category}
              onChange={(e) =>
                onCategoryChange(e.target.value as TicketCategory)
              }
              required
              fullWidth
              className="py-2.5"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
              PriorityLevel <span className="text-red-500">*</span>
            </label>
            <Select
              options={Object.values(TicketPriority).map((pri) => ({
                value: pri,
                label: pri,
              }))}
              value={priority}
              onChange={(e) =>
                onPriorityChange(e.target.value as TicketPriority)
              }
              required
              fullWidth
              className="py-2.5"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
