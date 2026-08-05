import { useState, useEffect } from 'react';
import './SiteConfig.css';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://doc-web-prq3.onrender.com');

export default function SiteConfig({ authHeaders, showToast }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general'); // general, services, hospitals

  // Fetch Settings
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/settings`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (err) {
      showToast('Error fetching settings', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const saveSettings = async (updatedSettings) => {
    try {
      const res = await fetch(`${API}/settings`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(updatedSettings)
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        showToast('Settings saved successfully!');
      } else {
        showToast('Failed to save settings', 'error');
      }
    } catch (err) {
      showToast('Error saving settings', 'error');
    }
  };

  if (loading || !settings) return <div>Loading...</div>;

  // General Settings Handlers
  const handleGeneralSave = (e) => {
    e.preventDefault();
    saveSettings(settings);
  };

  // Service Handlers
  const handleAddService = () => {
    const newSvc = { id: Date.now().toString(), title: 'New Service', icon: 'fas fa-star', desc: '', details: '', image: '' };
    setSettings({ ...settings, services: [...settings.services, newSvc] });
  };
  const handleUpdateService = (id, field, value) => {
    const updated = settings.services.map(s => s.id === id ? { ...s, [field]: value } : s);
    setSettings({ ...settings, services: updated });
  };
  const handleDeleteService = (id) => {
    setSettings({ ...settings, services: settings.services.filter(s => s.id !== id) });
  };

  // Hospital Handlers
  const handleAddHospital = () => {
    const newHosp = { 
      key: `hosp_${Date.now()}`, name: 'New Hospital', address: '', 
      days: '', hours: '', allowedDays: [], slots: [],
      schedule: [
        { day: 'Monday', timing: '—', open: false },
        { day: 'Tuesday', timing: '—', open: false },
        { day: 'Wednesday', timing: '—', open: false },
        { day: 'Thursday', timing: '—', open: false },
        { day: 'Friday', timing: '—', open: false },
        { day: 'Saturday', timing: '—', open: false },
        { day: 'Sunday', timing: '—', open: false }
      ]
    };
    setSettings({ ...settings, hospitals: [...settings.hospitals, newHosp] });
  };
  const handleUpdateHospital = (key, field, value) => {
    const updated = settings.hospitals.map(h => h.key === key ? { ...h, [field]: value } : h);
    setSettings({ ...settings, hospitals: updated });
  };
  const handleDeleteHospital = (key) => {
    setSettings({ ...settings, hospitals: settings.hospitals.filter(h => h.key !== key) });
  };
  
  const handleScheduleChange = (hospKey, dayIndex, field, value) => {
    const updated = settings.hospitals.map(h => {
      if (h.key === hospKey) {
        const newSched = [...h.schedule];
        newSched[dayIndex] = { ...newSched[dayIndex], [field]: value };
        return { ...h, schedule: newSched };
      }
      return h;
    });
    setSettings({ ...settings, hospitals: updated });
  };

  return (
    <div className="site-config">
      <div className="sc-tabs">
        <button className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>General</button>
        <button className={activeTab === 'services' ? 'active' : ''} onClick={() => setActiveTab('services')}>Services</button>
        <button className={activeTab === 'hospitals' ? 'active' : ''} onClick={() => setActiveTab('hospitals')}>Hospitals & Schedule</button>
      </div>

      <div className="sc-content">
        {activeTab === 'general' && (
          <form onSubmit={handleGeneralSave} className="sc-form">
            <h3>General Settings</h3>
            <div className="form-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={settings.doctorAvailable} 
                  onChange={e => setSettings({...settings, doctorAvailable: e.target.checked})} 
                />
                Doctor is Available for Appointments
              </label>
            </div>
            {!settings.doctorAvailable && (
              <div className="form-group">
                <label>Availability Message (Shown as banner)</label>
                <input 
                  type="text" 
                  value={settings.availabilityMessage} 
                  onChange={e => setSettings({...settings, availabilityMessage: e.target.value})} 
                  placeholder="e.g. Doctor is currently on leave..."
                />
              </div>
            )}
            <button type="submit" className="btn-save">Save General Settings</button>
          </form>
        )}

        {activeTab === 'services' && (
          <div className="sc-list">
            <div className="sc-header">
              <h3>Manage Services</h3>
              <button onClick={handleAddService} className="btn-add">+ Add Service</button>
            </div>
            {settings.services.map(svc => (
              <div key={svc.id} className="sc-card">
                <div className="sc-card-header">
                  <input type="text" value={svc.title} onChange={e => handleUpdateService(svc.id, 'title', e.target.value)} placeholder="Service Title" className="input-title"/>
                  <button onClick={() => handleDeleteService(svc.id)} className="btn-del">Delete</button>
                </div>
                <div className="sc-form-grid">
                  <div className="form-group">
                    <label>Icon (FontAwesome Class)</label>
                    <input type="text" value={svc.icon} onChange={e => handleUpdateService(svc.id, 'icon', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Image URL</label>
                    <input type="text" value={svc.image} onChange={e => handleUpdateService(svc.id, 'image', e.target.value)} />
                  </div>
                  <div className="form-group full">
                    <label>Short Description</label>
                    <textarea value={svc.desc} onChange={e => handleUpdateService(svc.id, 'desc', e.target.value)} rows={2} />
                  </div>
                  <div className="form-group full">
                    <label>Detailed Info</label>
                    <textarea value={svc.details} onChange={e => handleUpdateService(svc.id, 'details', e.target.value)} rows={3} />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => saveSettings(settings)} className="btn-save">Save All Services</button>
          </div>
        )}

        {activeTab === 'hospitals' && (
          <div className="sc-list">
            <div className="sc-header">
              <h3>Manage Hospitals & Schedules</h3>
              <button onClick={handleAddHospital} className="btn-add">+ Add Hospital</button>
            </div>
            {settings.hospitals.map(hosp => (
              <div key={hosp.key} className="sc-card">
                <div className="sc-card-header">
                  <input type="text" value={hosp.name} onChange={e => handleUpdateHospital(hosp.key, 'name', e.target.value)} placeholder="Hospital Name" className="input-title"/>
                  <button onClick={() => handleDeleteHospital(hosp.key)} className="btn-del">Delete</button>
                </div>
                <div className="sc-form-grid">
                  <div className="form-group">
                    <label>Identifier Key</label>
                    <input type="text" value={hosp.key} onChange={e => handleUpdateHospital(hosp.key, 'key', e.target.value)} disabled/>
                  </div>
                  <div className="form-group full">
                    <label>Address</label>
                    <input type="text" value={hosp.address} onChange={e => handleUpdateHospital(hosp.key, 'address', e.target.value)} />
                  </div>
                  <div className="form-group full">
                    <label>Google Map Embed URL</label>
                    <input type="text" value={hosp.mapSrc} onChange={e => handleUpdateHospital(hosp.key, 'mapSrc', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Hint Days (e.g. 'Mon-Wed')</label>
                    <input type="text" value={hosp.hintDays} onChange={e => handleUpdateHospital(hosp.key, 'hintDays', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Allowed Days (0=Sun, 1=Mon... comma separated)</label>
                    <input type="text" value={hosp.allowedDays ? hosp.allowedDays.join(',') : ''} onChange={e => handleUpdateHospital(hosp.key, 'allowedDays', e.target.value.split(',').map(Number))} />
                  </div>
                  <div className="form-group full">
                    <label>Time Slots (comma separated)</label>
                    <input type="text" value={hosp.slots ? hosp.slots.join(',') : ''} onChange={e => handleUpdateHospital(hosp.key, 'slots', e.target.value.split(',').map(s=>s.trim()))} />
                  </div>
                </div>
                
                <h4>Weekly Schedule</h4>
                <table className="sc-schedule-table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Open?</th>
                      <th>Timing (e.g. 10 AM - 2 PM)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hosp.schedule && hosp.schedule.map((s, idx) => (
                      <tr key={s.day}>
                        <td>{s.day}</td>
                        <td><input type="checkbox" checked={s.open} onChange={e => handleScheduleChange(hosp.key, idx, 'open', e.target.checked)} /></td>
                        <td><input type="text" value={s.timing} onChange={e => handleScheduleChange(hosp.key, idx, 'timing', e.target.value)} disabled={!s.open}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            <button onClick={() => saveSettings(settings)} className="btn-save">Save All Hospitals</button>
          </div>
        )}
      </div>
    </div>
  );
}
