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
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';

// The main app layout (with sidebar)
function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F7F4EC', fontFamily: 'sans-serif' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem 2.5rem', minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth pages — no sidebar */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* App pages — with sidebar */}
        <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/markets" element={<AppLayout><Markets /></AppLayout>} />
        <Route path="/learn" element={<AppLayout><Learn /></AppLayout>} />
        <Route path="/practice" element={<AppLayout><Practice /></AppLayout>} />
        <Route path="/predictions" element={<AppLayout><Predictions /></AppLayout>} />
        <Route path="/ai-buddy" element={<AppLayout><AIBuddy /></AppLayout>} />
        <Route path="/my-plan" element={<AppLayout><MyPlan /></AppLayout>} />
        <Route path="/invest" element={<AppLayout><Invest /></AppLayout>} />
        <Route path="/daily-digest" element={<AppLayout><DailyDigest /></AppLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;