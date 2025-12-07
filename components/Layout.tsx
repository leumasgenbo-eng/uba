import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeRole: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeRole, activeTab, onTabChange, onLogout }) => {
  const adminTabs = [
    { id: 'MANAGEMENT_PUPILS', label: '1. Manage Pupils' },
    { id: 'MANAGEMENT_FACILITATORS', label: '2. Manage Facilitators' },
    { id: 'MANAGEMENT_CHALLENGES', label: '3. Manage Challenges' },
    { id: 'MOCK_SCORES', label: '4. Entry of Mock Scores' },
    { id: 'ACADEMIC_REPORT', label: '5. Academic Reports' },
    { id: 'TREND_ANALYSIS', label: '6. Trend Analysis' },
  ];

  const facilitatorTabs = [
    { id: 'MOCK_SCORES', label: '3. Entry of Mock Scores' },
    { id: 'ACADEMIC_REPORT', label: '4. Academic Reports' },
    { id: 'TREND_ANALYSIS', label: '5. Trend Analysis' },
  ];

  const pupilTabs = [
    { id: 'ACADEMIC_REPORT', label: '4. Academic Reports' },
    { id: 'TREND_ANALYSIS', label: '5. Trend Analysis' },
  ];

  let currentTabs: typeof adminTabs = [];
  if (activeRole === 'ADMIN') currentTabs = adminTabs;
  if (activeRole === 'FACILITATOR') currentTabs = facilitatorTabs;
  if (activeRole === 'PUPIL') currentTabs = pupilTabs;

  return (
    <div className="flex h-screen bg-ubabg overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-ubablue text-white flex flex-col shadow-lg z-20">
        <div className="p-6 border-b border-blue-900">
          <h1 className="text-xl font-bold tracking-tight">United Baylor Academy</h1>
          <p className="text-xs text-blue-300 mt-1 uppercase tracking-wider">{activeRole} Portal</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {currentTabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors duration-150 border-l-4 ${
                    activeTab === tab.id
                      ? 'bg-blue-900 border-ubabrown text-white'
                      : 'border-transparent text-blue-200 hover:bg-blue-800 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-blue-900">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm text-blue-200 hover:text-white hover:bg-blue-800 rounded transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 z-10">
          <h2 className="text-2xl font-semibold text-gray-800">
            {currentTabs.find(t => t.id === activeTab)?.label}
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Academic Year 2023-2024</span>
            <div className="h-8 w-8 rounded-full bg-ubabrown text-white flex items-center justify-center font-bold">
              {activeRole[0]}
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
