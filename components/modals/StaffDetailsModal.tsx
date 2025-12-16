import React, { useState, useEffect } from 'react';
import { UserPlus, AlertCircle, Upload, Server, Monitor, Printer, Keyboard, Mouse, Shield, Video, Scan, CheckSquare, Trash2 } from 'lucide-react';
import { User, UserRole } from '../../types';
import { db } from '../../services/mockDatabase';
import { Modal, Input, Select, Button } from '../ui';

interface StaffDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User;
  title?: string;
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

export const StaffDetailsModal: React.FC<StaffDetailsModalProps> = ({ isOpen, onClose, users, currentUser, title = 'Staff Details' }) => {
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
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

  // Editable fields state
  const [ipAddress, setIpAddress] = useState('');
  const [pcNo, setPcNo] = useState('');
  const [department, setDepartment] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'TECHNICIAN' | 'EMPLOYEE'>('EMPLOYEE');
  const [isAutoFetching, setIsAutoFetching] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // Auto-fetch IP Address and PC Name
  const autoFetchSystemInfo = async () => {
    setIsAutoFetching(true);
    try {
      // Fetch IP Address from external API
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setIpAddress(data.ip);

      // Generate PC name with CSC-MIS prefix
      const lastOctet = data.ip.split('.').pop();
      const pcName = `CSC-MIS-${lastOctet}`;
      
      setPcNo(pcName);
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

  // Update form when user changes - MUST be before early return
  useEffect(() => {
    if (isOpen && users.length > 0) {
      const user = users[selectedUserIndex];
      setIpAddress(user.ipAddress || '');
      setPcNo(user.pcNo || '');
      setDepartment(user.department || '');
      setName(user.name || '');
      setRole(user.role);
      setAvatarPreview(user.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2U1ZTdlYiIvPjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjI1IiBmaWxsPSIjOWNhM2FmIi8+PHBhdGggZD0iTTMwIDEyMGMwLTI1IDIwLTQ1IDQ1LTQ1czQ1IDIwIDQ1IDQ1IiBmaWxsPSIjOWNhM2FmIi8+PC9zdmc+');
      
      // Load equipment from user
      if (user.equipment) {
        setEquipment({
          network: user.equipment.network || false,
          cpu: user.equipment.cpu || false,
          printer: user.equipment.printer || false,
          monitor: user.equipment.monitor || false,
          keyboard: user.equipment.keyboard || false,
          antiVirus: user.equipment.antiVirus || false,
          upsAvr: user.equipment.upsAvr || false,
          defragment: user.equipment.defragment || false,
          signaturePad: user.equipment.signaturePad || false,
          webCamera: user.equipment.webCamera || false,
          barcodeScanner: user.equipment.barcodeScanner || false,
          barcodePrinter: user.equipment.barcodePrinter || false,
          fingerPrintScanner: user.equipment.fingerPrintScanner || false,
          mouse: user.equipment.mouse || false
        });
      } else {
        // Reset to all false if no equipment data
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
      }
    }
  }, [selectedUserIndex, users, isOpen]);

  if (!isOpen || users.length === 0) return null;

  const handleUpdate = () => {
    // Validate required fields
    if (!name.trim() || !ipAddress.trim() || !pcNo.trim() || !department.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    // Check for duplicate PC No (excluding current user)
    const existingPcNo = db.getUsers().find(u => u.pcNo === pcNo.trim() && u.id !== users[selectedUserIndex].id);
    if (existingPcNo) {
      alert('This PC No. is already in use by another user');
      return;
    }

    // Check for duplicate IP Address (excluding current user)
    const existingIp = db.getUsers().find(u => u.ipAddress === ipAddress.trim() && u.id !== users[selectedUserIndex].id);
    if (existingIp) {
      alert('This IP Address is already in use by another user');
      return;
    }

    // Validate equipment
    const hasEquipment = Object.values(equipment).some(val => val === true);
    if (!hasEquipment) {
      alert('Please select at least one equipment');
      return;
    }

    // Update user in database
    const updatedUser: User = {
      ...users[selectedUserIndex],
      name,
      ipAddress,
      pcNo,
      department,
      role, // Include role in update
      avatar: avatarPreview,
      equipment
    };
    
    db.updateUser(updatedUser);
    alert('Staff details updated successfully!');
    onClose();
  };

  const handleDelete = () => {
    const userToDelete = users[selectedUserIndex];
    if (confirm(`Are you sure you want to delete ${userToDelete.name}? This action cannot be undone.`)) {
      const success = db.deleteUser(userToDelete.id);
      if (success) {
        alert('Staff member deleted successfully!');
        onClose();
      } else {
        alert('Failed to delete staff member.');
      }
    }
  };

  const footer = (
    <div className="flex w-full justify-between items-center">
      <Button
        variant="danger"
        onClick={handleDelete}
        icon={<Trash2 className="w-4 h-4" />}
      >
        Delete User
      </Button>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button onClick={handleUpdate}>
          Save Changes
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      footer={footer}
    >
      <div className="space-y-6">
        {/* User Selection Dropdown */}
        {users.length > 1 && (
          <div className="mb-4">
            <Select
              label="Select Staff Member"
              value={selectedUserIndex}
              onChange={(e) => setSelectedUserIndex(Number(e.target.value))}
              options={users.map((user, index) => ({ value: index, label: user.name }))}
              fullWidth
            />
          </div>
        )}

        {/* Auto-Fetch Button */}
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={autoFetchSystemInfo}
            loading={isAutoFetching}
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
              src={avatarPreview || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2U1ZTdlYiIvPjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjI1IiBmaWxsPSIjOWNhM2FmIi8+PHBhdGggZD0iTTMwIDEyMGMwLTI1IDIwLTQ1IDQ1LTQ1czQ1IDIwIDQ1IDQ1IiBmaWxsPSIjOWNhM2FmIi8+PC9zdmc+'} 
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
              id="avatar-upload-details"
            />
            <div className="flex flex-col gap-1">
              <label
                htmlFor="avatar-upload-details"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer text-sm font-medium text-slate-700 w-fit shadow-sm"
              >
                <Upload className="w-4 h-4" />
                Change Image
              </label>
              <p className="text-xs text-slate-500 pl-1">Max 2MB, JPG/PNG format</p>
            </div>
          </div>
        </div>

        {/* Staff Information - Now Editable */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Input
              label="IP Address"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="192.168.1.100"
              icon={<Server className="w-4 h-4" />}
            />
          </div>
          <div>
            <Input
              label="PC No."
              value={pcNo}
              onChange={(e) => setPcNo(e.target.value)}
              placeholder="CSC-MIS-01"
              icon={<Monitor className="w-4 h-4" />}
            />
             <p className="text-[10px] text-slate-400 mt-1 pl-1">Format: CSC-MIS-XX</p>
          </div>
          <div>
            <Select
              label="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
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
              fullWidth
            />
          </div>
          <div>
            <Input
              label="Employee Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              fullWidth
            />
          </div>
          <div>
            <Select
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'ADMIN' | 'TECHNICIAN' | 'EMPLOYEE')}
              disabled={currentUser.role !== 'ADMIN'}
              options={[
                { value: "ADMIN", label: "Admin" },
                { value: "TECHNICIAN", label: "Technician" },
                { value: "EMPLOYEE", label: "Employee" },
              ]}
              fullWidth
            />
             {currentUser.role !== 'ADMIN' && (
              <p className="text-[10px] text-slate-400 mt-1 pl-1">Only admins can change roles</p>
            )}
          </div>
        </div>

        {/* Installed Equipment Section */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
             <h4 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-500" />
              Installed Equipment
            </h4>
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
