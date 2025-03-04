import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { parseDate } from '../utils/dateUtils';
import { Save, AlertCircle } from 'lucide-react';

const Settings: React.FC = () => {
  const { state, updateTargetAttendance, updateCycleDates } = useApp();
  
  const [targetAttendance, setTargetAttendance] = useState(state.targetAttendance);
  const [cycleStartDate, setCycleStartDate] = useState(state.cycleStartDate);
  const [cycleEndDate, setCycleEndDate] = useState(state.cycleEndDate);
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleSaveSettings = () => {
    updateTargetAttendance(targetAttendance);
    updateCycleDates(cycleStartDate, cycleEndDate);
    
    setSuccessMessage('Settings saved successfully!');
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-700">Settings</h2>
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-4">Attendance Target</h3>
          
          <div className="flex items-center">
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={targetAttendance}
              onChange={(e) => setTargetAttendance(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="ml-4 text-lg font-bold text-blue-600 min-w-[3rem] text-center">
              {targetAttendance}%
            </span>
          </div>
          
          <div className="mt-2 flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              The minimum attendance requirement is typically 75%. Setting a higher target (e.g., 80-85%) gives you a safety buffer.
            </p>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-md font-medium text-gray-700 mb-4">Academic Cycle</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Cycle Start Date</label>
              <input
                type="date"
                value={cycleStartDate}
                onChange={(e) => setCycleStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Cycle End Date</label>
              <input
                type="date"
                value={cycleEndDate}
                onChange={(e) => setCycleEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4 bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Current Academic Calendar</h4>
            <p className="text-sm text-blue-600">
              Second Cycle: {format(parseDate(state.cycleStartDate), 'MMMM d, yyyy')} - {format(parseDate(state.cycleEndDate), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
        
        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;