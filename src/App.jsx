import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar        from './components/Navbar';
import Hero          from './components/Hero';
import About         from './components/About';
import Services      from './components/Services';
import Schedule      from './components/Schedule';
import Locations     from './components/Locations';
import Appointment   from './components/Appointment';
import Contact       from './components/Contact';
import Footer        from './components/Footer';
import { Toast, WhatsAppFloat } from './components/Widgets';

import AdminLogin     from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import ProtectedRoute from './admin/ProtectedRoute';

function PublicSite() {
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  return (
    <>
      <Navbar />
      <WhatsAppFloat />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <main>
        <Hero />
        <About />
        <Services />
        <Schedule />
        <Locations />
        <Appointment />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* ── Public website ── */}
      <Route path="/" element={<PublicSite />} />

      {/* ── Admin portal ── */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
