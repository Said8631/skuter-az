"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { mockScooters, heatmapData } from '../data/mockScooters';
import { mockZones, mobilityLayers, locationDatabase } from '../data/mockZones';
import { calculateDistance, recommendRoutes } from '../utils/aiRouting';
import { Search, Locate, Zap, Star, Gift, Sun, Moon, User, MapPin, Camera, ChevronRight, ChevronUp, ChevronDown, AlertTriangle, Timer, Play, Square, BarChart2, Shield, Clock, Wallet, CreditCard, UserCircle2, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamically import MapComponent to avoid SSR issues
const MapComponent = dynamic(() => import('../components/MapComponent'), { ssr: false, loading: () => <div className="glass" style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Xəritə yüklənir...</div> });

export default function HomePage() {
  // ==== Core UI State ==== //
  const [theme, setTheme] = useState('light');
  const [userLocation, setUserLocation] = useState({ lat: 40.375, lng: 49.835 });
  const [scooters, setScooters] = useState(mockScooters);
  const [selectedScooter, setSelectedScooter] = useState(null);
  const [selectedScooterId, setSelectedScooterId] = useState(null);
  const [filters, setFilters] = useState({ all: true, bolt: false, jet: false, lime: false, wings: false, bird: false });
  const [visibleLayers, setVisibleLayers] = useState(['scooters', 'zones', 'bikeLanes', 'metro', 'parking', 'busStops']);
  const [heatmapVisible, setHeatmapVisible] = useState(false);
  const [reports, setReports] = useState([]);
  const [destinationQuery, setDestinationQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [rideTimer, setRideTimer] = useState(0);
  const [reservation, setReservation] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // login | register
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: 'İstifadəçi',
    balance: 10.50,
    points: 120,
    bonuses: 2,
    campaigns: [
      { id: 1, title: 'İlk Gediş', discount: '50%', expiry: '2 gün' },
      { id: 2, title: 'Həftəsonu', discount: '20%', expiry: '5 gün' }
    ],
    recentRides: [
      { id: 101, date: '10 Mart 2026', duration: '12 dəq', cost: '3.60 AZN' },
      { id: 102, date: '08 Mart 2026', duration: '5 dəq', cost: '2.00 AZN' }
    ]
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showRideSummary, setShowRideSummary] = useState(false);
  const [lastRideCost, setLastRideCost] = useState(0);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isHudExpanded, setIsHudExpanded] = useState(true);

  // ==== Theme Management ==== //
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);

  // ==== Splash Screen ==== //
  useEffect(() => { const t = setTimeout(() => setShowSplash(false), 2500); return () => clearTimeout(t); }, []);

  // ==== Fetch Scooters (mock API) ==== //
  useEffect(() => {
    const fetchScooters = () => {
      const jittered = mockScooters.map(s => s.status === 'available' ? { ...s, lat: s.lat + (Math.random() - 0.5) * 0.0005, lng: s.lng + (Math.random() - 0.5) * 0.0005 } : s);
      setScooters(jittered);
    };
    fetchScooters();
    const interval = setInterval(fetchScooters, 5000);
    return () => clearInterval(interval);
  }, []);

  // ==== Geolocation ==== //
  const handleGetLocation = () => {
    if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(pos => {
      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    }, err => { alert('Unable to retrieve location'); });
  };

  // ==== Filtering ==== //
  const filteredScooters = useMemo(() => {
    return scooters.filter(s => {
      if (filters.all) return true;
      return filters[s.company.toLowerCase()];
    });
  }, [scooters, filters]);

  // ==== Nearest Scooter ==== //
  const findNearestScooter = () => {
    if (!filteredScooters.length) return;
    let nearest = filteredScooters[0];
    let minDist = Infinity;
    filteredScooters.forEach(s => {
      const d = calculateDistance(userLocation.lat, userLocation.lng, s.lat, s.lng);
      if (d < minDist) { minDist = d; nearest = s; }
    });
    setSelectedScooter(nearest);
    setSelectedScooterId(nearest.id);
    setUserLocation({ lat: nearest.lat, lng: nearest.lng });
  };

  // ==== Search Locations ==== //
  const handleSearch = () => {
    if (!destinationQuery.trim()) return;
    const result = locationDatabase.find(l => l.name.toLowerCase().includes(destinationQuery.toLowerCase()));
    if (result) {
      setSearchResult(result);
      const topRoutes = recommendRoutes(userLocation, result, filteredScooters);
      setRoutes(topRoutes);
    }
    else alert('Location not found');
  };

  // ==== Report Scooter ==== //
  const handleReportScooter = () => {
    const report = { id: Date.now(), lat: userLocation.lat, lng: userLocation.lng, timestamp: new Date().toLocaleString() };
    setReports(prev => [...prev, report]);
    setUserProfile(p => ({ ...p, balance: p.balance + 0.1, points: p.points + 10, bonuses: p.bonuses + 1 }));
    alert('Scooter reported! You earned 0.1 AZN and 10 points.');
  };

  // ==== Analytics Calculation ==== //
  const analytics = useMemo(() => {
    const totalReports = reports.length;
    const areaCounts = {};
    reports.forEach(r => {
      const key = `${r.lat.toFixed(3)}-${r.lng.toFixed(3)}`;
      areaCounts[key] = (areaCounts[key] || 0) + 1;
    });
    const popularAreas = Object.entries(areaCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => ({ loc: k, count: v }));
    const zoneCounts = { allowed: 0, restricted: 0, parking: 0 };
    mockZones.forEach(z => {
      const inside = filteredScooters.some(s => {
        const lats = z.coords.map(c => c[0]);
        const lngs = z.coords.map(c => c[1]);
        const minLat = Math.min(...lats), maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
        return s.lat >= minLat && s.lat <= maxLat && s.lng >= minLng && s.lng <= maxLng;
      });
      if (inside) zoneCounts[z.type]++;
    });
    const avgAvailability = filteredScooters.length > 0
      ? filteredScooters.filter(s => s.status === 'available').length / filteredScooters.length
      : 0;

    return { totalReports, popularAreas, busiestZones: zoneCounts, avgAvailability: Number(avgAvailability.toFixed(2)) };
  }, [reports, filteredScooters, mockZones]);

  // ==== Ride Management ==== //
  useEffect(() => {
    let timerId;
    if (activeRide) {
      timerId = setInterval(() => setRideTimer(prev => prev + 1), 1000);
    }
    return () => clearInterval(timerId);
  }, [activeRide]);

  // ==== Reservation Countdown ==== //
  useEffect(() => {
    let timerId;
    if (reservation) {
      timerId = setInterval(() => {
        setReservation(prev => {
          if (!prev) return null;
          if (prev.timeLeft <= 1) { clearInterval(timerId); return null; }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [reservation]);

  // ==== Ride Actions ==== //
  const handleReserve = () => {
    if (!selectedScooter || !isLoggedIn) {
      if (!isLoggedIn) setShowAuthModal(true);
      return;
    }
    setReservation({ scooter: selectedScooter, timeLeft: 300 }); // 5 minutes reserve
  };

  const handleStartRide = (route = null) => {
    if (!isLoggedIn) { setShowAuthModal(true); return; }
    
    if (route && route.scooter) {
      setActiveRide({ scooter: route.scooter, startTempLocation: userLocation, route: route, path: route.path });
      setRoutes([]);
      setSearchResult(null);
      setRideTimer(0);
    } else if (reservation) {
      setActiveRide({ scooter: reservation.scooter, startTempLocation: userLocation, path: [userLocation] });
      setReservation(null);
      setRideTimer(0);
    } else if (selectedScooter) {
      setActiveRide({ scooter: selectedScooter, startTempLocation: userLocation, path: [userLocation] });
      setRideTimer(0);
    }
  };

  const handleStopRide = () => {
    if (!activeRide) return;
    const minutes = Math.max(1, Math.ceil(rideTimer / 60));
    let cost = activeRide.scooter.pricePerMin * minutes;
    if (cost < 2.00) cost = 2.00; // Minimum 2 AZN
    
    setLastRideCost(cost.toFixed(2));
    
    setUserProfile(prev => ({
      ...prev,
      balance: prev.balance - cost,
      recentRides: [
        { id: Date.now(), date: new Date().toLocaleDateString('az-AZ'), duration: `${minutes} dəq`, cost: `${cost.toFixed(2)} AZN` },
        ...prev.recentRides
      ].slice(0, 5)
    }));
    
    setShowRideSummary(true);
    setActiveRide(null);
    setRideTimer(0);
    setSelectedScooter(null);
    setSelectedScooterId(null);
  };

  // ==== Authentication ==== //
  const validateAuth = () => {
    const { name, email, password } = authForm;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (authMode === 'register' && name.trim().length < 3) { setAuthError('Ad ən azı 3 simvol olmalıdır'); return false; }
    if (!emailRegex.test(email)) { setAuthError('Düzgün email daxil edin'); return false; }
    if (password.length < 6) { setAuthError('Şifrə ən azı 6 simvol olmalıdır'); return false; }
    setAuthError('');
    return true;
  };

  const handleAuthSubmit = e => {
    e.preventDefault();
    if (!validateAuth()) return;
    setIsLoggedIn(true);
    setShowAuthModal(false);
    setUserProfile(p => ({ ...p, name: authForm.name || p.name, balance: p.balance || 5 }));
    setAuthForm({ name: '', email: '', password: '' });
  };

  // ==== UI Helper Components ==== //
  const FilterChip = ({ label, active, onClick }) => (
    <button className={`filter-chip ${active ? 'active' : ''}`} onClick={onClick}>{label}</button>
  );

  const LayerToggle = ({ label, keyName }) => (
    <label className="checkbox-label">
      <input type="checkbox" checked={visibleLayers.includes(keyName)} onChange={() => {
        setVisibleLayers(v => v.includes(keyName) ? v.filter(l => l !== keyName) : [...v, keyName]);
      }} /> {label}
    </label>
  );

  // ==== Render ==== //
  if (showSplash) {
    return (
      <div className="splash-screen">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="loader-logo pulse">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'var(--gradient-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={35} color="white" />
            </div>
            <span>Skuter.az</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={theme} data-theme={theme} style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="header">
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800 }}>Skuter.az</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="theme-toggle" onClick={toggleTheme}>{theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}</button>
          {isLoggedIn ? (
            <button className="btn" style={{ width: 'auto', padding: '0.5rem 1rem', background: 'var(--panel-bg)', color: 'var(--foreground)', border: '1px solid var(--border-color)' }} onClick={() => setShowProfileModal(true)}>
              <UserCircle2 size={18} color="var(--primary)" /> {userProfile.name}
            </button>
          ) : (
            <button className="btn" style={{ width: 'auto', padding: '0.5rem 1rem' }} onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}><User size={18} /> Giriş</button>
          )}
        </div>
      </header>

      {/* Main Layout */}
      <main className="main-content">
        {/* Sidebar */}
        <aside className="sidebar">
          {/* Search & Routing */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <div className="input-group" style={{ position: 'relative', flex: 1 }}>
              <input type="text" className="input-field" placeholder="Məkan axtar (Metro, Park…)" value={destinationQuery} onChange={e => setDestinationQuery(e.target.value)} />
              <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}><Search size={18} opacity={0.5} /></div>
            </div>
            <button className="btn" style={{ width: 'auto', padding: '0 1.2rem' }} onClick={handleSearch}>Axtar</button>
          </div>

          {/* Recommended Routes (if search performed) */}
          {routes.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                 <h4 style={{ margin: 0 }}>Marşrutlar ({searchResult?.name})</h4>
                 <button onClick={() => { setRoutes([]); setSearchResult(null); }} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer' }}>Bağla</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {routes.map((r, i) => (
                  <div key={i} className={`route-card ${r.recommended ? 'recommended' : ''} ${selectedRoute?.scooter?.id === r.scooter.id ? 'active' : ''}`} onClick={() => setSelectedRoute(selectedRoute?.scooter?.id === r.scooter.id ? null : r)}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>{r.scooter.type === 'bike' ? '🚲' : '🛴'}</span> {r.company}
                          {r.recommended && <span style={{ fontSize: '0.7rem', background: 'var(--accent)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>Ən yaxşı</span>}
                        </div>
                        <div style={{ fontWeight: 'bold' }}>{r.cost} AZN</div>
                     </div>
                     <div style={{ fontSize: '0.85rem', opacity: 0.8, display: 'flex', gap: '1rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Timer size={14} /> {r.totalTime} dəq</span>
                        <span>(Piyada {r.walkTime} dəq)</span>
                     </div>
                     {selectedRoute?.scooter?.id === r.scooter.id && (
                        <motion.button initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="btn" style={{ marginTop: '0.8rem', padding: '0.6rem', fontSize: '0.9rem' }} onClick={(e) => { e.stopPropagation(); handleStartRide(r); }}>
                          Gedişə Başla
                        </motion.button>
                     )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Company Filters */}
          <div style={{ display: 'flex', overflowX: 'auto', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.2rem' }} className="hide-scrollbar">
            <FilterChip label="Hamısı" active={filters.all} onClick={() => setFilters({ all: true, bolt: false, jet: false, lime: false, wings: false, bird: false })} />
            <FilterChip label="Bolt" active={filters.bolt} onClick={() => setFilters({ ...filters, all: false, bolt: !filters.bolt })} />
            <FilterChip label="Jet" active={filters.jet} onClick={() => setFilters({ ...filters, all: false, jet: !filters.jet })} />
            <FilterChip label="Lime" active={filters.lime} onClick={() => setFilters({ ...filters, all: false, lime: !filters.lime })} />
            <FilterChip label="Wings" active={filters.wings} onClick={() => setFilters({ ...filters, all: false, wings: !filters.wings })} />
            <FilterChip label="Bird" active={filters.bird} onClick={() => setFilters({ ...filters, all: false, bird: !filters.bird })} />
          </div>

          {/* Collapsible Advanced Settings */}
          <details className="settings-details" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.75rem', marginBottom: '1rem' }}>
            <summary style={{ fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', listStyle: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} />
                Ətraflı Tənzimləmələr
              </div>
            </summary>
            
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', marginBottom: '0.4rem', opacity: 0.7, textTransform: 'uppercase' }}>Xəritə Layları</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.3rem', marginBottom: '1rem' }}>
                <LayerToggle label="Scooterlər" keyName="scooters" />
                <LayerToggle label="Zonalar" keyName="zones" />
                <LayerToggle label="Velo Yollar" keyName="bikeLanes" />
                <LayerToggle label="Metro" keyName="metro" />
                <LayerToggle label="Parkinq" keyName="parking" />
                <LayerToggle label="Avtobus" keyName="busStops" />
                <LayerToggle label="Bildirişlər" keyName="reports" />
                <LayerToggle label="Heatmap" keyName="heatmap" />
              </div>

              <h4 style={{ fontSize: '0.85rem', marginBottom: '0.4rem', opacity: 0.7, textTransform: 'uppercase' }}>Digər Alətlər</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button className="btn btn-sm" onClick={handleGetLocation}><Locate size={16} /> Mövqe</button>
                <button className="btn btn-sm" onClick={findNearestScooter}><Zap size={16} /> Yaxın</button>
                <button className="btn btn-sm" onClick={handleReportScooter}><Gift size={16} /> Bildir</button>
                <button className="btn btn-sm" onClick={() => setHeatmapVisible(v => !v)}>{heatmapVisible ? 'Heatmap Gizlət' : 'Heatmap Göstər'}</button>
              </div>

              {/* Analytics Dashboard */}
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <h4 style={{ marginBottom: '0.4rem', opacity: 0.7 }}>Analitika</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>Ümumi Bildiriş:</span> <strong>{analytics.totalReports}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Orta Mövcudluq:</span> <strong>{analytics.avgAvailability * 100}%</strong>
                </div>
              </div>
            </div>
          </details>
        </aside>

        {/* Map Section */}
        <section className="map-container">
          <MapComponent
            scooters={filteredScooters}
            userLocation={userLocation}
            selectedRoute={selectedRoute}
            onSelectScooter={s => { setSelectedScooter(s); setSelectedScooterId(s.id); }}
            activeRide={activeRide}
            theme={theme}
            visibleLayers={visibleLayers.concat(heatmapVisible ? ['heatmap'] : [])}
            selectedScooterId={selectedScooterId}
            reports={reports}
            showHeatmap={heatmapVisible}
            heatmapData={heatmapData}
            searchResultLocation={searchResult}
            panToLocation={searchResult}
          />
          {/* Floating Action Buttons */}
          <div className="floating-actions" style={{ position: 'absolute', bottom: '2rem', right: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 1000 }}>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="btn" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }} onClick={findNearestScooter} title="Ən yaxını tap">
              <Crosshair size={30} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="btn" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }} onClick={handleReportScooter} title="Skuter Bildir">
              <Camera size={26} />
            </motion.button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        © 2026 Skuter.az – Baku Mobility Platform
      </footer>

      {/* Selected Scooter Action Panel */}
      <AnimatePresence>
        {selectedScooter && !reservation && !activeRide && (
            <motion.div className="hud-panel" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: 'var(--panel-bg)', backdropFilter: 'blur(12px)', padding: '1rem', borderRadius: '20px', boxShadow: '0 15px 35px rgba(0,0,0,0.2)', zIndex: 1999, width: '90%', maxWidth: '350px', border: '1px solid var(--border-color)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                 <div>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Zap size={16} color="var(--primary)" /> {selectedScooter.company}
                    </h3>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{selectedScooter.battery}% Batareya · {selectedScooter.range} km</div>
                 </div>
                 <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold' }}>{selectedScooter.pricePerMin} ₼/dəq</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Min: 2.00 ₼</div>
                 </div>
               </div>
               <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn" style={{ flex: 1, background: 'var(--border-color)', color: 'var(--foreground)' }} onClick={() => { setSelectedScooter(null); setSelectedScooterId(null); }}>Bağla</button>
                  <button className="btn" style={{ flex: 1.5, background: 'var(--card-bg)', color: 'var(--foreground)', border: '1px solid var(--primary)' }} onClick={handleReserve}><Timer size={16} /> Rezerv (5 dqv)</button>
                  <button className="btn" style={{ flex: 1.5, background: 'var(--primary)' }} onClick={handleStartRide}><Play size={16} fill="currentColor" /> Başla</button>
               </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Reservation HUD */}
      <AnimatePresence>
        {reservation && !activeRide && (
           <motion.div className="hud-panel" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: 'var(--background)', padding: '1.5rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', zIndex: 2000, width: '90%', maxWidth: '350px', border: '2px solid var(--primary)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <div>
                 <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Sizin üçün Rezerv edilib</div>
                 <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>{reservation.scooter.company} skuter</div>
               </div>
               <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)' }}>
                 {String(Math.floor(reservation.timeLeft / 60)).padStart(2, '0')}:{String(reservation.timeLeft % 60).padStart(2, '0')}
               </div>
             </div>
             
             <div style={{ display: 'flex', gap: '0.8rem' }}>
               <button className="btn" style={{ flex: 1, background: 'var(--card-bg)', color: 'var(--foreground)', border: '1px solid var(--border-color)' }} onClick={() => { setReservation(null); setSelectedScooter(null); setSelectedScooterId(null); }}>Ləğv et</button>
               <button className="btn" style={{ flex: 2, background: 'var(--gradient-1)' }} onClick={handleStartRide}><Play size={18} fill="currentColor" /> Gedişə Başla</button>
             </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Active Ride HUD */}
      <AnimatePresence>
        {activeRide && (
          <motion.div className="hud-panel" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: 'var(--background)', padding: '1.5rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', zIndex: 2000, width: '90%', maxWidth: '350px', border: '2px solid var(--accent)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isHudExpanded ? '1rem' : '0', cursor: 'pointer' }} onClick={() => setIsHudExpanded(!isHudExpanded)}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                 <div style={{ animation: 'pulse 1.5s infinite', width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%' }}></div>
                 <span style={{ fontWeight: 'bold' }}>Aktiv Naviqasiya</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                 <div style={{ fontSize: '1.8rem', fontWeight: '900', fontFamily: 'monospace' }}>
                   {String(Math.floor(rideTimer / 60)).padStart(2, '0')}:{String(rideTimer % 60).padStart(2, '0')}
                 </div>
                 {isHudExpanded ? <ChevronDown size={20} opacity={0.5} /> : <ChevronUp size={20} opacity={0.5} />}
               </div>
             </div>

             <AnimatePresence>
               {isHudExpanded && (
                 <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                   {/* Navigation Metrics if exploring a specific route */}
                   {activeRide.route && (
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                             <span style={{ opacity: 0.6 }}>Məsafə</span>
                             <strong style={{ fontSize: '1.2rem' }}>{Math.max(0.1, ((activeRide.route.totalTime - (rideTimer / 60)) * (15 / 60))).toFixed(1)} km</strong>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                             <span style={{ opacity: 0.6 }}>Çatacaq</span>
                             <strong style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>{Math.max(1, Math.ceil(activeRide.route.totalTime - (rideTimer / 60)))} dəq</strong>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                             <span style={{ opacity: 0.6 }}>Sürət</span>
                             <strong style={{ fontSize: '1.2rem' }}>15 <span style={{ fontSize: '0.7rem' }}>km/s</span></strong>
                          </div>
                       </div>
                   )}
                   
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1rem', background: 'var(--card-bg)', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                      <div>
                         <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Cari Məbləğ</div>
                         <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{Math.max(2.00, activeRide.scooter.pricePerMin * Math.max(1, Math.ceil(rideTimer / 60))).toFixed(2)} ₼</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                         <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Tarif</div>
                         <div style={{ fontSize: '1rem', fontWeight: '600' }}>{activeRide.scooter.pricePerMin} ₼/dəq</div>
                      </div>
                   </div>
                   
                   <button className="btn" style={{ background: '#ef4444' }} onClick={handleStopRide}><Square size={18} fill="currentColor" /> Gedişi Bitir</button>
                 </motion.div>
               )}
             </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ride Summary Modal */}
      <AnimatePresence>
        {showRideSummary && (
           <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRideSummary(false)}>
            <motion.div className="modal-content" style={{ textAlign: 'center', padding: '3rem 2rem' }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={e => e.stopPropagation()}>
               <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                 <Wallet size={40} />
               </div>
               <h2 style={{ marginBottom: '0.5rem' }}>Gediş Bitti!</h2>
               <p style={{ opacity: 0.7, marginBottom: '2rem' }}>Gediş haqqı balansınızdan silindi</p>
               
               <div style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '2rem', color: 'var(--foreground)' }}>{lastRideCost} <span style={{ fontSize: '1.2rem', opacity: 0.6 }}>AZN</span></div>
               
               <p style={{ fontSize: '0.85rem', opacity: 0.5, marginBottom: '2rem' }}>Qeyd: Minimum gediş haqqı 2.00 AZN təşkil edir.</p>
               
               <button className="btn" onClick={() => setShowRideSummary(false)}>Bağla</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProfileModal(false)}>
            <motion.div className="modal-content" style={{ padding: '0', maxWidth: '400px' }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} onClick={e => e.stopPropagation()}>
              <div style={{ background: 'var(--gradient-dark)', padding: '2rem', borderRadius: '28px 28px 0 0', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <div>
                     <h2 style={{ marginBottom: '0.2rem', fontSize: '1.5rem' }}>{userProfile.name}</h2>
                     <span style={{ opacity: 0.8, fontSize: '0.9rem' }}>Balans: <strong>{userProfile.balance.toFixed(2)} AZN</strong></span>
                   </div>
                   <button onClick={() => setShowProfileModal(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.8 }}>✕</button>
                </div>
              </div>
              <div style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
                 <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Gift size={18} color="var(--primary)" /> Kampaniyalar</h4>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
                    {userProfile.campaigns.map(c => (
                      <div key={c.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div>
                            <div style={{ fontWeight: 'bold' }}>{c.title}</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Etibarlıdır: {c.expiry}</div>
                         </div>
                         <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontWeight: 'bold' }}>{c.discount}</div>
                      </div>
                    ))}
                 </div>
                 
                 <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={18} color="var(--primary)" /> Son Gedişlər</h4>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                    {userProfile.recentRides.map(r => (
                      <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border-color)' }}>
                         <div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{r.date}</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Müddət: {r.duration}</div>
                         </div>
                         <div style={{ fontWeight: 'bold', color: 'var(--foreground)' }}>{r.cost}</div>
                      </div>
                    ))}
                 </div>
                 
                 <button className="btn" style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', width: '100%' }} onClick={() => { setShowProfileModal(false); setIsLoggedIn(false); }}>Çıxış Et</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowAuthModal(false); setAuthError(''); }}
          >
            <motion.div
              className="auth-modal"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Logo + Title */}
              <div className="auth-header">
                <div className="auth-logo">
                  <Zap size={28} color="white" />
                </div>
                <div>
                  <h2 className="auth-title">Skuter.az</h2>
                  <p className="auth-subtitle">Bakının ən sürətli mobillik platformu</p>
                </div>
              </div>

              {/* Tab Switcher */}
              <div className="auth-tabs">
                <button
                  className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                >Giriş</button>
                <button
                  className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
                  onClick={() => { setAuthMode('register'); setAuthError(''); }}
                >Qeydiyyat</button>
              </div>

              {/* Form */}
              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <AnimatePresence mode="wait">
                  {authMode === 'register' && (
                    <motion.input
                      key="name"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="auth-input"
                      type="text"
                      placeholder="👤  Ad Soyad"
                      value={authForm.name}
                      onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
                      required
                    />
                  )}
                </AnimatePresence>
                <input className="auth-input" type="email" placeholder="✉️  Email" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} required />
                <input className="auth-input" type="password" placeholder="🔒  Şifrə" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} required />

                {authError && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="auth-error">
                    ⚠️ {authError}
                  </motion.div>
                )}

                <button type="submit" className="auth-submit-btn">
                  {authMode === 'login' ? '🚀  Daxil Ol' : '✅  Qeydiyyatdan Keç'}
                </button>
              </form>

              <button className="auth-close" onClick={() => { setShowAuthModal(false); setAuthError(''); }}>✕</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
