import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Role } from '../../types';
import { dataService } from '../../services/dataService';

interface LoginProps {
  onLoginSuccess: (role: Role) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'LOGIN') {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;

        // Fetch User Role from public table
        // We assume email links to the public.users table 
        const users = await dataService.getUsers(); 
        const userProfile = users.find(u => u.email === email);

        if (userProfile) {
           onLoginSuccess(userProfile.role);
        } else {
           // Fallback for demo if user not in DB yet but in Auth
           setError("User profile not found. Please contact Admin.");
           await supabase.auth.signOut();
        }

      } else {
        // Simple signup for demo (creates Auth user, not public profile)
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        alert('Check your email for the confirmation link!');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ubabg">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-ubablue">UBA Assessment Center</h1>
                <p className="text-gray-500 mt-2">Sign in to access the system</p>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

            <form onSubmit={handleAuth} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ubablue focus:border-ubablue"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input 
                        type="password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ubablue focus:border-ubablue"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ubablue hover:bg-blue-900 focus:outline-none disabled:opacity-50"
                >
                    {loading ? 'Processing...' : (mode === 'LOGIN' ? 'Sign In' : 'Sign Up')}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button 
                    onClick={() => setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
                    className="text-sm text-ubablue hover:underline"
                >
                    {mode === 'LOGIN' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
            </div>
        </div>
    </div>
  );
};
