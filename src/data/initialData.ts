import { Subject, Holiday } from '../types';
import { parseDate, formatDate } from '../utils/dateUtils';

export const initialSubjects: Subject[] = [
  // Monday
  {
    id: 'daa-lab',
    name: 'Design and Analysis of Algorithms Lab',
    faculty: 'Dr. P.Aravind / Mr. M.S.N Murthy',
    roomNo: '3A Lab',
    startTime: '08:40',
    endTime: '11:10',
    day: 'Monday',
    isLab: true
  },
  {
    id: 'accounting',
    name: 'Accounting and Economics for Engineers',
    faculty: 'Mr. K.Bhaskara Rao',
    roomNo: 'B4-301',
    startTime: '12:00',
    endTime: '12:50',
    day: 'Monday',
    isLab: false
  },
  {
    id: 'numerical-methods-1',
    name: 'Numerical Methods',
    faculty: 'Mr. K. Satya Murthy',
    roomNo: 'B4-301',
    startTime: '12:50',
    endTime: '13:40',
    day: 'Monday',
    isLab: false
  },
  {
    id: 'daa-1',
    name: 'Design and Analysis of Algorithms',
    faculty: 'Dr. P.Aravind',
    roomNo: 'B4-301',
    startTime: '13:40',
    endTime: '14:30',
    day: 'Monday',
    isLab: false
  },
  {
    id: 'dwdm-1',
    name: 'Data Warehousing and Data Mining',
    faculty: 'Ms. M.S.R Pavani',
    roomNo: 'B4-301',
    startTime: '14:30',
    endTime: '15:20',
    day: 'Monday',
    isLab: false
  },
  
  // Tuesday
  {
    id: 'dwdm-2',
    name: 'Data Warehousing and Data Mining',
    faculty: 'Ms. M.S.R Pavani',
    roomNo: 'B4-301',
    startTime: '08:40',
    endTime: '09:30',
    day: 'Tuesday',
    isLab: false
  },
  {
    id: 'dwdm-3',
    name: 'Data Warehousing and Data Mining',
    faculty: 'Ms. M.S.R Pavani',
    roomNo: 'B4-301',
    startTime: '09:30',
    endTime: '10:20',
    day: 'Tuesday',
    isLab: false
  },
  {
    id: 'daa-2',
    name: 'Design and Analysis of Algorithms',
    faculty: 'Dr. P.Aravind',
    roomNo: 'B4-301',
    startTime: '10:20',
    endTime: '11:10',
    day: 'Tuesday',
    isLab: false
  },
  {
    id: 'os-lab',
    name: 'Operating Systems Lab',
    faculty: 'Mrs. S.C.K. Mahalakshmi / Mrs. B. Pranalini / Ms. S. Lakshmi Aparna',
    roomNo: '3A Lab',
    startTime: '12:00',
    endTime: '14:30',
    day: 'Tuesday',
    isLab: true
  },
  
  // Wednesday
  {
    id: 'cpp-lab',
    name: 'C++ Programming Lab',
    faculty: 'Mrs. G. Sathee Lakshmi / Ms. P. Sravya',
    roomNo: 'MIC',
    startTime: '08:40',
    endTime: '11:10',
    day: 'Wednesday',
    isLab: true
  },
  {
    id: 'accounting-2',
    name: 'Accounting and Economics for Engineers',
    faculty: 'Mr. K.Bhaskara Rao',
    roomNo: 'B4-301',
    startTime: '12:00',
    endTime: '12:50',
    day: 'Wednesday',
    isLab: false
  },
  {
    id: 'numerical-methods-2',
    name: 'Numerical Methods',
    faculty: 'Mr. K. Satya Murthy',
    roomNo: 'B4-301',
    startTime: '12:50',
    endTime: '13:40',
    day: 'Wednesday',
    isLab: false
  },
  {
    id: 'os-1',
    name: 'Operating Systems',
    faculty: 'Dr. P. Prapoorna Roja',
    roomNo: 'B4-301',
    startTime: '13:40',
    endTime: '14:30',
    day: 'Wednesday',
    isLab: false
  },
  
  // Thursday
  {
    id: 'dwdm-4',
    name: 'Data Warehousing and Data Mining',
    faculty: 'Ms. M.S.R Pavani',
    roomNo: 'B4-301',
    startTime: '08:40',
    endTime: '09:30',
    day: 'Thursday',
    isLab: false
  },
  {
    id: 'os-2',
    name: 'Operating Systems',
    faculty: 'Dr. P. Prapoorna Roja',
    roomNo: 'B4-301',
    startTime: '09:30',
    endTime: '10:20',
    day: 'Thursday',
    isLab: false
  },
  {
    id: 'os-3',
    name: 'Operating Systems',
    faculty: 'Dr. P. Prapoorna Roja',
    roomNo: 'B4-301',
    startTime: '10:20',
    endTime: '11:10',
    day: 'Thursday',
    isLab: false
  },
  {
    id: 'numerical-methods-3',
    name: 'Numerical Methods',
    faculty: 'Mr. K. Satya Murthy',
    roomNo: 'B4-301',
    startTime: '12:00',
    endTime: '12:50',
    day: 'Thursday',
    isLab: false
  },
  {
    id: 'numerical-methods-4',
    name: 'Numerical Methods',
    faculty: 'Mr. K. Satya Murthy',
    roomNo: 'B4-301',
    startTime: '12:50',
    endTime: '13:40',
    day: 'Thursday',
    isLab: false
  },
  
  // Friday
  {
    id: 'accounting-3',
    name: 'Accounting and Economics for Engineers',
    faculty: 'Mr. K.Bhaskara Rao',
    roomNo: 'B4-301',
    startTime: '08:40',
    endTime: '09:30',
    day: 'Friday',
    isLab: false
  },
  {
    id: 'daa-3',
    name: 'Design and Analysis of Algorithms',
    faculty: 'Dr. P.Aravind',
    roomNo: 'B4-301',
    startTime: '09:30',
    endTime: '10:20',
    day: 'Friday',
    isLab: false
  },
  {
    id: 'daa-4',
    name: 'Design and Analysis of Algorithms',
    faculty: 'Dr. P.Aravind',
    roomNo: 'B4-301',
    startTime: '10:20',
    endTime: '11:10',
    day: 'Friday',
    isLab: false
  },
  {
    id: 'os-4',
    name: 'Operating Systems',
    faculty: 'Dr. P. Prapoorna Roja',
    roomNo: 'B4-301',
    startTime: '11:10',
    endTime: '12:00',
    day: 'Friday',
    isLab: false
  },
  {
    id: 'design-thinking',
    name: 'Design Thinking and Innovation',
    faculty: 'Ms. Lateefa Shaik / Ms. K. Beulah / Mrs. Geetanjali Nayak',
    roomNo: 'B4-301',
    startTime: '12:50',
    endTime: '15:20',
    day: 'Friday',
    isLab: false
  }
];

export const initialHolidays: Holiday[] = [
  {
    date: '2025-01-13',
    name: 'Bhogi'
  },
  {
    date: '2025-01-14',
    name: 'Makara Sankranti'
  },
  {
    date: '2025-01-15',
    name: 'Kanuma'
  },
  {
    date: '2025-02-26',
    name: 'Maha Sivaratri'
  },
  {
    date: '2025-03-14',
    name: 'Holi'
  },
  {
    date: '2025-03-31',
    name: 'Eid-Ul-Fitr (Ramzan)'
  },
  {
    date: '2025-04-05',
    name: 'Babu Jagjivan Ram\'s Birthday'
  },
  {
    date: '2025-04-14',
    name: 'Dr. B.R.Ambedkar\'s Birthday'
  },
  {
    date: '2025-04-18',
    name: 'Good Friday'
  }
];

export const initialCycleData = {
  currentCycle: 'second' as const,
  cycleStartDate: '2025-03-03', // Second cycle start date
  cycleEndDate: '2025-04-26'    // Second cycle end date
};

export const getInitialState = () => ({
  user: null,
  subjects: initialSubjects,
  attendance: [],
  holidays: initialHolidays,
  targetAttendance: 65,
  ...initialCycleData
});