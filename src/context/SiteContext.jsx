import React, { createContext, useState, useEffect, useContext } from 'react';

const SiteContext = createContext();

export const useSite = () => useContext(SiteContext);

export const SiteProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    services: [],
    hospitals: [],
    doctorAvailable: true,
    availabilityMessage: "Doctor is currently unavailable.",
  });
  const [loading, setLoading] = useState(true);
  
  // Transform the array of hospitals into an object keyed by `key` (for easier lookup similar to old data.jsx)
  // And format SCHEDULE properly
  const [hospitalsDict, setHospitalsDict] = useState({});
  const [scheduleDict, setScheduleDict] = useState({});

  const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://doc-web-prq3.onrender.com');

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API}/settings`);
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
        
        // Build dicts
        const hDict = {};
        const sDict = {};
        if (data.data.hospitals) {
          data.data.hospitals.forEach(h => {
            hDict[h.key] = h;
            if (h.schedule) {
              sDict[h.key] = h.schedule;
            }
          });
        }
        setHospitalsDict(hDict);
        setScheduleDict(sDict);
      }
    } catch (err) {
      console.error('Failed to load site settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SiteContext.Provider value={{
      settings,
      hospitals: hospitalsDict,
      schedule: scheduleDict,
      services: settings.services || [],
      loading,
      fetchSettings
    }}>
      {children}
    </SiteContext.Provider>
  );
};
