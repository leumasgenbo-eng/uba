import React, { useState, useEffect } from 'react';
import { User, MockExam, Challenge, ScoreRecord } from '../../types';
import { dataService } from '../../services/dataService';
import { ALL_SUBJECTS } from '../../constants';

export const ScoreEntry = () => {
  const [step, setStep] = useState(1);
  const [mocks, setMocks] = useState<MockExam[]>([]);
  const [pupils, setPupils] = useState<User[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedMock, setSelectedMock] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('MATH');
  
  // Form State: pupilId -> Entry
  const [entries, setEntries] = useState<Record<string, {scoreA: number, scoreB: number, challenges: Set<string>, remarks: string}>>({});

  useEffect(() => {
    dataService.getMocks().then(setMocks);
    dataService.getUsers('PUPIL').then(setPupils);
  }, []);

  useEffect(() => {
    if (selectedSubject) {
        setLoading(true);
        // Supabase returns challenges sorted by count DESC, so slice(0,5) gives Top 5
        dataService.getChallenges(selectedSubject).then((data) => {
            setChallenges(data);
            setLoading(false);
        });
    }
  }, [selectedSubject]);

  const handleScoreChange = (pupilId: string, field: 'scoreA' | 'scoreB', value: string) => {
    setEntries(prev => ({
      ...prev,
      [pupilId]: {
        ...(prev[pupilId] || { scoreA: 0, scoreB: 0, challenges: new Set(), remarks: '' }),
        [field]: Number(value)
      }
    }));
  };

  const toggleChallenge = (pupilId: string, challengeId: string) => {
    setEntries(prev => {
        const current = prev[pupilId] || { scoreA: 0, scoreB: 0, challenges: new Set(), remarks: '' };
        const newSet = new Set(current.challenges);
        if (newSet.has(challengeId)) newSet.delete(challengeId);
        else newSet.add(challengeId);
        return { ...prev, [pupilId]: { ...current, challenges: newSet } };
    });
  };

  const submitScores = async () => {
    setLoading(true);
    try {
        const promises = Object.entries(entries).map(async ([pupilId, data]) => {
            const total = data.scoreA + data.scoreB;
            // Generate a UUID (conceptually) or use composite key logic in backend
            // Here we use a string key for now
            const scoreId = `${selectedMock}-${pupilId}-${selectedSubject}`; 
            
            const record: ScoreRecord = {
                id: scoreId,
                mockId: selectedMock,
                pupilId,
                subjectId: selectedSubject,
                scoreA: data.scoreA,
                scoreB: data.scoreB,
                totalScore: total,
                grade: 'PENDING', // Will be updated by NRT process
                challenges: Array.from(data.challenges),
                remarks: data.remarks
            };
            
            // 1. Save Raw Score
            await dataService.saveScore(record);
            
            // 2. Increment Challenge Counts
            await dataService.incrementChallengeCount(record.challenges);
        });

        await Promise.all(promises);

        // 3. Trigger NRT Grading (Calculates Z-scores for the whole batch)
        await dataService.processNRTGrading(selectedMock, selectedSubject);

        alert('Scores Submitted & NRT Grades Calculated Successfully!');
        setEntries({});
        setStep(1);
    } catch (e: any) {
        alert('Error submitting scores: ' + e.message);
    } finally {
        setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow border border-gray-200">
        <h3 className="text-xl font-bold text-ubablue mb-6">Select Examination Context</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mock Examination</label>
            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-ubagreen focus:border-ubagreen sm:text-sm rounded-md border"
              onChange={(e) => setSelectedMock(e.target.value)} value={selectedMock}>
              <option value="">Select a Mock...</option>
              {mocks.map(m => <option key={m.id} value={m.id}>{m.type} Mock #{m.mockNumber} ({m.date})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-ubagreen focus:border-ubagreen sm:text-sm rounded-md border"
              onChange={(e) => setSelectedSubject(e.target.value)} value={selectedSubject}>
              {ALL_SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button 
            disabled={!selectedMock || !selectedSubject}
            onClick={() => setStep(2)}
            className="w-full bg-ubablue text-white py-2 rounded hover:bg-blue-800 disabled:opacity-50"
          >
            Proceed to Entry
          </button>
        </div>
      </div>
    );
  }

  // Use only Top 5 Challenges for the quick-select list
  const topChallenges = challenges.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded shadow">
        <h3 className="font-bold text-gray-700">Entering Scores: {ALL_SUBJECTS.find(s=>s.id === selectedSubject)?.name}</h3>
        <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-700">Change Selection</button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pupil</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Section A</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Section B</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Top 5 Challenges</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-48">Remarks</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pupils.map(pupil => {
                  const entry = entries[pupil.id] || { scoreA: 0, scoreB: 0, challenges: new Set(), remarks: '' };
                  return (
                    <tr key={pupil.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{pupil.firstName} {pupil.lastName}</td>
                      <td className="px-4 py-4">
                        <input type="number" className="w-20 border rounded p-1 text-center" 
                           value={entry.scoreA || ''} onChange={(e) => handleScoreChange(pupil.id, 'scoreA', e.target.value)} />
                      </td>
                      <td className="px-4 py-4">
                         <input type="number" className="w-20 border rounded p-1 text-center" 
                           value={entry.scoreB || ''} onChange={(e) => handleScoreChange(pupil.id, 'scoreB', e.target.value)} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col space-y-1">
                          {topChallenges.length > 0 ? topChallenges.map(ch => (
                              <label key={ch.id} className="inline-flex items-center text-xs">
                                  <input type="checkbox" className="form-checkbox h-3 w-3 text-ubagreen" 
                                    checked={entry.challenges.has(ch.id)}
                                    onChange={() => toggleChallenge(pupil.id, ch.id)}
                                  />
                                  <span className="ml-2 text-gray-600 truncate max-w-xs" title={ch.text}>{ch.text} ({ch.count})</span>
                              </label>
                          )) : <span className="text-xs text-gray-400 italic">No challenges found</span>}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <textarea className="w-full border rounded p-1 text-xs" rows={2} 
                            placeholder="General remarks..."
                            value={entry.remarks}
                            onChange={(e) => setEntries(prev => ({...prev, [pupil.id]: {...entry, remarks: e.target.value}}))}
                        ></textarea>
                      </td>
                    </tr>
                  );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex justify-end p-4">
          <button 
            onClick={submitScores} 
            disabled={loading}
            className="bg-ubagreen text-white px-6 py-3 rounded font-bold shadow hover:bg-green-700 disabled:opacity-50"
          >
              {loading ? 'Processing...' : 'Submit & Calculate NRT Grades'}
          </button>
      </div>
    </div>
  );
};