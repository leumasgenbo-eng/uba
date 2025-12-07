export type Role = 'ADMIN' | 'FACILITATOR' | 'PUPIL';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: Role;
  classLevel?: string; // For pupils
  subjects?: string[]; // For facilitators
  roles?: string[]; // invigilator, chief-invigilator, etc.
  email: string;
  contact: string;
  lastActivity: string;
  status: 'active' | 'inactive';
}

export interface Subject {
  id: string;
  name: string;
  type: 'CORE' | 'ELECTIVE';
}

export interface Challenge {
  id: string;
  subjectId: string;
  text: string;
  count: number; // For ranking
}

export interface MockExam {
  id: string;
  mockNumber: number;
  type: 'INTERNAL' | 'EXTERNAL' | 'PAST_QUESTIONS';
  date: string;
  durationMin: number;
  status: 'OPEN' | 'SUBMITTED' | 'FINALIZED';
}

export interface ScoreRecord {
  id: string;
  mockId: string;
  pupilId: string;
  subjectId: string;
  scoreA: number;
  scoreB: number;
  totalScore: number;
  grade: string; // A1, B2, etc.
  challenges: string[]; // IDs of challenges
  remarks: string;
}

export interface GradingScale {
  grade: string;
  description: string;
  minZ: number;
}