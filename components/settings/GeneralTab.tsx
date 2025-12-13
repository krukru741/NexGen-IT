import React from 'react';
import { Card, Input, Select } from '../ui';

export const GeneralTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* System Configuration */}
      <Card variant="bordered">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">System Configuration</h2>
          <p className="text-sm text-gray-500">Basic system information and settings</p>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="System Name"
              type="text"
              defaultValue="NexGen IT Support"
              fullWidth
            />
            <Input
              label="Support Email"
              type="email"
              defaultValue="support@nexgen.com"
              fullWidth
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Select
              label="Timezone"
              options={[
                { value: 'utc+8', label: 'UTC+8 (Philippine Time)' },
                { value: 'utc+0', label: 'UTC+0 (GMT)' },
                { value: 'utc-5', label: 'UTC-5 (EST)' },
                { value: 'utc-8', label: 'UTC-8 (PST)' },
              ]}
              defaultValue="utc+8"
              fullWidth
            />
            <Select
              label="Language"
              options={[
                { value: 'en', label: 'English (US)' },
                { value: 'fil', label: 'Filipino' },
                { value: 'es', label: 'Spanish' },
                { value: 'zh', label: 'Chinese' },
              ]}
              defaultValue="en"
              fullWidth
            />
          </div>
        </div>
      </Card>

      {/* Maintenance Mode */}
      <Card variant="bordered">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Maintenance Mode</h2>
          <p className="text-sm text-gray-500">Temporarily disable access for system updates</p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <span className="text-sm font-medium text-gray-900">Enable Maintenance Mode</span>
              <p className="text-xs text-gray-500">Only admins will be able to access the system</p>
            </div>
            <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
              <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
