import React, { useState } from 'react';
import { X } from 'lucide-react';
import { User } from '../../types';
import { db } from '../../services/mockDatabase';

interface StaffDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
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

export const StaffDetailsModal: React.FC<StaffDetailsModalProps> = ({ isOpen, onClose, users, title = 'Staff Details' }) => {
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
  React.useEffect(() => {
    if (isOpen && users.length > 0) {
      const currentUser = users[selectedUserIndex];
      setIpAddress(currentUser.ipAddress || '');
      setPcNo(currentUser.pcNo || '');
      setDepartment(currentUser.department || '');
      setName(currentUser.name || '');
      setAvatarPreview(currentUser.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2U1ZTdlYiIvPjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjI1IiBmaWxsPSIjOWNhM2FmIi8+PHBhdGggZD0iTTMwIDEyMGMwLTI1IDIwLTQ1IDQ1LTQ1czQ1IDIwIDQ1IDQ1IiBmaWxsPSIjOWNhM2FmIi8+PC9zdmc+');
      
      // Load equipment from user
      if (currentUser.equipment) {
        setEquipment({
          network: currentUser.equipment.network || false,
          cpu: currentUser.equipment.cpu || false,
          printer: currentUser.equipment.printer || false,
          monitor: currentUser.equipment.monitor || false,
          keyboard: currentUser.equipment.keyboard || false,
          antiVirus: currentUser.equipment.antiVirus || false,
          upsAvr: currentUser.equipment.upsAvr || false,
          defragment: currentUser.equipment.defragment || false,
          signaturePad: currentUser.equipment.signaturePad || false,
          webCamera: currentUser.equipment.webCamera || false,
          barcodeScanner: currentUser.equipment.barcodeScanner || false,
          barcodePrinter: currentUser.equipment.barcodePrinter || false,
          fingerPrintScanner: currentUser.equipment.fingerPrintScanner || false,
          mouse: currentUser.equipment.mouse || false
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

  const currentUser = users[selectedUserIndex];

  const handleCheckboxChange = (key: keyof Equipment) => {
    setEquipment(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUpdate = () => {
    // Validate required fields
    if (!name.trim() || !ipAddress.trim() || !pcNo.trim() || !department.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    // Check for duplicate PC No (excluding current user)
    const existingPcNo = db.getUsers().find(u => u.pcNo === pcNo.trim() && u.id !== currentUser.id);
    if (existingPcNo) {
      alert('This PC No. is already in use by another user');
      return;
    }

    // Check for duplicate IP Address (excluding current user)
    const existingIp = db.getUsers().find(u => u.ipAddress === ipAddress.trim() && u.id !== currentUser.id);
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
    const updatedUser = {
      ...currentUser,
      name: name.trim(),
      ipAddress: ipAddress.trim(),
      pcNo: pcNo.trim(),
      department: department.trim(),
      avatar: avatarPreview,
      equipment: equipment
    };
    
    db.updateUser(updatedUser);
    alert('Staff details updated successfully!');
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${currentUser.name}? This action cannot be undone.`)) {
      const success = db.deleteUser(currentUser.id);
      if (success) {
        alert('User deleted successfully!');
        onClose();
        window.location.reload(); // Reload to update the list
      } else {
        alert('Failed to delete user.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">

        {/* User Selection Dropdown */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Employee Name
          </label>
          <select
            value={selectedUserIndex}
            onChange={(e) => setSelectedUserIndex(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            {users.map((user, index) => (
              <option key={user.id} value={index}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        {/* Auto-Fetch Button */}
        <div className="mb-4">
          <button
            onClick={autoFetchSystemInfo}
            disabled={isAutoFetching}
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
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
          <div className="flex-shrink-0">
            <img 
              src={avatarPreview || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2U1ZTdlYiIvPjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjI1IiBmaWxsPSIjOWNhM2FmIi8+PHBhdGggZD0iTTMwIDEyMGMwLTI1IDIwLTQ1IDQ1LTQ1czQ1IDIwIDQ1IDQ1IiBmaWxsPSIjOWNhM2FmIi8+PC9zdmc+'} 
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
              id="avatar-upload-details"
            />
            <label
              htmlFor="avatar-upload-details"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer text-xs font-medium text-gray-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Change Image
            </label>
            <p className="text-[10px] text-gray-500 mt-1">Max 2MB, JPG/PNG</p>
          </div>
        </div>

        {/* Staff Information - Now Editable */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              IP Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="192.168.1.100"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              PC No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={pcNo}
              onChange={(e) => setPcNo(e.target.value)}
              placeholder="CSC-MIS-01"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <p className="text-[10px] text-gray-500 mt-0.5">Format: CSC-MIS-XX</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
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
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Employee Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Installed Equipment Section */}
        <div className="bg-indigo-900 text-white px-4 py-2 rounded-t-lg font-semibold">
          INSTALLED
        </div>
        <div className="border border-gray-300 rounded-b-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1 */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={equipment.network}
                  onChange={() => handleCheckboxChange('network')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">NETWORK</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={equipment.cpu}
                  onChange={() => handleCheckboxChange('cpu')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">CPU</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={equipment.printer}
                  onChange={() => handleCheckboxChange('printer')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">PRINTER</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={equipment.monitor}
                  onChange={() => handleCheckboxChange('monitor')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">MONITOR</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={equipment.keyboard}
                  onChange={() => handleCheckboxChange('keyboard')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">KEYBOARD</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={equipment.antiVirus}
                  onChange={() => handleCheckboxChange('antiVirus')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">ANTI-VIRUS</span>
              </label>
            </div>

            {/* Column 2 */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={equipment.upsAvr}
                  onChange={() => handleCheckboxChange('upsAvr')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">UPS/AVR</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={equipment.defragment}
                  onChange={() => handleCheckboxChange('defragment')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">DEFRAGMENT</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={equipment.signaturePad}
                  onChange={() => handleCheckboxChange('signaturePad')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">SIGNATURE PAD</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={equipment.webCamera}
                  onChange={() => handleCheckboxChange('webCamera')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">WEB CAMERA</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={equipment.barcodeScanner}
                  onChange={() => handleCheckboxChange('barcodeScanner')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">BARCODE SCANNER</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={equipment.barcodePrinter}
                  onChange={() => handleCheckboxChange('barcodePrinter')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">BARCODE PRINTER</span>
              </label>
            </div>

            {/* Column 3 */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={equipment.fingerPrintScanner}
                  onChange={() => handleCheckboxChange('fingerPrintScanner')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">FINGER PRINT SCANNER</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={equipment.mouse}
                  onChange={() => handleCheckboxChange('mouse')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">MOUSE</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-3 mt-6">
          <button
            onClick={handleDelete}
            className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm shadow-md"
          >
            DELETE
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Close
            </button>
            <button
              onClick={handleUpdate}
              className="px-5 py-2.5 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800 transition-colors font-semibold text-sm shadow-md"
            >
              UPDATE
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
