import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createIcon = (color, status) => {
  const opacity = status === 'available' ? 1 : 0.5;
  const border = status === 'busy' ? '3px solid #666' : status === 'charging' ? '3px solid #f39c12' : '3px solid white';
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color:${color};width:20px;height:20px;border-radius:50%;border:${border};box-shadow:0 0 10px rgba(0,0,0,0.5);opacity:${opacity};"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const userIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color:#3b82f6;width:24px;height:24px;border-radius:50%;border:4px solid white;box-shadow:0 0 12px rgba(59,130,246,0.8);"><div style="width:8px;height:8px;background:white;border-radius:50%;margin:4px;"></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

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

const bikeLanes = [
  [[40.360, 49.830], [40.365, 49.840], [40.370, 49.850], [40.375, 49.865]],
  [[40.365, 49.832], [40.372, 49.835], [40.378, 49.830]]
];

export default function MapComponent({ scooters, userLocation, selectedRoute, onSelectScooter, activeRide, theme }) {
  const tileUrl = theme === 'dark' 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  return (
    <MapContainer 
      key={theme} // Force re-render on theme change to update tiles properly
      center={[userLocation.lat, userLocation.lng]} 
      zoom={14} 
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        url={tileUrl}
        attribution='&copy; CARTO'
      />

      {bikeLanes.map((lane, idx) => (
        <Polyline 
          key={`bike-lane-${idx}`}
          positions={lane}
          color="#10b981"
          weight={4}
          opacity={0.4}
        />
      ))}

      {selectedRoute && selectedRoute.path && (
          <PanToBounds path={selectedRoute.path} />
      )}

      {selectedRoute && selectedRoute.path && (
          <Polyline 
             positions={selectedRoute.path} 
             color="#10b981" 
             weight={6} 
             dashArray="10, 10" 
             opacity={0.8} 
          />
      )}

      {activeRide && activeRide.path && (
          <Polyline 
             positions={activeRide.path} 
             color="#3b82f6" 
             weight={6} 
             opacity={1} 
          />
      )}

      <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
         <Popup>Sizin mövqeyiniz</Popup>
      </Marker>

      {selectedRoute && selectedRoute.path && (
         <Marker position={selectedRoute.path[selectedRoute.path.length - 1]} icon={userIcon}>
            <Popup>Təyinat yeri</Popup>
         </Marker>
      )}

      {scooters.map(s => (
        <Marker 
          key={s.id} 
          position={[s.lat, s.lng]} 
          icon={createIcon(s.color, s.status)}
          eventHandlers={{
            click: () => onSelectScooter && onSelectScooter(s)
          }}
        >
            <Popup>
                <strong>{s.company}</strong><br/>
                Status: {s.status === 'available' ? 'Mövcuddur' : s.status === 'busy' ? 'Məşğuldur' : 'Enerji yığır'}<br/>
                Batareya: {s.battery}%<br/>
                Qiymət: {s.pricePerMin} AZN/dəq
            </Popup>
        </Marker>
      ))}

    </MapContainer>
  );
}
