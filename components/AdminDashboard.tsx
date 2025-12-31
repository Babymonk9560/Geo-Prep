import React, { useEffect, useState } from 'react';
import { getLogs, clearLogs } from '../services/storageService';
import { LogEntry } from '../types';

const AdminDashboard: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    setLogs(getLogs());
  }, []);

  const totalEvaluations = logs.length;
  
  // Safe accessor for nested new structure vs potential old structure in storage
  const getScore = (log: LogEntry) => log.result?.user_feedback?.score_total || 0;
  
  const averageScore = logs.length 
    ? (logs.reduce((acc, curr) => acc + getScore(curr), 0) / logs.length).toFixed(1) 
    : "0.0";

  // 1. ARCHETYPE ANALYTICS
  const archetypeCounts: Record<string, number> = {};
  logs.forEach(log => {
      const type = log.result?.admin_analytics?.candidate_archetype || 'Unknown';
      archetypeCounts[type] = (archetypeCounts[type] || 0) + 1;
  });

  // 2. ERROR CATEGORY vs TOPIC (Simplified Heatmap)
  const errorStats: Record<string, number> = {};
  logs.forEach(log => {
      const err = log.result?.admin_analytics?.error_category || 'None';
      if (err !== 'None') {
        errorStats[err] = (errorStats[err] || 0) + 1;
      }
  });

  // 3. COGNITIVE LEVEL
  const cogStats: Record<string, number> = { 'Recall': 0, 'Application': 0, 'Analysis': 0, 'Synthesis': 0 };
  logs.forEach(log => {
      const level = log.result?.admin_analytics?.cognitive_level;
      if (level && cogStats[level] !== undefined) {
          cogStats[level]++;
      }
  });

  const handleClear = () => {
    if (confirm("Are you sure you want to delete all records?")) {
        clearLogs();
        setLogs([]);
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900">Admin Analytics 📊</h1>
            <p className="text-slate-500 text-sm">HPSC Geography Cohort Insights</p>
          </div>
          <button onClick={handleClear} className="text-red-600 hover:text-red-800 text-sm font-medium border border-red-200 px-3 py-1 rounded-lg bg-white">Clear Database</button>
        </div>

        {/* TOP LEVEL METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Attempts</h3>
            <p className="text-3xl font-bold text-slate-800 mt-1">{totalEvaluations}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Readiness</h3>
             <p className={`text-3xl font-bold mt-1 ${Number(averageScore) >= 60 ? 'text-green-600' : 'text-blue-600'}`}>
               {averageScore}<span className="text-sm text-slate-400">%</span>
             </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 md:col-span-2">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Issue</h3>
             <p className="text-xl font-bold text-red-500 mt-1">
                 {Object.entries(errorStats).sort((a, b) => b[1] - a[1])[0]?.[0] || "No Data"}
             </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* PREPARATION GAP (Archetype) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span>🧠</span> The Preparation Gap (Archetypes)
                </h2>
                {Object.keys(archetypeCounts).length > 0 ? (
                    <div className="space-y-4">
                        {Object.entries(archetypeCounts).map(([type, count]) => {
                             const pct = ((count / totalEvaluations) * 100).toFixed(0);
                             let color = 'bg-slate-400';
                             if (type === 'Rote Learner') color = 'bg-orange-400';
                             if (type === 'Generalist') color = 'bg-yellow-400';
                             if (type === 'Academic') color = 'bg-blue-400';
                             if (type === 'HPSC Ready') color = 'bg-green-500';

                             return (
                                 <div key={type}>
                                     <div className="flex justify-between text-sm mb-1">
                                         <span className="font-medium text-slate-700">{type}</span>
                                         <span className="text-slate-500">{count} ({pct}%)</span>
                                     </div>
                                     <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                         <div className={`${color} h-3 rounded-full`} style={{width: `${pct}%`}}></div>
                                     </div>
                                 </div>
                             );
                        })}
                    </div>
                ) : (
                    <p className="text-slate-400 italic text-sm">No data available.</p>
                )}
            </div>

            {/* COGNITIVE DEPTH */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span>💡</span> Cognitive Depth Tracker
                </h2>
                <div className="flex items-end justify-between h-40 pt-4 px-2 border-b border-slate-200">
                    {['Recall', 'Application', 'Analysis', 'Synthesis'].map((level) => {
                        const count = cogStats[level] || 0;
                        const max = Math.max(...Object.values(cogStats), 1);
                        const height = (count / max) * 100;
                        return (
                            <div key={level} className="flex flex-col items-center gap-2 w-1/4 group">
                                <div className="text-xs font-bold text-slate-500 mb-auto opacity-0 group-hover:opacity-100">{count}</div>
                                <div 
                                    className={`w-full max-w-[40px] rounded-t bg-indigo-500 hover:bg-indigo-600 transition-all`} 
                                    style={{height: `${height || 2}%`}}
                                ></div>
                                <span className="text-xs font-medium text-slate-600 mt-2">{level.substring(0,4)}.</span>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-4 text-xs text-slate-500 text-center">Bloom's Taxonomy Level Distribution</div>
            </div>
        </div>

        {/* LOGS TABLE (Simplified for space) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-sm">
                Recent Activity
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 text-slate-500">
                            <th className="px-6 py-3 font-medium">Student</th>
                            <th className="px-6 py-3 font-medium">Module</th>
                            <th className="px-6 py-3 font-medium">Archetype</th>
                            <th className="px-6 py-3 font-medium">Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {logs.slice().reverse().slice(0, 10).map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50">
                                <td className="px-6 py-3 text-slate-900">{log.student}</td>
                                <td className="px-6 py-3 text-slate-500 text-xs uppercase">{log.result?.admin_analytics?.module_used || log.module || 'N/A'}</td>
                                <td className="px-6 py-3">
                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs border border-slate-200">
                                        {log.result?.admin_analytics?.candidate_archetype || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-3 font-bold text-slate-700">
                                    {getScore(log)}%
                                </td>
                            </tr>
                        ))}
                         {logs.length === 0 && (
                            <tr><td colSpan={4} className="p-6 text-center text-slate-400">No logs found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;