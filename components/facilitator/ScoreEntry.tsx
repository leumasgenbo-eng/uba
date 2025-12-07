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
  const [feedback, setFeedback] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  
  const [selectedMock, setSelectedMock] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('MATH');
  
  // Form State: pupilId -> Entry
  const [entries, setEntries] = useState<Record<string, {scoreA: number, scoreB: number, challenges: Set<string>, remarks: string, grade?: string}>>({});
  // General Remarks State (Class Overview)
  const [generalRemark, setGeneralRemark] = useState<string>('');

  useEffect(() => {
    dataService.getMocks().then(setMocks);
    dataService.getUsers('PUPIL').then(setPupils);
  }, []);

  useEffect(() => {
    if (selectedSubject && selectedMock) {
        loadEntryData();
    }
  }, [selectedSubject, selectedMock]);

  // Persist General Remark to LocalStorage when it changes
  useEffect(() => {
    if (selectedMock && selectedSubject) {
      localStorage.setItem(`general_remark_${selectedMock}_${selectedSubject}`, generalRemark);
    }
  }, [generalRemark, selectedMock, selectedSubject]);

  const loadEntryData = async () => {
      setLoading(true);
      try {
        // Load Challenges
        const chalData = await dataService.getChallenges(selectedSubject);
        setChallenges(chalData);

        // Load Existing Scores if any
        const existingScores = await dataService.getScores(selectedMock, selectedSubject);
        const newEntries: Record<string, any> = {};
        
        existingScores.forEach(s => {
            newEntries[s.pupilId] = {
                scoreA: s.scoreA,
                scoreB: s.scoreB,
                challenges: new Set(s.challenges),
                remarks: s.remarks,
                grade: s.grade
            };
        });
        
        // Merge with pupils who might not have scores yet
        setEntries(prev => {
            const merged = { ...prev };
            existingScores.forEach(s => {
                merged[s.pupilId] = newEntries[s.pupilId];
            });
            return merged;
        });

        // Load General Remark from Persistence
        const savedRemark = localStorage.getItem(`general_remark_${selectedMock}_${selectedSubject}`);
        setGeneralRemark(savedRemark || '');

      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

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
    setFeedback(null);
    try {
        const promises = Object.entries(entries).map(async ([pupilId, data]) => {
            const total = data.scoreA + data.scoreB;
            // Generate a deterministic ID based on composite key for this demo
            const scoreId = `${selectedMock}-${pupilId}-${selectedSubject}`; 
            
            const record: ScoreRecord = {
                id: scoreId,
                mockId: selectedMock,
                pupilId,
                subjectId: selectedSubject,
                scoreA: data.scoreA,
                scoreB: data.scoreB,
                totalScore: total,
                grade: data.grade || 'PENDING',
                challenges: Array.from(data.challenges),
                remarks: data.remarks
            };
            
            // 1. Save Raw Score
            await dataService.saveScore(record);
            
            // 2. Increment Challenge Counts (Naive implementation)
            await dataService.incrementChallengeCount(record.challenges);
        });

        await Promise.all(promises);
        setFeedback({ msg: 'Scores saved successfully. Click "Calculate NRT" to finalize grades.', type: 'success' });
    } catch (e: any) {
        setFeedback({ msg: 'Error saving scores: ' + e.message, type: 'error' });
    } finally {
        setLoading(false);
    }
  };

  // NRT Calculation Handler
  const handleCalculateNRT = async () => {
      if (!selectedMock || !selectedSubject) return;

      const confirmed = window.confirm(
          "Generate NRT Grades?\n\nThis will calculate Z-scores for the entire class and overwrite existing grades based on the Stanine distribution (A1 top 5%, etc.)."
      );
      if (!confirmed) return;

      setLoading(true);
      setFeedback(null);
      try {
          // Trigger Batch Processing
          const updatedScores = await dataService.processNRTGrading(selectedMock, selectedSubject);
          
          // Update UI with new grades immediately
          const updatedEntries = { ...entries };
          let updateCount = 0;

          updatedScores.forEach(s => {
              if (updatedEntries[s.pupilId]) {
                  updatedEntries[s.pupilId] = {
                      ...updatedEntries[s.pupilId],
                      grade: s.grade
                  };
                  updateCount++;
              }
          });
          setEntries(updatedEntries);
          setFeedback({ msg: `NRT Grading Applied Successfully! Updated ${updateCount} pupil records.`, type: 'success' });
      } catch (e: any) {
          setFeedback({ msg: 'Error calculating NRT: ' + e.message, type: 'error' });
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded shadow">
        <h3 className="font-bold text-gray-700">Entering Scores: {ALL_SUBJECTS.find(s=>s.id === selectedSubject)?.name}</h3>
        <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-700">Change Selection</button>
      </div>

      {feedback && (
          <div className={`p-4 rounded ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {feedback.msg}
          </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pupil</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Section A</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Section B</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">Grade</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-72">Challenges</th>
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
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                             ${entry.grade === 'A1' ? 'bg-green-100 text-green-800' : 
                               entry.grade === 'F9' ? 'bg-red-100 text-red-800' : 
                               !entry.grade || entry.grade === 'PENDING' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-800'}`}>
                             {entry.grade || '-'}
                         </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {Array.from(entry.challenges).map(chId => {
                              const ch = challenges.find(c => c.id === chId);
                              if (!ch) return null;
                              return (
                                <span key={chId} 
                                  onClick={() => toggleChallenge(pupil.id, chId)}
                                  className="cursor-pointer inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-ubablue text-white hover:bg-blue-800 transition-colors"
                                  title="Click to remove"
                                >
                                  {ch.text}
                                  <svg className="ml-1.5 h-3 w-3 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </span>
                              );
                            })}
                          </div>
                          
                          {/* Custom Dropdown Trigger */}
                          <div className="relative group inline-block mt-1">
                              <button className="flex items-center text-xs text-ubablue hover:text-blue-900 font-medium focus:outline-none opacity-80 hover:opacity-100 transition-opacity">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                  Add Challenge
                              </button>
                              <select
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                value=""
                                onChange={(e) => {
                                    if(e.target.value) {
                                        toggleChallenge(pupil.id, e.target.value);
                                        e.target.value = ""; 
                                    }
                                }}
                              >
                                <option value="">Add Challenge...</option>
                                {challenges
                                    .filter(ch => !entry.challenges.has(ch.id))
                                    .map(ch => (
                                        <option key={ch.id} value={ch.id}>
                                            {ch.text} {ch.count > 0 ? `(${ch.count})` : ''}
                                        </option>
                                    ))
                                }
                              </select>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <textarea className="w-full border rounded p-1 text-xs" rows={2} 
                            placeholder="Specific remarks..."
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
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
           <label className="block text-sm font-bold text-gray-700 mb-2">General Mock Remarks (Class Overview)</label>
           <textarea
               className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-ubablue focus:border-ubablue"
               rows={3}
               placeholder="Enter overall remarks for this subject mock session (e.g., 'General performance in Section B was poor', 'Exam started 15 mins late')..."
               value={generalRemark}
               onChange={(e) => setGeneralRemark(e.target.value)}
           ></textarea>
        </div>
      </div>
      
      <div className="flex justify-end p-4 space-x-4">
          <button 
            onClick={submitScores} 
            disabled={loading}
            className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded font-bold shadow hover:bg-gray-50 disabled:opacity-50"
          >
              {loading ? 'Processing...' : 'Save Draft / Submit'}
          </button>
          
          <button 
            onClick={handleCalculateNRT} 
            disabled={loading}
            className="bg-ubablue text-white px-6 py-3 rounded font-bold shadow hover:bg-blue-800 disabled:opacity-50 flex items-center"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
             </svg>
             Calculate NRT Grades
          </button>
      </div>
    </div>
  );
};