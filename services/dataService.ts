import { supabase } from '../lib/supabaseClient';
import { User, MockExam, ScoreRecord, Challenge } from '../types';
import { applyNRTGrading } from './gradingService';

// Supabase Data Service
export const dataService = {
  // --- User Management ---
  getUsers: async (role?: string): Promise<User[]> => {
    let query = supabase.from('users').select('*');
    if (role) {
      query = query.eq('role', role);
    }
    const { data, error } = await query;
    if (error) throw error;
    
    // Map DB fields to TS Interface if snake_case differs from camelCase
    return (data || []).map(u => ({
        ...u,
        firstName: u.first_name,
        lastName: u.last_name,
        classLevel: u.class_level,
        lastActivity: u.last_activity
    }));
  },

  addUser: async (user: Omit<User, 'id' | 'lastActivity'>) => {
    // Note: In real auth, you create auth user first. Here we just insert to public.users for demo
    const { data, error } = await supabase.from('users').insert([{
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        role: user.role,
        class_level: user.classLevel,
        subjects: user.subjects,
        roles: user.roles,
        contact: user.contact,
        status: user.status,
        last_activity: new Date().toISOString()
    }]).select().single();

    if (error) throw error;
    return { ...data, firstName: data.first_name, lastName: data.last_name };
  },

  // --- Mock Management ---
  getMocks: async (): Promise<MockExam[]> => {
    const { data, error } = await supabase.from('mocks').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map(m => ({
        ...m,
        mockNumber: m.mock_number,
        durationMin: m.duration_min
    }));
  },

  // --- Score Management ---
  getScores: async (mockId: string, subjectId?: string): Promise<ScoreRecord[]> => {
    let query = supabase.from('scores').select('*').eq('mock_id', mockId);
    if(subjectId) query = query.eq('subject_id', subjectId);
    
    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(s => ({
        id: s.id,
        mockId: s.mock_id,
        pupilId: s.pupil_id,
        subjectId: s.subject_id,
        scoreA: s.score_a,
        scoreB: s.score_b,
        totalScore: s.total_score,
        grade: s.grade,
        challenges: s.challenges || [], // Array of strings (Challenge IDs)
        remarks: s.remarks
    }));
  },

  saveScore: async (score: ScoreRecord) => {
    // Upsert score
    const { error } = await supabase.from('scores').upsert({
        id: score.id, // If provided, update, else insert (UUID handling needed in real app if not generated here)
        mock_id: score.mockId,
        pupil_id: score.pupilId,
        subject_id: score.subjectId,
        score_a: score.scoreA,
        score_b: score.scoreB,
        total_score: score.totalScore,
        grade: score.grade,
        challenges: score.challenges,
        remarks: score.remarks
    }, { onConflict: 'mock_id, pupil_id, subject_id' }); // Assuming composite constraint

    if (error) throw error;
  },

  // --- Challenge Management ---
  getChallenges: async (subjectId: string): Promise<Challenge[]> => {
    // Get Top Ranked Challenges (by count descending)
    const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('subject_id', subjectId)
        .order('count', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(c => ({
        id: c.id,
        subjectId: c.subject_id,
        text: c.text,
        count: c.count
    }));
  },

  incrementChallengeCount: async (ids: string[]) => {
      if (ids.length === 0) return;
      // In Supabase, can use RPC or loop updates. For simplicity:
      for (const id of ids) {
          const { error } = await supabase.rpc('increment_challenge_count', { row_id: id });
          if(error) console.error("Error incrementing challenge", error);
      }
  },

  // --- NRT Processing ---
  processNRTGrading: async (mockId: string, subjectId: string) => {
      // 1. Fetch all raw scores
      const scores = await dataService.getScores(mockId, subjectId);
      if (scores.length === 0) return;

      // 2. Calculate Grades
      const gradedScores = applyNRTGrading(scores);

      // 3. Update DB
      const updates = gradedScores.map(s => ({
          id: s.id,
          mock_id: s.mockId,
          pupil_id: s.pupilId,
          subject_id: s.subjectId,
          score_a: s.scoreA,
          score_b: s.scoreB,
          total_score: s.totalScore,
          challenges: s.challenges,
          remarks: s.remarks,
          grade: s.grade // The new NRT grade
      }));

      const { error } = await supabase.from('scores').upsert(updates);
      if (error) throw error;
      return gradedScores;
  }
};
