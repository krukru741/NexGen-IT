import React, { useState } from 'react';
import { X } from 'lucide-react';
import { User } from '../../types';

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

  if (!isOpen || users.length === 0) return null;

  const currentUser = users[selectedUserIndex];

  const handleCheckboxChange = (key: keyof Equipment) => {
    setEquipment(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* User Selection Dropdown */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Employee Name
          </label>
          <select
            value={selectedUserIndex}
            onChange={(e) => setSelectedUserIndex(Number(e.target.value))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            {users.map((user, index) => (
              <option key={user.id} value={index}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        {/* Staff Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              IP Address
            </label>
            <input
              type="text"
              value="192.168.2.11"
              readOnly
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              PC No
            </label>
            <input
              type="text"
              value="CPDSC-MIS01"
              readOnly
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Employee Name
            </label>
            <input
              type="text"
              value={currentUser.name.toUpperCase()}
              readOnly
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50"
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
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            Close
          </button>
          <button
            className="px-5 py-2.5 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800 transition-colors font-semibold text-sm shadow-md"
          >
            UPDATE
          </button>
        </div>
      </div>
    </div>
  );
};
