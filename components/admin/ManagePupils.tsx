import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { dataService } from '../../services/dataService';

export const ManagePupils = () => {
  const [pupils, setPupils] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // New Pupil State
  const [newPupil, setNewPupil] = useState({
    firstName: '', lastName: '', email: '', classLevel: 'Basic 9'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await dataService.getUsers('PUPIL');
    setPupils(data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataService.addUser({
        firstName: newPupil.firstName,
        lastName: newPupil.lastName,
        email: newPupil.email,
        role: 'PUPIL',
        classLevel: newPupil.classLevel,
        contact: '',
        status: 'active'
    });
    setShowModal(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
      if(confirm('Are you sure you want to delete this pupil?')) {
          await dataService.deleteUser(id);
          loadData();
      }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Pupil Directory</h3>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-ubablue hover:bg-blue-800 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium transition-colors"
        >
          + Register New Pupil
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email/ID</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pupils.map((pupil) => (
              <tr key={pupil.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-ubagreen font-bold text-xs">
                      {pupil.firstName[0]}{pupil.lastName[0]}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{pupil.firstName} {pupil.lastName}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pupil.classLevel}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pupil.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleDelete(pupil.id)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-ubablue">Register Pupil</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="First Name" className="border p-2 rounded w-full" value={newPupil.firstName} onChange={e => setNewPupil({...newPupil, firstName: e.target.value})} />
                <input required placeholder="Last Name" className="border p-2 rounded w-full" value={newPupil.lastName} onChange={e => setNewPupil({...newPupil, lastName: e.target.value})} />
              </div>
              <input required type="email" placeholder="Student Email / ID" className="border p-2 rounded w-full" value={newPupil.email} onChange={e => setNewPupil({...newPupil, email: e.target.value})} />
              <select className="border p-2 rounded w-full" value={newPupil.classLevel} onChange={e => setNewPupil({...newPupil, classLevel: e.target.value})}>
                  <option>Basic 7</option>
                  <option>Basic 8</option>
                  <option>Basic 9</option>
              </select>
              <div className="flex justify-end space-x-2 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-ubagreen text-white rounded hover:bg-green-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
