import { LogEntry } from "../types";

const LOGS_KEY = "hpsc_geo_logs";

export const getLogs = (): LogEntry[] => {
  const stored = localStorage.getItem(LOGS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getStudentLogs = (student: string): LogEntry[] => {
    return getLogs().filter(log => log.student === student);
};

export const saveLog = (entry: Omit<LogEntry, "id" | "timestamp">) => {
  const logs = getLogs();
  const newEntry: LogEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  logs.push(newEntry);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  return newEntry;
};

export const clearLogs = () => {
  localStorage.removeItem(LOGS_KEY);
};