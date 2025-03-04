import { AppState, User } from '../types';

const APP_STATE_KEY = 'attendance-tracker-state';
const USERS_KEY = 'attendance-tracker-users';

export const saveAppState = (state: AppState): void => {
  localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
};

export const loadAppState = (): AppState | null => {
  const savedState = localStorage.getItem(APP_STATE_KEY);
  return savedState ? JSON.parse(savedState) : null;
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  const existingUserIndex = users.findIndex(u => u.rollNumber === user.rollNumber);
  
  if (existingUserIndex >= 0) {
    users[existingUserIndex] = user;
  } else {
    users.push(user);
  }
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getUsers = (): User[] => {
  const usersJson = localStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

export const findUser = (rollNumber: string, password: string): User | undefined => {
  const users = getUsers();
  return users.find(user => user.rollNumber === rollNumber && user.password === password);
};

export const userExists = (rollNumber: string): boolean => {
  const users = getUsers();
  return users.some(user => user.rollNumber === rollNumber);
};

export const clearAppState = (): void => {
  localStorage.removeItem(APP_STATE_KEY);
};