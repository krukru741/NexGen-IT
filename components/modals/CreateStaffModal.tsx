import React, { useState } from 'react';
import { UserPlus, AlertCircle, Upload, Server, Monitor, Printer, Keyboard, Mouse, Shield, Video, Scan, CheckSquare } from 'lucide-react';
import { UserRole } from '../../types';
import { db } from '../../services/mockDatabase';
import { Modal, Input, Select, Button, Badge } from '../ui';

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
      
      handleClose();

    } catch (error) {
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
      setEquipment({
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
      setErrors({});
      onClose();
    }
  };

  const footer = (
    <>
      <Button
        variant="secondary"
        onClick={handleClose}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        onClick={(e) => handleSubmit(e as any)}
        loading={isSubmitting}
        icon={<UserPlus className="w-4 h-4" />}
      >
        Create Staff Member
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Staff Member"
      size="lg"
      footer={footer}
    >
      <div className="space-y-6">
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm font-medium text-red-800">{errors.submit}</p>
          </div>
        )}

        {/* Auto-Fetch Button */}
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={autoFetchSystemInfo}
            loading={isAutoFetching}
            disabled={isSubmitting}
            icon={<Server className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Auto-Fetch IP & PC Name
          </Button>
        </div>

        {/* Avatar Upload Section */}
        <div className="flex items-center gap-6 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
          <div className="flex-shrink-0 relative group">
            <img 
              src={avatarPreview} 
              alt="Avatar preview" 
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md group-hover:shadow-lg transition-all"
            />
            <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/10"></div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
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
            <div className="flex flex-col gap-1">
              <label
                htmlFor="avatar-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer text-sm font-medium text-slate-700 w-fit shadow-sm"
              >
                <Upload className="w-4 h-4" />
                Upload New Image
              </label>
              <p className="text-xs text-slate-500 pl-1">Max 2MB, JPG/PNG format</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* PC No. Field */}
          <div>
            <Input
              label="PC No."
              value={formData.pcNo}
              onChange={(e) => setFormData({ ...formData, pcNo: e.target.value })}
              placeholder="CSC-MIS-01"
              error={errors.pcNo}
              disabled={isSubmitting}
              icon={<Monitor className="w-4 h-4" />}
            />
            <p className="text-[10px] text-slate-400 mt-1 pl-1">Format: CSC-MIS-XX</p>
          </div>

          {/* IP Address Field */}
          <div>
            <Input
              label="IP Address"
              value={formData.ipAddress}
              onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
              placeholder="192.168.1.100"
              error={errors.ipAddress}
              disabled={isSubmitting}
              icon={<Server className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Full Name Field */}
        <div>
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter full name"
            error={errors.name}
            disabled={isSubmitting}
            fullWidth
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Department Field */}
          <div>
            <Select
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              disabled={isSubmitting}
              options={[
                { value: "MIS / IT", label: "MIS / IT" },
                { value: "HR", label: "HR" },
                { value: "Finance", label: "Finance" },
                { value: "Accounting", label: "Accounting" },
                { value: "Admin OIC", label: "Admin OIC" },
                { value: "Procurement", label: "Procurement" },
                { value: "Operations", label: "Operations" },
                { value: "Management", label: "Management" },
                { value: "Sales Marketing", label: "Sales Marketing" },
                { value: "Logistics Warehouse", label: "Logistics Warehouse" },
                { value: "Building Maintenance", label: "Building Maintenance" },
                { value: "Customer Service", label: "Customer Service" },
                { value: "Quality Assurance", label: "Quality Assurance" },
                { value: "Research & Development", label: "Research & Development" },
                { value: "Legal", label: "Legal" },
                { value: "Compliance", label: "Compliance" },
                { value: "Training & Development", label: "Training & Development" },
                { value: "Security", label: "Security" },
                { value: "Facilities", label: "Facilities" },
              ]}
              error={errors.department}
              fullWidth
            />
          </div>

          {/* Role Field */}
          <div>
            <Select
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              disabled={isSubmitting}
              options={[
                { value: UserRole.EMPLOYEE, label: "Employee" },
                { value: UserRole.TECHNICIAN, label: "Technician" },
                { value: UserRole.ADMIN, label: "Admin" },
              ]}
              fullWidth
            />
          </div>
        </div>


        {/* Installed Equipment Section */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <h4 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-500" />
              Installed Equipment
            </h4>
            {errors.equipment && (
              <span className="text-red-500 text-xs font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.equipment}
              </span>
            )}
          </div>
          
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4">
            {[
              { key: 'network', label: 'NETWORK', icon: Server },
              { key: 'cpu', label: 'CPU', icon: Monitor },
              { key: 'printer', label: 'PRINTER', icon: Printer },
              { key: 'monitor', label: 'MONITOR', icon: Monitor },
              { key: 'keyboard', label: 'KEYBOARD', icon: Keyboard },
              { key: 'mouse', label: 'MOUSE', icon: Mouse },
              { key: 'antiVirus', label: 'ANTI-VIRUS', icon: Shield },
              { key: 'webCamera', label: 'WEB CAMERA', icon: Video },
              { key: 'barcodeScanner', label: 'BARCODE SCANNER', icon: Scan },
              { key: 'barcodePrinter', label: 'BARCODE PRINTER', icon: Printer },
              // Add other items appropriately or generically
              { key: 'upsAvr', label: 'UPS/AVR' },
              { key: 'defragment', label: 'DEFRAGMENT' },
              { key: 'signaturePad', label: 'SIGNATURE PAD' },
              { key: 'fingerPrintScanner', label: 'FINGERPRINT' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group select-none">
                <input 
                  type="checkbox" 
                  checked={equipment[key as keyof Equipment]} 
                  onChange={() => setEquipment(prev => ({ ...prev, [key]: !prev[key as keyof Equipment] }))} 
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 transition-colors cursor-pointer" 
                />
                <span className={`text-xs font-medium transition-colors ${equipment[key as keyof Equipment] ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
