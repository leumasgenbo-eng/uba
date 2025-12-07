import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { dataService } from '../../services/dataService';
import { FACILITATOR_ROLES, ALL_SUBJECTS } from '../../constants';
import { Badge } from '../ui/Badge';

export const ManageFacilitators = () => {
  const [facilitators, setFacilitators] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // New Invite State
  const [newInvite, setNewInvite] = useState({
    firstName: '', lastName: '', email: '', subject: 'MATH', role: 'Invigilator'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await dataService.getUsers('FACILITATOR');
    setFacilitators(data);
    setLoading(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call and Email Trigger
    alert(`EMAIL SENT:\nTo: ${newInvite.email}\nSubject: UBA Invigilation Invitation\n\nDear ${newInvite.firstName} ${newInvite.lastName},\nYou are invited to ${newInvite.role} for ${newInvite.subject} at UBA Basic 9 Hall.`);
    
    await dataService.addUser({
        firstName: newInvite.firstName,
        lastName: newInvite.lastName,
        email: newInvite.email,
        role: 'FACILITATOR',
        subjects: [newInvite.subject],
        roles: [newInvite.role],
        contact: '+233243504091',
        status: 'active'
    });
    
    setShowInviteModal(false);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Facilitator Directory</h3>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="bg-ubagreen hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium transition-colors"
        >
          + Invite New Facilitator
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {facilitators.map((fac) => (
              <tr key={fac.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-ubablue font-bold">
                      {fac.firstName[0]}{fac.lastName[0]}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{fac.firstName} {fac.lastName}</div>
                      <div className="text-sm text-gray-500">{fac.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex flex-wrap gap-1">
                     {fac.roles?.map(r => <Badge key={r} color="yellow">{r}</Badge>)}
                   </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                      {fac.subjects?.map(s => <Badge key={s} color="blue">{s}</Badge>)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fac.contact}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-ubablue hover:text-blue-900">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-ubablue">Invite Facilitator</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="First Name" className="border p-2 rounded w-full" value={newInvite.firstName} onChange={e => setNewInvite({...newInvite, firstName: e.target.value})} />
                <input required placeholder="Last Name" className="border p-2 rounded w-full" value={newInvite.lastName} onChange={e => setNewInvite({...newInvite, lastName: e.target.value})} />
              </div>
              <input required type="email" placeholder="Email Address" className="border p-2 rounded w-full" value={newInvite.email} onChange={e => setNewInvite({...newInvite, email: e.target.value})} />
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Assign Subject</label>
                <select className="border p-2 rounded w-full" value={newInvite.subject} onChange={e => setNewInvite({...newInvite, subject: e.target.value})}>
                    {ALL_SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Assign Role</label>
                 <select className="border p-2 rounded w-full" value={newInvite.role} onChange={e => setNewInvite({...newInvite, role: e.target.value})}>
                    {FACILITATOR_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button type="button" onClick={() => setShowInviteModal(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-ubagreen text-white rounded hover:bg-green-700">Send Invitation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};