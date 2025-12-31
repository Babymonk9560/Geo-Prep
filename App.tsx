import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';
import EvaluationLab from './components/EvaluationLab';
import { AppMode, Message, User } from './types';
import { sendMessageToGemini } from './services/geminiService';
import ApiKeyModal from './components/ApiKeyModal';

const App: React.FC = () => {
  // We use a dummy check for API Key modal (since it's env based now, we might skip this UI or keep it if env is missing)
  // For the purpose of this demo with strict env variable usage, we assume process.env.API_KEY is present or managed externally.
  // However, keeping the ApiKeyModal logic for flexibility if the env var isn't set in the browser context properly.
  const [hasApiKey, setHasApiKey] = useState(!!process.env.API_KEY); 
  
  const [user, setUser] = useState<User | null>(null);
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.SYLLABUS_DECODER);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleApiKeySubmit = (key: string) => {
    // In a real app we might validate this. 
    // Here we just acknowledge the user "entered" one, though the code uses process.env.API_KEY primarily.
    // If the instruction implies ONLY process.env.API_KEY, we should probably assume it exists. 
    // But the previous file content had this, so I'll keep the logic simple.
    setHasApiKey(true);
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    if (loggedInUser.role === 'Admin') {
        setCurrentMode(AppMode.ADMIN_DASHBOARD);
    } else {
        setCurrentMode(AppMode.SYLLABUS_DECODER);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setMessages([]);
    setCurrentMode(AppMode.SYLLABUS_DECODER);
  };

  const handleSendMessage = async (text: string) => {
    if (!user) return;
    
    const userMsg: Message = { role: 'user', text, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Pass the user profile type to the Gemini service
      const responseText = await sendMessageToGemini(messages, text, currentMode, user.profileType);
      const aiMsg: Message = { role: 'model', text: responseText, timestamp: Date.now() };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = { 
        role: 'model', 
        text: "I encountered an error connecting to the Geography Mentor service.", 
        timestamp: Date.now() 
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (mode: AppMode) => {
    if (mode === currentMode) return;
    setCurrentMode(mode);
    setMessages([]); // Clear chat when switching modes
    
    // Add welcome message only for Chat modes
    if (mode === AppMode.SYLLABUS_DECODER || mode === AppMode.INTERVIEW_SIMULATOR || mode === AppMode.HARYANA_CONTEXTUALIZER) {
        let welcomeText = "";
        if (mode === AppMode.SYLLABUS_DECODER) welcomeText = `Mode A Active: Syllabus Decoder. Which topic from the HPSC syllabus shall we analyze academically? (${user?.profileType} Mode)`;
        if (mode === AppMode.INTERVIEW_SIMULATOR) welcomeText = `Mode B Active: Interview Simulator. I will act as the HPSC Panel. Type 'Ready' to begin your mock interview. (${user?.profileType} Mode)`;
        if (mode === AppMode.HARYANA_CONTEXTUALIZER) welcomeText = `Mode C Active: Haryana Contextualizer. Give me a geography concept, and I will connect it to Haryana. (${user?.profileType} Mode)`;
        setMessages([{ role: 'model', text: welcomeText, timestamp: Date.now() }]);
    }
  };

  // 1. API Key Check (If env var missing)
  if (!hasApiKey && !process.env.API_KEY) {
      return <ApiKeyModal onSubmit={handleApiKeySubmit} />;
  }

  // 2. Login Check
  if (!user) {
      return <LoginScreen onLogin={handleLogin} />;
  }

  // 3. Main App Layout
  return (
    <div className="flex h-screen w-full bg-slate-50">
      <Sidebar 
        currentMode={currentMode} 
        onModeSelect={handleModeChange}
        onReset={() => setMessages([])}
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 h-full relative overflow-hidden flex flex-col">
        {currentMode === AppMode.ADMIN_DASHBOARD ? (
            <AdminDashboard />
        ) : currentMode === AppMode.EVALUATION_LAB ? (
            <EvaluationLab username={user.username} />
        ) : (
            <ChatInterface 
                messages={messages} 
                isLoading={isLoading} 
                onSendMessage={handleSendMessage}
                currentMode={currentMode}
            />
        )}
        
        {/* Mobile Mode Switcher (Simplified for demo) */}
        <div className="md:hidden absolute top-0 right-0 p-2 z-50">
             <button onClick={handleLogout} className="text-xs bg-slate-800 text-white px-2 py-1 rounded">Logout</button>
        </div>
      </main>
    </div>
  );
};

export default App;