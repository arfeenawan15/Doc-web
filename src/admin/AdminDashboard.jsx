import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import DesktopAdminView from './DesktopAdminView';
import MobileAppView from './MobileAppView';
import './AdminDashboard.css';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://doc-web-prq3.onrender.com');

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');
  const adminEmail = localStorage.getItem('adminEmail') || 'drwaqasahmadawan@gmail.com';

  // Responsive device view check (Mobile App vs Desktop Dashboard)
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 820 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 820);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main UI states
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedAptId, setExpandedAptId] = useState(null);
  const [notesText, setNotesText] = useState({});
  const [emailLoading, setEmailLoading] = useState({});

  // Credentials form
  const [credsForm, setCredsForm] = useState({ currentPassword: '', newEmail: '', newPassword: '', confirmPassword: '' });
  const [credsLoading, setCredsLoading] = useState(false);
  const [credsError, setCredsError] = useState('');
  const [credsSuccess, setCredsSuccess] = useState('');
  const [showCredsPass, setShowCredsPass] = useState({ current: false, newp: false, confirm: false });

  // Bulk & sorting
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortKey, setSortKey] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Digital clock
  const [adminClock, setAdminClock] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setAdminClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }), [token]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Logout ── */
  const handleLogout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    navigate('/admin');
  }, [navigate]);

  /* ── Fetch Stats ── */
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/stats`, { headers: authHeaders });
      const data = await res.json();
      if (data && data.success && data.stats) {
        setStats(data.stats);
      } else if (res.status === 401 || res.status === 403) {
        handleLogout();
      }
    } catch { /* silent */ }
  }, [authHeaders, handleLogout]);

  /* ── Fetch Appointments ── */
  const fetchAppointments = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (search.trim()) params.set('search', search.trim());
      const res = await fetch(`${API}/appointments?${params}`, { headers: authHeaders });
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        setAppointments(data.data);
      } else if (res.status === 401 || res.status === 403) {
        handleLogout();
      }
    } catch { /* silent */ }
    if (!isBackground) setLoading(false);
  }, [filterStatus, search, authHeaders, handleLogout]);

  // Initial & periodic data synchronization
  useEffect(() => {
    if (!token) return;
    fetchStats();
    fetchAppointments(true);
    const interval = setInterval(() => {
      if (localStorage.getItem('adminToken')) {
        fetchStats();
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [fetchStats, fetchAppointments, token]);

  /* ── Compute Monthly Report ── */
  const getMonthlyReport = useCallback(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const list = Array.isArray(appointments) ? appointments : [];
    const thisMonth = list.filter(a => {
      if (!a || !a.createdAt) return false;
      const d = new Date(a.createdAt);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
    return {
      monthName,
      total: thisMonth.length,
      confirmed: thisMonth.filter(a => a?.status === 'confirmed').length,
      pending: thisMonth.filter(a => a?.status === 'pending').length,
      cancelled: thisMonth.filter(a => a?.status === 'cancelled').length,
    };
  }, [appointments]);

  /* ── Chart Data for 7-Day Trend ── */
  const getChartData = useCallback(() => {
    if (!stats) return [];
    const trend = Array.isArray(stats.dailyTrend) ? stats.dailyTrend : [];
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().slice(0, 10);
      list.push(str);
    }
    return list.map(dateStr => {
      const match = trend.find(x => x && x._id === dateStr);
      const dateObj = new Date(dateStr);
      const label = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      return {
        date: dateStr,
        label,
        count: match ? (match.count || 0) : 0
      };
    });
  }, [stats]);

  /* ── Sorting Helper ── */
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const getSortedAppointments = useCallback(() => {
    const list = Array.isArray(appointments) ? appointments : [];
    return [...list].sort((a, b) => {
      if (!a || !b) return 0;
      let valA = a[sortKey] || '';
      let valB = b[sortKey] || '';

      if (sortKey === 'age') {
        return sortOrder === 'asc' ? (a.age || 0) - (b.age || 0) : (b.age || 0) - (a.age || 0);
      }

      if (sortKey === 'date') {
        const parseDateTime = (dStr, tStr) => {
          try {
            return new Date(`${dStr} ${tStr || ''}`).getTime() || 0;
          } catch {
            return 0;
          }
        };
        return sortOrder === 'asc'
          ? parseDateTime(a.date, a.time) - parseDateTime(b.date, b.time)
          : parseDateTime(b.date, b.time) - parseDateTime(a.date, a.time);
      }

      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [appointments, sortKey, sortOrder]);

  /* ── Highlight Search Matches ── */
  const highlightText = (text, searchStr) => {
    if (!searchStr || !searchStr.trim()) return text;
    const regex = new RegExp(`(${searchStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = String(text).split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} className="desk-search-highlight">{part}</mark> : part
    );
  };

  /* ── Bulk Actions ── */
  const toggleSelectRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const list = Array.isArray(appointments) ? appointments : [];
    if (selectedIds.length === list.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(list.map(a => a._id));
    }
  };

  const handleBulkStatusChange = async (status) => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    let successCount = 0;
    try {
      await Promise.all(selectedIds.map(async (id) => {
        const res = await fetch(`${API}/appointments/${id}`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({ status }),
        });
        const data = await res.json();
        if (data.success) successCount++;
      }));

      if (successCount > 0) {
        setAppointments(prev => prev.map(a => selectedIds.includes(a._id) ? { ...a, status } : a));
        fetchStats();
        showToast(`Bulk updated ${successCount} appointments to ${status}!`);
      }
    } catch {
      showToast('Some appointments failed to update.', 'error');
    }
    setSelectedIds([]);
    setLoading(false);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Permanently delete ${selectedIds.length} appointment records?`)) return;
    setLoading(true);
    let successCount = 0;
    try {
      await Promise.all(selectedIds.map(async (id) => {
        const res = await fetch(`${API}/appointments/${id}`, {
          method: 'DELETE',
          headers: authHeaders,
        });
        const data = await res.json();
        if (data.success) successCount++;
      }));

      if (successCount > 0) {
        setAppointments(prev => prev.filter(a => !selectedIds.includes(a._id)));
        fetchStats();
        showToast(`Bulk deleted ${successCount} appointments.`, 'warn');
      }
    } catch {
      showToast('Some records failed to delete.', 'error');
    }
    setSelectedIds([]);
    setLoading(false);
  };

  /* ── Single Appointment Actions ── */
  const confirmAppointment = async (id) => {
    try {
      const res = await fetch(`${API}/appointments/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status: 'confirmed' }),
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev => prev.map(a => a._id === id ? data.data : a));
        fetchStats();
        showToast(data.emailSent ? '✅ Confirmed & notification email sent!' : '✅ Appointment confirmed!');
      }
    } catch {
      showToast('Error confirming appointment.', 'error');
    }
  };

  const cancelAppointment = async (id) => {
    try {
      const res = await fetch(`${API}/appointments/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status: 'cancelled' }),
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev => prev.map(a => a._id === id ? data.data : a));
        fetchStats();
        showToast('⛔ Appointment cancelled.', 'warn');
      }
    } catch {
      showToast('Error cancelling appointment.', 'error');
    }
  };

  const handleResendEmail = async (id) => {
    setEmailLoading(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`${API}/appointments/${id}/resend-email`, {
        method: 'POST',
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev => prev.map(a => a._id === id ? data.data : a));
        showToast(data.emailSent ? '📧 Notification email resent!' : 'Email delivery attempted.');
      } else {
        showToast(data.message || 'Error resending email.', 'error');
      }
    } catch {
      showToast('Connection error. Failed to resend email.', 'error');
    } finally {
      setEmailLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const saveDoctorNotes = async (id, notes) => {
    try {
      const res = await fetch(`${API}/appointments/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ doctorNotes: notes }),
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev => prev.map(a => a._id === id ? data.data : a));
        showToast('💾 Clinical notes saved!');
      }
    } catch {
      showToast('Error saving clinical notes.', 'error');
    }
  };

  const deleteAppointment = async (id) => {
    try {
      const res = await fetch(`${API}/appointments/${id}`, { method: 'DELETE', headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev => prev.filter(a => a._id !== id));
        fetchStats();
        showToast('🗑️ Appointment record deleted.', 'warn');
      }
    } catch {
      showToast('Error deleting appointment.', 'error');
    }
    setDeleteConfirm(null);
  };

  const saveEdit = async () => {
    if (!editModal) return;
    const { _id, ...fields } = editModal;
    try {
      const res = await fetch(`${API}/appointments/${_id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev => prev.map(a => a._id === _id ? data.data : a));
        fetchStats();
        showToast('✏️ Appointment updated!');
        setEditModal(null);
      }
    } catch {
      showToast('Error saving changes.', 'error');
    }
  };

  const handleToggleExpand = (apt) => {
    if (expandedAptId === apt._id) {
      setExpandedAptId(null);
    } else {
      setExpandedAptId(apt._id);
      setNotesText(prev => ({ ...prev, [apt._id]: apt.doctorNotes || '' }));
    }
  };

  const exportToCSV = () => {
    const list = Array.isArray(appointments) ? appointments : [];
    if (list.length === 0) {
      showToast('No records to export.', 'warn');
      return;
    }
    const headers = ['#', 'Patient Name', 'Age', 'Guardian Name', 'Email', 'Phone', 'Hospital', 'Service', 'Date', 'Time', 'Concern', 'Status', 'Booked At'];
    const rows = list.map((a, i) => [
      i + 1,
      a.patientName,
      a.age,
      a.guardianName,
      a.guardianEmail,
      a.phone,
      a.hospital,
      a.service,
      a.date,
      a.time,
      a.concern ? a.concern.replace(/"/g, '""') : '',
      a.status,
      a.createdAt ? new Date(a.createdAt).toLocaleString() : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `drwaqas_appointments_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📈 Exported CSV successfully!');
  };

  const handleChangeCredentials = async (e) => {
    e.preventDefault();
    setCredsError('');
    setCredsSuccess('');
    if (credsForm.newPassword !== credsForm.confirmPassword) {
      setCredsError('New passwords do not match.');
      return;
    }
    setCredsLoading(true);
    try {
      const res = await fetch(`${API}/admin/change-credentials`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          currentPassword: credsForm.currentPassword,
          newEmail: credsForm.newEmail,
          newPassword: credsForm.newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminEmail', credsForm.newEmail);
        setCredsSuccess('✅ Credentials updated successfully!');
        setCredsForm({ currentPassword: '', newEmail: '', newPassword: '', confirmPassword: '' });
        showToast('🔐 Credentials updated!');
      } else {
        setCredsError(data.message || 'Failed to update credentials.');
      }
    } catch {
      setCredsError('Connection error. Please try again.');
    }
    setCredsLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAppointments();
  };

  return (
    <>
      <SEO
        title="Admin Portal"
        description="Comprehensive clinic administration and pediatric appointment portal."
        noIndex
      />

      {/* ── Toast Notification ── */}
      {toast && (
        <div className={`ad-toast ad-toast-${toast.type}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Seamless Switcher: Native Mobile App View vs High-Density Desktop EHR ── */}
      {isMobile ? (
        <MobileAppView
          tab={tab}
          setTab={setTab}
          stats={stats}
          fetchStats={fetchStats}
          appointments={appointments}
          fetchAppointments={fetchAppointments}
          loading={loading}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          search={search}
          setSearch={setSearch}
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
          adminEmail={adminEmail}
          handleLogout={handleLogout}
          credsForm={credsForm}
          setCredsForm={setCredsForm}
          handleChangeCredentials={handleChangeCredentials}
          credsLoading={credsLoading}
          credsError={credsError}
          credsSuccess={credsSuccess}
          showCredsPass={showCredsPass}
          setShowCredsPass={setShowCredsPass}
          authHeaders={authHeaders}
          showToast={showToast}
        />
      ) : (
        <DesktopAdminView
          tab={tab}
          setTab={setTab}
          stats={stats}
          fetchStats={fetchStats}
          appointments={appointments}
          fetchAppointments={fetchAppointments}
          loading={loading}
          search={search}
          setSearch={setSearch}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          adminClock={adminClock}
          adminEmail={adminEmail}
          handleLogout={handleLogout}
          getMonthlyReport={getMonthlyReport}
          getChartData={getChartData}
          getSortedAppointments={getSortedAppointments}
          sortKey={sortKey}
          sortOrder={sortOrder}
          handleSort={handleSort}
          selectedIds={selectedIds}
          toggleSelectRow={toggleSelectRow}
          toggleSelectAll={toggleSelectAll}
          handleBulkStatusChange={handleBulkStatusChange}
          handleBulkDelete={handleBulkDelete}
          exportToCSV={exportToCSV}
          expandedAptId={expandedAptId}
          handleToggleExpand={handleToggleExpand}
          notesText={notesText}
          setNotesText={setNotesText}
          saveDoctorNotes={saveDoctorNotes}
          confirmAppointment={confirmAppointment}
          cancelAppointment={cancelAppointment}
          handleResendEmail={handleResendEmail}
          emailLoading={emailLoading}
          setEditModal={setEditModal}
          setDeleteConfirm={setDeleteConfirm}
          highlightText={highlightText}
          handleSearch={handleSearch}
          credsForm={credsForm}
          setCredsForm={setCredsForm}
          handleChangeCredentials={handleChangeCredentials}
          credsLoading={credsLoading}
          credsError={credsError}
          credsSuccess={credsSuccess}
          showCredsPass={showCredsPass}
          setShowCredsPass={setShowCredsPass}
          authHeaders={authHeaders}
          showToast={showToast}
        />
      )}

      {/* ════ EDIT APPOINTMENT MODAL ════ */}
      {editModal && (
        <div className="ad-overlay" onClick={() => setEditModal(null)}>
          <div className="ad-modal" onClick={e => e.stopPropagation()}>
            <div className="ad-modal-header">
              <h2>Edit Appointment Record</h2>
              <button className="ad-modal-close" onClick={() => setEditModal(null)}>✕</button>
            </div>
            <div className="ad-modal-body">
              {[
                { field: 'patientName', label: 'Patient Name', type: 'text' },
                { field: 'age', label: 'Age (Years)', type: 'number' },
                { field: 'guardianName', label: 'Guardian Name', type: 'text' },
                { field: 'phone', label: 'Phone Number', type: 'text' },
                { field: 'guardianEmail', label: 'Guardian Email', type: 'email' },
                { field: 'hospital', label: 'Hospital Branch', type: 'text' },
                { field: 'service', label: 'Clinical Service', type: 'text' },
                { field: 'date', label: 'Scheduled Date', type: 'text' },
                { field: 'time', label: 'Scheduled Time', type: 'text' },
              ].map(({ field, label, type }) => (
                <div className="ad-modal-field" key={field}>
                  <label htmlFor={`edit-${field}`}>{label}</label>
                  <input
                    id={`edit-${field}`}
                    type={type}
                    value={editModal[field] ?? ''}
                    onChange={e => setEditModal(prev => ({ ...prev, [field]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="ad-modal-field">
                <label htmlFor="edit-status">Status</label>
                <select
                  id="edit-status"
                  value={editModal.status}
                  onChange={e => setEditModal(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="ad-modal-field">
                <label htmlFor="edit-concern">Concern / Problem Description</label>
                <textarea
                  id="edit-concern"
                  rows={3}
                  value={editModal.concern ?? ''}
                  onChange={e => setEditModal(prev => ({ ...prev, concern: e.target.value }))}
                />
              </div>
            </div>
            <div className="ad-modal-footer">
              <button className="ad-modal-cancel" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="ad-modal-save" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ DELETE CONFIRMATION MODAL ════ */}
      {deleteConfirm && (
        <div className="ad-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="ad-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="ad-confirm-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </div>
            <h2>Permanently Delete Record?</h2>
            <p>This action cannot be undone. The appointment will be permanently removed from MongoDB.</p>
            <div className="ad-confirm-btns">
              <button className="ad-modal-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="ad-modal-delete" onClick={() => deleteAppointment(deleteConfirm)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
