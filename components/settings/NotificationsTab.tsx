import React from 'react';
import { Bell } from 'lucide-react';
import { Card, Select } from '../ui';

export const NotificationsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card variant="bordered">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Email Notifications
          </h2>
          <p className="text-sm text-gray-500">Configure email alerts for various events</p>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: 'New Ticket Created', description: 'Receive email when a new ticket is submitted', enabled: true },
            { label: 'Ticket Assigned to Me', description: 'Get notified when a ticket is assigned to you', enabled: true },
            { label: 'Ticket Status Changed', description: 'Email when ticket status is updated', enabled: true },
            { label: 'New Message Received', description: 'Alert when you receive a new support message', enabled: true },
            { label: 'Ticket Comment Added', description: 'Notify when someone comments on your ticket', enabled: false },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <div>
                <span className="text-sm font-medium text-gray-900">{item.label}</span>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              <div className={`w-12 h-6 ${item.enabled ? 'bg-blue-600' : 'bg-gray-200'} rounded-full relative cursor-pointer`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute ${item.enabled ? 'right-0.5' : 'left-0.5'} top-0.5 shadow-sm`}></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* In-App Notifications */}
      <Card variant="bordered">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">In-App Notifications</h2>
          <p className="text-sm text-gray-500">Control browser notifications and alerts</p>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: 'Desktop Notifications', description: 'Show browser notifications for important events', enabled: true },
            { label: 'Sound Alerts', description: 'Play sound when receiving notifications', enabled: false },
            { label: 'Badge Counters', description: 'Show unread count badges in navigation', enabled: true },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <div>
                <span className="text-sm font-medium text-gray-900">{item.label}</span>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              <div className={`w-12 h-6 ${item.enabled ? 'bg-blue-600' : 'bg-gray-200'} rounded-full relative cursor-pointer`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute ${item.enabled ? 'right-0.5' : 'left-0.5'} top-0.5 shadow-sm`}></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Notification Frequency */}
      <Card variant="bordered">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Notification Frequency</h2>
          <p className="text-sm text-gray-500">Control how often you receive notifications</p>
        </div>
        <div className="p-6 space-y-4">
          <Select
            label="Email Digest"
            options={[
              { value: 'realtime', label: 'Real-time (Immediate)' },
              { value: 'hourly', label: 'Hourly Digest' },
              { value: 'daily', label: 'Daily Digest' },
              { value: 'weekly', label: 'Weekly Digest' },
              { value: 'disabled', label: 'Disabled' },
            ]}
            defaultValue="realtime"
            helperText="Group multiple notifications into a single email"
            fullWidth
          />
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <span className="text-sm font-medium text-gray-900">Do Not Disturb</span>
              <p className="text-xs text-gray-500">Pause all notifications temporarily</p>
            </div>
            <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
              <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Admin Notifications */}
      <Card variant="bordered">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Admin Alerts</h2>
          <p className="text-sm text-gray-500">System-wide notifications for administrators</p>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: 'System Errors', description: 'Alert on critical system errors', enabled: true },
            { label: 'New User Registrations', description: 'Notify when new users sign up', enabled: true },
            { label: 'High Priority Tickets', description: 'Alert for critical/high priority tickets', enabled: true },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <div>
                <span className="text-sm font-medium text-gray-900">{item.label}</span>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
