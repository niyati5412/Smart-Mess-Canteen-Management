import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Public Pages
import Index from './pages/public/Index';
import Login from './pages/public/Login';
import Signup from './pages/Signup';
import About from './pages/About';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentIntention from './pages/student/Intention';
import StudentMenu from './pages/student/Menu';
import StudentValue from './pages/student/Value';
import StudentFeedback from './pages/student/Feedback';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminMenu from './pages/admin/Menu';
import AdminBudget from './pages/admin/Budget';
import AdminWaste from './pages/admin/Waste';
import AdminIntentions from './pages/admin/Intentions';

// Guardian Pages
import GuardianDashboard from './pages/guardian/Dashboard';
import GuardianBudget from './pages/guardian/Budget';
import GuardianAttendance from './pages/guardian/Attendance';
import GuardianAlerts from './pages/guardian/Alerts';

import ThemeToggle from './components/ThemeToggle';

function App() {
  return (
    <div className="App">
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/intention" element={<StudentIntention />} />
        <Route path="/student/menu" element={<StudentMenu />} />
        <Route path="/student/value" element={<StudentValue />} />
        <Route path="/student/feedback" element={<StudentFeedback />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/menu" element={<AdminMenu />} />
        <Route path="/admin/budget" element={<AdminBudget />} />
        <Route path="/admin/waste" element={<AdminWaste />} />
        <Route path="/admin/intentions" element={<AdminIntentions />} />
        
        {/* Guardian Routes */}
        <Route path="/guardian/dashboard" element={<GuardianDashboard />} />
        <Route path="/guardian/budget" element={<GuardianBudget />} />
        <Route path="/guardian/attendance" element={<GuardianAttendance />} />
        <Route path="/guardian/alerts" element={<GuardianAlerts />} />
      </Routes>
    </div>
  );
}

export default App;
