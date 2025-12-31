import { UserProfileType } from '../types';

export interface StoredUser {
  password: string; // Simple storage for demo purposes
  profile: UserProfileType;
}

const DB_KEY = 'hpsc_users_db';

export const getUsers = (): Record<string, StoredUser> => {
  const stored = localStorage.getItem(DB_KEY);
  return stored ? JSON.parse(stored) : {};
};

export const registerUser = (username: string, password: string, profile: UserProfileType): boolean => {
  const users = getUsers();
  if (users[username]) return false; // User already exists
  
  users[username] = { password, profile };
  localStorage.setItem(DB_KEY, JSON.stringify(users));
  return true;
};

export const authenticateUser = (username: string, password: string): { success: boolean; profile?: UserProfileType } => {
  const users = getUsers();
  const user = users[username];
  if (user && user.password === password) {
    return { success: true, profile: user.profile };
  }
  return { success: false };
};