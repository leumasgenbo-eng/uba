import { Subject, GradingScale } from './types';

export const CORE_SUBJECTS: Subject[] = [
  { id: 'MATH', name: 'Mathematics', type: 'CORE' },
  { id: 'ENG', name: 'English Language', type: 'CORE' },
  { id: 'SOC', name: 'Social Studies', type: 'CORE' },
  { id: 'SCI', name: 'Science', type: 'CORE' },
  { id: 'CT', name: 'Career Technology', type: 'CORE' },
  { id: 'BDT', name: 'Basic Design and Technology', type: 'CORE' },
];

export const ELECTIVE_SUBJECTS: Subject[] = [
  { id: 'GHL', name: 'Ghanaian Language Option', type: 'ELECTIVE' },
  { id: 'FRE', name: 'French', type: 'ELECTIVE' },
  { id: 'ARA', name: 'Arabic', type: 'ELECTIVE' },
  { id: 'RME', name: 'Religious and Moral Education', type: 'ELECTIVE' },
];

export const ALL_SUBJECTS = [...CORE_SUBJECTS, ...ELECTIVE_SUBJECTS];

// NRT Grading System based on Z-Scores (Stanine / Standard Nine distribution)
// A1 ≈5%, B2 ≈10%, B3 ≈15%, C4 ≈20%, C5 ≈15%, C6 ≈10%, D7 ≈5%, E8 ≈5%, F9 ≈10%
export const GRADING_SYSTEM: GradingScale[] = [
  { grade: 'A1', description: 'Excellent', minZ: 1.645 },
  { grade: 'B2', description: 'Very Good', minZ: 1.036 },
  { grade: 'B3', description: 'Good', minZ: 0.524 },
  { grade: 'C4', description: 'Credit', minZ: 0 }, // Mean
  { grade: 'C5', description: 'Credit', minZ: -0.524 },
  { grade: 'C6', description: 'Credit', minZ: -1.036 },
  { grade: 'D7', description: 'Pass', minZ: -1.645 },
  { grade: 'E8', description: 'Pass', minZ: -2.326 },
  { grade: 'F9', description: 'Fail', minZ: -999 }, // Below -2.326
];

export const MOCK_TYPES = ['Internal', 'External', 'Past Questions'];

export const FACILITATOR_ROLES = [
  'Invigilator',
  'Chief Invigilator',
  'Examiner',
  'Chief Examiner',
  'Examination Officer'
];