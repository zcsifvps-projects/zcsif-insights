import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import Toaster from '@/components/ui/Toaster';
import Layout from '@/components/layout/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Events from '@/pages/Events';
import EventDetail from '@/pages/EventDetail';
import Trainings from '@/pages/Trainings';
import TrainingDetail from '@/pages/TrainingDetail';
import Feedback from '@/pages/Feedback';
import PublicFeedback from '@/pages/PublicFeedback';

function ProtectedApp() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-paper">
        <div className="h-8 w-8 rounded-full border-2 border-forest-200 border-t-forest-600 animate-spin" />
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/trainings" element={<Trainings />} />
        <Route path="/trainings/:id" element={<TrainingDetail />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public, no-login feedback link — must stay outside the auth gate above */}
          <Route path="/give-feedback/:module/:id" element={<PublicFeedback />} />
          <Route path="/*" element={<ProtectedApp />} />
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}
