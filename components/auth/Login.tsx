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
  
  // New state for registration
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
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
        const users = await dataService.getUsers(); 
        const userProfile = users.find(u => u.email === email);

        if (userProfile) {
           onLoginSuccess(userProfile.role);
        } else {
           setError("User profile not found. If you just signed up, please check your database or try registering again.");
           await supabase.auth.signOut();
        }

      } else {
        // Handle Sign Up (Register as Admin for first access)
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
            }
          }
        });

        if (signUpError) throw signUpError;

        // If auto-confirm is enabled or we have a session, create the public profile immediately
        if (signUpData.user) {
            try {
                // We default self-registered users to ADMIN for this setup so you can access the dashboard.
                // In a real app, you might default to 'PUPIL' or require admin approval.
                await dataService.addUser({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    role: 'ADMIN', 
                    status: 'active',
                    contact: '',
                    classLevel: '',
                    subjects: [],
                    roles: []
                });
                
                // If session exists, log them in
                if (signUpData.session) {
                    onLoginSuccess('ADMIN');
                } else {
                    alert('Registration successful! Please check your email to confirm your account before logging in.');
                    setMode('LOGIN');
                }
            } catch (profileError: any) {
                console.error("Profile creation failed:", profileError);
                // If profile creation failed (e.g. duplicate), just alert
                if (signUpData.session) {
                     // Try to log in anyway if it was just a duplicate error
                     onLoginSuccess('ADMIN');
                }
            }
        }
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
                <p className="text-gray-500 mt-2">
                    {mode === 'LOGIN' ? 'Sign in to access the system' : 'Register as Administrator'}
                </p>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

            <form onSubmit={handleAuth} className="space-y-4">
                {mode === 'SIGNUP' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input 
                                type="text" required={mode === 'SIGNUP'}
                                value={firstName} onChange={(e) => setFirstName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ubablue focus:border-ubablue"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input 
                                type="text" required={mode === 'SIGNUP'}
                                value={lastName} onChange={(e) => setLastName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ubablue focus:border-ubablue"
                            />
                        </div>
                    </div>
                )}

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
                    {loading ? 'Processing...' : (mode === 'LOGIN' ? 'Sign In' : 'Create Admin Account')}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button 
                    onClick={() => {
                        setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN');
                        setError('');
                    }}
                    className="text-sm text-ubablue hover:underline"
                >
                    {mode === 'LOGIN' ? "No account? Register as Admin" : "Already have an account? Sign In"}
                </button>
            </div>
        </div>
    </div>
  );
};