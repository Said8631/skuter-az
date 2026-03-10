import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Polygon, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { mockZones, mobilityLayers } from '../data/mockZones';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const COMPANY_COLORS = {
  bolt: '#2ecc71',
  jet: '#f1c40f',
  lime: '#3498db',
  wings: '#e67e22',
  bird: '#9b59b6',
};

const getCompanyColor = (company) =>
  COMPANY_COLORS[company.toLowerCase()] || '#64748b';

const createScooterIcon = (company, status, type, isSelected) => {
  const color = getCompanyColor(company);
  const opacity = status === 'available' ? 1 : 0.55;
  const size = isSelected ? 36 : type === 'bike' ? 28 : 26;
  const emoji = type === 'bike' ? '🚲' : '🛴';
  const glow = isSelected ? `box-shadow:0 0 0 4px ${color}44, 0 0 20px ${color}88;` : '0 2px 8px rgba(0,0,0,0.4)';
  const borderColor = status === 'charging' ? '#f59e0b' : status === 'busy' ? '#94a3b8' : 'white';

  return L.divIcon({
    className: '',
    html: `<div style="
      background:${color};
      width:${size}px;height:${size}px;
      border-radius:${type === 'bike' ? '8px' : '50%'};
      border:2.5px solid ${borderColor};
      box-shadow:${glow};
      opacity:${opacity};
      display:flex;align-items:center;justify-content:center;
      font-size:${size * 0.45}px;
      transition:all 0.2s;
      cursor:pointer;
    ">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const userIcon = L.divIcon({
  className: '',
  html: `<div style="position:relative;width:24px;height:24px;">
    <div style="position:absolute;inset:0;background:#3b82f6;border-radius:50%;opacity:0.3;animation:ping 1.5s infinite;"></div>
    <div style="background:#3b82f6;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 0 12px rgba(59,130,246,0.8);margin:2px;"></div>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const metroIcon = L.divIcon({
  className: '',
  html: `<div style="background:#e74c3c;color:white;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:11px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">M</div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const parkingIcon = L.divIcon({
  className: '',
  html: `<div style="background:#3b82f6;color:white;width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:11px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">P</div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const busStopIcon = L.divIcon({
  className: '',
  html: `<div style="background:#f59e0b;color:white;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:11px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">B</div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const reportIcon = L.divIcon({
  className: '',
  html: `<div style="background:#a855f7;color:white;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;border:2px solid white;box-shadow:0 2px 8px rgba(168,85,247,0.5);">📍</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

const searchResultIcon = L.divIcon({
  className: '',
  html: `<div style="background:#ec4899;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;border:2.5px solid white;box-shadow:0 0 16px rgba(236,72,153,0.6);">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

function PanToLocation({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 16, { duration: 1.2 });
    }
  }, [location, map]);
  return null;
}

function PanToBounds({ path }) {
  const map = useMap();
  useEffect(() => {
    if (path && path.length > 0) {
      const bounds = L.latLngBounds(path);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [path, map]);
  return null;
}

export default function MapComponent({
  scooters,
  userLocation,
  selectedRoute,
  onSelectScooter,
  activeRide,
  theme,
  visibleLayers = ['scooters', 'zones'],
  selectedScooterId,
  reports = [],
  showHeatmap = false,
  heatmapData = [],
  searchResultLocation = null,
  panToLocation = null,
}) {
  const tileUrl = theme === 'dark'
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  return (
    <MapContainer
      key={theme}
      center={[userLocation.lat, userLocation.lng]}
      zoom={14}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer url={tileUrl} attribution='&copy; CARTO' />

      {/* Pan to searched location */}
      {panToLocation && <PanToLocation location={panToLocation} />}

      {/* Pan to route bounds */}
      {selectedRoute?.path && <PanToBounds path={selectedRoute.path} />}

      {/* === ZONES === */}
      {visibleLayers.includes('zones') && mockZones.map(zone => (
        <Polygon
          key={zone.id}
          positions={zone.coords}
          pathOptions={{ fillColor: zone.color, color: zone.color, fillOpacity: 0.18, weight: 2 }}
        >
          <Popup>
            <strong>{zone.name}</strong><br />
            {zone.type === 'allowed' ? '✅ İcazəli Zona' : zone.type === 'restricted' ? '🚫 Qadağan Zona' : '🅿️ Parkinq Zonası'}
          </Popup>
        </Polygon>
      ))}

      {/* === BIKE LANES === */}
      {visibleLayers.includes('bikeLanes') && mobilityLayers.bikeLanes.map((lane, idx) => (
        <Polyline key={`bikelane-${idx}`} positions={lane} color="#10b981" weight={5} opacity={0.65} dashArray="12,6" />
      ))}

      {/* === METRO STATIONS === */}
      {visibleLayers.includes('metro') && mobilityLayers.metro.map((m, idx) => (
        <Marker key={`metro-${idx}`} position={[m.lat, m.lng]} icon={metroIcon}>
          <Popup><strong>🚇 Metro: {m.name}</strong></Popup>
        </Marker>
      ))}

      {/* === PARKING === */}
      {visibleLayers.includes('parking') && mobilityLayers.parking.map((p, idx) => (
        <Marker key={`parking-${idx}`} position={[p.lat, p.lng]} icon={parkingIcon}>
          <Popup><strong>🅿️ Parkinq: {p.name}</strong></Popup>
        </Marker>
      ))}

      {/* === BUS STOPS === */}
      {visibleLayers.includes('busStops') && mobilityLayers.busStops.map((b, idx) => (
        <Marker key={`bus-${idx}`} position={[b.lat, b.lng]} icon={busStopIcon}>
          <Popup><strong>🚌 Avtobus: {b.name}</strong></Popup>
        </Marker>
      ))}

      {/* === HEATMAP (simulated with circles) === */}
      {showHeatmap && heatmapData.map((h, idx) => (
        <Circle
          key={`heat-${idx}`}
          center={[h.lat, h.lng]}
          radius={350}
          pathOptions={{
            fillColor: `hsl(${(1 - h.intensity) * 120}, 90%, 50%)`,
            color: 'transparent',
            fillOpacity: h.intensity * 0.55,
          }}
        >
          <Popup>🔥 {h.name} — Sıxlıq: {Math.round(h.intensity * 100)}%</Popup>
        </Circle>
      ))}

      {/* === USER LOCATION === */}
      <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
        <Popup><strong>📍 Sizin Mövqeyiniz</strong></Popup>
      </Marker>

      {/* === SEARCH RESULT MARKER === */}
      {searchResultLocation && (
        <Marker position={[searchResultLocation.lat, searchResultLocation.lng]} icon={searchResultIcon}>
          <Popup><strong>📍 {searchResultLocation.name}</strong></Popup>
        </Marker>
      )}

      {/* === SELECTED ROUTE PATH === */}
      {selectedRoute?.path && (
        <Polyline positions={selectedRoute.path} color="#6366f1" weight={5} dashArray="12, 8" opacity={0.9} />
      )}

      {/* === ACTIVE RIDE PATH === */}
      {activeRide?.path && (
        <Polyline positions={activeRide.path} color="#3b82f6" weight={6} opacity={1} />
      )}

      {/* === DESTINATION MARKER === */}
      {selectedRoute?.path && (
        <Marker position={selectedRoute.path[selectedRoute.path.length - 1]} icon={searchResultIcon}>
          <Popup>🏁 Təyinat Yeri</Popup>
        </Marker>
      )}

      {/* === USER REPORT MARKERS === */}
      {reports.map(r => (
        <Marker key={`report-${r.id}`} position={[r.lat, r.lng]} icon={reportIcon}>
          <Popup><strong>👤 İstifadəçi Bildirişi</strong><br />{r.timestamp}</Popup>
        </Marker>
      ))}

      {/* === SCOOTERS === */}
      {visibleLayers.includes('scooters') && scooters.map(s => (
        <div key={s.id}>
          <Marker
            position={[s.lat, s.lng]}
            icon={createScooterIcon(s.company, s.status, s.type, selectedScooterId === s.id)}
            eventHandlers={{ click: () => onSelectScooter && onSelectScooter(s) }}
          >
            <Popup>
              <div style={{ minWidth: '170px', fontFamily: 'Inter, sans-serif' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>{s.type === 'bike' ? '🚲' : '🛴'}</span>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '1rem', color: getCompanyColor(s.company) }}>{s.company}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{s.type === 'bike' ? 'Velosiped' : 'Elektrik Skuter'}</div>
                  </div>
                </div>
                <hr style={{ margin: '6px 0', opacity: 0.2 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                  <span>🔋 Batareya: <strong>{s.battery}%</strong></span>
                  <span>📍 Son görülmə: <strong>{s.lastSeen}</strong></span>
                  <span>📏 Menzil: <strong>{s.range} km</strong></span>
                  <span>💰 Qiymət: <strong>{s.pricePerMin} AZN/dəq</strong></span>
                  <span>⚡ Status: <strong style={{ color: s.status === 'available' ? '#22c55e' : s.status === 'charging' ? '#f59e0b' : '#94a3b8' }}>
                    {s.status === 'available' ? 'Mövcuddur' : s.status === 'charging' ? 'Enerji Yığır' : 'Məşğuldur'}
                  </strong></span>
                </div>
              </div>
            </Popup>
          </Marker>
          {/* Battery range circle when selected */}
          {selectedScooterId === s.id && (
            <Circle
              center={[s.lat, s.lng]}
              radius={s.range * 1000}
              pathOptions={{ color: getCompanyColor(s.company), fillColor: getCompanyColor(s.company), fillOpacity: 0.07, weight: 2, dashArray: '8, 6' }}
            />
          )}
        </div>
      ))}
    </MapContainer>
  );
}
