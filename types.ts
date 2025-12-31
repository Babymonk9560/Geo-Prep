import React from 'react';

export enum AppMode {
  SYLLABUS_DECODER = 'MODE_A',
  INTERVIEW_SIMULATOR = 'MODE_B',
  HARYANA_CONTEXTUALIZER = 'MODE_C',
  EVALUATION_LAB = 'MODE_D',
  ADMIN_DASHBOARD = 'MODE_ADMIN',
}

export type UserRole = 'Student' | 'Admin';
export type UserProfileType = "Fresher" | "Working Professional" | "UPSC Aspirant" | "General";

export interface User {
  username: string;
  role: UserRole;
  profileType: UserProfileType;
}

export type EvaluationModule = 'INTERVIEW_SIMULATION' | 'TEACHING_DEMO' | 'RESEARCH_DEFENSE';

export interface FrameworkScores {
  dimension_1: number;
  dimension_2: number;
  dimension_3: number;
}

export interface UserFeedback {
  score_total: number;
  framework_scores: FrameworkScores;
  constructive_comment: string;
}

export interface AdminAnalytics {
  module_used: string;
  candidate_archetype: 'Rote Learner' | 'Generalist' | 'Academic' | 'HPSC Ready';
  error_category: 'Conceptual Gap' | 'Contextual Blindness' | 'Pedagogical Failure' | 'None';
  cognitive_level: 'Recall' | 'Application' | 'Analysis' | 'Synthesis';
}

export interface EvaluationResult {
  user_feedback: UserFeedback;
  admin_analytics: AdminAnalytics;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  student: string;
  topic: string;
  question: string;
  module: EvaluationModule;
  result: EvaluationResult;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ModeConfig {
  id: AppMode;
  title: string;
  icon: React.ReactNode;
  description: string;
}