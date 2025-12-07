import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export const TrendAnalysis = () => {
  // Mock Data for visualization
  const subjectPerformance = [
    { name: 'Math', avg: 65, passRate: 80 },
    { name: 'Eng', avg: 72, passRate: 95 },
    { name: 'Sci', avg: 58, passRate: 70 },
    { name: 'Soc', avg: 68, passRate: 85 },
    { name: 'BDT', avg: 75, passRate: 90 },
  ];

  const trendData = [
    { mock: 'Mock 1', math: 55, eng: 60 },
    { mock: 'Mock 2', math: 60, eng: 65 },
    { mock: 'Mock 3', math: 65, eng: 72 },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Subject Averages */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-bold text-ubablue mb-4">Subject Performance (Average Score)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avg" fill="#0f3460" name="Class Average" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Trend Over Time */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-bold text-ubablue mb-4">Performance Trend (Core Subjects)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mock" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="math" stroke="#e74c3c" name="Mathematics" />
                <Line type="monotone" dataKey="eng" stroke="#2e8b57" name="English" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Gender Distribution Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-bold text-ubablue mb-4">Demographics & Challenge Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded text-center">
                  <span className="block text-2xl font-bold text-ubablue">45%</span>
                  <span className="text-sm text-gray-600">Male Pupils</span>
              </div>
              <div className="p-4 bg-pink-50 rounded text-center">
                  <span className="block text-2xl font-bold text-pink-600">55%</span>
                  <span className="text-sm text-gray-600">Female Pupils</span>
              </div>
               <div className="p-4 bg-yellow-50 rounded text-center">
                  <span className="block text-2xl font-bold text-ubabrown">Math</span>
                  <span className="text-sm text-gray-600">Most Challenging Subject</span>
              </div>
          </div>
      </div>
    </div>
  );
};