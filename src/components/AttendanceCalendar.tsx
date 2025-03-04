import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isWithinInterval,
  parseISO,
  startOfWeek,
  addDays
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  Calendar as CalendarIcon,
  AlertCircle
} from 'lucide-react';
import { formatDate, parseDate, isHoliday, getClassesForDate } from '../utils/dateUtils';
import { Subject } from '../types';

const AttendanceCalendar: React.FC = () => {
  const { state, markAttendance, markHoliday } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const previousSelectedDateRef = useRef<Date | null>(null);

  const cycleStartDate = parseDate(state.cycleStartDate);
  const cycleEndDate = parseDate(state.cycleEndDate);

  // Store the previous selected date when it changes
  useEffect(() => {
    previousSelectedDateRef.current = selectedDate;
  }, [selectedDate]);

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  
  // Generate calendar grid with proper week alignment
  const calendarDays = [];
  let day = startDate;
  
  // Create 6 weeks (42 days) to ensure we have enough rows for any month
  for (let i = 0; i < 42; i++) {
    calendarDays.push(day);
    day = addDays(day, 1);
    
    // Break if we've gone past the end of the month and completed the week
    if (i > 28 && !isSameMonth(day, monthStart) && day.getDay() === 0) {
      break;
    }
  }

  const getAttendanceForDay = (date: Date, subjectId: string) => {
    const dateStr = formatDate(date);
    return state.attendance.find(
      a => a.date === dateStr && a.subjectId === subjectId
    );
  };

  const handleAttendanceChange = (date: Date, subjectId: string, status: 'present' | 'absent' | null) => {
    const dateStr = formatDate(date);
    const existingRecord = state.attendance.find(
      a => a.date === dateStr && a.subjectId === subjectId
    );
    
    // If status is null, it means we're toggling off the current status
    if (status === null) {
      // If there's an existing record, we'll remove it by passing null to markAttendance
      if (existingRecord) {
        markAttendance({
          date: dateStr,
          subjectId,
          status: null
        });
      }
      return;
    }
    
    // If the same status is already set, toggle it off
    if (existingRecord && existingRecord.status === status) {
      markAttendance({
        date: dateStr,
        subjectId,
        status: null
      });
    } else {
      // Otherwise, set the new status
      markAttendance({
        date: dateStr,
        subjectId,
        status
      });
    }
  };

  const handleHolidayToggle = (date: Date) => {
    const dateStr = formatDate(date);
    const holiday = isHoliday(date, state.holidays);
    markHoliday(dateStr, !holiday);
  };

  const isDateInCycle = (date: Date) => {
    return isWithinInterval(date, { start: cycleStartDate, end: cycleEndDate });
  };

  const getClassesForSelectedDate = (): Subject[] => {
    if (!selectedDate) return [];
    return getClassesForDate(selectedDate, state.subjects);
  };

  const getDayClasses = (date: Date) => {
    let classes = 'h-10 w-10 rounded-full flex items-center justify-center';
    
    if (!isSameMonth(date, currentMonth)) {
      classes += ' text-gray-300';
    } else {
      classes += ' text-gray-900 hover:bg-gray-100';
      
      if (selectedDate && isSameDay(date, selectedDate)) {
        classes += ' bg-blue-100 text-blue-600 font-bold';
      }
      
      // Check if it's a holiday
      if (isHoliday(date, state.holidays)) {
        classes += ' bg-red-50 text-red-600';
      }
      
      // Check if it's in the cycle
      if (!isDateInCycle(date)) {
        classes += ' opacity-50';
      }
    }
    
    return classes;
  };

  const selectedDateClasses = getClassesForSelectedDate();
  const selectedDateHoliday = selectedDate ? isHoliday(selectedDate, state.holidays) : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">Attendance Calendar</h2>
        <div className="flex space-x-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <span className="text-gray-700 font-medium">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2 border-b">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, i) => {
          const dayClasses = getDayClasses(day);
          const isHolidayDay = isHoliday(day, state.holidays);
          const classes = getClassesForDate(day, state.subjects);
          const hasClasses = classes.length > 0;
          
          return (
            <div key={i} className="text-center py-1">
              <button
                onClick={() => setSelectedDate(day)}
                className={dayClasses}
              >
                {format(day, 'd')}
              </button>
              {isSameMonth(day, currentMonth) && isDateInCycle(day) && (
                <div className="mt-1 flex justify-center">
                  {isHolidayDay ? (
                    <span className="h-1.5 w-1.5 bg-red-500 rounded-full"></span>
                  ) : hasClasses ? (
                    <span className="h-1.5 w-1.5 bg-blue-500 rounded-full"></span>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-6 border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Mark as holiday:</span>
              <button
                onClick={() => handleHolidayToggle(selectedDate)}
                className={`p-2 rounded-full ${
                  selectedDateHoliday ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                {selectedDateHoliday ? (
                  <AlertCircle className="h-5 w-5" />
                ) : (
                  <CalendarIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {selectedDateHoliday ? (
            <div className="bg-red-50 border border-red-100 rounded-md p-4 text-center">
              <p className="text-red-600 font-medium">
                {selectedDateHoliday.name}
              </p>
              <p className="text-sm text-red-500 mt-1">
                No classes on this holiday
              </p>
            </div>
          ) : selectedDateClasses.length > 0 ? (
            <div className="space-y-4">
              {selectedDateClasses.map(subject => {
                const attendance = getAttendanceForDay(selectedDate, subject.id);
                
                return (
                  <div key={subject.id} className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{subject.name}</h4>
                        <p className="text-sm text-gray-500">
                          {subject.startTime} - {subject.endTime} | {subject.roomNo}
                        </p>
                        <p className="text-sm text-gray-500">
                          {subject.faculty}
                        </p>
                        {subject.isLab && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Lab (Counts as 3 classes)
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAttendanceChange(
                            selectedDate, 
                            subject.id, 
                            attendance?.status === 'present' ? null : 'present'
                          )}
                          className={`p-2 rounded-full ${
                            attendance?.status === 'present' 
                              ? 'bg-green-100 text-green-600' 
                              : 'hover:bg-gray-100 text-gray-500'
                          }`}
                          title="Mark as present"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(
                            selectedDate, 
                            subject.id, 
                            attendance?.status === 'absent' ? null : 'absent'
                          )}
                          className={`p-2 rounded-full ${
                            attendance?.status === 'absent' 
                              ? 'bg-red-100 text-red-600' 
                              : 'hover:bg-gray-100 text-gray-500'
                          }`}
                          title="Mark as absent"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-100 rounded-md p-4 text-center">
              <p className="text-gray-500">
                No classes scheduled for this day
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceCalendar;