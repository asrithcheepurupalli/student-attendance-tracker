import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  calculateAttendancePercentage,
  parseDate,
  formatDate
} from '../utils/dateUtils';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

const AttendanceStats: React.FC = () => {
  const { state } = useApp();
  const [showAll, setShowAll] = useState(false);
  
  const startDate = parseDate(state.cycleStartDate);
  const endDate = parseDate(state.cycleEndDate);
  
  const attendanceStats = calculateAttendancePercentage(
    state.attendance,
    state.subjects,
    startDate,
    endDate,
    state.holidays
  );
  
  // Group subjects by name to combine multiple classes of the same subject
  const subjectGroups: Record<string, {
    name: string;
    totalClasses: number;
    attendedClasses: number;
    percentage: number;
    ids: string[];
  }> = {};
  
  state.subjects.forEach(subject => {
    if (!subjectGroups[subject.name]) {
      subjectGroups[subject.name] = {
        name: subject.name,
        totalClasses: 0,
        attendedClasses: 0,
        percentage: 0,
        ids: []
      };
    }
    
    subjectGroups[subject.name].ids.push(subject.id);
  });
  
  // Calculate attendance for each subject group
  Object.values(subjectGroups).forEach(group => {
    let totalClasses = 0;
    let attendedClasses = 0;
    
    // Create a map to track which classes have attendance records
    const classAttendanceMap = new Map();
    
    // First, process all attendance records for this subject group
    state.attendance.forEach(record => {
      if (group.ids.includes(record.subjectId) && record.status !== 'holiday' && record.status !== null) {
        const subject = state.subjects.find(s => s.id === record.subjectId);
        if (subject) {
          const key = `${record.date}-${record.subjectId}`;
          classAttendanceMap.set(key, {
            weight: subject.isLab ? 3 : 1,
            status: record.status
          });
        }
      }
    });
    
    // Now calculate totals from the map
    classAttendanceMap.forEach(({ weight, status }) => {
      totalClasses += weight;
      if (status === 'present') {
        attendedClasses += weight;
      }
    });
    
    group.totalClasses = totalClasses;
    group.attendedClasses = attendedClasses;
    group.percentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
  });
  
  // Sort subjects by attendance percentage (ascending)
  const sortedSubjects = Object.values(subjectGroups).sort((a, b) => a.percentage - b.percentage);
  
  // Determine which subjects to display
  const displaySubjects = showAll 
    ? sortedSubjects 
    : sortedSubjects.slice(0, 5);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">Attendance Statistics</h2>
        <div className="flex items-center text-sm text-gray-500">
          <BarChart3 className="h-4 w-4 mr-1" />
          <span>Current Cycle: {formatDate(startDate)} - {formatDate(endDate)}</span>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-blue-800">Overall Attendance</h3>
            <p className="text-sm text-blue-600">
              Target: {state.targetAttendance}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-700">
              {attendanceStats.overall.toFixed(1)}%
            </p>
            <p className={`text-sm flex items-center ${
              attendanceStats.overall >= state.targetAttendance 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {attendanceStats.overall >= state.targetAttendance ? (
                <>
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>Above target</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 mr-1" />
                  <span>Below target</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-md font-medium text-gray-700 mb-4">Subject-wise Attendance</h3>
        
        <div className="space-y-4">
          {displaySubjects.map((subject, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{subject.name}</h4>
                  <p className="text-sm text-gray-500">
                    {subject.attendedClasses} of {subject.totalClasses} classes attended
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    subject.percentage >= state.targetAttendance 
                      ? 'text-green-600' 
                      : subject.percentage >= state.targetAttendance * 0.9
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}>
                    {subject.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    subject.percentage >= state.targetAttendance 
                      ? 'bg-green-500' 
                      : subject.percentage >= state.targetAttendance * 0.9
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, subject.percentage)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        
        {sortedSubjects.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showAll ? 'Show Less' : `Show All (${sortedSubjects.length - 5} more)`}
          </button>
        )}
      </div>
    </div>
  );
};

export default AttendanceStats;