import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Role } from './types';
import { ManageFacilitators } from './components/admin/ManageFacilitators';
import { ScoreEntry } from './components/facilitator/ScoreEntry';
import { TrendAnalysis } from './components/dashboard/TrendAnalysis';
import { ReportCard } from './components/reports/ReportCard';
import { Login } from './components/auth/Login';
import { dataService } from './services/dataService';
import { supabase } from './lib/supabaseClient';

function App() {
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Report Generation State
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // In a real app, you'd fetch the user's role from the DB here
        setIsAuthenticated(true);
        // Temporarily default to Admin if session exists but role not set in state
        // In production, fetch role from public.users table based on session.user.email
      }
    });
  }, []);

  const handleLoginSuccess = (role: Role) => {
    setIsAuthenticated(true);
    setActiveRole(role);
    setDefaultTab(role);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setActiveRole(null);
  };

  const setDefaultTab = (role: Role) => {
    if (role === 'ADMIN') setActiveTab('MANAGEMENT_PUPILS');
    else if (role === 'FACILITATOR') setActiveTab('MOCK_SCORES');
    else if (role === 'PUPIL') setActiveTab('ACADEMIC_REPORT');
  }

  const generateMockReport = async () => {
      const pupils = await dataService.getUsers('PUPIL');
      if (pupils.length === 0) return;
      const pupil = pupils[0];
      
      const scores = await dataService.getScores('MOCK-001'); // Example ID
      const pupilScores = scores.filter(s => s.pupilId === pupil.id);

      setReportData({ pupil, scores: pupilScores, mockName: 'Internal Mock 1' });
      setShowReport(true);
  }

  if (!isAuthenticated || !activeRole) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout 
      activeRole={activeRole} 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      onLogout={handleLogout}
    >
      {activeTab === 'MANAGEMENT_PUPILS' && (
        <div className="bg-white p-8 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Pupil Management (Admin View)</h2>
            <p className="text-gray-500">Feature to manage pupil records, bulk upload, and editing.</p>
             <div className="mt-4 border-t pt-4">
                 <button className="bg-blue-600 text-white px-4 py-2 rounded">Bulk Upload (CSV)</button>
             </div>
        </div>
      )}

      {activeTab === 'MANAGEMENT_FACILITATORS' && <ManageFacilitators />}
      
      {activeTab === 'MOCK_SCORES' && <ScoreEntry />}
      
      {activeTab === 'ACADEMIC_REPORT' && (
          <div>
              {!showReport ? (
                <div className="bg-white p-8 rounded shadow text-center">
                    <h2 className="text-xl font-bold mb-4">Generate Academic Reports</h2>
                    <p className="mb-4">Select criteria to generate printable reports for pupils.</p>
                    <button onClick={generateMockReport} className="bg-ubablue text-white px-6 py-3 rounded shadow hover:bg-blue-800">
                        View Sample Report
                    </button>
                </div>
              ) : (
                  <div>
                      <button onClick={() => setShowReport(false)} className="mb-4 text-blue-600 underline no-print">Back to Selection</button>
                      <button onClick={() => window.print()} className="mb-4 ml-4 bg-gray-800 text-white px-3 py-1 rounded no-print">Print Report</button>
                      {reportData && <ReportCard {...reportData} />}
                  </div>
              )}
          </div>
      )}

      {activeTab === 'TREND_ANALYSIS' && <TrendAnalysis />}
    </Layout>
  );
}

export default App;