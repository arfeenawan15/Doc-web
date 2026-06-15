import { useState, useEffect, useCallback, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const STATUS_COLORS = {
  pending: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  confirmed: { bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  cancelled: { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');
  const adminEmail = localStorage.getItem('adminEmail') || 'Admin';

  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast] = useState(null);
  const [editModal, setEditModal] = useState(null); // appointment to edit
  const [deleteConfirm, setDeleteConfirm] = useState(null); // id to delete
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedAptId, setExpandedAptId] = useState(null); // id of expanded row
  const [notesText, setNotesText] = useState({});
  const [emailLoading, setEmailLoading] = useState({});

  const handleToggleExpand = (apt) => {
    if (expandedAptId === apt._id) {
      setExpandedAptId(null);
    } else {
      setExpandedAptId(apt._id);
      setNotesText(prev => ({ ...prev, [apt._id]: apt.doctorNotes || '' }));
    }
  };
  
  // Advanced States
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortKey, setSortKey] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [activities, setActivities] = useState([
    { id: 1, text: 'Admin session initiated', type: 'info', time: 'Just now' },
    { id: 2, text: 'Synchronized database indexes', type: 'success', time: '5m ago' },
    { id: 3, text: 'Connection established to MongoDB Atlas Cluster', type: 'success', time: '10m ago' }
  ]);

  const logActivity = useCallback((text, type = 'info') => {
    setActivities(prev => [
      { id: Date.now(), text, type, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
      ...prev
    ].slice(0, 10));
  }, []);

  useEffect(() => { setSelectedIds([]); }, [appointments, filterStatus]);

  // Live clock for sidebar
  const [adminClock, setAdminClock] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setAdminClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);


  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Fetch Stats ── */
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/stats`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) setStats(data.stats);
      else if (res.status === 401 || res.status === 403) handleLogout();
    } catch { /* silent */ }
  }, []);

  /* ── Get Chart Data for 7-Day Daily Trend ── */
  const getChartData = () => {
    if (!stats) return [];
    const trend = stats.dailyTrend || [];
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().slice(0, 10);
      list.push(str);
    }
    return list.map(dateStr => {
      const match = trend.find(x => x._id === dateStr);
      const dateObj = new Date(dateStr);
      const label = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      return {
        date: dateStr,
        label,
        count: match ? match.count : 0
      };
    });
  };

  /* ── Fetch Appointments ── */
  const fetchAppointments = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (search.trim()) params.set('search', search.trim());
      const res = await fetch(`${API}/appointments?${params}`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) setAppointments(data.data);
      else if (res.status === 401 || res.status === 403) handleLogout();
    } catch { /* silent */ }
    if (!isBackground) setLoading(false);
  }, [filterStatus, search]);

  // Background polling for statistics to update pending badges dynamically
  useEffect(() => {
    if (!token) return;
    fetchStats();
    const interval = setInterval(() => {
      if (localStorage.getItem('adminToken')) {
        fetchStats();
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchStats, token]);

  // Background polling for appointments (silent background update)
  useEffect(() => {
    if (!token) return;
    if (tab === 'appointments') {
      fetchAppointments(false); // First load or status filter changes shows the spinner
      const interval = setInterval(() => {
        if (localStorage.getItem('adminToken')) {
          fetchAppointments(true); // Background updates run silently
        }
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [tab, filterStatus, fetchAppointments, token]);

  /* ── Confirm Appointment ── */
  const confirmAppointment = async (id) => {
    try {
      const apt = appointments.find(a => a._id === id);
      const res = await fetch(`${API}/appointments/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status: 'confirmed' }),
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev => prev.map(a => a._id === id ? data.data : a));
        fetchStats();
        showToast('✅ Appointment confirmed!');
        logActivity(`Confirmed booking for ${apt ? apt.patientName : 'patient'}`, 'success');
        if (data.emailSent) {
          logActivity(`📧 Confirmation email sent to ${apt?.guardianEmail}`, 'success');
        } else if (data.data?.emailStatus === 'failed') {
          logActivity(`❌ Confirmation email failed: ${data.data.lastEmailError}`, 'warn');
        }
      }
    } catch { showToast('Error confirming appointment.', 'error'); }
  };

  /* ── Resend Email Notification ── */
  const handleResendEmail = async (id) => {
    setEmailLoading(prev => ({ ...prev, [id]: true }));
    try {
      const apt = appointments.find(a => a._id === id);
      const res = await fetch(`${API}/appointments/${id}/resend-email`, {
        method: 'POST',
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev => prev.map(a => a._id === id ? data.data : a));
        if (data.emailSent) {
          showToast('📧 Email resent successfully!');
          logActivity(`📧 Resent notification email to ${apt ? apt.guardianEmail : 'patient email'}`, 'success');
        } else {
          showToast(`❌ Email delivery failed: ${data.data?.lastEmailError || 'Error'}`, 'error');
          logActivity(`❌ Resend email failed: ${data.data?.lastEmailError || 'SMTP Error'}`, 'warn');
        }
      } else {
        showToast(data.message || 'Error sending email.', 'error');
      }
    } catch {
      showToast('Connection error. Failed to resend email.', 'error');
    } finally {
      setEmailLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  /* ── Save Doctor Notes ── */
  const saveDoctorNotes = async (id, notes) => {
    try {
      const res = await fetch(`${API}/appointments/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ doctorNotes: notes }),
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev => prev.map(a => a._id === id ? data.data : a)); // Sync database fields
        showToast('📝 Clinical notes saved successfully!');
        logActivity(`Updated clinical notes for patient record`, 'success');
      }
    } catch { showToast('Error saving clinical notes.', 'error'); }
  };

  /* ── Cancel Appointment ── */
  const cancelAppointment = async (id) => {
    try {
      const apt = appointments.find(a => a._id === id);
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
        logActivity(`Cancelled booking for ${apt ? apt.patientName : 'patient'}`, 'warn');
        if (data.emailSent) {
          logActivity(`📧 Cancellation email sent to ${apt?.guardianEmail}`, 'success');
        } else if (data.data?.emailStatus === 'failed') {
          logActivity(`❌ Cancellation email failed: ${data.data.lastEmailError}`, 'warn');
        }
      }
    } catch { showToast('Error cancelling appointment.', 'error'); }
  };

  /* ── Delete Appointment ── */
  const deleteAppointment = async (id) => {
    try {
      const apt = appointments.find(a => a._id === id);
      const res = await fetch(`${API}/appointments/${id}`, { method: 'DELETE', headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev => prev.filter(a => a._id !== id));
        fetchStats();
        showToast('🗑️ Appointment deleted.', 'warn');
        logActivity(`Deleted record for ${apt ? apt.patientName : 'patient'}`, 'danger');
      }
    } catch { showToast('Error deleting appointment.', 'error'); }
    setDeleteConfirm(null);
  };

  /* ── Save Edit ── */
  const saveEdit = async () => {
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
        logActivity(`Updated fields for patient: ${editModal.patientName}`, 'info');
        setEditModal(null);
      }
    } catch { showToast('Error saving changes.', 'error'); }
  };

  /* ── Bulk Operations ── */
  const toggleSelectRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === appointments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(appointments.map(a => a._id));
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
        logActivity(`Bulk status changed (${successCount} records to '${status}')`, 'info');
      }
    } catch {
      showToast('Some appointments failed to update.', 'error');
    }
    setSelectedIds([]);
    setLoading(false);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} appointments permanently?`)) return;
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
        logActivity(`Bulk deleted ${successCount} appointment records`, 'danger');
      }
    } catch {
      showToast('Some appointments failed to delete.', 'error');
    }
    setSelectedIds([]);
    setLoading(false);
  };

  /* ── Export CSV ── */
  const exportToCSV = () => {
    if (appointments.length === 0) {
      showToast('No appointments to export.', 'warn');
      return;
    }
    const headers = ['#', 'Patient Name', 'Age', 'Guardian Name', 'Email', 'Phone', 'Hospital', 'Service', 'Date', 'Time', 'Concern', 'Status', 'Booked At'];
    const rows = appointments.map((a, i) => [
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
    logActivity('Exported appointments dataset to CSV', 'info');
  };

  /* ── Handle Sort ── */
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const getSortedAppointments = () => {
    return [...appointments].sort((a, b) => {
      let valA = a[sortKey] || '';
      let valB = b[sortKey] || '';

      if (sortKey === 'age') {
        return sortOrder === 'asc' ? a.age - b.age : b.age - a.age;
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
  };

  const highlightText = (text, searchStr) => {
    if (!searchStr || !searchStr.trim()) return text;
    const regex = new RegExp(`(${searchStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = String(text).split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="ad-search-highlight">{part}</mark> : part
    );
  };

  /* ── Logout ── */
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    navigate('/admin');
  };

  /* ── Search handler ── */
  const handleSearch = (e) => {
    e.preventDefault();
    fetchAppointments();
  };

  return (
    <div className="ad-root">
      {/* ── Sidebar ── */}
      <aside className={`ad-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="ad-sidebar-header">
          <div className="ad-brand">
            <div className="ad-brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            {sidebarOpen && (
              <div className="ad-brand-text">
                <span className="ad-brand-name">Dr. Waqas</span>
                <span className="ad-brand-role">Admin Portal</span>
              </div>
            )}
          </div>
          <button className="ad-collapse-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {sidebarOpen
                ? <polyline points="15 18 9 12 15 6" />
                : <polyline points="9 18 15 12 9 6" />}
            </svg>
          </button>
        </div>

        {/* Live Clock */}
        {sidebarOpen && (
          <div className="ad-sidebar-clock">
            <div className="ad-clock-time">
              {adminClock.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="ad-clock-date">
              {adminClock.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        )}

        <nav className="ad-nav">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />, fill: true },
            { key: 'appointments', label: 'Appointments', icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>, badge: stats?.pending > 0 ? stats.pending : null },
          ].map(({ key, label, icon, fill, badge }) => (
            <button
              key={key}
              className={`ad-nav-item ${tab === key ? 'active' : ''}`}
              onClick={() => setTab(key)}
              title={!sidebarOpen ? label : ''}
            >
              <div className="ad-nav-icon-wrap">
                <svg viewBox="0 0 24 24" fill={fill && tab === key ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  {icon}
                </svg>
                {badge && <span className="ad-nav-badge">{badge}</span>}
              </div>
              {sidebarOpen && <span>{label}</span>}
              {sidebarOpen && badge && <span className="ad-nav-badge-pill">{badge}</span>}
            </button>
          ))}
        </nav>


        <div className="ad-sidebar-footer">
          <div className="ad-user-info">
            <div className="ad-avatar">{adminEmail[0].toUpperCase()}</div>
            {sidebarOpen && (
              <div className="ad-user-detail">
                <p className="ad-user-name">Administrator</p>
                <p className="ad-user-email">{adminEmail}</p>
              </div>
            )}
          </div>
          <button className="ad-logout-btn" onClick={handleLogout} title="Logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="ad-main">

        {/* ── Toast ── */}
        {toast && (
          <div className={`ad-toast ad-toast-${toast.type}`}>
            {toast.msg}
          </div>
        )}

        {/* ════ DASHBOARD TAB ════ */}
        {tab === 'dashboard' && (
          <div className="ad-page">
            <div className="ad-page-header">
              <div>
                <h1>Dashboard</h1>
                <p>Welcome back, Administrator</p>
              </div>
              <button className="ad-refresh-btn" onClick={() => { fetchStats(); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                </svg>
                Refresh
              </button>
            </div>

            {/* Stat Cards */}
            <div className="ad-stats-grid">
              {[
                { label: 'Total Bookings', value: stats?.total ?? '—', trend: 'All time records', color: '#6366f1', icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
                { label: 'Pending Review', value: stats?.pending ?? '—', trend: 'Awaiting confirmation', color: '#f59e0b', icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
                { label: 'Confirmed Visits', value: stats?.confirmed ?? '—', trend: 'Ready for consultation', color: '#10b981', icon: <><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></> },
                { label: 'Cancelled', value: stats?.cancelled ?? '—', trend: 'Requires follow-up', color: '#ef4444', icon: <><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></> },
                { label: 'Last 7 Days', value: stats?.recentCount ?? '—', trend: 'Recent appointments', color: '#8b5cf6', icon: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></> },
              ].map(({ label, value, trend, color, icon }) => (
                <div className="ad-stat-card" key={label} style={{ '--card-color': color }}>
                  <div className="ad-stat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{icon}</svg>
                  </div>
                  <div className="ad-stat-body">
                    <p className="ad-stat-label">{label}</p>
                    <h2 className="ad-stat-value">{value}</h2>
                    <p className="ad-stat-trend">{trend}</p>
                  </div>
                </div>
              ))}
            </div>


            {/* Interactive distribution row */}
            <div className="ad-dashboard-interactive-row">
              {/* Hospital Location Summary */}
              {stats?.byHospital?.length > 0 && (
                <div className="ad-card ad-dashboard-card">
                  <h3 className="ad-card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    Hospital Distribution
                  </h3>
                  <div className="ad-bar-list">
                    {stats.byHospital.map(({ _id, count }) => (
                      <div className="ad-bar-item" key={_id}>
                        <span className="ad-bar-label">{_id}</span>
                        <div className="ad-bar-track">
                          <div
                            className="ad-bar-fill"
                            style={{ width: `${Math.round((count / stats.total) * 100)}%` }}
                          />
                        </div>
                        <span className="ad-bar-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Type Summary */}
              {stats?.byService?.length > 0 && (
                <div className="ad-card ad-dashboard-card">
                  <h3 className="ad-card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                    Services Requested
                  </h3>
                  <div className="ad-bar-list">
                    {stats.byService.map(({ _id, count }) => (
                      <div className="ad-bar-item" key={_id}>
                        <span className="ad-bar-label">{_id}</span>
                        <div className="ad-bar-track">
                          <div
                            className="ad-bar-fill ad-bar-fill-purple"
                            style={{ width: `${Math.round((count / stats.total) * 100)}%` }}
                          />
                        </div>
                        <span className="ad-bar-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* ── 7-Day Daily Booking Trend Chart ── */}
            {stats && (() => {
              const chartData = getChartData();
              const maxCount = Math.max(...chartData.map(d => d.count), 1);
              const W = 700, H = 180, padL = 36, padR = 16, padT = 16, padB = 36;
              const innerW = W - padL - padR;
              const innerH = H - padT - padB;
              const points = chartData.map((d, i) => {
                const x = padL + (i / (chartData.length - 1)) * innerW;
                const y = padT + innerH - (d.count / maxCount) * innerH;
                return { x, y, ...d };
              });
              const polyline = points.map(p => `${p.x},${p.y}`).join(' ');
              const areaPath = `M${points[0].x},${padT + innerH} ` +
                points.map(p => `L${p.x},${p.y}`).join(' ') +
                ` L${points[points.length - 1].x},${padT + innerH} Z`;
              return (
                <div className="ad-card ad-trend-chart-card">
                  <h3 className="ad-card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                    7-Day Booking Trend
                    <span className="ad-trend-subtitle">Daily appointment activity</span>
                  </h3>
                  <div className="ad-trend-svg-wrap">
                    <svg viewBox={`0 0 ${W} ${H}`} className="ad-trend-svg" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Gridlines */}
                      {[0, 0.25, 0.5, 0.75, 1].map(r => {
                        const y = padT + r * innerH;
                        const val = Math.round(maxCount * (1 - r));
                        return (
                          <g key={r}>
                            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                            <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.35)">{val}</text>
                          </g>
                        );
                      })}
                      {/* Area fill */}
                      <path d={areaPath} fill="url(#trendGrad)" />
                      {/* Line */}
                      <polyline points={polyline} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                      {/* Dots & X-labels */}
                      {points.map((p, i) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="4" fill="#6366f1" stroke="#1e1e2e" strokeWidth="2" />
                          {p.count > 0 && (
                            <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize="9" fill="#a5b4fc" fontWeight="600">{p.count}</text>
                          )}
                          <text x={p.x} y={H - 6} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.45)">{p.label}</text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>
              );
            })()}

            {/* Quick Go to Appointments */}
            <button className="ad-quick-btn" onClick={() => setTab('appointments')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              View All Appointments →
            </button>
          </div>
        )}

        {/* ════ APPOINTMENTS TAB ════ */}
        {tab === 'appointments' && (
          <div className="ad-page">
            <div className="ad-page-header">
              <div>
                <h1>Appointments Panel</h1>
                <p>Manage and review patient bookings ({appointments.length} showing)</p>
              </div>
              <div className="ad-header-actions-group">
                <button className="ad-export-btn" onClick={exportToCSV} title="Export current list to CSV">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  Export CSV
                </button>
                <button className="ad-refresh-btn" onClick={fetchAppointments}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                  </svg>
                  Refresh Data
                </button>
              </div>
            </div>

            {/* Inline Stats Interactive Grid */}
            <div className="ad-mini-stats-grid">
              {[
                { label: 'All Bookings', value: stats?.total ?? 0, key: 'all', color: '#6366f1', icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
                { label: 'Pending', value: stats?.pending ?? 0, key: 'pending', color: '#f59e0b', icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
                { label: 'Confirmed', value: stats?.confirmed ?? 0, key: 'confirmed', color: '#10b981', icon: <><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></> },
                { label: 'Cancelled', value: stats?.cancelled ?? 0, key: 'cancelled', color: '#ef4444', icon: <><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></> },
              ].map(({ label, value, key, color, icon }) => (
                <div
                  key={key}
                  className={`ad-mini-stat-card ${filterStatus === key ? 'active' : ''}`}
                  style={{ '--card-color': color }}
                  onClick={() => setFilterStatus(key)}
                >
                  <div className="ad-mini-stat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{icon}</svg>
                  </div>
                  <div className="ad-mini-stat-info">
                    <span className="ad-mini-stat-value">{value}</span>
                    <span className="ad-mini-stat-label">{label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="ad-filters">
              <form className="ad-search-form" onSubmit={handleSearch}>
                <div className="ad-search-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search patient name, guardian, phone, hospital location..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <button type="submit" className="ad-search-btn">Search</button>
              </form>
            </div>

            {/* Table */}
            {loading ? (
              <div className="ad-loading">
                <div className="ad-spinner" />
                <p>Fetching records…</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="ad-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <p>No appointments match the criteria</p>
              </div>
            ) : (
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}></th>
                      <th style={{ width: '40px' }} onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="ad-header-checkbox"
                          checked={selectedIds.length === appointments.length && appointments.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th style={{ width: '60px' }}>#</th>
                      <th className="sortable-header" onClick={() => handleSort('patientName')}>
                        Patient {sortKey === 'patientName' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="sortable-header" onClick={() => handleSort('guardianName')}>
                        Guardian Info {sortKey === 'guardianName' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th>Phone</th>
                      <th className="sortable-header" onClick={() => handleSort('hospital')}>
                        Hospital {sortKey === 'hospital' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="sortable-header" onClick={() => handleSort('service')}>
                        Service {sortKey === 'service' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="sortable-header" onClick={() => handleSort('date')}>
                        Date & Time {sortKey === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th>Concern Summary</th>
                      <th className="sortable-header" onClick={() => handleSort('status')}>
                        Status {sortKey === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedAppointments().map((apt, idx) => {
                      const sc = STATUS_COLORS[apt.status] || STATUS_COLORS.pending;
                      const isExpanded = expandedAptId === apt._id;
                      const isSelected = selectedIds.includes(apt._id);
                      return (
                        <Fragment key={apt._id}>
                          <tr 
                            className={`ad-table-row-main ${isExpanded ? 'active-expanded' : ''} ${isSelected ? 'row-selected' : ''} status-${apt.status}`}
                            onClick={() => handleToggleExpand(apt)}
                          >
                            <td className="td-toggle-btn">
                              <svg 
                                className={`ad-arrow-icon ${isExpanded ? 'rotated' : ''}`}
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                              >
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </td>
                            <td className="td-checkbox-cell" onClick={e => e.stopPropagation()}>
                              <input 
                                type="checkbox"
                                className="ad-row-checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectRow(apt._id)}
                              />
                            </td>
                            <td className="td-index-num">{idx + 1}</td>
                            <td className="td-patient-cell">
                              <div className="td-bold">{highlightText(apt.patientName, search)}</div>
                              <div className="td-meta-sub">{apt.age} yrs</div>
                            </td>
                            <td>
                              <div className="td-guardian-name">{highlightText(apt.guardianName, search)}</div>
                              <div className="td-meta-sub">{highlightText(apt.guardianEmail, search)}</div>
                            </td>
                            <td className="td-phone-num">{highlightText(apt.phone, search)}</td>
                            <td>{highlightText(apt.hospital, search)}</td>
                            <td>
                              <span className="ad-table-service-tag">{apt.service}</span>
                            </td>
                            <td>
                              <div className="td-date">{apt.date}</div>
                              <div className="td-meta-sub">{apt.time}</div>
                            </td>
                            <td className="td-concern-trunc">
                              {apt.concern ? (
                                apt.concern.length > 35 ? `${apt.concern.slice(0, 35)}...` : apt.concern
                              ) : (
                                <span className="td-no-concern">—</span>
                              )}
                            </td>
                            <td>
                              <span className="ad-status-badge" style={{ background: sc.bg, color: sc.text }}>
                                <span className="ad-status-dot" style={{ background: sc.dot }} />
                                {apt.status}
                              </span>
                            </td>
                            <td onClick={e => e.stopPropagation()}>
                              <div className="ad-actions" style={{ justifyContent: 'flex-end' }}>
                                {apt.status !== 'confirmed' && (
                                  <button
                                    className="ad-act-btn ad-act-confirm"
                                    title="Confirm Appointment"
                                    onClick={() => confirmAppointment(apt._id)}
                                  >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  </button>
                                )}
                                {apt.status !== 'cancelled' && (
                                  <button
                                    className="ad-act-btn ad-act-cancel"
                                    title="Cancel Appointment"
                                    onClick={() => cancelAppointment(apt._id)}
                                  >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                  </button>
                                )}
                                <button
                                  className="ad-act-btn ad-act-edit"
                                  title="Edit Fields"
                                  onClick={() => setEditModal({ ...apt })}
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                </button>
                                <button
                                  className="ad-act-btn ad-act-delete"
                                  title="Remove Permanent"
                                  onClick={() => setDeleteConfirm(apt._id)}
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                    <path d="M10 11v6M14 11v6" />
                                    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="ad-expanded-row" onClick={e => e.stopPropagation()}>
                              <td></td>
                              <td></td>
                              <td colSpan={10}>
                                <div className="ad-expanded-content-wrapper">
                                  <div className="ad-expanded-layout-grid">
                                    {/* Left Panel: Booking & Patient Details */}
                                    <div className="ad-expanded-panel-left">
                                      <div className="ad-expanded-grid">
                                        <div className="ad-expanded-section">
                                          <h3>Patient Information</h3>
                                          <div className="ad-expanded-detail-row">
                                            <span className="label">Full Name:</span>
                                            <span className="val">{apt.patientName}</span>
                                          </div>
                                          <div className="ad-expanded-detail-row">
                                            <span className="label">Age:</span>
                                            <span className="val">{apt.age} years old</span>
                                          </div>
                                          <div className="ad-expanded-detail-row">
                                            <span className="label">Service Required:</span>
                                            <span className="val">{apt.service}</span>
                                          </div>
                                        </div>

                                        <div className="ad-expanded-section">
                                          <h3>Guardian Contact</h3>
                                          <div className="ad-expanded-detail-row">
                                            <span className="label">Guardian Name:</span>
                                            <span className="val">{apt.guardianName}</span>
                                          </div>
                                          <div className="ad-expanded-detail-row">
                                            <span className="label">Email Address:</span>
                                            <span className="val">{apt.guardianEmail}</span>
                                          </div>
                                          <div className="ad-expanded-detail-row">
                                            <span className="label">Phone Contact:</span>
                                            <span className="val">{apt.phone}</span>
                                          </div>
                                        </div>

                                        <div className="ad-expanded-section">
                                          <h3>Appointment Details</h3>
                                          <div className="ad-expanded-detail-row">
                                            <span className="label">Hospital Branch:</span>
                                            <span className="val">{apt.hospital}</span>
                                          </div>
                                          <div className="ad-expanded-detail-row">
                                            <span className="label">Scheduled Time:</span>
                                            <span className="val">{apt.date} — {apt.time}</span>
                                          </div>
                                          <div className="ad-expanded-detail-row">
                                            <span className="label">Booking Recorded:</span>
                                            <span className="val">
                                              {apt.createdAt 
                                                ? new Date(apt.createdAt).toLocaleString('en-US', { 
                                                    dateStyle: 'medium', 
                                                    timeStyle: 'short' 
                                                  }) 
                                                : 'N/A'}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="ad-expanded-section ad-email-status-section">
                                          <h3>Email Notification</h3>
                                          <div className="ad-expanded-detail-row">
                                            <span className="label">Delivery Status:</span>
                                            <span className="val">
                                              {apt.emailStatus === 'sent' && (
                                                <span className="ad-email-badge sent">
                                                  ✅ Sent Successfully
                                                </span>
                                              )}
                                              {apt.emailStatus === 'failed' && (
                                                <span className="ad-email-badge failed" title={apt.lastEmailError}>
                                                  ❌ Delivery Failed
                                                </span>
                                              )}
                                              {(apt.emailStatus === 'none' || !apt.emailStatus) && (
                                                <span className="ad-email-badge none">
                                                  🕒 Not Sent Yet
                                                </span>
                                              )}
                                            </span>
                                          </div>
                                          {apt.lastEmailError && (
                                            <div className="ad-expanded-detail-row error-row">
                                              <span className="label" style={{ color: '#f87171' }}>Error Info:</span>
                                              <span className="val error-msg" style={{ color: '#ef4444', fontSize: '11px', wordBreak: 'break-all' }}>
                                                {apt.lastEmailError}
                                              </span>
                                            </div>
                                          )}
                                          {apt.status !== 'pending' ? (
                                            <button 
                                              className={`ad-email-resend-btn ${emailLoading[apt._id] ? 'loading' : ''}`}
                                              onClick={() => handleResendEmail(apt._id)}
                                              disabled={emailLoading[apt._id]}
                                            >
                                              {emailLoading[apt._id] ? 'Sending Notification...' : '📧 Send/Resend Email'}
                                            </button>
                                          ) : (
                                            <div className="ad-email-notice" style={{ fontStyle: 'italic', fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
                                              Confirm or cancel appointment to auto-send email
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <div className="ad-expanded-concern-box">
                                        <h3>Patient's Concern / Notes</h3>
                                        <div className="ad-concern-content">
                                          {apt.concern ? (
                                            <p className="concern-quote">“{apt.concern}”</p>
                                          ) : (
                                            <p className="concern-none">No patient concern or notes provided for this booking.</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Right Panel: Doctor Clinical Notes & EHR History */}
                                    <div className="ad-expanded-panel-right">
                                      <div className="ad-expanded-section ad-clinical-notes-section">
                                        <h3>
                                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14, height:14, color:'#6366f1'}}>
                                            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                          </svg>
                                          Clinical Notes & Treatment Plan
                                        </h3>
                                        <textarea
                                          className="clinical-notes-textarea"
                                          placeholder="Type clinical diagnosis, prescriptions, or post-operative advice..."
                                          rows={4}
                                          value={notesText[apt._id] ?? ''}
                                          onChange={e => setNotesText(prev => ({ ...prev, [apt._id]: e.target.value }))}
                                        />
                                        <button 
                                          className="ad-clinical-save-btn"
                                          onClick={() => saveDoctorNotes(apt._id, notesText[apt._id] ?? '')}
                                        >
                                          💾 Save Clinical Notes
                                        </button>
                                      </div>

                                      <div className="ad-expanded-section ad-past-history-section">
                                        <h3>
                                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14, height:14, color:'#10b981'}}>
                                            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          Past Visits History ({appointments.filter(a => a._id !== apt._id && a.phone === apt.phone && a.patientName === apt.patientName).length})
                                        </h3>
                                        {(() => {
                                          const pastVisits = appointments.filter(a => a._id !== apt._id && a.phone === apt.phone && a.patientName === apt.patientName);
                                          if (pastVisits.length === 0) {
                                            return <p className="past-history-none">No previous medical visits recorded in database.</p>;
                                          }
                                          return (
                                            <div className="past-history-timeline">
                                              {pastVisits.slice(0, 4).map(v => (
                                                <div key={v._id} className="timeline-item">
                                                  <div className="timeline-dot" />
                                                  <div className="timeline-content">
                                                    <div className="timeline-header">
                                                      <span className="timeline-date">{v.date} ({v.time})</span>
                                                      <span className={`timeline-status status-${v.status}`}>{v.status}</span>
                                                    </div>
                                                    <p className="timeline-service">{v.service}</p>
                                                    {v.doctorNotes ? (
                                                      <p className="timeline-notes">📝 {v.doctorNotes}</p>
                                                    ) : (
                                                      <p className="timeline-no-notes">No doctor notes saved.</p>
                                                    )}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bulk Action Controls */}
            {selectedIds.length > 0 && (
              <div className="ad-bulk-action-bar">
                <div className="ad-bulk-info">
                  <span className="ad-bulk-count">{selectedIds.length}</span> appointments selected
                </div>
                <div className="ad-bulk-actions">
                  <button className="ad-bulk-btn ad-bulk-confirm" onClick={() => handleBulkStatusChange('confirmed')}>
                    Confirm Selected
                  </button>
                  <button className="ad-bulk-btn ad-bulk-cancel" onClick={() => handleBulkStatusChange('cancelled')}>
                    Cancel Selected
                  </button>
                  <button className="ad-bulk-btn ad-bulk-delete" onClick={handleBulkDelete}>
                    Delete Selected
                  </button>
                  <button className="ad-bulk-clear" onClick={() => setSelectedIds([])}>✕ Clear</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ════ EDIT MODAL ════ */}
      {editModal && (
        <div className="ad-overlay" onClick={() => setEditModal(null)}>
          <div className="ad-modal" onClick={e => e.stopPropagation()}>
            <div className="ad-modal-header">
              <h2>Edit Appointment</h2>
              <button className="ad-modal-close" onClick={() => setEditModal(null)}>✕</button>
            </div>
            <div className="ad-modal-body">
              {[
                { field: 'patientName', label: 'Patient Name', type: 'text' },
                { field: 'guardianName', label: 'Guardian Name', type: 'text' },
                { field: 'phone', label: 'Phone', type: 'text' },
                { field: 'guardianEmail', label: 'Email', type: 'email' },
                { field: 'age', label: 'Age', type: 'number' },
                { field: 'date', label: 'Date', type: 'text' },
                { field: 'time', label: 'Time', type: 'text' },
                { field: 'hospital', label: 'Hospital', type: 'text' },
                { field: 'service', label: 'Service', type: 'text' },
              ].map(({ field, label, type }) => (
                <div className="ad-modal-field" key={field}>
                  <label>{label}</label>
                  <input
                    type={type}
                    value={editModal[field] ?? ''}
                    onChange={e => setEditModal(prev => ({ ...prev, [field]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="ad-modal-field">
                <label>Status</label>
                <select
                  value={editModal.status}
                  onChange={e => setEditModal(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="ad-modal-field">
                <label>Concern / Notes</label>
                <textarea
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

      {/* ════ DELETE CONFIRM MODAL ════ */}
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
            <h2>Delete Appointment?</h2>
            <p>This action cannot be undone. The appointment will be permanently removed from the database.</p>
            <div className="ad-confirm-btns">
              <button className="ad-modal-cancel" onClick={() => setDeleteConfirm(null)}>Keep It</button>
              <button className="ad-modal-delete" onClick={() => deleteAppointment(deleteConfirm)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
