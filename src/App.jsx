import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import SEO           from './components/SEO';
import Navbar        from './components/Navbar';
import Hero          from './components/Hero';
import About         from './components/About';
import Services      from './components/Services';
import Schedule      from './components/Schedule';
import Locations     from './components/Locations';
import UserRecordsSection from './components/UserRecordsSection';
import Appointment   from './components/Appointment';
import Contact       from './components/Contact';
import Footer        from './components/Footer';
import { Toast, WhatsAppFloat } from './components/Widgets';

import AdminLogin     from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import ProtectedRoute from './admin/ProtectedRoute';
import ErrorBoundary  from './components/ErrorBoundary';

import UserLogin from './components/UserLogin';
import UserSignup from './components/UserSignup';
import UserProtectedRoute from './components/UserProtectedRoute';
import PatientDashboard from './components/PatientDashboard';
import { AuthProvider } from './context/AuthContext';
import { SiteProvider, useSite } from './context/SiteContext';

function AvailabilityBanner() {
  const { settings, loading } = useSite();
  if (loading || settings.doctorAvailable) return null;
  return (
    <div style={{
      backgroundColor: '#ef4444',
      color: 'white',
      textAlign: 'center',
      padding: '10px 20px',
      fontSize: '15px',
      fontWeight: '600',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
      {settings.availabilityMessage}
    </div>
  );
}

function PublicSite() {
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      }
    }
  }, [location.pathname, location.hash]);

  return (
    <>
      <SEO />
      <AvailabilityBanner />
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
        <UserRecordsSection />
        <Appointment />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl + Shift + A (Windows/Linux) or Cmd + Shift + A (Mac)
      // Also support Ctrl + Alt + A or Ctrl + Shift + D in case a screenshot tool hijacks Ctrl+Shift+A
      const isA = e.key === 'A' || e.key === 'a';
      const isD = e.key === 'D' || e.key === 'd';
      const hasModifier = e.ctrlKey || e.metaKey;

      if ((hasModifier && e.shiftKey && isA) ||
          (hasModifier && e.altKey && isA) ||
          (hasModifier && e.shiftKey && isD)) {
        e.preventDefault();
        window.open('/admin', '_blank', 'noopener,noreferrer');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <ErrorBoundary>
      <SiteProvider>
        <AuthProvider>
          <Routes>
            {/* ── Public website ── */}
            <Route path="/" element={<PublicSite />} />

            {/* ── User Auth & Portal ── */}
            <Route path="/login" element={<UserLogin />} />
            <Route path="/signup" element={<UserSignup />} />
            <Route path="/patient-dashboard" element={
              <UserProtectedRoute>
                <PatientDashboard />
              </UserProtectedRoute>
            } />

            {/* ── Admin portal ── */}
            <Route path="/admin" element={
              <ErrorBoundary>
                <AdminLogin />
              </ErrorBoundary>
            } />
            <Route
              path="/admin/dashboard"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
          </Routes>
        </AuthProvider>
      </SiteProvider>
    </ErrorBoundary>
  );
}
