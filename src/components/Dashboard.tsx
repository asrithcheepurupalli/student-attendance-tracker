import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { 
  parseDate, 
  formatDate, 
  calculateAttendancePercentage,
  calculateRequiredAttendance,
  getTotalClassesInCycle,
  getRemainingClassDays,
  getClassesToSkip
} from '../utils/dateUtils';
import { 
  Calendar, 
  BarChart3, 
  Settings as SettingsIcon, 
  LogOut, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar as CalendarIcon,
  User,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import SubjectList from './SubjectList';
import AttendanceCalendar from './AttendanceCalendar';
import AttendanceStats from './AttendanceStats';
import Settings from './Settings';
import Profile from './Profile';

const Dashboard: React.FC = () => {
  const { state, logout } = useApp();
  const [activeTab, setActiveTab] = useState('calendar');

  const today = new Date();
  const startDate = parseDate(state.cycleStartDate);
  const endDate = parseDate(state.cycleEndDate);

  const attendanceStats = calculateAttendancePercentage(
    state.attendance,
    state.subjects,
    startDate,
    endDate,
    state.holidays
  );

  const totalClassesInCycle = getTotalClassesInCycle(
    startDate,
    endDate,
    state.subjects,
    state.holidays
  );

  // Calculate total classes held and attended with proper lab weighting
  let totalClassesHeld = 0;
  let totalClassesAttended = 0;

  // Create a map to track which classes have attendance records
  const classAttendanceMap = new Map();
  
  // First, process all attendance records
  state.attendance.forEach(record => {
    if (record.status !== 'holiday' && record.status !== null) {
      const subject = state.subjects.find(s => s.id === record.subjectId);
      if (subject) {
        const weight = subject.isLab ? 3 : 1;
        const key = `${record.date}-${record.subjectId}`;
        
        // Store the record with its weight
        classAttendanceMap.set(key, {
          weight,
          status: record.status
        });
      }
    }
  });
  
  // Now calculate totals from the map
  classAttendanceMap.forEach(({ weight, status }) => {
    totalClassesHeld += weight;
    if (status === 'present') {
      totalClassesAttended += weight;
    }
  });

  const remainingClassDays = getRemainingClassDays(
    state.subjects,
    startDate,
    endDate,
    state.holidays
  );

  const remainingClasses = remainingClassDays.reduce(
    (total, day) => total + day.classes.reduce((sum, cls) => sum + (cls.isLab ? 3 : 1), 0), 
    0
  );

  const requiredAttendance = calculateRequiredAttendance(
    attendanceStats.overall,
    state.targetAttendance,
    totalClassesAttended,
    totalClassesHeld,
    remainingClasses
  );

  // Get classes that can be skipped
  const classesToSkip = getClassesToSkip(
    state.subjects,
    state.attendance,
    startDate,
    endDate,
    state.holidays,
    state.targetAttendance,
    requiredAttendance.maxAbsences
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar - Fixed Position */}
      <div className="w-64 bg-white shadow-md fixed h-full">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Attendance Tracker</h1>
          </div>
          {state.user?.name && (
            <p className="text-sm text-gray-600 mt-1">Welcome, {state.user.name}</p>
          )}
        </div>
        
        <nav className="mt-6">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`w-full flex items-center px-6 py-3 text-left ${
              activeTab === 'calendar'
                ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Calendar className="h-5 w-5 mr-3" />
            <span>Calendar</span>
          </button>
          
          <button
            onClick={() => setActiveTab('stats')}
            className={`w-full flex items-center px-6 py-3 text-left ${
              activeTab === 'stats'
                ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="h-5 w-5 mr-3" />
            <span>Statistics</span>
          </button>
          
          <button
            onClick={() => setActiveTab('subjects')}
            className={`w-full flex items-center px-6 py-3 text-left ${
              activeTab === 'subjects'
                ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <BookOpen className="h-5 w-5 mr-3" />
            <span>Subjects</span>
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center px-6 py-3 text-left ${
              activeTab === 'profile'
                ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <User className="h-5 w-5 mr-3" />
            <span>Profile</span>
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center px-6 py-3 text-left ${
              activeTab === 'settings'
                ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <SettingsIcon className="h-5 w-5 mr-3" />
            <span>Settings</span>
          </button>
        </nav>
        
        <div className="absolute bottom-0 w-64 border-t p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Current Cycle</p>
              <p className="text-xs text-gray-500">
                {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
              </p>
            </div>
            <button 
              onClick={logout}
              className="p-2 rounded-full hover:bg-gray-100"
              title="Logout"
            >
              <LogOut className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - With Left Margin */}
      <div className="flex-1 ml-64">
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Overall Attendance</h2>
              <div className="flex items-end">
                <span className="text-3xl font-bold text-blue-600">{attendanceStats.overall.toFixed(1)}%</span>
                <span className="text-sm text-gray-500 ml-2 mb-1">/ {state.targetAttendance}% target</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className={`h-2.5 rounded-full ${
                    attendanceStats.overall >= state.targetAttendance 
                      ? 'bg-green-500' 
                      : attendanceStats.overall >= state.targetAttendance * 0.9 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, attendanceStats.overall)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Classes Attended</h2>
              <div className="flex items-end">
                <span className="text-3xl font-bold text-blue-600">{totalClassesAttended}</span>
                <span className="text-sm text-gray-500 ml-2 mb-1">/ {totalClassesHeld} classes</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {totalClassesInCycle} total classes in this cycle
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Attendance Forecast</h2>
              {requiredAttendance.canReachTarget ? (
                <>
                  <div className="flex items-center mb-1">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm">Target is achievable</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    You need to attend <span className="font-semibold">{requiredAttendance.classesNeeded}</span> more classes
                  </p>
                  <p className="text-sm text-gray-600">
                    You can miss up to <span className="font-semibold">{requiredAttendance.maxAbsences}</span> classes
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center mb-1">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-sm">Target may not be achievable</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Even with 100% attendance for remaining classes
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              {activeTab === 'calendar' && <AttendanceCalendar />}
              {activeTab === 'stats' && <AttendanceStats />}
              {activeTab === 'subjects' && <SubjectList />}
              {activeTab === 'profile' && <Profile />}
              {activeTab === 'settings' && <Settings />}
            </div>
          </div>

          {/* Attendance Recommendations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Attendance Recommendations</h2>
            
            {remainingClassDays.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  To maintain at least {state.targetAttendance}% attendance, here are some recommendations:
                </p>
                
                {requiredAttendance.canReachTarget ? (
                  <>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">You need to attend {requiredAttendance.classesNeeded} more classes</p>
                        <p className="text-sm text-gray-600">
                          You can miss up to {requiredAttendance.maxAbsences} classes and still meet your target
                        </p>
                      </div>
                    </div>
                    
                    {classesToSkip.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Classes you could potentially skip:</p>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {classesToSkip.map((item, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-md">
                              <p className="text-sm font-medium">{format(item.date, 'EEEE, MMMM d, yyyy')}</p>
                              <div className="mt-1 flex items-center justify-between">
                                <div>
                                  <p className="text-sm">{item.subject.name}</p>
                                  <p className="text-xs text-gray-600">{item.subject.startTime} - {item.subject.endTime} | {item.subject.roomNo}</p>
                                </div>
                                <div className={`text-xs px-2 py-1 rounded-full ${
                                  item.priority === 'low' 
                                    ? 'bg-green-100 text-green-800' 
                                    : item.priority === 'medium'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                }`}>
                                  {item.priority === 'low' ? 'Safe to skip' : item.priority === 'medium' ? 'Skip with caution' : 'Attend if possible'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Target attendance may not be achievable</p>
                      <p className="text-sm text-gray-600">
                        You should attend all remaining {remainingClasses} classes to get as close as possible to your target
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                No upcoming classes found in the current cycle.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;