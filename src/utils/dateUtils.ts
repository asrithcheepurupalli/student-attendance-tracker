import { format, parse, addDays, isWithinInterval, isSameDay, differenceInDays, isSameMonth, getDay } from 'date-fns';
import { Holiday, Subject, AttendanceRecord, ClassSkipRecommendation } from '../types';

export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const parseDate = (dateString: string): Date => {
  return parse(dateString, 'yyyy-MM-dd', new Date());
};

export const getDayName = (date: Date): string => {
  return format(date, 'EEEE').toLowerCase();
};

export const isHoliday = (date: Date, holidays: Holiday[]): Holiday | undefined => {
  return holidays.find(holiday => isSameDay(parseDate(holiday.date), date));
};

export const getClassesForDate = (date: Date, subjects: Subject[]): Subject[] => {
  const dayName = getDayName(date);
  return subjects.filter(subject => subject.day.toLowerCase() === dayName);
};

export const getDatesBetween = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  let currentDate = startDate;
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  
  return dates;
};

export const getTotalClassesInCycle = (
  startDate: Date,
  endDate: Date,
  subjects: Subject[],
  holidays: Holiday[]
): number => {
  const dates = getDatesBetween(startDate, endDate);
  let totalClasses = 0;
  
  dates.forEach(date => {
    const dayName = getDayName(date);
    const isDateHoliday = isHoliday(date, holidays);
    
    if (!isDateHoliday) {
      const classesOnDay = subjects.filter(subject => subject.day.toLowerCase() === dayName);
      // Count lab sessions as 3 classes
      totalClasses += classesOnDay.reduce((sum, cls) => sum + (cls.isLab ? 3 : 1), 0);
    }
  });
  
  return totalClasses;
};

export const calculateAttendancePercentage = (
  attendance: AttendanceRecord[],
  subjects: Subject[],
  startDate: Date,
  endDate: Date,
  holidays: Holiday[]
): { overall: number; bySubject: Record<string, number> } => {
  const dates = getDatesBetween(startDate, endDate);
  const today = new Date();
  
  // Filter dates up to today
  const pastDates = dates.filter(date => date <= today);
  
  // Create a map to track which classes have attendance records
  const classAttendanceMap = new Map();
  
  // First, process all attendance records
  attendance.forEach(record => {
    if (record.status !== 'holiday' && record.status !== null) {
      const subject = subjects.find(s => s.id === record.subjectId);
      if (subject) {
        const key = `${record.date}-${record.subjectId}`;
        classAttendanceMap.set(key, {
          weight: subject.isLab ? 3 : 1,
          status: record.status
        });
      }
    }
  });
  
  // Initialize counters
  let totalClasses = 0;
  let totalPresent = 0;
  const subjectTotals: Record<string, { total: number; present: number }> = {};
  
  // Initialize subject totals
  subjects.forEach(subject => {
    subjectTotals[subject.id] = { total: 0, present: 0 };
  });
  
  // Count classes and attendance for past dates
  pastDates.forEach(date => {
    const dayName = getDayName(date);
    const dateHoliday = isHoliday(date, holidays);
    
    if (!dateHoliday) {
      const classesOnDay = subjects.filter(subject => subject.day.toLowerCase() === dayName);
      
      classesOnDay.forEach(subject => {
        const dateStr = formatDate(date);
        const key = `${dateStr}-${subject.id}`;
        const attendanceRecord = classAttendanceMap.get(key);
        
        // Count lab sessions as 3 classes
        const classWeight = subject.isLab ? 3 : 1;
        
        if (attendanceRecord) {
          subjectTotals[subject.id].total += classWeight;
          totalClasses += classWeight;
          
          if (attendanceRecord.status === 'present') {
            subjectTotals[subject.id].present += classWeight;
            totalPresent += classWeight;
          }
        } else if (date <= today) {
          // If no record exists for a past class, count it as happened but absent
          subjectTotals[subject.id].total += classWeight;
          totalClasses += classWeight;
        }
      });
    }
  });
  
  // Calculate percentages
  const bySubject: Record<string, number> = {};
  
  Object.entries(subjectTotals).forEach(([subjectId, counts]) => {
    bySubject[subjectId] = counts.total > 0 ? (counts.present / counts.total) * 100 : 0;
  });
  
  const overall = totalClasses > 0 ? (totalPresent / totalClasses) * 100 : 0;
  
  return { overall, bySubject };
};

export const calculateRequiredAttendance = (
  currentAttendance: number,
  targetAttendance: number,
  totalClassesAttended: number,
  totalClassesHeld: number,
  remainingClasses: number
): { 
  canReachTarget: boolean; 
  classesNeeded: number;
  maxAbsences: number;
} => {
  // Total classes by the end of the cycle
  const totalClasses = totalClassesHeld + remainingClasses;
  
  // Calculate how many classes needed to attend to reach target
  const classesNeededForTarget = Math.ceil((targetAttendance / 100) * totalClasses);
  const classesNeeded = Math.max(0, classesNeededForTarget - totalClassesAttended);
  
  // Calculate how many more classes can be missed while still meeting target
  const maxAbsences = Math.max(0, remainingClasses - classesNeeded);
  
  // Check if target is still achievable
  const canReachTarget = (totalClassesAttended + remainingClasses) >= classesNeededForTarget;
  
  return {
    canReachTarget,
    classesNeeded,
    maxAbsences
  };
};

export const getRemainingClassDays = (
  subjects: Subject[],
  startDate: Date,
  endDate: Date,
  holidays: Holiday[]
): { date: Date; classes: Subject[] }[] => {
  const today = new Date();
  const dates = getDatesBetween(
    today > startDate ? today : startDate,
    endDate
  );
  
  return dates
    .filter(date => !isHoliday(date, holidays))
    .map(date => ({
      date,
      classes: getClassesForDate(date, subjects)
    }))
    .filter(day => day.classes.length > 0);
};

export const getClassesToSkip = (
  subjects: Subject[],
  attendance: AttendanceRecord[],
  startDate: Date,
  endDate: Date,
  holidays: Holiday[],
  targetAttendance: number,
  maxAbsences: number
): ClassSkipRecommendation[] => {
  if (maxAbsences <= 0) {
    return [];
  }
  
  const today = new Date();
  const remainingDays = getRemainingClassDays(subjects, today, endDate, holidays);
  
  // Calculate current attendance stats
  const stats = calculateAttendancePercentage(attendance, subjects, startDate, endDate, holidays);
  
  // Create a list of all upcoming classes
  const upcomingClasses: ClassSkipRecommendation[] = [];
  
  remainingDays.forEach(day => {
    day.classes.forEach(subject => {
      // Calculate the impact of skipping this class
      const subjectAttendance = stats.bySubject[subject.id] || 0;
      const classWeight = subject.isLab ? 3 : 1;
      
      // Higher impact means more important to attend
      let impact = 0;
      
      // If subject attendance is below target, it's more important to attend
      if (subjectAttendance < targetAttendance) {
        impact = (targetAttendance - subjectAttendance) * classWeight;
      }
      
      // Determine priority
      let priority: 'low' | 'medium' | 'high' = 'low';
      
      if (impact > 10) {
        priority = 'high';
      } else if (impact > 5) {
        priority = 'medium';
      }
      
      upcomingClasses.push({
        date: day.date,
        subject,
        impact,
        priority
      });
    });
  });
  
  // Sort by impact (ascending) - lower impact classes are better to skip
  upcomingClasses.sort((a, b) => a.impact - b.impact);
  
  // Return only the number of classes that can be skipped
  return upcomingClasses.slice(0, maxAbsences);
};