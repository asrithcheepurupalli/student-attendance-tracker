import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updatePassword,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { User, AppState, Subject, AttendanceRecord, Holiday } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { getInitialState } from '../data/initialData';

// Authentication functions
export const registerUser = async (email: string, password: string, name: string, rollNumber: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user: User = {
      uid: userCredential.user.uid,
      email,
      name,
      rollNumber
    };
    
    // Save user profile to Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), user);
    
    // Get initial state with predefined subjects and holidays
    const initialState = getInitialState();
    
    // Create initial app state for the user
    await setDoc(doc(db, 'appStates', userCredential.user.uid), {
      subjects: initialState.subjects,
      attendance: [],
      holidays: initialState.holidays,
      targetAttendance: initialState.targetAttendance,
      currentCycle: initialState.currentCycle,
      cycleStartDate: initialState.cycleStartDate,
      cycleEndDate: initialState.cycleEndDate,
      user: {
        uid: userCredential.user.uid,
        email,
        name,
        rollNumber
      }
    });
    
    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (userDoc.exists()) {
      return { uid: userCredential.user.uid, ...userDoc.data() } as User;
    } else {
      throw new Error('User profile not found');
    }
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

export const changeUserPassword = async (currentUser: FirebaseUser, newPassword: string): Promise<void> => {
  try {
    await updatePassword(currentUser, newPassword);
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// App state functions
export const saveAppState = async (userId: string, state: Partial<AppState>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'appStates', userId), state);
  } catch (error) {
    console.error('Error saving app state:', error);
    throw error;
  }
};

export const loadAppState = async (userId: string): Promise<AppState | null> => {
  try {
    const stateDoc = await getDoc(doc(db, 'appStates', userId));
    
    if (stateDoc.exists()) {
      return stateDoc.data() as AppState;
    } else {
      // If no state exists, create a new one with initial data
      const initialState = getInitialState();
      initialState.user = { uid: userId } as User;
      
      await setDoc(doc(db, 'appStates', userId), initialState);
      return initialState;
    }
  } catch (error) {
    console.error('Error loading app state:', error);
    throw error;
  }
};

export const updateSubjects = async (userId: string, subjects: Subject[]): Promise<void> => {
  try {
    await updateDoc(doc(db, 'appStates', userId), { subjects });
  } catch (error) {
    console.error('Error updating subjects:', error);
    throw error;
  }
};

export const updateAttendance = async (userId: string, attendance: AttendanceRecord[]): Promise<void> => {
  try {
    await updateDoc(doc(db, 'appStates', userId), { attendance });
  } catch (error) {
    console.error('Error updating attendance:', error);
    throw error;
  }
};

export const updateHolidays = async (userId: string, holidays: Holiday[]): Promise<void> => {
  try {
    await updateDoc(doc(db, 'appStates', userId), { holidays });
  } catch (error) {
    console.error('Error updating holidays:', error);
    throw error;
  }
};

export const updateTargetAttendance = async (userId: string, targetAttendance: number): Promise<void> => {
  try {
    await updateDoc(doc(db, 'appStates', userId), { targetAttendance });
  } catch (error) {
    console.error('Error updating target attendance:', error);
    throw error;
  }
};

export const updateCycleDates = async (
  userId: string, 
  cycleStartDate: string, 
  cycleEndDate: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'appStates', userId), { cycleStartDate, cycleEndDate });
  } catch (error) {
    console.error('Error updating cycle dates:', error);
    throw error;
  }
};

export const markAttendance = async (
  userId: string, 
  currentAttendance: AttendanceRecord[],
  record: AttendanceRecord
): Promise<AttendanceRecord[]> => {
  try {
    const existingIndex = currentAttendance.findIndex(
      a => a.date === record.date && a.subjectId === record.subjectId
    );
    
    let newAttendance;
    
    // If status is null, remove the record
    if (record.status === null) {
      newAttendance = currentAttendance.filter(
        a => !(a.date === record.date && a.subjectId === record.subjectId)
      );
    } else if (existingIndex >= 0) {
      // Update existing record
      newAttendance = [...currentAttendance];
      newAttendance[existingIndex] = record;
    } else {
      // Add new record
      newAttendance = [...currentAttendance, record];
    }
    
    await updateDoc(doc(db, 'appStates', userId), { attendance: newAttendance });
    return newAttendance;
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw error;
  }
};

export const markHoliday = async (
  userId: string, 
  currentHolidays: Holiday[],
  date: string, 
  isHoliday: boolean
): Promise<Holiday[]> => {
  try {
    let newHolidays = [...currentHolidays];
    
    if (isHoliday) {
      // Check if holiday already exists
      const holidayExists = newHolidays.some(h => h.date === date);
      if (!holidayExists) {
        const newHoliday: Holiday = { date, name: 'Custom Holiday' };
        newHolidays = [...newHolidays, newHoliday];
      }
    } else {
      // Remove holiday if it exists
      newHolidays = newHolidays.filter(h => h.date !== date);
    }
    
    await updateDoc(doc(db, 'appStates', userId), { holidays: newHolidays });
    return newHolidays;
  } catch (error) {
    console.error('Error marking holiday:', error);
    throw error;
  }
};