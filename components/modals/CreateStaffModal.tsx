import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { UserRole } from '../../types';
import { db } from '../../services/mockDatabase';

interface CreateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Equipment {
  network: boolean;
  cpu: boolean;
  printer: boolean;
  monitor: boolean;
  keyboard: boolean;
  antiVirus: boolean;
  upsAvr: boolean;
  defragment: boolean;
  signaturePad: boolean;
  webCamera: boolean;
  barcodeScanner: boolean;
  barcodePrinter: boolean;
  fingerPrintScanner: boolean;
  mouse: boolean;
}

export const CreateStaffModal: React.FC<CreateStaffModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    pcNo: '',
    department: '',
    ipAddress: '',
    role: UserRole.EMPLOYEE
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isAutoFetching, setIsAutoFetching] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2U1ZTdlYiIvPjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjI1IiBmaWxsPSIjOWNhM2FmIi8+PHBhdGggZD0iTTMwIDEyMGMwLTI1IDIwLTQ1IDQ1LTQ1czQ1IDIwIDQ1IDQ1IiBmaWxsPSIjOWNhM2FmIi8+PC9zdmc+');
  const [equipment, setEquipment] = useState<Equipment>({
    network: false,
    cpu: false,
    printer: false,
    monitor: false,
    keyboard: false,
    antiVirus: false,
    upsAvr: false,
    defragment: false,
    signaturePad: false,
    webCamera: false,
    barcodeScanner: false,
    barcodePrinter: false,
    fingerPrintScanner: false,
    mouse: false
  });

  // Auto-fetch IP Address and PC Name
  const autoFetchSystemInfo = async () => {
    setIsAutoFetching(true);
    try {
      // Fetch IP Address from external API
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setFormData(prev => ({ ...prev, ipAddress: data.ip }));

      // Generate PC name with CSC-MIS prefix
      const lastOctet = data.ip.split('.').pop();
      const pcName = `CSC-MIS-${lastOctet}`;
      setFormData(prev => ({ ...prev, pcNo: pcName }));
    } catch (error) {
      console.error('Failed to auto-fetch system info:', error);
      alert('Could not auto-fetch IP address. Please enter manually.');
    } finally {
      setIsAutoFetching(false);
    }
  };

  // Handle avatar image upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        return;
      }

      // Read file and convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.pcNo.trim()) {
      newErrors.pcNo = 'PC No. is required';
    } else {
      // Check for duplicate PC No
      const existingPcNo = db.getUsers().find(u => u.pcNo === formData.pcNo.trim());
      if (existingPcNo) {
        newErrors.pcNo = 'This PC No. is already in use';
      }
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.ipAddress.trim()) {
      newErrors.ipAddress = 'IP Address is required';
    } else if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(formData.ipAddress)) {
      newErrors.ipAddress = 'Invalid IP address format (e.g., 192.168.1.1)';
    } else {
      // Check for duplicate IP Address
      const existingIp = db.getUsers().find(u => u.ipAddress === formData.ipAddress.trim());
      if (existingIp) {
        newErrors.ipAddress = 'This IP Address is already in use';
      }
    }

    // Check if at least one equipment is selected
    const hasEquipment = Object.values(equipment).some(value => value === true);
    if (!hasEquipment) {
      newErrors.equipment = 'At least one equipment must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create email from name and IP address
      const email = `${formData.ipAddress.replace(/\./g, '-')}@corp.com`;

      db.addUser({
        name: formData.name.trim(),
        email: email,
        role: formData.role,
        avatar: avatarPreview,
        pcNo: formData.pcNo.trim(),
        department: formData.department.trim(),
        ipAddress: formData.ipAddress.trim(),
        equipment: equipment
      });

      setSubmitStatus('success');
      
      setTimeout(() => {
        setFormData({
          name: '',
          pcNo: '',
          department: '',
          ipAddress: '',
          role: UserRole.EMPLOYEE
        });
        setErrors({});
        setSubmitStatus('idle');
        onClose();
      }, 1500);

    } catch (error) {
      setSubmitStatus('error');
      setErrors({ submit: 'Failed to create staff member. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        pcNo: '',
        department: '',
        ipAddress: '',
        role: UserRole.EMPLOYEE
      });
      setErrors({});
      setSubmitStatus('idle');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-white" />
            <h3 className="text-lg font-bold text-white">Create New Staff Member</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
          {/* Auto-Fetch Button */}
          <div>
            <button
              type="button"
              onClick={autoFetchSystemInfo}
              disabled={isAutoFetching || isSubmitting}
              className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium text-xs shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isAutoFetching ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Auto-Fetch IP & PC Name
                </>
              )}
            </button>
          </div>

          {/* Avatar Upload Section */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex-shrink-0">
              <img 
                src={avatarPreview} 
                alt="Avatar preview" 
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Profile Picture
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-upload"
                disabled={isSubmitting}
              />
              <label
                htmlFor="avatar-upload"
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer text-xs font-medium text-gray-700 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upload Image
              </label>
              <p className="text-[10px] text-gray-500 mt-1">Max 2MB, JPG/PNG</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PC No. Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                PC No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.pcNo}
                onChange={(e) => setFormData({ ...formData, pcNo: e.target.value })}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                  errors.pcNo ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="CSC-MIS-01"
                disabled={isSubmitting}
              />
              <p className="text-[10px] text-gray-500 mt-0.5">Format: CSC-MIS-XX</p>
              {errors.pcNo && (
                <p className="mt-0.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.pcNo}
                </p>
              )}
            </div>

            {/* IP Address Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                IP Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.ipAddress}
                onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                  errors.ipAddress ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="192.168.1.100"
                disabled={isSubmitting}
              />
              {errors.ipAddress && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.ipAddress}
                </p>
              )}
            </div>
          </div>

          {/* Full Name Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter full name"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Department Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white ${
                  errors.department ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Select Department</option>
                <option value="MIS / IT">MIS / IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Accounting">Accounting</option>
                <option value="Admin OIC">Admin OIC</option>
                <option value="Procurement">Procurement</option>
                <option value="Operations">Operations</option>
                <option value="Management">Management</option>
                <option value="Sales Marketing">Sales Marketing</option>
                <option value="Logistics Warehouse">Logistics Warehouse</option>
                <option value="Building Maintenance">Building Maintenance</option>
                <option value="Customer Service">Customer Service</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Research & Development">Research & Development</option>
                <option value="Legal">Legal</option>
                <option value="Compliance">Compliance</option>
                <option value="Training & Development">Training & Development</option>
                <option value="Security">Security</option>
                <option value="Facilities">Facilities</option>
              </select>
              {errors.department && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.department}
                </p>
              )}
            </div>

            {/* Role Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                disabled={isSubmitting}
              >
                <option value={UserRole.EMPLOYEE}>Employee</option>
                <option value={UserRole.TECHNICIAN}>Technician</option>
                <option value={UserRole.ADMIN}>Admin</option>
              </select>
            </div>
          </div>


          {/* Installed Equipment Section */}
          <div className="bg-indigo-900 text-white px-3 py-2 rounded-t-md font-semibold text-sm flex justify-between items-center">
            <span>INSTALLED</span>
            {errors.equipment && (
              <span className="text-red-300 text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.equipment}
              </span>
            )}
          </div>
          <div className="border border-gray-300 rounded-b-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Column 1 */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={equipment.network} onChange={() => setEquipment(prev => ({ ...prev, network: !prev.network }))} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="text-xs text-gray-700">NETWORK</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={equipment.cpu} onChange={() => setEquipment(prev => ({ ...prev, cpu: !prev.cpu }))} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="text-xs text-gray-700">CPU</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={equipment.printer} onChange={() => setEquipment(prev => ({ ...prev, printer: !prev.printer }))} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="text-xs text-gray-700">PRINTER</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={equipment.monitor} onChange={() => setEquipment(prev => ({ ...prev, monitor: !prev.monitor }))} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="text-xs text-gray-700">MONITOR</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={equipment.keyboard} onChange={() => setEquipment(prev => ({ ...prev, keyboard: !prev.keyboard }))} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="text-xs text-gray-700">KEYBOARD</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={equipment.antiVirus} onChange={() => setEquipment(prev => ({ ...prev, antiVirus: !prev.antiVirus }))} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="text-xs text-gray-700">ANTI-VIRUS</span>
                </label>
              </div>
              {/* Column 2 */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={equipment.upsAvr} onChange={() => setEquipment(prev => ({ ...prev, upsAvr: !prev.upsAvr }))} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="text-xs text-gray-700">UPS/AVR</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={equipment.defragment} onChange={() => setEquipment(prev => ({ ...prev, defragment: !prev.defragment }))} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="text-xs text-gray-700">DEFRAGMENT</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={equipment.signaturePad} onChange={() => setEquipment(prev => ({ ...prev, signaturePad: !prev.signaturePad }))} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="text-xs text-gray-700">SIGNATURE PAD</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={equipment.webCamera} onChange={() => setEquipment(prev => ({ ...prev, webCamera: !prev.webCamera }))} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="text-xs text-gray-700">WEB CAMERA</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={equipment.barcodeScanner} onChange={() => setEquipment(prev => ({ ...prev, barcodeScanner: !prev.barcodeScanner }))} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="text-xs text-gray-700">BARCODE SCANNER</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={equipment.barcodePrinter} onChange={() => setEquipment(prev => ({ ...prev, barcodePrinter: !prev.barcodePrinter }))} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="text-xs text-gray-700">BARCODE PRINTER</span>
                </label>
              </div>
              {/* Column 3 */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={equipment.fingerPrintScanner} onChange={() => setEquipment(prev => ({ ...prev, fingerPrintScanner: !prev.fingerPrintScanner }))} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="text-xs text-gray-700">FINGER PRINT SCANNER</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={equipment.mouse} onChange={() => setEquipment(prev => ({ ...prev, mouse: !prev.mouse }))} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="text-xs text-gray-700">MOUSE</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Staff Member
                </>
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};
