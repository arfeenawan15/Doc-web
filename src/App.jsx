import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import SEO           from './components/SEO';
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

import UserLogin from './components/UserLogin';
import UserSignup from './components/UserSignup';
import { AuthProvider } from './context/AuthContext';

function PublicSite() {
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  return (
    <>
      <SEO 
        title="Best Pediatric Surgeon in Mian Channu & Multan"
        description="Looking for the Best Pediatric Surgeon in Mian Channu? Dr. Waqas Ahmad Awan is a top-rated child surgeon and child specialist offering expert pediatric and neonatal surgery."
        keywords="Best Pediatric Surgeon in mian channu, Child surgeon, child specialist, best pediatric surgeon in multan, pediatric surgeon near me, children hospital multan child specialist, neonatal surgeon"
        url="https://drwaqasawan.com/"
      />
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
    <AuthProvider>
      <Routes>
        {/* ── Public website ── */}
        <Route path="/" element={<PublicSite />} />

        {/* ── User Auth ── */}
        <Route path="/login" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignup />} />

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
    </AuthProvider>
  );
}
