import React, { useState } from 'react';
import { Shield, Bell, Globe, FileText, Save, Check } from 'lucide-react';
import { Tabs, Button } from './ui';
import { RBACTab } from './settings/RBACTab';
import { GeneralTab } from './settings/GeneralTab';
import { NotificationsTab } from './settings/NotificationsTab';
import { PrintFormTab } from './settings/PrintFormTab';

export const SettingsPage: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedMessage('Settings saved successfully');
      setTimeout(() => setSavedMessage(null), 3000);
    }, 1000);
  };

  const tabs = [
    {
      id: 'general',
      label: 'General',
      icon: <Globe className="w-4 h-4" />,
      content: <GeneralTab />,
    },
    {
      id: 'rbac',
      label: 'Access Control (RBAC)',
      icon: <Shield className="w-4 h-4" />,
      content: <RBACTab />,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-4 h-4" />,
      content: <NotificationsTab />,
    },
    {
      id: 'printform',
      label: 'Print Form',
      icon: <FileText className="w-4 h-4" />,
      content: <PrintFormTab />,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-500">Manage global configurations and permissions.</p>
      </div>

      <Tabs tabs={tabs} defaultTab="rbac" />

      {/* Floating Save Bar */}
      <div className="fixed bottom-6 right-6 flex items-center space-x-4">
        {savedMessage && (
          <div className="bg-green-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center animate-fade-in">
            <Check className="w-4 h-4 mr-2" />
            {savedMessage}
          </div>
        )}
        <Button
          onClick={handleSave}
          loading={isSaving}
          icon={<Save className="w-4 h-4" />}
          size="lg"
          className="shadow-xl"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};