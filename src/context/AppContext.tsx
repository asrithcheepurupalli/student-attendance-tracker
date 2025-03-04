import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, User, Subject, AttendanceRecord, Holiday } from '../types';
import { getInitialState } from '../data/initialData';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import {
  loginUser,
  logoutUser,
  registerUser,
  loadAppState,
  saveAppState,
  updateSubjects as updateFirebaseSubjects,
  updateAttendance as updateFirebaseAttendance,
  updateHolidays as updateFirebaseHolidays,
  updateTargetAttendance as updateFirebaseTargetAttendance,
  updateCycleDates as updateFirebaseCycleDates,
  markAttendance as markFirebaseAttendance,
  markHoliday as markFirebaseHoliday,
  changeUserPassword
} from '../utils/firebaseUtils';

interface AppContextType {
  state: AppState;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, rollNumber: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  updateSubjects: (subjects: Subject[]) => Promise<void>;
  updateAttendance: (attendance: AttendanceRecord[]) => Promise<void>;
  updateHolidays: (holidays: Holiday[]) => Promise<void>;
  updateTargetAttendance: (target: number) => Promise<void>;
  updateCycleDates: (startDate: string, endDate: string) => Promise<void>;
  markAttendance: (record: AttendanceRecord) => Promise<void>;
  markHoliday: (date: string, isHoliday: boolean) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(getInitialState());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      try {
        if (user) {
          // User is signed in
          const userDoc = await loadAppState(user.uid);
          if (userDoc) {
            setState(prevState => ({
              ...prevState,
              ...userDoc,
              user: {
                uid: user.uid,
                email: user.email || '',
                name: userDoc.user?.name || '',
                rollNumber: userDoc.user?.rollNumber || ''
              }
            }));
          }
        } else {
          // User is signed out
          setState(getInitialState());
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginUser(email, password);
      const appState = await loadAppState(user.uid!);
      if (appState) {
        setState(prevState => ({
          ...prevState,
          ...appState,
          user
        }));
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, rollNumber: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await registerUser(email, password, name, rollNumber);
      setState(prevState => ({
        ...prevState,
        user
      }));
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await logoutUser();
      setState(getInitialState());
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Failed to logout');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!auth.currentUser) {
        throw new Error('No user is currently logged in');
      }
      await changeUserPassword(auth.currentUser, newPassword);
    } catch (err: any) {
      console.error('Change password error:', err);
      setError(err.message || 'Failed to change password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSubjects = async (subjects: Subject[]) => {
    if (!state.user?.uid) return;
    setLoading(true);
    try {
      await updateFirebaseSubjects(state.user.uid, subjects);
      setState(prevState => ({ ...prevState, subjects }));
    } catch (err: any) {
      setError(err.message || 'Failed to update subjects');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAttendance = async (attendance: AttendanceRecord[]) => {
    if (!state.user?.uid) return;
    setLoading(true);
    try {
      await updateFirebaseAttendance(state.user.uid, attendance);
      setState(prevState => ({ ...prevState, attendance }));
    } catch (err: any) {
      setError(err.message || 'Failed to update attendance');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateHolidays = async (holidays: Holiday[]) => {
    if (!state.user?.uid) return;
    setLoading(true);
    try {
      await updateFirebaseHolidays(state.user.uid, holidays);
      setState(prevState => ({ ...prevState, holidays }));
    } catch (err: any) {
      setError(err.message || 'Failed to update holidays');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTargetAttendance = async (target: number) => {
    if (!state.user?.uid) return;
    setLoading(true);
    try {
      await updateFirebaseTargetAttendance(state.user.uid, target);
      setState(prevState => ({ ...prevState, targetAttendance: target }));
    } catch (err: any) {
      setError(err.message || 'Failed to update target attendance');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCycleDates = async (cycleStartDate: string, cycleEndDate: string) => {
    if (!state.user?.uid) return;
    setLoading(true);
    try {
      await updateFirebaseCycleDates(state.user.uid, cycleStartDate, cycleEndDate);
      setState(prevState => ({ ...prevState, cycleStartDate, cycleEndDate }));
    } catch (err: any) {
      setError(err.message || 'Failed to update cycle dates');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (record: AttendanceRecord) => {
    if (!state.user?.uid) return;
    setLoading(true);
    try {
      const newAttendance = await markFirebaseAttendance(state.user.uid, state.attendance, record);
      setState(prevState => ({ ...prevState, attendance: newAttendance }));
    } catch (err: any) {
      setError(err.message || 'Failed to mark attendance');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markHoliday = async (date: string, isHoliday: boolean) => {
    if (!state.user?.uid) return;
    setLoading(true);
    try {
      const newHolidays = await markFirebaseHoliday(state.user.uid, state.holidays, date, isHoliday);
      setState(prevState => ({ ...prevState, holidays: newHolidays }));
    } catch (err: any) {
      setError(err.message || 'Failed to mark holiday');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const contextValue: AppContextType = {
    state,
    loading,
    error,
    login,
    register,
    logout,
    changePassword,
    updateSubjects,
    updateAttendance,
    updateHolidays,
    updateTargetAttendance,
    updateCycleDates,
    markAttendance,
    markHoliday
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};