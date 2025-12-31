import React, { useState } from 'react';

interface ApiKeyModalProps {
  onSubmit: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSubmit }) => {
  const [inputKey, setInputKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim()) {
      onSubmit(inputKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 border border-slate-200">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-3xl">
            🗺️
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-800 text-center">
            HPSC Geography Prep
          </h2>
          <p className="text-slate-500 text-center mt-2 text-sm">
            Enter your Google Gemini API Key to access your AI Academic Mentor.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700 mb-1">
              API Key
            </label>
            <input
              type="password"
              id="apiKey"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="AIzaSy..."
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm"
          >
            Start Session
          </button>
        </form>
        <p className="mt-4 text-xs text-center text-slate-400">
          Your key is used locally and never stored on our servers.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyModal;