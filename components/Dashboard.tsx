import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Ticket, TicketStatus, TicketPriority, User, UserRole } from '../types';
import { CheckCircle, Clock, AlertTriangle, Layers, UserCheck, UserX, TrendingUp, Activity, Plus, AlertCircle } from 'lucide-react';

interface DashboardProps {
  tickets: Ticket[];
  users?: User[];
  currentUser: User;
  onCreateTicket?: () => void;
  onSelectTicket?: (ticket: Ticket) => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6B7280', '#8B5CF6'];

export const Dashboard: React.FC<DashboardProps> = ({ tickets, users = [], currentUser, onCreateTicket, onSelectTicket }) => {
  // Filter tickets for employees - show only their own tickets
  const isEmployee = currentUser.role === UserRole.EMPLOYEE;
  const filteredTickets = isEmployee 
    ? tickets.filter(t => t.requesterId === currentUser.id)
    : tickets;

  // If employee, show personalized dashboard
  if (isEmployee) {
    const myStats = React.useMemo(() => {
      const myTickets = tickets.filter(t => t.requesterId === currentUser.id);
      const awaitingVerification = myTickets.filter(t => t.status === TicketStatus.RESOLVED).length;
      
      const resolvedTickets = myTickets.filter(t => 
        t.status === TicketStatus.RESOLVED || t.status === TicketStatus.VERIFIED || t.status === TicketStatus.CLOSED
      );
      const avgResolutionHours = resolvedTickets.length > 0
        ? resolvedTickets.reduce((sum, ticket) => {
            const created = new Date(ticket.createdAt).getTime();
            const updated = new Date(ticket.updatedAt).getTime();
            return sum + (updated - created) / (1000 * 60 * 60);
          }, 0) / resolvedTickets.length
        : 0;

      return {
        total: myTickets.length,
        open: myTickets.filter(t => t.status === TicketStatus.OPEN).length,
        inProgress: myTickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
        resolved: resolvedTickets.length,
        awaitingVerification,
        avgResolutionHours: Math.round(avgResolutionHours * 10) / 10
      };
    }, [tickets, currentUser.id]);

    const myStatusData = React.useMemo(() => {
      const myTickets = tickets.filter(t => t.requesterId === currentUser.id);
      const counts: Record<string, number> = {};
      myTickets.forEach(t => {
        counts[t.status] = (counts[t.status] || 0) + 1;
      });
      return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
    }, [tickets, currentUser.id]);

    const myPriorityData = React.useMemo(() => {
      const myTickets = tickets.filter(t => t.requesterId === currentUser.id);
      const counts: Record<string, number> = {};
      myTickets.forEach(t => {
        counts[t.priority] = (counts[t.priority] || 0) + 1;
      });
      return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
    }, [tickets, currentUser.id]);

    const myRecentTickets = React.useMemo(() => {
      return tickets
        .filter(t => t.requesterId === currentUser.id)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);
    }, [tickets, currentUser.id]);

    const pendingVerification = React.useMemo(() => {
      return tickets.filter(t => t.requesterId === currentUser.id && t.status === TicketStatus.RESOLVED);
    }, [tickets, currentUser.id]);

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

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'OPEN': return 'text-blue-600 bg-blue-50';
        case 'IN_PROGRESS': return 'text-yellow-600 bg-yellow-50';
        case 'RESOLVED': return 'text-green-600 bg-green-50';
        case 'VERIFIED': return 'text-green-700 bg-green-100';
        case 'CLOSED': return 'text-gray-600 bg-gray-50';
        default: return 'text-gray-600 bg-gray-50';
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Dashboard</h2>
            <p className="text-gray-500">Track your support tickets</p>
          </div>
          {onCreateTicket && (
            <button
              onClick={onCreateTicket}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
            >
              <Plus className="w-5 h-5" />
              Create New Ticket
            </button>
          )}
        </div>

        {/* Employee Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="My Total Tickets" value={myStats.total} icon={Layers} color="bg-blue-500" subtext="All time" />
          <StatCard title="Open Tickets" value={myStats.open} icon={Clock} color="bg-yellow-500" subtext="Awaiting response" />
          <StatCard title="In Progress" value={myStats.inProgress} icon={TrendingUp} color="bg-orange-500" subtext="Being worked on" />
          <StatCard title="Awaiting Verification" value={myStats.awaitingVerification} icon={AlertCircle} color="bg-green-500" subtext="Please verify" />
        </div>

        {/* Pending Verification Alert */}
        {pendingVerification.length > 0 && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-900 mb-2">Tickets Awaiting Your Verification</h3>
                <p className="text-sm text-green-700 mb-4">You have {pendingVerification.length} resolved ticket(s) waiting for your confirmation.</p>
                <div className="space-y-2">
                  {pendingVerification.map(ticket => (
                    <div 
                      key={ticket.id} 
                      onClick={() => onSelectTicket?.(ticket)}
                      className="bg-white p-3 rounded-lg border border-green-200 cursor-pointer hover:bg-green-50 hover:border-green-300 transition-all hover:shadow-md"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-sm text-gray-900">{ticket.id}</span>
                          <p className="text-sm text-gray-700">{ticket.title}</p>
                        </div>
                        <span className="text-xs text-green-600 font-semibold">Click to verify →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Avg Resolution Time */}
        {myStats.resolved > 0 && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-100 mb-1">Your Average Resolution Time</p>
                <h3 className="text-4xl font-bold">{myStats.avgResolutionHours}h</h3>
                <p className="text-xs text-indigo-200 mt-2">Based on {myStats.resolved} resolved tickets</p>
              </div>
              <div className="p-4 bg-white bg-opacity-20 rounded-lg">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Tickets by Status */}
          {myStatusData.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
              <h3 className="text-lg font-semibold mb-6">My Tickets by Status</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie
                      data={myStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {myStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {myStatusData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center text-xs text-gray-600">
                    <span className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: COLORS[index % COLORS.length]}}></span>
                    {entry.name} ({entry.value})
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Tickets by Priority */}
          {myPriorityData.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
              <h3 className="text-lg font-semibold mb-6">My Tickets by Priority</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={myPriorityData}>
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
          )}
        </div>

        {/* My Recent Tickets */}
        {myRecentTickets.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold">My Recent Tickets</h3>
            </div>
            <div className="space-y-4">
              {myRecentTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900">{ticket.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 truncate">{ticket.title}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>{ticket.assignedToName || 'Unassigned'}</span>
                      <span>•</span>
                      <span>{new Date(ticket.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Tickets Message */}
        {myStats.total === 0 && (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
            <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tickets Yet</h3>
            <p className="text-gray-500 mb-6">You haven't submitted any support tickets yet.</p>
            {onCreateTicket && (
              <button
                onClick={onCreateTicket}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
              >
                <Plus className="w-5 h-5" />
                Create Your First Ticket
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Admin/Technician Dashboard (existing full system view)
  const stats = React.useMemo(() => {
    const verified = tickets.filter(t => t.status === TicketStatus.VERIFIED).length;
    const unassigned = tickets.filter(t => !t.assignedToId).length;
    
    // Calculate average resolution time
    const resolvedTickets = tickets.filter(t => 
      t.status === TicketStatus.RESOLVED || t.status === TicketStatus.VERIFIED || t.status === TicketStatus.CLOSED
    );
    const avgResolutionHours = resolvedTickets.length > 0
      ? resolvedTickets.reduce((sum, ticket) => {
          const created = new Date(ticket.createdAt).getTime();
          const updated = new Date(ticket.updatedAt).getTime();
          return sum + (updated - created) / (1000 * 60 * 60);
        }, 0) / resolvedTickets.length
      : 0;

    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === TicketStatus.OPEN).length,
      inProgress: tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
      resolved: tickets.filter(t => t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED).length,
      verified,
      unassigned,
      critical: tickets.filter(t => t.priority === TicketPriority.CRITICAL && t.status !== TicketStatus.CLOSED).length,
      avgResolutionHours: Math.round(avgResolutionHours * 10) / 10
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

  const technicianData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach(t => {
      if (t.assignedToName) {
        counts[t.assignedToName] = (counts[t.assignedToName] || 0) + 1;
      }
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] })).sort((a, b) => b.value - a.value);
  }, [tickets]);

  const recentActivity = React.useMemo(() => {
    return [...tickets]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'text-blue-600 bg-blue-50';
      case 'IN_PROGRESS': return 'text-yellow-600 bg-yellow-50';
      case 'RESOLVED': return 'text-green-600 bg-green-50';
      case 'VERIFIED': return 'text-green-700 bg-green-100';
      case 'CLOSED': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-500">Real-time insights into system performance</p>
      </div>

      {/* Main Stats - 6 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Tickets" value={stats.total} icon={Layers} color="bg-blue-500" subtext="All time" />
        <StatCard title="Open / Active" value={stats.open + stats.inProgress} icon={Clock} color="bg-yellow-500" subtext="Needs attention" />
        <StatCard title="Resolved (Awaiting Verification)" value={stats.resolved} icon={CheckCircle} color="bg-green-500" subtext="Completed" />
        <StatCard title="Verified" value={stats.verified} icon={UserCheck} color="bg-green-600" subtext="Confirmed" />
        <StatCard title="Unassigned" value={stats.unassigned} icon={UserX} color="bg-orange-500" subtext="Awaiting" />
        <StatCard title="Critical" value={stats.critical} icon={AlertTriangle} color="bg-red-500" subtext="High priority" />
      </div>

      {/* Avg Resolution Time */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-100 mb-1">Average Resolution Time</p>
            <h3 className="text-4xl font-bold">{stats.avgResolutionHours}h</h3>
            <p className="text-xs text-indigo-200 mt-2">Based on {stats.resolved + stats.verified} resolved tickets</p>
          </div>
          <div className="p-4 bg-white bg-opacity-20 rounded-lg">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-semibold mb-6">Tickets by Category</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-semibold mb-6">Ticket Status Distribution</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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

      {/* Tickets per Technician */}
      {technicianData.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">Tickets per Technician</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={technicianData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} 
                />
                <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Activity Timeline */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          {recentActivity.map((ticket) => (
            <div key={ticket.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-900">{ticket.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-sm text-gray-700 truncate">{ticket.title}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>{ticket.requesterName}</span>
                  <span>•</span>
                  <span>{ticket.assignedToName || 'Unassigned'}</span>
                  <span>•</span>
                  <span>{new Date(ticket.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
