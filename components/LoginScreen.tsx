import React, { useState } from 'react';
import { User, UserRole, UserProfileType } from '../types';
import { authenticateUser, registerUser } from '../services/authService';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'LOGIN' | 'SIGNUP' | 'ADMIN';

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [profileType, setProfileType] = useState<UserProfileType>('Fresher');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    
    const userVal = username.trim();
    const passVal = password.trim();

    if (mode === 'ADMIN') {
      if (passVal === 'BABYMONK') {
        onLogin({ username: 'Administrator', role: 'Admin', profileType: 'General' });
      } else {
        setError('Access Denied: Incorrect Admin Code');
      }
      return;
    }

    if (!userVal || !passVal) {
        setError('All fields are required');
        return;
    }

    if (mode === 'SIGNUP') {
        const success = registerUser(userVal, passVal, profileType);
        if (success) {
            setSuccessMsg("Account Created! Please log in.");
            setMode('LOGIN');
            setPassword('');
        } else {
            setError("Username already exists.");
        }
    } else if (mode === 'LOGIN') {
        const auth = authenticateUser(userVal, passVal);
        if (auth.success && auth.profile) {
            onLogin({ username: userVal, role: 'Student', profileType: auth.profile });
        } else {
            setError("Invalid Username or Password.");
        }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🌏</div>
          <h1 className="text-2xl font-serif font-bold text-slate-800">HPSC Geo-Prep</h1>
          <p className="text-slate-500 text-sm mt-1">Identity Access Management</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-6">
            <button 
                onClick={() => { setMode('LOGIN'); setError(null); setSuccessMsg(null); }}
                className={`flex-1 py-2 text-sm font-medium ${mode === 'LOGIN' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Login
            </button>
            <button 
                onClick={() => { setMode('SIGNUP'); setError(null); setSuccessMsg(null); }}
                className={`flex-1 py-2 text-sm font-medium ${mode === 'SIGNUP' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Sign Up
            </button>
            <button 
                onClick={() => { setMode('ADMIN'); setError(null); setSuccessMsg(null); }}
                className={`flex-1 py-2 text-sm font-medium ${mode === 'ADMIN' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Admin
            </button>
        </div>

        {successMsg && (
             <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg text-center">
                 {successMsg}
             </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Admin Field */}
          {mode === 'ADMIN' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Access Code</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Admin Passcode"
                />
              </div>
          )}

          {/* Student Fields */}
          {(mode === 'LOGIN' || mode === 'SIGNUP') && (
              <>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                    <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input
                    type="password"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    />
                </div>
              </>
          )}

          {/* Profile Selection for Sign Up */}
          {mode === 'SIGNUP' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Your Profile</label>
                <select
                    value={profileType}
                    onChange={(e) => setProfileType(e.target.value as UserProfileType)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                    <option value="Fresher">Fresher (Student)</option>
                    <option value="Working Professional">Working Professional</option>
                    <option value="UPSC Aspirant">UPSC Aspirant</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">
                    {profileType === 'Fresher' && "We will start from basics."}
                    {profileType === 'Working Professional' && "We will focus on high-yield topics."}
                    {profileType === 'UPSC Aspirant' && "We will leverage your General Studies knowledge."}
                </p>
              </div>
          )}

          {error && <p className="text-red-600 text-xs font-medium text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 rounded-lg transition-colors shadow-lg mt-2"
          >
            {mode === 'LOGIN' && "Secure Login"}
            {mode === 'SIGNUP' && "Create Account"}
            {mode === 'ADMIN' && "Verify & Access"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;