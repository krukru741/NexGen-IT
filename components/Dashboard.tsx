import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Ticket, TicketStatus, TicketPriority } from '../types';
import { CheckCircle, Clock, AlertTriangle, Layers } from 'lucide-react';

interface DashboardProps {
  tickets: Ticket[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'];

export const Dashboard: React.FC<DashboardProps> = ({ tickets }) => {
  const stats = React.useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === TicketStatus.OPEN).length,
      inProgress: tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
      resolved: tickets.filter(t => t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED).length,
      critical: tickets.filter(t => t.priority === TicketPriority.CRITICAL && t.status !== TicketStatus.CLOSED).length
    };
  }, [tickets]);

  const categoryData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [tickets]);

  const statusData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach(t => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [tickets]);

  const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-500">Real-time insights into system performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Tickets" value={stats.total} icon={Layers} color="bg-blue-500" subtext="All time volume" />
        <StatCard title="Open / In Progress" value={stats.open + stats.inProgress} icon={Clock} color="bg-yellow-500" subtext="Requires attention" />
        <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} color="bg-green-500" subtext="Successfully closed" />
        <StatCard title="Critical Issues" value={stats.critical} icon={AlertTriangle} color="bg-red-500" subtext="High priority active" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-semibold mb-6">Tickets by Category</h3>
          <div className="h-64 w-full flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} 
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-semibold mb-6">Ticket Status Distribution</h3>
          <div className="h-64 w-full flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {statusData.map((entry, index) => (
              <div key={entry.name} className="flex items-center text-xs text-gray-600">
                <span className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: COLORS[index % COLORS.length]}}></span>
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};