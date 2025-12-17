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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-600">
        <h2 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          Ticket Information
        </h2>
      </div>

      <div className="p-0">
        <table className="w-full text-xs text-left">
          <tbody className="divide-y divide-gray-200">
            {/* Title Row */}
            <tr className="divide-x divide-gray-200">
              <td className="px-3 py-2 bg-gray-50 font-semibold text-gray-700 w-1/3 border-r border-gray-200 align-middle">
                <div className="flex items-center gap-2">
                  <Type className="w-3.5 h-3.5 text-gray-400" />
                  Ticket Title <span className="text-red-500">*</span>
                </div>
              </td>
              <td className="px-3 py-2 text-gray-900">
                <Input
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  onBlur={() => onBlur("title")}
                  error={touched.title ? errors.title : undefined}
                  placeholder="Brief summary of the issue"
                  required
                  fullWidth
                  className="text-xs"
                />
              </td>
            </tr>

            {/* Description Row */}
            <tr className="divide-x divide-gray-200">
              <td className="px-3 py-2 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200 align-top">
                <div className="flex items-center gap-2 mt-1.5">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  Description <span className="text-red-500">*</span>
                </div>
              </td>
              <td className="px-3 py-2 text-gray-900">
                <div className="relative">
                  <textarea
                    value={description || ""}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    onBlur={() => onBlur("description")}
                    placeholder="Detailed description of the issue..."
                    className={`w-full px-3 py-2 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all ${
                      touched.description && errors.description
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    rows={5}
                  />
                  {touched.description && errors.description && (
                    <div className="absolute top-2 right-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    </div>
                  )}
                </div>
                {touched.description && errors.description && (
                  <p className="text-[10px] text-red-600 mt-1">{errors.description}</p>
                )}
              </td>
            </tr>

            {/* Category Row */}
            <tr className="divide-x divide-gray-200">
              <td className="px-3 py-2 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200 align-middle">
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  Category <span className="text-red-500">*</span>
                </div>
              </td>
              <td className="px-3 py-2 text-gray-900">
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
                  className="text-xs py-1"
                />
              </td>
            </tr>

            {/* Priority Row */}
            <tr className="divide-x divide-gray-200">
              <td className="px-3 py-2 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200 align-middle">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
                  Priority Level <span className="text-red-500">*</span>
                </div>
              </td>
              <td className="px-3 py-2 text-gray-900">
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
                  className="text-xs py-1"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
