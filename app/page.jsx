"use client";
import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Map, Navigation2, Search, Clock, CreditCard, Info, Github, AlertTriangle, UserCircle2, Crosshair, Wallet, Gift, LogOut, Timer, Play, Square, Sun, Moon, MapPin, Smartphone, Camera } from 'lucide-react';
import { recommendRoutes } from '../utils/aiRouting';

const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => <div className="glass" style={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Xəritə yüklənir...</div>
});

const DEFAULT_USER_LOCATION = { lat: 40.380, lng: 49.845 };

// Company Branding Config
const COMPANY_LOGOS = {
  bolt: { 
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Bolt_logo.svg/1024px-Bolt_logo.svg.png",
    color: "#2ecc71"
  },
  jet: { 
    icon: "https://play-lh.googleusercontent.com/L-H1n3M2T9jB0Q9v3w1z_q9y_O7x0pA0G0w4z9vA9o0w4z9vA9o0w4z9vA9o0w4z9vA9o=w240-h480-rw",
    color: "#f1c40f"
  },
  lime: { 
    icon: "https://upload.wikimedia.org/wikipedia/commons/d/d1/Lime_%28transportation_company%29_logo.svg",
    color: "#3498db"
  }
};

export default function Home() {
  const [theme, setTheme] = useState('dark');
  const [startQuery, setStartQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [scooters, setScooters] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAbout, setShowAbout] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(DEFAULT_USER_LOCATION);

  const [selectedScooter, setSelectedScooter] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [rideSummary, setRideSummary] = useState(null);

  const [userProfile, setUserProfile] = useState({
      name: 'Said Ibrahimov', email: 'user@skuter.az', balance: 12.50, bonuses: 2, card: '1234', avatar: null
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchScooters = () => {
        fetch('/api/scooters').then(res => res.json()).then(res => {
            if(res.success) {
                const jittered = res.data.map(s => s.status === 'available' ? ({
                    ...s,
                    lat: s.lat + (Math.random() - 0.5) * 0.0005,
                    lng: s.lng + (Math.random() - 0.5) * 0.0005
                }) : s);
                setScooters(jittered);
            }
        });
    };
    fetchScooters();
    const interval = setInterval(fetchScooters, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!reservation) return;
    const timer = setInterval(() => {
        setReservation(prev => {
            if (!prev || prev.timeLeft <= 0) {
                clearInterval(timer);
                return null;
            }
            return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
    }, 1000);
    return () => clearInterval(timer);
  }, [reservation]);

  useEffect(() => {
    if (!activeRide) return;
    const timer = setInterval(() => {
        setActiveRide(prev => {
            if (!prev) return null;
            const newDuration = prev.duration + 1;
            const newDist = prev.distance + 0.005;
            const newCost = prev.scooter.basePrice + (newDuration / 60) * prev.scooter.pricePerMin;
            return { ...prev, duration: newDuration, distance: newDist, cost: newCost };
        });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeRide]);

  const handleSearch = async () => {
    if (!destinationQuery.trim()) return;
    setLoading(true);
    // Simulating API Search
    setTimeout(() => {
        const mockDest = { lat: 40.415, lng: 49.870 }; // Narimanov
        const newRoutes = recommendRoutes(userLocation, mockDest, scooters);
        setRoutes(newRoutes);
        setLoading(false);
    }, 1000);
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <div className="layout">
      <header className="header">
        <div className="logo" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem' }} onClick={() => window.location.reload()}>
          <img src="/logo.png" alt="Skuter.az Logo" style={{ height: '45px', width: 'auto', borderRadius: '8px' }} />
          <span style={{ fontWeight: '800', fontSize: '1.4rem', color: 'var(--foreground)' }}>Skuter.az</span>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="theme-toggle" onClick={() => setShowAbout(true)}><Info size={20} /></button>
          <button className="btn" style={{ width: 'auto', padding: '0.5rem 1rem' }} onClick={() => setShowLogin(true)}>
            <UserCircle2 size={20} /> <span className="hide-mobile">{isLoggedIn ? 'Hesabım' : 'Giriş'}</span>
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="map-container">
           <MapComponent 
             scooters={scooters} 
             userLocation={userLocation} 
             selectedRoute={selectedRoute} 
             onSelectScooter={setSelectedScooter}
             activeRide={activeRide}
             theme={theme}
           />
        </div>

        <div className="sidebar">
          {activeRide && (
              <div className="glass animate-fade-in" style={{ border: '2px solid var(--primary)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <h3 style={{ color: 'var(--primary)' }}>Canlı Gediş</h3>
                      <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{activeRide.cost.toFixed(2)} AZN</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div className="glass" style={{ textAlign: 'center', padding: '0.75rem' }}>
                          <Timer size={16} color="#94a3b8" />
                          <div style={{ fontWeight: 'bold' }}>{Math.floor(activeRide.duration / 60)}:{String(activeRide.duration % 60).padStart(2, '0')}</div>
                      </div>
                      <div className="glass" style={{ textAlign: 'center', padding: '0.75rem' }}>
                          <Navigation2 size={16} color="#94a3b8" />
                          <div style={{ fontWeight: 'bold' }}>{activeRide.distance.toFixed(2)} km</div>
                      </div>
                  </div>
                  <button className="btn" style={{ background: '#ef4444' }} onClick={() => {setRideSummary(activeRide); setActiveRide(null);}}>
                      <Square size={18} /> Gedişi Bitir
                  </button>
              </div>
          )}

          {rideSummary && (
               <div className="glass animate-fade-in" style={{ border: '2px solid var(--accent)', marginBottom: '1.5rem' }}>
                   <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Gediş Tamamlandı</h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Məsafə:</span> <strong>{rideSummary.distance.toFixed(2)} km</strong></div>
                       <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Vaxt:</span> <strong>{Math.floor(rideSummary.duration/60)} dəq</strong></div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', marginTop: '0.5rem' }}><span>Ümumi:</span> <strong style={{color: 'var(--accent)'}}>{rideSummary.cost.toFixed(2)} AZN</strong></div>
                   </div>
                   <button className="btn" style={{ marginTop: '1rem' }} onClick={() => setRideSummary(null)}>Anladım</button>
               </div>
          )}

          {reservation && !activeRide && (
              <div className="glass animate-fade-in" style={{ border: '2px solid #f59e0b', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                          <p style={{ color: '#f59e0b', fontSize: '0.8rem' }}>RESERVASİYA</p>
                          <h4 style={{ fontSize: '1.5rem' }}>{Math.floor(reservation.timeLeft / 60)}:{String(reservation.timeLeft % 60).padStart(2, '0')}</h4>
                      </div>
                      <button className="btn" style={{ width: 'auto' }} onClick={() => {
                          const s = scooters.find(x => x.id === reservation.scooterId);
                          setActiveRide({ scooter: s, duration: 0, distance: 0, cost: s.basePrice, path: [] });
                          setReservation(null);
                      }}>
                          <Play size={18} /> Başla
                      </button>
                  </div>
              </div>
          )}

          {!activeRide && !rideSummary && !reservation && (
            <>
              <div className="glass search-box" style={{ marginBottom: '1.5rem' }}>
                 <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Hara Getmək İstəyirsiz?</h2>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="input-group" style={{ position: 'relative' }}>
                        <input type="text" className="input-field" placeholder="Giriş nöqtəsi..." value={startQuery} onChange={(e) => setStartQuery(e.target.value)} />
                        <Crosshair size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', cursor: 'pointer' }} />
                    </div>
                    <div className="input-group">
                        <input type="text" className="input-field" placeholder="Təyinat nöqtəsi..." value={destinationQuery} onChange={(e) => setDestinationQuery(e.target.value)} />
                    </div>
                    <button className="btn" onClick={handleSearch} disabled={loading}>
                        {loading ? 'Axtarılır...' : <><Search size={18} /> Marşrut Tap</>}
                    </button>
                 </div>
              </div>

              {selectedScooter && (
                  <div className="glass animate-fade-in" style={{ marginBottom: '1.5rem', border: `1px solid ${selectedScooter.color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <h3 style={{ color: selectedScooter.color }}>{selectedScooter.company}</h3>
                          <div style={{ fontWeight: 'bold' }}>{selectedScooter.pricePerMin} AZN/dəq</div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                          <span>🔋 {selectedScooter.battery}%</span>
                          <span>⚡ {selectedScooter.status === 'available' ? 'Hazırdır' : 'Məşğul'}</span>
                      </div>
                      <button className="btn" onClick={() => {
                          setReservation({ scooterId: selectedScooter.id, timeLeft: 300 });
                          setSelectedScooter(null);
                      }}>Rezerv et (5 dəq)</button>
                  </div>
              )}

              {routes.length > 0 && (
                <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#94a3b8', letterSpacing: '1px' }}>OPTIMAL VARIANTLAR</h3>
                  {routes.map((r, i) => (
                    <div 
                      key={i} 
                      className={`route-card ${r.recommended ? 'recommended' : ''} ${selectedRoute === r ? 'active' : ''}`} 
                      onClick={() => {
                        setSelectedRoute(r);
                        setSelectedScooter(r.scooter);
                        setErrorMsg(''); // Clear errors when switching
                      }} 
                      style={{ 
                        transition: 'all 0.2s',
                        border: selectedRoute === r ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: selectedRoute === r ? 'var(--primary-glow)' : 'var(--card-bg)'
                      }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: r.scooter.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                  {r.company[0]}
                                </div>
                                <div style={{ fontWeight: '700', color: 'var(--foreground)' }}>{r.company} Skuter</div>
                            </div>
                            <div style={{ color: 'var(--accent)', fontWeight: '800', fontSize: '1.2rem' }}>{r.cost.toFixed(2)} AZN</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14}/> {r.totalTime} dəq gediş</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Wallet size={14}/> {r.scooter.pricePerMin} AZN/dəq</span>
                        </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="footer">
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <span>&copy; 2026 Skuter.az</span>
            <a href="https://github.com/seid8631" target="_blank" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Powered by Said Ibrahimov</a>
        </div>
      </footer>

      {showLogin && (
         <div className="modal-overlay" onClick={() => setShowLogin(false)}>
            <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
               {!isLoggedIn ? (
                 <div className="login-form">
                   <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                      <div className="logo-circle" style={{ width: '70px', height: '70px', background: 'var(--primary-glow)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <MapPin size={32} color="var(--primary)" />
                      </div>
                      <h2 style={{ color: 'var(--foreground)' }}>Xoş Gəlmisiniz</h2>
                      <p style={{ color: 'var(--foreground)', opacity: 0.6, fontSize: '0.9rem' }}>Skuter.az hesabınıza daxil olun</p>
                   </div>
                   
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="input-group">
                        <label style={{ fontSize: '0.8rem', color: 'var(--foreground)', opacity: 0.8, marginBottom: '0.4rem', display: 'block' }}>Email</label>
                        <input type="email" className="input-field" placeholder="adiniz@mail.com" defaultValue="user@skuter.az" />
                      </div>
                      <div className="input-group">
                        <label style={{ fontSize: '0.8rem', color: 'var(--foreground)', opacity: 0.8, marginBottom: '0.4rem', display: 'block' }}>Şifrə</label>
                        <input type="password" className="input-field" placeholder="••••••••" defaultValue="123456" />
                      </div>
                      
                      <button className="btn" style={{ marginTop: '0.5rem' }} onClick={() => setIsLoggedIn(true)}>
                        Daxil Ol
                      </button>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                        <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>və ya</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--foreground)', border: '1px solid var(--border-color)', flex: 1 }}>
                          <Smartphone size={18} /> Google
                        </button>
                        <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--foreground)', border: '1px solid var(--border-color)', flex: 1 }}>
                          <Github size={18} /> Apple
                        </button>
                      </div>
                   </div>
                 </div>
               ) : (
                 <div className="profile-view">
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-glow)', overflow: 'hidden', border: '2px solid var(--primary)' }}>
                          <UserCircle2 size={80} color="var(--primary)" />
                        </div>
                        <button style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--primary)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
                          <Camera size={14} />
                        </button>
                      </div>
                      <div>
                        <h3 style={{ color: 'var(--foreground)' }}>{userProfile.name}</h3>
                        <p style={{ color: 'var(--foreground)', opacity: 0.6, fontSize: '0.85rem' }}>Premium İstifadəçi</p>
                      </div>
                   </div>
                   
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <div className="glass" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <Wallet size={20} color="var(--primary)" />
                          <span>Balans</span>
                        </div>
                        <strong style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>{userProfile.balance.toFixed(2)} AZN</strong>
                      </div>
                      <div className="glass" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <Gift size={20} color="var(--accent)" />
                          <span>Bonuslar</span>
                        </div>
                        <strong style={{ color: 'var(--accent)', fontSize: '1.2rem' }}>{userProfile.bonuses} Gediş</strong>
                      </div>
                      <div className="glass" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <CreditCard size={20} color="#f59e0b" />
                          <span>Mənim Kartım</span>
                        </div>
                        <strong style={{ opacity: 0.8 }}>**** {userProfile.card}</strong>
                      </div>
                      
                      <button className="btn" style={{ marginTop: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }} onClick={() => {
                          setIsLoggedIn(false);
                          setShowLogin(false);
                      }}>
                          <LogOut size={18} /> Çıxış Et
                      </button>
                   </div>
                 </div>
               )}
            </div>
         </div>
      )}

      {showAbout && (
         <div className="modal-overlay" onClick={() => setShowAbout(false)}>
            <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
               <h2 style={{ color: 'var(--foreground)' }}>Skuter.az</h2>
               <p style={{ marginTop: '1rem', lineHeight: '1.6', color: '#94a3b8' }}>
                 Bu platforma Bakıdakı bütün skuter xidmətlərini bir yerə toplayır. AI köməyi ilə ən optimal və ucuz marşrutu tapmağınıza kömək edirik.
               </p>
               <button className="btn" style={{ marginTop: '2rem' }} onClick={() => setShowAbout(false)}>Bağla</button>
            </div>
         </div>
      )}
    </div>
  );
}
