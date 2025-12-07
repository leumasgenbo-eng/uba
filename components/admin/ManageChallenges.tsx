import React, { useState, useEffect } from 'react';
import { Challenge } from '../../types';
import { dataService } from '../../services/dataService';
import { ALL_SUBJECTS } from '../../constants';

export const ManageChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('MATH');
  const [newChallengeText, setNewChallengeText] = useState('');
  
  useEffect(() => {
    loadData();
  }, [selectedSubject]);

  const loadData = async () => {
    const data = await dataService.getChallenges(selectedSubject);
    setChallenges(data);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataService.addChallenge({
        subjectId: selectedSubject,
        text: newChallengeText
    });
    setNewChallengeText('');
    loadData();
  };

  const handleDelete = async (id: string) => {
      await dataService.deleteChallenge(id);
      loadData();
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Manage Subject Challenges</h3>
            <select 
                className="border p-2 rounded bg-white shadow-sm"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
            >
                {ALL_SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-2">
                <div className="bg-white shadow rounded-lg border border-gray-200">
                    <div className="p-4 border-b bg-gray-50 font-bold text-gray-700">Ranked Challenges (Frequency)</div>
                    <ul className="divide-y divide-gray-200">
                        {challenges.map((c, idx) => (
                            <li key={c.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                <div>
                                    <span className={`inline-block w-6 h-6 text-center text-xs leading-6 rounded-full mr-3 ${idx < 5 ? 'bg-ubablue text-white font-bold' : 'bg-gray-200 text-gray-600'}`}>
                                        {idx + 1}
                                    </span>
                                    <span className="text-gray-800">{c.text}</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">
                                        Used: {c.count}
                                    </span>
                                    <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                                </div>
                            </li>
                        ))}
                        {challenges.length === 0 && <li className="p-4 text-gray-400 italic">No challenges defined for this subject.</li>}
                    </ul>
                </div>
           </div>

           <div>
               <div className="bg-white shadow rounded-lg border border-gray-200 p-6 sticky top-6">
                   <h4 className="font-bold text-ubabrown mb-4">Add New Challenge</h4>
                   <form onSubmit={handleAdd}>
                       <label className="block text-sm text-gray-600 mb-2">Challenge Description</label>
                       <textarea 
                           className="w-full border rounded p-2 mb-4 text-sm" 
                           rows={4}
                           placeholder="e.g., Poor Hand-Writing, Bad Spelling"
                           value={newChallengeText}
                           onChange={(e) => setNewChallengeText(e.target.value)}
                           required
                       ></textarea>
                       <button type="submit" className="w-full bg-ubagreen text-white py-2 rounded hover:bg-green-700 shadow font-medium">
                           Add to List
                       </button>
                   </form>
                   <p className="text-xs text-gray-400 mt-4">
                       Note: The top 5 ranked challenges will appear in the Facilitator Score Entry screen.
                   </p>
               </div>
           </div>
       </div>
    </div>
  );
};
