// Real auth module — backed by Express + MongoDB API
import { api, getToken, setToken, removeToken } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  loggedInAt?: string;
}

const USER_KEY = 'help_nearby_user';

// ─── Local helpers ─────────────────────────────────────────────────────────────
export const getUser = (): User | null => {
  if (!getToken()) return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

const saveUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const logoutUser = async (): Promise<void> => {
  try {
    await api.auth.logout();
  } catch {
    // ignore — always clear local state
  }
  removeToken();
  localStorage.removeItem(USER_KEY);
};

// ─── Sign Up (register + send OTP) ────────────────────────────────────────────
export const signupUser = async (
  name: string,
  email: string,
  password: string
): Promise<{ message: string }> => {
  const res = await api.auth.signup(name, email, password) as { message: string };
  return res;
};

// ─── Send OTP for login ────────────────────────────────────────────────────────
export const sendLoginOtp = async (email: string): Promise<{ message: string }> => {
  const res = await api.auth.sendOtp(email) as { message: string };
  return res;
};

// ─── Verify OTP → returns user + stores JWT ────────────────────────────────────
export const verifyOtpAndLogin = async (
  email: string,
  otp: string,
  purpose: 'login' | 'signup'
): Promise<User> => {
  const res = await api.auth.verifyOtp(email, otp, purpose);
  setToken(res.token);
  const user: User = { ...res.user, loggedInAt: new Date().toISOString() };
  saveUser(user);
  return user;
};

// ─── Password Login → returns user + stores JWT ────────────────────────────────
export const loginWithPassword = async (email: string, password: string): Promise<User> => {
  const res = await api.auth.login(email, password);
  setToken(res.token);
  const user: User = { ...res.user, loggedInAt: new Date().toISOString() };
  saveUser(user);
  return user;
};

// ─── Re-fetch user from backend (refresh profile) ─────────────────────────────
export const refreshUser = async (): Promise<User | null> => {
  if (!getToken()) return null;
  try {
    const res = await api.auth.me() as { user: User };
    saveUser(res.user);
    return res.user;
  } catch {
    return null;
  }
};
