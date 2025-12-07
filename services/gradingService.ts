import { GRADING_SYSTEM } from '../constants';
import { ScoreRecord } from '../types';

export const calculateMean = (scores: number[]): number => {
  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
};

export const calculateStdDev = (scores: number[], mean: number): number => {
  if (scores.length === 0) return 0;
  const squareDiffs = scores.map(score => Math.pow(score - mean, 2));
  const avgSquareDiff = calculateMean(squareDiffs);
  return Math.sqrt(avgSquareDiff);
};

// Assigns a grade to a single score based on provided batch statistics
export const calculateGrade = (score: number, mean: number, stdDev: number): string => {
  if (stdDev === 0) {
    // Edge case: if everyone got the same score, assign C4 (Credit) if above 0
    return score > 0 ? 'C4' : 'F9'; 
  }
  
  const zScore = (score - mean) / stdDev;
  
  for (const bracket of GRADING_SYSTEM) {
    if (zScore >= bracket.minZ) {
      return bracket.grade;
    }
  }
  return 'F9';
};

// Process an entire set of scores for a subject to apply NRT
export const applyNRTGrading = (scores: ScoreRecord[]): ScoreRecord[] => {
    const rawValues = scores.map(s => s.totalScore);
    const mean = calculateMean(rawValues);
    const stdDev = calculateStdDev(rawValues, mean);

    return scores.map(record => ({
        ...record,
        grade: calculateGrade(record.totalScore, mean, stdDev)
    }));
};

export const getOrdinalSuffix = (i: number) => {
  const j = i % 10,
        k = i % 100;
  if (j === 1 && k !== 11) {
      return i + "st";
  }
  if (j === 2 && k !== 12) {
      return i + "nd";
  }
  if (j === 3 && k !== 13) {
      return i + "rd";
  }
  return i + "th";
}