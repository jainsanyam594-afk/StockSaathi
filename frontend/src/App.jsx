import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import Learn from './pages/Learn';
import Practice from './pages/Practice';
import Predictions from './pages/Predictions';
import AIBuddy from './pages/AIBuddy';
import MyPlan from './pages/MyPlan';
import Invest from './pages/Invest';
import DailyDigest from './pages/DailyDigest';

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F7F4EC', fontFamily: 'sans-serif' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem 2.5rem', minWidth: 0 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/ai-buddy" element={<AIBuddy />} />
            <Route path="/my-plan" element={<MyPlan />} />
            <Route path="/invest" element={<Invest />} />
            <Route path="/daily-digest" element={<DailyDigest />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;