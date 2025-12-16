import React from "react";
import { Search, Filter, Calendar, Download } from "lucide-react";
import {
  TicketStatus,
  TicketPriority,
  TicketCategory,
  User,
  UserRole,
} from "../../types";
import { Input, Select, Button, Card } from "../ui";

interface FilterState {
  search: string;
  status: string[];
  priority: string[];
  category: string[];
  assignee: string[];
  dateRange: "all" | "today" | "week" | "month";
}

interface TicketFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  technicians: User[];
  onExport: () => void;
  ticketCount: number;
}

export const TicketFilters: React.FC<TicketFiltersProps> = ({
  filters,
  onFiltersChange,
  technicians,
  onExport,
  ticketCount,
}) => {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (
    key: "status" | "priority" | "category" | "assignee",
    value: string
  ) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: [],
      priority: [],
      category: [],
      assignee: [],
      dateRange: "all",
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.status.length > 0 ||
    filters.priority.length > 0 ||
    filters.category.length > 0 ||
    filters.assignee.length > 0 ||
    filters.dateRange !== "all";

  return (
    <Card variant="bordered">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              All System Tickets
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Showing {ticketCount} ticket{ticketCount !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-3">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={onExport}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tickets by title, ID, requester, or description..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.values(TicketStatus).map((status) => (
                <button
                  key={status}
                  onClick={() => toggleArrayFilter("status", status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filters.status.includes(status)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Priority
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.values(TicketPriority).map((priority) => (
                <button
                  key={priority}
                  onClick={() => toggleArrayFilter("priority", priority)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filters.priority.includes(priority)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.values(TicketCategory).map((category) => (
                <button
                  key={category}
                  onClick={() => toggleArrayFilter("category", category)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filters.category.includes(category)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Assignee Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assigned To
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => toggleArrayFilter("assignee", "unassigned")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filters.assignee.includes("unassigned")
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Unassigned
              </button>
              {technicians.map((tech) => (
                <button
                  key={tech.id}
                  onClick={() => toggleArrayFilter("assignee", tech.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filters.assignee.includes(tech.id)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tech.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Date Range
          </label>
          <div className="flex gap-2">
            {(["all", "today", "week", "month"] as const).map((range) => (
              <button
                key={range}
                onClick={() => updateFilter("dateRange", range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.dateRange === range
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {range === "all"
                  ? "All Time"
                  : range === "today"
                  ? "Today"
                  : range === "week"
                  ? "This Week"
                  : "This Month"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
