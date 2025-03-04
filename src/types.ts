export interface User {
  uid?: string;
  email: string;
  rollNumber: string;
  password?: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  faculty: string;
  roomNo: string;
  startTime: string;
  endTime: string;
  day: string;
  isLab: boolean;
}

export interface TimeTable {
  monday: Subject[];
  tuesday: Subject[];
  wednesday: Subject[];
  thursday: Subject[];
  friday: Subject[];
}

export interface AttendanceRecord {
  date: string;
  subjectId: string;
  status: 'present' | 'absent' | 'holiday' | null;
}

export interface Holiday {
  date: string;
  name: string;
}

export interface AppState {
  user: User | null;
  subjects: Subject[];
  attendance: AttendanceRecord[];
  holidays: Holiday[];
  targetAttendance: number;
  currentCycle: 'first' | 'second';
  cycleStartDate: string;
  cycleEndDate: string;
}

export interface ClassSkipRecommendation {
  date: Date;
  subject: Subject;
  impact: number; // Impact on overall attendance if skipped
  priority: 'low' | 'medium' | 'high'; // Priority to attend
}