import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, Input } from '../ui';

export const PrintFormTab: React.FC = () => {
  const [printConfig, setPrintConfig] = useState(() => {
    const saved = localStorage.getItem('printFormConfig');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse print config:', e);
      }
    }
    return {
      companyName: 'PHYSICIANS\' DIAGNOSTIC SERVICES CENTER, INC.',
      formTitle: 'M.I.S SERVICE REQUEST',
      docCode: 'MIS-010-F',
      versionNo: 'C',
      revisionDate: '22-Apr-2024',
      issueDate: '22-Apr-2024',
      effectivityDate: '22-Apr-2024',
      retainedBy: 'JCG'
    };
  });

  useEffect(() => {
    localStorage.setItem('printFormConfig', JSON.stringify(printConfig));
  }, [printConfig]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPrintConfig({...printConfig, logoBase64: reader.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Print Form Configuration */}
      <Card variant="bordered">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Print Form Configuration</h2>
          <p className="text-sm text-gray-500">Customize the ticket print form layout and information</p>
        </div>
        <div className="p-6 space-y-6">
          {/* Company Information */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-4">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Company Name"
                type="text"
                value={printConfig.companyName}
                onChange={(e) => setPrintConfig({...printConfig, companyName: e.target.value})}
                placeholder="PHYSICIANS' DIAGNOSTIC SERVICES CENTER, INC."
                fullWidth
              />
              <Input
                label="Form Title"
                type="text"
                value={printConfig.formTitle}
                onChange={(e) => setPrintConfig({...printConfig, formTitle: e.target.value})}
                placeholder="M.I.S SERVICE REQUEST"
                fullWidth
              />
            </div>
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                <strong>Note:</strong> Department/Section and Computer Name are automatically fetched from user data and cannot be configured here.
              </p>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Company Logo</h3>
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Recommended: Square image, max 2MB (PNG, JPG, SVG)
                </p>
              </div>
              {printConfig.logoBase64 && (
                <div className="flex flex-col items-center">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preview
                  </label>
                  <div className="relative">
                    <img 
                      src={printConfig.logoBase64} 
                      alt="Logo preview" 
                      className="w-20 h-20 object-contain border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={() => setPrintConfig({...printConfig, logoBase64: undefined})}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                      title="Remove logo"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Document Control */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Document Control Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input
                label="Doc Code"
                type="text"
                value={printConfig.docCode}
                onChange={(e) => setPrintConfig({...printConfig, docCode: e.target.value})}
                placeholder="MIS-010-F"
                fullWidth
              />
              <Input
                label="Version No"
                type="text"
                value={printConfig.versionNo}
                onChange={(e) => setPrintConfig({...printConfig, versionNo: e.target.value})}
                placeholder="C"
                fullWidth
              />
              <Input
                label="Retained By"
                type="text"
                value={printConfig.retainedBy}
                onChange={(e) => setPrintConfig({...printConfig, retainedBy: e.target.value})}
                placeholder="JCG"
                fullWidth
              />
              <Input
                label="Revision Date"
                type="text"
                value={printConfig.revisionDate}
                onChange={(e) => setPrintConfig({...printConfig, revisionDate: e.target.value})}
                placeholder="22-Apr-2024"
                fullWidth
              />
              <Input
                label="Issue Date"
                type="text"
                value={printConfig.issueDate}
                onChange={(e) => setPrintConfig({...printConfig, issueDate: e.target.value})}
                placeholder="22-Apr-2024"
                fullWidth
              />
              <Input
                label="Effectivity Date"
                type="text"
                value={printConfig.effectivityDate}
                onChange={(e) => setPrintConfig({...printConfig, effectivityDate: e.target.value})}
                placeholder="22-Apr-2024"
                fullWidth
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Print Form Preview</h4>
              <p className="text-sm text-blue-700 mt-1">
                Changes to these settings will be reflected in the ticket print forms. Go to <strong>Print & Reports</strong> to preview the updated form.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
