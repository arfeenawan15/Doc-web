import { useState, useMemo } from 'react';
import SiteConfig from './SiteConfig';
import './MobileApp.css';

export default function MobileAppView({
  tab,
  setTab,
  stats,
  fetchStats,
  appointments = [],
  fetchAppointments,
  loading,
  filterStatus,
  setFilterStatus,
  search,
  setSearch,
  confirmAppointment,
  cancelAppointment,
  saveDoctorNotes,
  handleResendEmail,
  emailLoading = {},
  notesText = {},
  setNotesText,
  expandedAptId,
  setExpandedAptId,
  setDeleteConfirm,
  setEditModal,
  adminEmail,
  handleLogout,
  credsForm,
  setCredsForm,
  handleChangeCredentials,
  credsLoading,
  credsError,
  credsSuccess,
  showCredsPass,
  setShowCredsPass,
  authHeaders,
  showToast
}) {
  const [refreshing, setRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchAppointments(true)]);
    setTimeout(() => setRefreshing(false), 500);
    showToast('Refreshed data!');
  };

  // Filter and sort appointments
  const filteredAppointments = useMemo(() => {
    const list = Array.isArray(appointments) ? appointments : [];
    return list.filter(apt => {
      if (!apt) return false;
      const matchFilter = filterStatus === 'all' || apt.status === filterStatus;
      if (!matchFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (apt.patientName && apt.patientName.toLowerCase().includes(q)) ||
        (apt.guardianName && apt.guardianName.toLowerCase().includes(q)) ||
        (apt.phone && apt.phone.includes(q)) ||
        (apt.hospital && apt.hospital.toLowerCase().includes(q)) ||
        (apt.service && apt.service.toLowerCase().includes(q))
      );
    });
  }, [appointments, filterStatus, search]);

  const pendingCount = stats?.pending || 0;

  return (
    <div className="mob-app-root">
      {/* ── Native Sticky App Header ── */}
      <header className="mob-top-header">
        <div className="mob-header-doctor">
          <div className="mob-doc-avatar">
            {(adminEmail && adminEmail[0] ? adminEmail[0] : 'W').toUpperCase()}
          </div>
          <div className="mob-doc-info">
            <span className="mob-doc-name">Dr. Waqas Ahmad</span>
            <span className="mob-doc-status">
              <span className="mob-status-dot" /> Clinic Portal Active
            </span>
          </div>
        </div>

        <div className="mob-header-actions">
          <button
            className="mob-icon-btn"
            onClick={handleManualRefresh}
            aria-label="Refresh"
            title="Refresh"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                transition: 'transform 0.4s',
                transform: refreshing ? 'rotate(180deg)' : 'none'
              }}
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
            </svg>
          </button>
          <button
            className="mob-icon-btn logout"
            onClick={handleLogout}
            aria-label="Logout"
            title="Logout"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Tab Views ── */}
      <main className="mob-content">
        {/* ════ TAB 1: DASHBOARD (HOME) ════ */}
        {tab === 'dashboard' && (
          <>
            {/* Action Banner if pending exist */}
            {pendingCount > 0 && (
              <div className="mob-alert-banner">
                <div className="mob-alert-left">
                  <div className="mob-alert-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <div>
                    <div className="mob-alert-title">{pendingCount} Booking{pendingCount > 1 ? 's' : ''} Pending</div>
                    <div className="mob-alert-desc">Awaiting your consultation review</div>
                  </div>
                </div>
                <button
                  className="mob-alert-btn"
                  onClick={() => {
                    setFilterStatus('pending');
                    setTab('appointments');
                  }}
                >
                  Review
                </button>
              </div>
            )}

            {/* 2x2 App Stat Cards */}
            <div className="mob-stats-grid">
              <div className="mob-stat-card" style={{ '--mob-stat-color': '#0284c7', '--mob-stat-bg': '#e0f2fe' }}>
                <div className="mob-stat-top">
                  <span className="mob-stat-label">Total Bookings</span>
                  <div className="mob-stat-icon-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                </div>
                <div className="mob-stat-value">{stats?.total ?? 0}</div>
                <div className="mob-stat-sub">Lifetime records</div>
              </div>

              <div className="mob-stat-card" style={{ '--mob-stat-color': '#f59e0b', '--mob-stat-bg': '#fef3c7' }}>
                <div className="mob-stat-top">
                  <span className="mob-stat-label">Pending</span>
                  <div className="mob-stat-icon-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                </div>
                <div className="mob-stat-value">{stats?.pending ?? 0}</div>
                <div className="mob-stat-sub">Needs response</div>
              </div>

              <div className="mob-stat-card" style={{ '--mob-stat-color': '#10b981', '--mob-stat-bg': '#d1fae5' }}>
                <div className="mob-stat-top">
                  <span className="mob-stat-label">Confirmed</span>
                  <div className="mob-stat-icon-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                </div>
                <div className="mob-stat-value">{stats?.confirmed ?? 0}</div>
                <div className="mob-stat-sub">Approved visits</div>
              </div>

              <div className="mob-stat-card" style={{ '--mob-stat-color': '#ef4444', '--mob-stat-bg': '#fee2e2' }}>
                <div className="mob-stat-top">
                  <span className="mob-stat-label">Cancelled</span>
                  <div className="mob-stat-icon-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  </div>
                </div>
                <div className="mob-stat-value">{stats?.cancelled ?? 0}</div>
                <div className="mob-stat-sub">Cancelled slots</div>
              </div>
            </div>

            {/* Recent Appointments Feed Snapshot */}
            <div className="mob-section-card">
              <div className="mob-section-header">
                <span className="mob-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Recent Bookings
                </span>
                <button
                  className="mob-alert-btn"
                  style={{ background: '#f1f5f9', color: '#0284c7' }}
                  onClick={() => setTab('appointments')}
                >
                  View All →
                </button>
              </div>

              {appointments.slice(0, 4).length === 0 ? (
                <div className="mob-empty-feed">
                  <p>No bookings found.</p>
                </div>
              ) : (
                <div className="mob-patient-feed">
                  {appointments.slice(0, 4).map(apt => (
                    <PatientCard
                      key={apt._id}
                      apt={apt}
                      confirmAppointment={confirmAppointment}
                      cancelAppointment={cancelAppointment}
                      saveDoctorNotes={saveDoctorNotes}
                      handleResendEmail={handleResendEmail}
                      emailLoading={emailLoading}
                      notesText={notesText}
                      setNotesText={setNotesText}
                      expandedAptId={expandedAptId}
                      setExpandedAptId={setExpandedAptId}
                      setDeleteConfirm={setDeleteConfirm}
                      setEditModal={setEditModal}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ════ TAB 2: APPOINTMENTS (BOOKINGS LIST) ════ */}
        {tab === 'appointments' && (
          <div className="mob-section-card" style={{ padding: '14px 12px' }}>
            {/* Search Input */}
            <div className="mob-search-wrap">
              <svg className="mob-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="mob-search-input"
                placeholder="Search patient, phone, hospital..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="mob-search-clear" onClick={() => setSearch('')}>
                  ✕
                </button>
              )}
            </div>

            {/* Segmented Filter Pills */}
            <div className="mob-segmented-control" style={{ marginBottom: 14 }}>
              {[
                { key: 'all', label: 'All', count: stats?.total ?? appointments.length },
                { key: 'pending', label: 'Pending', count: stats?.pending ?? 0 },
                { key: 'confirmed', label: 'Confirmed', count: stats?.confirmed ?? 0 },
                { key: 'cancelled', label: 'Cancelled', count: stats?.cancelled ?? 0 },
              ].map(f => (
                <button
                  key={f.key}
                  className={`mob-segment-btn ${filterStatus === f.key ? 'active' : ''}`}
                  onClick={() => setFilterStatus(f.key)}
                >
                  {f.label}
                  <span className="mob-segment-badge">{f.count}</span>
                </button>
              ))}
            </div>

            {/* Patient Cards Feed */}
            {loading ? (
              <div className="mob-empty-feed">
                <p>Loading appointments...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="mob-empty-feed">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <p>No appointments match this filter.</p>
              </div>
            ) : (
              <div className="mob-patient-feed">
                {filteredAppointments.map(apt => (
                  <PatientCard
                    key={apt._id}
                    apt={apt}
                    confirmAppointment={confirmAppointment}
                    cancelAppointment={cancelAppointment}
                    saveDoctorNotes={saveDoctorNotes}
                    handleResendEmail={handleResendEmail}
                    emailLoading={emailLoading}
                    notesText={notesText}
                    setNotesText={setNotesText}
                    expandedAptId={expandedAptId}
                    setExpandedAptId={setExpandedAptId}
                    setDeleteConfirm={setDeleteConfirm}
                    setEditModal={setEditModal}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════ TAB 3: SITE CMS ════ */}
        {tab === 'site' && (
          <div className="mob-section-card">
            <div className="mob-section-header">
              <span className="mob-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                Site Configuration
              </span>
            </div>
            <SiteConfig authHeaders={authHeaders} showToast={showToast} />
          </div>
        )}

        {/* ════ TAB 4: SETTINGS & SECURITY ════ */}
        {tab === 'settings' && (
          <div className="mob-section-card">
            <div className="mob-section-header">
              <span className="mob-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Admin Credentials
              </span>
            </div>

            <form onSubmit={handleChangeCredentials} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Current Password
                </label>
                <input
                  type={showCredsPass.current ? 'text' : 'password'}
                  className="mob-search-input"
                  style={{ height: 40 }}
                  placeholder="Enter current password"
                  value={credsForm.currentPassword}
                  onChange={e => setCredsForm(p => ({ ...p, currentPassword: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  New Admin Email
                </label>
                <input
                  type="email"
                  className="mob-search-input"
                  style={{ height: 40 }}
                  placeholder="Enter new email"
                  value={credsForm.newEmail}
                  onChange={e => setCredsForm(p => ({ ...p, newEmail: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  New Password
                </label>
                <input
                  type={showCredsPass.newp ? 'text' : 'password'}
                  className="mob-search-input"
                  style={{ height: 40 }}
                  placeholder="Min 8 characters"
                  value={credsForm.newPassword}
                  onChange={e => setCredsForm(p => ({ ...p, newPassword: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Confirm New Password
                </label>
                <input
                  type={showCredsPass.confirm ? 'text' : 'password'}
                  className="mob-search-input"
                  style={{ height: 40 }}
                  placeholder="Re-enter new password"
                  value={credsForm.confirmPassword}
                  onChange={e => setCredsForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  required
                />
              </div>

              {credsError && (
                <div style={{ color: '#ef4444', fontSize: 12, background: '#fee2e2', padding: '8px 12px', borderRadius: 8 }}>
                  {credsError}
                </div>
              )}
              {credsSuccess && (
                <div style={{ color: '#065f46', fontSize: 12, background: '#d1fae5', padding: '8px 12px', borderRadius: 8 }}>
                  {credsSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={credsLoading}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 16px',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  marginTop: 6
                }}
              >
                {credsLoading ? 'Updating...' : 'Update Admin Credentials'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ── Native Mobile Bottom Tab Bar ── */}
      <nav className="mob-bottom-tabbar">
        <button
          className={`mob-tab-item ${tab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setTab('dashboard')}
          aria-label="Dashboard"
        >
          <div className="mob-tab-icon-wrap">
            <svg viewBox="0 0 24 24" fill={tab === 'dashboard' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="mob-tab-label">Dashboard</span>
        </button>

        <button
          className={`mob-tab-item ${tab === 'appointments' ? 'active' : ''}`}
          onClick={() => setTab('appointments')}
          aria-label="Bookings"
        >
          <div className="mob-tab-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {pendingCount > 0 && <span className="mob-tab-badge">{pendingCount}</span>}
          </div>
          <span className="mob-tab-label">Bookings</span>
        </button>

        <button
          className={`mob-tab-item ${tab === 'site' ? 'active' : ''}`}
          onClick={() => setTab('site')}
          aria-label="Site CMS"
        >
          <div className="mob-tab-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </div>
          <span className="mob-tab-label">Site CMS</span>
        </button>

        <button
          className={`mob-tab-item ${tab === 'settings' ? 'active' : ''}`}
          onClick={() => setTab('settings')}
          aria-label="Security"
        >
          <div className="mob-tab-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <span className="mob-tab-label">Security</span>
        </button>
      </nav>
    </div>
  );
}

/**
 * Native Touch-Friendly Patient Card for Mobile
 */
function PatientCard({
  apt,
  confirmAppointment,
  cancelAppointment,
  saveDoctorNotes,
  handleResendEmail,
  emailLoading,
  notesText,
  setNotesText,
  expandedAptId,
  setExpandedAptId,
  setDeleteConfirm,
  setEditModal
}) {
  const isExpanded = expandedAptId === apt._id;
  const cleanPhone = (apt.phone || '').replace(/[^0-9]/g, '');

  const initials = (apt.patientName || 'P')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  return (
    <div className={`mob-patient-card status-${apt.status}`}>
      <div className={`mob-card-status-strip ${apt.status}`} />

      <div className="mob-card-body">
        {/* Head: Avatar, Name, Age, Status Pill */}
        <div className="mob-card-head">
          <div className="mob-patient-summary">
            <div className="mob-avatar-circle">{initials}</div>
            <div className="mob-patient-titles">
              <span className="mob-patient-fullname">{apt.patientName}</span>
              <span className="mob-patient-age-badge">
                {apt.age} yrs · Guardian: {apt.guardianName}
              </span>
            </div>
          </div>
          <span className={`mob-status-pill ${apt.status}`}>
            <span className="mob-status-pill-dot" />
            {apt.status}
          </span>
        </div>

        {/* Details row: Date, Time, Hospital */}
        <div className="mob-card-meta-list">
          <div className="mob-meta-row">
            <span className="label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Scheduled Time
            </span>
            <span className="val highlight">{apt.date} · {apt.time}</span>
          </div>

          <div className="mob-meta-row">
            <span className="label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Hospital
            </span>
            <span className="val">{apt.hospital}</span>
          </div>

          <div className="mob-meta-row">
            <span className="label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              Service
            </span>
            <span className="val">{apt.service}</span>
          </div>
        </div>

        {/* Quick Contact Buttons (WhatsApp & Call) */}
        <div className="mob-contact-quick-bar">
          <a
            href={`https://wa.me/${cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(`Assalam-o-Alaikum, this is Dr. Waqas Ahmad Awan's clinic regarding the appointment for ${apt.patientName}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mob-contact-btn whatsapp"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
            </svg>
            WhatsApp
          </a>

          <a href={`tel:${apt.phone}`} className="mob-contact-btn call">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
            </svg>
            Call
          </a>
        </div>

        {/* Primary Action Row */}
        <div className="mob-card-action-bar">
          {apt.status !== 'confirmed' && (
            <button
              className="mob-action-btn confirm"
              onClick={() => confirmAppointment(apt._id)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Confirm
            </button>
          )}

          {apt.status !== 'cancelled' && (
            <button
              className="mob-action-btn cancel"
              onClick={() => cancelAppointment(apt._id)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Cancel
            </button>
          )}

          <button
            className="mob-action-btn details"
            onClick={() => setExpandedAptId(isExpanded ? null : apt._id)}
          >
            {isExpanded ? 'Hide' : 'Details'}
          </button>
        </div>
      </div>

      {/* Expanded Accordion Drawer */}
      {isExpanded && (
        <div className="mob-card-expanded-panel">
          {/* Patient Concern */}
          <div className="mob-expanded-block">
            <h4>Patient Problem / Concern</h4>
            <div className="mob-concern-text">
              {apt.concern ? `“${apt.concern}”` : 'No notes provided by patient.'}
            </div>
          </div>

          {/* Email Notification Tracker */}
          <div className="mob-expanded-block">
            <h4>Email Delivery Status</h4>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className={`mob-email-status-pill ${apt.emailStatus || 'none'}`}>
                {apt.emailStatus === 'sent' && '✅ Sent to ' + apt.guardianEmail}
                {apt.emailStatus === 'failed' && '❌ Delivery Failed'}
                {(!apt.emailStatus || apt.emailStatus === 'none') && '🕒 Pending Notification'}
              </span>
              {apt.status !== 'pending' && (
                <button
                  className="mob-resend-email-btn"
                  onClick={() => handleResendEmail(apt._id)}
                  disabled={emailLoading[apt._id]}
                >
                  {emailLoading[apt._id] ? 'Sending...' : 'Resend'}
                </button>
              )}
            </div>
            {apt.lastEmailError && (
              <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>
                {apt.lastEmailError}
              </p>
            )}
          </div>

          {/* Clinical Doctor Notes */}
          <div className="mob-expanded-block">
            <h4>Clinical Notes / Prescription</h4>
            <textarea
              className="mob-notes-textarea"
              rows={3}
              placeholder="Write clinical diagnosis or surgery instructions..."
              value={notesText[apt._id] ?? (apt.doctorNotes || '')}
              onChange={e => setNotesText(prev => ({ ...prev, [apt._id]: e.target.value }))}
            />
            <button
              className="mob-save-notes-btn"
              onClick={() => saveDoctorNotes(apt._id, notesText[apt._id] ?? (apt.doctorNotes || ''))}
            >
              Save Doctor Notes
            </button>
          </div>

          {/* Edit / Delete Buttons */}
          <div className="mob-card-danger-zone">
            <button
              className="mob-delete-record-btn"
              style={{ color: '#0284c7', borderColor: '#bae6fd' }}
              onClick={() => setEditModal({ ...apt })}
            >
              ✏️ Edit Fields
            </button>
            <button
              className="mob-delete-record-btn"
              onClick={() => setDeleteConfirm(apt._id)}
            >
              🗑️ Delete Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
