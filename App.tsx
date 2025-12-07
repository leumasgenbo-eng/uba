import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Role } from './types';
import { ManageFacilitators } from './components/admin/ManageFacilitators';
import { ManagePupils } from './components/admin/ManagePupils';
import { ManageChallenges } from './components/admin/ManageChallenges';
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
        setIsAuthenticated(true);
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
      
      // Fetch mock scores for demo. In real app, provide a UI to select user/mock.
      const mocks = await dataService.getMocks();
      if(mocks.length === 0) { alert('No mocks found'); return; }
      const mockId = mocks[0].id;
      
      const scores = await dataService.getScores(mockId); 
      const pupilScores = scores.filter(s => s.pupilId === pupil.id);

      setReportData({ pupil, scores: pupilScores, mockName: `Mock ${mocks[0].mockNumber} (${mocks[0].type})` });
      setShowReport(true);
  }

  if (!isAuthenticated || !activeRole) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Define Tabs based on Role (Updated with new components)
  const renderContent = () => {
      switch (activeTab) {
          case 'MANAGEMENT_PUPILS':
              return <ManagePupils />;
          case 'MANAGEMENT_FACILITATORS':
              return <ManageFacilitators />;
          case 'MANAGEMENT_CHALLENGES': // Need to add this to Layout.tsx tabs if strictly dynamic
               // However, current Layout.tsx logic defines tabs inside it. 
               // For this demo, we can just use the components mapped to IDs.
               // We need to ensure Layout passes the correct ID.
               // Let's assume we update Layout tabs list below or in the component logic.
               return <ManageChallenges />;
          case 'MOCK_SCORES':
              return <ScoreEntry />;
          case 'TREND_ANALYSIS':
              return <TrendAnalysis />;
          case 'ACADEMIC_REPORT':
              return (
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
              );
          default:
              return <div>Select a tab</div>;
      }
  };

  return (
    <Layout 
      activeRole={activeRole} 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      onLogout={handleLogout}
    >
      {/* If current tab is missing from switch, we can default here or inside switch */}
      {/* We need to inject the extra Admin tab for Challenges which Layout.tsx might not have by default unless we update Layout.tsx or override it here */}
      {/* Since Layout is generic, we can stick to IDs. */}
      {/* Note: I will need to update Layout.tsx tabs array to include Challenge Management for Admin */}
      {activeTab === 'MANAGEMENT_CHALLENGES' ? <ManageChallenges /> : renderContent()}
    </Layout>
  );
}

export default App;
