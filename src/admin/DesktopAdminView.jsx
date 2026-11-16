import { Fragment } from 'react';
import SiteConfig from './SiteConfig';

const STATUS_COLORS = {
  pending: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b', border: '#fde68a' },
  confirmed: { bg: '#d1fae5', text: '#065f46', dot: '#10b981', border: '#a7f3d0' },
  cancelled: { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444', border: '#fecaca' },
};

export default function DesktopAdminView({
  tab,
  setTab,
  stats,
  fetchStats,
  appointments = [],
  fetchAppointments,
  loading,
  search,
  setSearch,
  filterStatus,
  setFilterStatus,
  sidebarOpen,
  setSidebarOpen,
  adminClock,
  adminEmail,
  handleLogout,
  getMonthlyReport,
  getChartData,
  getSortedAppointments,
  sortKey,
  sortOrder,
  handleSort,
  selectedIds,
  toggleSelectRow,
  toggleSelectAll,
  handleBulkStatusChange,
  handleBulkDelete,
  exportToCSV,
  expandedAptId,
  handleToggleExpand,
  notesText,
  setNotesText,
  saveDoctorNotes,
  confirmAppointment,
  cancelAppointment,
  handleResendEmail,
  emailLoading = {},
  setEditModal,
  setDeleteConfirm,
  highlightText,
  handleSearch,
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
  const monthlyReport = getMonthlyReport();
  const sortedList = getSortedAppointments();

  return (
    <div className="desk-admin-root">
      {/* ── Left Dark Sidebar ── */}
      <aside className={`desk-sidebar ${sidebarOpen ? 'expanded' : 'collapsed'}`}>
        <div className="desk-sidebar-head">
          <div className="desk-brand-group">
            <div className="desk-brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            {sidebarOpen && (
              <div className="desk-brand-text">
                <span className="desk-brand-title">Dr. Waqas Awan</span>
                <span className="desk-brand-badge">Surgeon Admin</span>
              </div>
            )}
          </div>
          <button
            className="desk-collapse-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle Sidebar"
            title="Toggle Sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {sidebarOpen ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
            </svg>
          </button>
        </div>

        {/* Live Clock Card */}
        {sidebarOpen && (
          <div className="desk-sidebar-clock-box">
            <div className="desk-clock-time">
              {adminClock.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="desk-clock-date">
              {adminClock.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="desk-nav-list">
          {[
            {
              key: 'dashboard',
              label: 'Dashboard Overview',
              icon: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            },
            {
              key: 'appointments',
              label: 'Appointments Panel',
              badge: stats?.pending > 0 ? stats.pending : null,
              icon: (
                <>
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </>
              )
            },
            {
              key: 'site',
              label: 'Site CMS Config',
              icon: (
                <>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </>
              )
            },
            {
              key: 'settings',
              label: 'Admin Security',
              icon: (
                <>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </>
              )
            }
          ].map(item => (
            <button
              key={item.key}
              className={`desk-nav-btn ${tab === item.key ? 'active' : ''}`}
              onClick={() => setTab(item.key)}
              title={!sidebarOpen ? item.label : ''}
            >
              <div className="desk-nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {item.icon}
                </svg>
                {!sidebarOpen && item.badge && <span className="desk-mini-badge">{item.badge}</span>}
              </div>
              {sidebarOpen && <span className="desk-nav-label">{item.label}</span>}
              {sidebarOpen && item.badge && <span className="desk-nav-pill-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="desk-sidebar-footer">
          <div className="desk-user-box">
            <div className="desk-user-avatar">
              {(adminEmail && adminEmail[0] ? adminEmail[0] : 'W').toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="desk-user-meta">
                <div className="desk-user-title">Dr. Waqas Ahmad</div>
                <div className="desk-user-email">{adminEmail}</div>
              </div>
            )}
          </div>
          <button className="desk-logout-action" onClick={handleLogout} title="Sign Out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Canvas ── */}
      <div className="desk-main-canvas">
        {/* Top Navbar */}
        <header className="desk-topbar">
          <div className="desk-breadcrumbs">
            <span className="desk-bc-root">Admin Portal</span>
            <span className="desk-bc-sep">/</span>
            <span className="desk-bc-current">
              {tab === 'dashboard' && 'Dashboard Overview'}
              {tab === 'appointments' && 'Appointments Management'}
              {tab === 'site' && 'Site CMS & Hospitals'}
              {tab === 'settings' && 'Security & Account'}
            </span>
          </div>

          <div className="desk-topbar-actions">
            {tab === 'appointments' && (
              <button className="desk-top-btn secondary" onClick={exportToCSV}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                Export CSV
              </button>
            )}

            <button
              className="desk-top-btn primary"
              onClick={() => {
                fetchStats();
                fetchAppointments();
                showToast('Synchronized latest data!');
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
              </svg>
              Refresh
            </button>
          </div>
        </header>

        {/* ── Content Panes ── */}
        <main className="desk-content-container">
          {/* ════ TAB 1: DASHBOARD OVERVIEW ════ */}
          {tab === 'dashboard' && (
            <div className="desk-view-wrapper">
              {/* 4 Clean Metric Cards */}
              <div className="desk-metrics-grid">
                {[
                  {
                    label: 'Total Bookings',
                    val: stats?.total ?? '—',
                    sub: 'All registered appointments',
                    color: '#0284c7',
                    bg: '#e0f2fe',
                    icon: (
                      <>
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </>
                    )
                  },
                  {
                    label: 'Pending Review',
                    val: stats?.pending ?? '—',
                    sub: 'Requires doctor confirmation',
                    color: '#f59e0b',
                    bg: '#fef3c7',
                    icon: (
                      <>
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </>
                    )
                  },
                  {
                    label: 'Confirmed Visits',
                    val: stats?.confirmed ?? '—',
                    sub: 'Scheduled for consultation',
                    color: '#10b981',
                    bg: '#d1fae5',
                    icon: (
                      <>
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </>
                    )
                  },
                  {
                    label: 'Cancelled / Archived',
                    val: stats?.cancelled ?? '—',
                    sub: 'Cancelled consultations',
                    color: '#ef4444',
                    bg: '#fee2e2',
                    icon: (
                      <>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </>
                    )
                  }
                ].map((c, i) => (
                  <div key={i} className="desk-metric-card" style={{ '--accent-color': c.color }}>
                    <div className="desk-metric-top">
                      <span className="desk-metric-label">{c.label}</span>
                      <div className="desk-metric-icon" style={{ background: c.bg, color: c.color }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          {c.icon}
                        </svg>
                      </div>
                    </div>
                    <div className="desk-metric-val">{c.val}</div>
                    <div className="desk-metric-sub">{c.sub}</div>
                  </div>
                ))}
              </div>

              {/* Monthly Performance & Hospital Distribution Grid */}
              <div className="desk-split-grid">
                {/* Monthly Snapshot */}
                <div className="desk-card">
                  <div className="desk-card-head">
                    <div>
                      <h2 className="desk-card-title">Monthly Consultations</h2>
                      <p className="desk-card-desc">{monthlyReport.monthName}</p>
                    </div>
                    <span className="desk-pill green">Active Month</span>
                  </div>

                  <div className="desk-rate-progress-list">
                    <div className="desk-progress-row">
                      <div className="desk-pr-info">
                        <span>Confirmed Appointments</span>
                        <span className="desk-pr-val">
                          {monthlyReport.confirmed} / {monthlyReport.total} (
                          {monthlyReport.total > 0 ? Math.round((monthlyReport.confirmed / monthlyReport.total) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="desk-pr-track">
                        <div
                          className="desk-pr-fill green"
                          style={{
                            width: `${monthlyReport.total > 0 ? (monthlyReport.confirmed / monthlyReport.total) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>

                    <div className="desk-progress-row">
                      <div className="desk-pr-info">
                        <span>Pending Review</span>
                        <span className="desk-pr-val">
                          {monthlyReport.pending} / {monthlyReport.total} (
                          {monthlyReport.total > 0 ? Math.round((monthlyReport.pending / monthlyReport.total) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="desk-pr-track">
                        <div
                          className="desk-pr-fill amber"
                          style={{
                            width: `${monthlyReport.total > 0 ? (monthlyReport.pending / monthlyReport.total) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>

                    <div className="desk-progress-row">
                      <div className="desk-pr-info">
                        <span>Cancelled</span>
                        <span className="desk-pr-val">
                          {monthlyReport.cancelled} / {monthlyReport.total} (
                          {monthlyReport.total > 0 ? Math.round((monthlyReport.cancelled / monthlyReport.total) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="desk-pr-track">
                        <div
                          className="desk-pr-fill red"
                          style={{
                            width: `${monthlyReport.total > 0 ? (monthlyReport.cancelled / monthlyReport.total) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hospital Distribution */}
                <div className="desk-card">
                  <div className="desk-card-head">
                    <div>
                      <h2 className="desk-card-title">Hospital Location Breakdown</h2>
                      <p className="desk-card-desc">Patient volume across hospital branches</p>
                    </div>
                  </div>

                  {stats?.byHospital?.length > 0 ? (
                    <div className="desk-bar-distribution-list">
                      {stats.byHospital.map(h => (
                        <div key={h._id} className="desk-bar-dist-item">
                          <div className="desk-dist-head">
                            <span className="desk-dist-name">{h._id}</span>
                            <span className="desk-dist-count">{h.count} patients</span>
                          </div>
                          <div className="desk-pr-track">
                            <div
                              className="desk-pr-fill sky"
                              style={{
                                width: `${stats.total > 0 ? ((h.count || 0) / stats.total) * 100 : 0}%`
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 12 }}>No hospital records yet.</p>
                  )}
                </div>
              </div>

              {/* 7-Day Trend Chart */}
              {stats && (() => {
                const chartData = getChartData();
                if (!chartData || chartData.length < 2) return null;
                const maxCount = Math.max(...chartData.map(d => d.count || 0), 1);
                const W = 700, H = 180, padL = 36, padR = 16, padT = 16, padB = 36;
                const innerW = W - padL - padR;
                const innerH = H - padT - padB;
                const points = chartData.map((d, i) => {
                  const x = padL + (i / (chartData.length - 1)) * innerW;
                  const y = padT + innerH - ((d.count || 0) / maxCount) * innerH;
                  return { x, y, ...d };
                });
                if (!points.length || !points[0] || !points[points.length - 1]) return null;
                const polyline = points.map(p => `${p.x},${p.y}`).join(' ');
                const areaPath = `M${points[0].x},${padT + innerH} ` +
                  points.map(p => `L${p.x},${p.y}`).join(' ') +
                  ` L${points[points.length - 1].x},${padT + innerH} Z`;

                return (
                  <div className="desk-card" style={{ marginTop: 24 }}>
                    <div className="desk-card-head">
                      <div>
                        <h2 className="desk-card-title">7-Day Consultation Trend</h2>
                        <p className="desk-card-desc">Daily appointment booking frequency</p>
                      </div>
                    </div>
                    <div className="desk-trend-chart-box">
                      <svg viewBox={`0 0 ${W} ${H}`} className="desk-trend-svg" preserveAspectRatio="xMidYMid meet">
                        <defs>
                          <linearGradient id="deskTrendGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {[0, 0.25, 0.5, 0.75, 1].map(r => {
                          const y = padT + r * innerH;
                          const val = Math.round(maxCount * (1 - r));
                          return (
                            <g key={r}>
                              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />
                              <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                                {val}
                              </text>
                            </g>
                          );
                        })}
                        <path d={areaPath} fill="url(#deskTrendGrad)" />
                        <polyline points={polyline} fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                        {points.map((p, i) => (
                          <g key={i}>
                            <circle cx={p.x} cy={p.y} r="4" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                            {p.count > 0 && (
                              <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize="10" fill="#0284c7" fontWeight="700">
                                {p.count}
                              </text>
                            )}
                            <text x={p.x} y={H - 10} textAnchor="middle" fontSize="10" fill="#64748b">
                              {p.label}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ════ TAB 2: APPOINTMENTS MANAGEMENT ════ */}
          {tab === 'appointments' && (
            <div className="desk-view-wrapper">
              {/* Filter & Search Bar */}
              <div className="desk-toolbar-card">
                {/* Status Segmented Buttons */}
                <div className="desk-filter-pills">
                  {[
                    { key: 'all', label: 'All Records', count: stats?.total ?? appointments.length },
                    { key: 'pending', label: 'Pending', count: stats?.pending ?? 0 },
                    { key: 'confirmed', label: 'Confirmed', count: stats?.confirmed ?? 0 },
                    { key: 'cancelled', label: 'Cancelled', count: stats?.cancelled ?? 0 },
                  ].map(f => (
                    <button
                      key={f.key}
                      className={`desk-filter-pill-btn ${filterStatus === f.key ? 'active' : ''}`}
                      onClick={() => setFilterStatus(f.key)}
                    >
                      {f.label}
                      <span className="desk-pill-count">{f.count}</span>
                    </button>
                  ))}
                </div>

                {/* Search Form */}
                <form className="desk-search-form" onSubmit={handleSearch}>
                  <div className="desk-search-input-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search patient name, guardian, phone, or hospital..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                      <button type="button" className="desk-search-clear" onClick={() => setSearch('')}>
                        ✕
                      </button>
                    )}
                  </div>
                  <button type="submit" className="desk-btn primary">
                    Search
                  </button>
                </form>
              </div>

              {/* Bulk Actions Banner */}
              {selectedIds.length > 0 && (
                <div className="desk-bulk-banner">
                  <div className="desk-bulk-selected-txt">
                    <span className="desk-bulk-num">{selectedIds.length}</span> appointments selected
                  </div>
                  <div className="desk-bulk-btn-group">
                    <button className="desk-bulk-action confirm" onClick={() => handleBulkStatusChange('confirmed')}>
                      ✓ Confirm Selected
                    </button>
                    <button className="desk-bulk-action cancel" onClick={() => handleBulkStatusChange('cancelled')}>
                      ✕ Cancel Selected
                    </button>
                    <button className="desk-bulk-action delete" onClick={handleBulkDelete}>
                      🗑️ Delete Selected
                    </button>
                    <button className="desk-bulk-action clear" onClick={() => toggleSelectAll()}>
                      Deselect All
                    </button>
                  </div>
                </div>
              )}

              {/* Table Card */}
              <div className="desk-card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                  <div className="desk-loading-state">
                    <div className="desk-spinner" />
                    <p>Loading medical records...</p>
                  </div>
                ) : sortedList.length === 0 ? (
                  <div className="desk-empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <p>No appointments match the selected criteria.</p>
                  </div>
                ) : (
                  <div className="desk-table-scroller">
                    <table className="desk-table">
                      <thead>
                        <tr>
                          <th style={{ width: 40 }} />
                          <th style={{ width: 44 }}>
                            <input
                              type="checkbox"
                              className="desk-checkbox"
                              checked={selectedIds.length === appointments.length && appointments.length > 0}
                              onChange={toggleSelectAll}
                            />
                          </th>
                          <th style={{ width: 50 }}>#</th>
                          <th className="sortable" onClick={() => handleSort('patientName')}>
                            Patient {sortKey === 'patientName' && (sortOrder === 'asc' ? '▲' : '▼')}
                          </th>
                          <th className="sortable" onClick={() => handleSort('guardianName')}>
                            Guardian Info {sortKey === 'guardianName' && (sortOrder === 'asc' ? '▲' : '▼')}
                          </th>
                          <th>Phone</th>
                          <th className="sortable" onClick={() => handleSort('hospital')}>
                            Hospital {sortKey === 'hospital' && (sortOrder === 'asc' ? '▲' : '▼')}
                          </th>
                          <th className="sortable" onClick={() => handleSort('service')}>
                            Service {sortKey === 'service' && (sortOrder === 'asc' ? '▲' : '▼')}
                          </th>
                          <th className="sortable" onClick={() => handleSort('date')}>
                            Date &amp; Time {sortKey === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}
                          </th>
                          <th className="sortable" onClick={() => handleSort('status')}>
                            Status {sortKey === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
                          </th>
                          <th style={{ textAlign: 'right', minWidth: 140 }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedList.map((apt, idx) => {
                          const sc = STATUS_COLORS[apt.status] || STATUS_COLORS.pending;
                          const isExpanded = expandedAptId === apt._id;
                          const isSelected = selectedIds.includes(apt._id);
                          const cleanPhone = (apt.phone || '').replace(/[^0-9]/g, '');

                          return (
                            <Fragment key={apt._id}>
                              <tr
                                className={`desk-tr ${isExpanded ? 'active-row' : ''} ${isSelected ? 'selected-row' : ''}`}
                                onClick={() => handleToggleExpand(apt)}
                              >
                                <td className="desk-td-expand">
                                  <svg
                                    className={`desk-arrow ${isExpanded ? 'open' : ''}`}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                  >
                                    <polyline points="6 9 12 15 18 9" />
                                  </svg>
                                </td>
                                <td onClick={e => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    className="desk-checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelectRow(apt._id)}
                                  />
                                </td>
                                <td className="desk-td-muted">{idx + 1}</td>
                                <td>
                                  <div className="desk-td-bold">{highlightText(apt.patientName, search)}</div>
                                  <div className="desk-td-sub">{apt.age} years old</div>
                                </td>
                                <td>
                                  <div className="desk-td-guardian">{highlightText(apt.guardianName, search)}</div>
                                  <div className="desk-td-sub">{highlightText(apt.guardianEmail, search)}</div>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span className="desk-td-phone">{highlightText(apt.phone, search)}</span>
                                    <a
                                      href={`https://wa.me/${cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(`Assalam-o-Alaikum, this is Dr. Waqas Ahmad Awan's clinic regarding the appointment for ${apt.patientName}.`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={e => e.stopPropagation()}
                                      className="desk-wa-icon-link"
                                      title="Open WhatsApp chat"
                                    >
                                      💬
                                    </a>
                                  </div>
                                </td>
                                <td>{highlightText(apt.hospital, search)}</td>
                                <td>
                                  <span className="desk-service-badge">{apt.service}</span>
                                </td>
                                <td>
                                  <div className="desk-td-date">{apt.date}</div>
                                  <div className="desk-td-sub">{apt.time}</div>
                                </td>
                                <td>
                                  <span
                                    className="desk-status-badge"
                                    style={{ background: sc.bg, color: sc.text, borderColor: sc.border }}
                                  >
                                    <span className="desk-dot" style={{ background: sc.dot }} />
                                    {apt.status}
                                  </span>
                                </td>
                                <td onClick={e => e.stopPropagation()} style={{ textAlign: 'right' }}>
                                  <div className="desk-actions-cluster">
                                    {apt.status !== 'confirmed' && (
                                      <button
                                        className="desk-btn-act confirm"
                                        title="Confirm Appointment"
                                        onClick={() => confirmAppointment(apt._id)}
                                      >
                                        ✓
                                      </button>
                                    )}
                                    {apt.status !== 'cancelled' && (
                                      <button
                                        className="desk-btn-act cancel"
                                        title="Cancel Appointment"
                                        onClick={() => cancelAppointment(apt._id)}
                                      >
                                        ✕
                                      </button>
                                    )}
                                    <button
                                      className="desk-btn-act edit"
                                      title="Edit Appointment"
                                      onClick={() => setEditModal({ ...apt })}
                                    >
                                      ✎
                                    </button>
                                    <button
                                      className="desk-btn-act delete"
                                      title="Delete Record"
                                      onClick={() => setDeleteConfirm(apt._id)}
                                    >
                                      🗑
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {/* Expanded Row Detail Drawer */}
                              {isExpanded && (
                                <tr className="desk-expanded-drawer" onClick={e => e.stopPropagation()}>
                                  <td colSpan={11}>
                                    <div className="desk-drawer-container">
                                      {/* Left Column: Full Patient Details */}
                                      <div className="desk-drawer-col">
                                        <h3 className="desk-drawer-head">Patient &amp; Consultation Summary</h3>
                                        <div className="desk-drawer-field-grid">
                                          <div>
                                            <span className="label">Patient Name:</span>
                                            <span className="val">{apt.patientName} ({apt.age} yrs)</span>
                                          </div>
                                          <div>
                                            <span className="label">Guardian:</span>
                                            <span className="val">{apt.guardianName}</span>
                                          </div>
                                          <div>
                                            <span className="label">Contact Phone:</span>
                                            <span className="val">
                                              <a href={`tel:${apt.phone}`} style={{ color: '#0284c7' }}>{apt.phone}</a>
                                            </span>
                                          </div>
                                          <div>
                                            <span className="label">Guardian Email:</span>
                                            <span className="val">{apt.guardianEmail}</span>
                                          </div>
                                          <div>
                                            <span className="label">Hospital Location:</span>
                                            <span className="val">{apt.hospital}</span>
                                          </div>
                                          <div>
                                            <span className="label">Slot Scheduled:</span>
                                            <span className="val">{apt.date} at {apt.time}</span>
                                          </div>
                                        </div>

                                        {/* Concern */}
                                        <div className="desk-concern-block">
                                          <span className="label">Patient / Parent Stated Concern:</span>
                                          <p className="val">
                                            {apt.concern ? `“${apt.concern}”` : 'No specific concern mentioned.'}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Right Column: Doctor Clinical Notes & Email Notification */}
                                      <div className="desk-drawer-col">
                                        <h3 className="desk-drawer-head">Clinical Notes &amp; Notification Tracker</h3>

                                        {/* Email delivery badge */}
                                        <div className="desk-email-tracker-box">
                                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span className="label">Guardian Email Status:</span>
                                            <span className={`desk-email-chip ${apt.emailStatus || 'none'}`}>
                                              {apt.emailStatus === 'sent' && '✅ Notification Sent'}
                                              {apt.emailStatus === 'failed' && '❌ Delivery Failed'}
                                              {(!apt.emailStatus || apt.emailStatus === 'none') && '🕒 Not Dispatched Yet'}
                                            </span>
                                          </div>
                                          {apt.lastEmailError && (
                                            <div style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>
                                              {apt.lastEmailError}
                                            </div>
                                          )}
                                          {apt.status !== 'pending' && (
                                            <button
                                              className="desk-btn secondary"
                                              style={{ marginTop: 8, fontSize: 11, padding: '4px 10px' }}
                                              onClick={() => handleResendEmail(apt._id)}
                                              disabled={emailLoading[apt._id]}
                                            >
                                              {emailLoading[apt._id] ? 'Dispatching...' : '📧 Resend Status Email'}
                                            </button>
                                          )}
                                        </div>

                                        {/* Doctor Notes Textarea */}
                                        <div style={{ marginTop: 12 }}>
                                          <span className="label">Doctor's Clinical Notes / Prescription:</span>
                                          <textarea
                                            className="desk-notes-input"
                                            rows={3}
                                            placeholder="Write clinical diagnosis, surgery instructions, or follow-up notes..."
                                            value={notesText[apt._id] ?? (apt.doctorNotes || '')}
                                            onChange={e => setNotesText(p => ({ ...p, [apt._id]: e.target.value }))}
                                          />
                                          <button
                                            className="desk-btn primary"
                                            style={{ marginTop: 6 }}
                                            onClick={() => saveDoctorNotes(apt._id, notesText[apt._id] ?? (apt.doctorNotes || ''))}
                                          >
                                            💾 Save Notes to Patient Record
                                          </button>
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
              </div>
            </div>
          )}

          {/* ════ TAB 3: SITE CMS ════ */}
          {tab === 'site' && (
            <div className="desk-view-wrapper">
              <div className="desk-card">
                <div className="desk-card-head">
                  <div>
                    <h2 className="desk-card-title">Website CMS Configuration</h2>
                    <p className="desk-card-desc">Manage services, hospital availability, and clinic timings dynamically</p>
                  </div>
                </div>
                <SiteConfig authHeaders={authHeaders} showToast={showToast} />
              </div>
            </div>
          )}

          {/* ════ TAB 4: SETTINGS ════ */}
          {tab === 'settings' && (
            <div className="desk-view-wrapper">
              <div className="desk-split-grid">
                {/* Change Credentials Card */}
                <div className="desk-card">
                  <div className="desk-card-head">
                    <div>
                      <h2 className="desk-card-title">Change Admin Credentials</h2>
                      <p className="desk-card-desc">Update your administrator email and password securely</p>
                    </div>
                  </div>

                  <form onSubmit={handleChangeCredentials} className="desk-creds-form">
                    <div className="desk-field">
                      <label>Current Password</label>
                      <input
                        type={showCredsPass.current ? 'text' : 'password'}
                        value={credsForm.currentPassword}
                        onChange={e => setCredsForm(p => ({ ...p, currentPassword: e.target.value }))}
                        required
                        placeholder="Enter current password"
                      />
                    </div>

                    <div className="desk-field">
                      <label>New Admin Email</label>
                      <input
                        type="email"
                        value={credsForm.newEmail}
                        onChange={e => setCredsForm(p => ({ ...p, newEmail: e.target.value }))}
                        required
                        placeholder="Enter new admin email"
                      />
                    </div>

                    <div className="desk-field">
                      <label>New Password</label>
                      <input
                        type={showCredsPass.newp ? 'text' : 'password'}
                        value={credsForm.newPassword}
                        onChange={e => setCredsForm(p => ({ ...p, newPassword: e.target.value }))}
                        required
                        placeholder="Min 8 characters"
                      />
                    </div>

                    <div className="desk-field">
                      <label>Confirm New Password</label>
                      <input
                        type={showCredsPass.confirm ? 'text' : 'password'}
                        value={credsForm.confirmPassword}
                        onChange={e => setCredsForm(p => ({ ...p, confirmPassword: e.target.value }))}
                        required
                        placeholder="Confirm new password"
                      />
                    </div>

                    {credsError && <div className="desk-form-alert error">{credsError}</div>}
                    {credsSuccess && <div className="desk-form-alert success">{credsSuccess}</div>}

                    <button type="submit" className="desk-btn primary" disabled={credsLoading}>
                      {credsLoading ? 'Updating credentials...' : 'Update Admin Credentials'}
                    </button>
                  </form>
                </div>

                {/* Security Info Card */}
                <div className="desk-card">
                  <div className="desk-card-head">
                    <div>
                      <h2 className="desk-card-title">Security Best Practices</h2>
                      <p className="desk-card-desc">Keep your clinic portal protected</p>
                    </div>
                  </div>

                  <ul className="desk-security-list">
                    <li>• Use a unique 12+ character password with letters, numbers &amp; symbols.</li>
                    <li>• Do not share clinic credentials on public or shared computers.</li>
                    <li>• Always log out after completing your clinical admin tasks.</li>
                    <li>• Notification emails are securely dispatched through clinic SMTP.</li>
                  </ul>

                  <div className="desk-session-box">
                    <span className="label">Current Authenticated Account</span>
                    <span className="val">{adminEmail}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
