import React from 'react';
import { AppMode, ModeConfig, User } from '../types';

interface SidebarProps {
  currentMode: AppMode;
  onModeSelect: (mode: AppMode) => void;
  onReset: () => void;
  user: User;
  onLogout: () => void;
}

const MODES: ModeConfig[] = [
  {
    id: AppMode.SYLLABUS_DECODER,
    title: 'Syllabus Decoder',
    icon: <span className="text-xl">📚</span>,
    description: 'Deep academic explanation',
  },
  {
    id: AppMode.INTERVIEW_SIMULATOR,
    title: 'Interview Simulator',
    icon: <span className="text-xl">🎤</span>,
    description: 'Mock panel simulation',
  },
  {
    id: AppMode.HARYANA_CONTEXTUALIZER,
    title: 'Haryana Context',
    icon: <span className="text-xl">🌾</span>,
    description: 'Link global to local',
  },
  {
    id: AppMode.EVALUATION_LAB,
    title: 'Evaluation Lab',
    icon: <span className="text-xl">📝</span>,
    description: 'AI Score Card & Grading',
  },
];

const Sidebar: React.FC<SidebarProps> = ({ currentMode, onModeSelect, onReset, user, onLogout }) => {
  return (
    <div className="w-80 bg-slate-900 h-full flex flex-col text-slate-100 shadow-xl z-20 hidden md:flex">
      <div className="p-6 border-b border-slate-800">
        <h1 className="font-serif text-xl font-bold flex items-center gap-2">
          <span>🌏</span> Geo-Mentor
        </h1>
        <p className="text-xs text-slate-400 mt-1">HPSC Assistant Professor Prep</p>
      </div>

      <div className="p-4 bg-slate-800/50 mx-4 mt-4 rounded-lg border border-slate-700 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">
            {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="overflow-hidden">
            <div className="text-sm font-medium truncate">{user.username}</div>
            <div className="text-xs text-slate-400">{user.role}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Study Modes
        </p>
        {MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeSelect(mode.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
              currentMode === mode.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentMode === mode.id ? 'bg-blue-500' : 'bg-slate-700'}`}>
              {mode.icon}
            </div>
            <div>
              <div className="font-medium text-sm">{mode.title}</div>
              <div className={`text-xs ${currentMode === mode.id ? 'text-blue-100' : 'text-slate-500'}`}>
                {mode.description}
              </div>
            </div>
          </button>
        ))}

        {user.role === 'Admin' && (
             <button
             onClick={() => onModeSelect(AppMode.ADMIN_DASHBOARD)}
             className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all mt-6 ${
               currentMode === AppMode.ADMIN_DASHBOARD
                 ? 'bg-indigo-600 text-white shadow-md'
                 : 'hover:bg-slate-800 text-indigo-300'
             }`}
           >
             <div className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-900">
               📊
             </div>
             <div>
               <div className="font-medium text-sm">Admin Dashboard</div>
               <div className="text-xs text-indigo-200">View Class Analytics</div>
             </div>
           </button>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 space-y-2">
        {(currentMode === AppMode.SYLLABUS_DECODER || currentMode === AppMode.INTERVIEW_SIMULATOR || currentMode === AppMode.HARYANA_CONTEXTUALIZER) && (
            <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors text-sm"
            >
            <span>↺</span> Reset Conversation
            </button>
        )}
        <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-900/40 transition-colors text-sm"
        >
            Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;