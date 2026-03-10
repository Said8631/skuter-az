export const mockScooters = [
  // Bolt - Green (#2ecc71)
  { id: "bolt-1", company: "Bolt", lat: 40.375, lng: 49.835, battery: 85, basePrice: 0.40, pricePerMin: 0.20, status: "available", color: "#2ecc71", type: "scooter", lastSeen: "2 dəq əvvəl", range: 15 },
  { id: "bolt-2", company: "Bolt", lat: 40.380, lng: 49.845, battery: 92, basePrice: 0.40, pricePerMin: 0.20, status: "available", color: "#2ecc71", type: "scooter", lastSeen: "5 dəq əvvəl", range: 18 },
  { id: "bolt-3", company: "Bolt", lat: 40.395, lng: 49.865, battery: 40, basePrice: 0.40, pricePerMin: 0.20, status: "busy", color: "#2ecc71", type: "scooter", lastSeen: "10 dəq əvvəl", range: 7 },
  { id: "bolt-4", company: "Bolt", lat: 40.388, lng: 49.838, battery: 72, basePrice: 0.40, pricePerMin: 0.20, status: "available", color: "#2ecc71", type: "scooter", lastSeen: "1 dəq əvvəl", range: 13 },
  { id: "bolt-5", company: "Bolt", lat: 40.362, lng: 49.843, battery: 55, basePrice: 0.40, pricePerMin: 0.20, status: "available", color: "#2ecc71", type: "scooter", lastSeen: "7 dəq əvvəl", range: 10 },

  // Jet - Yellow (#f1c40f)
  { id: "jet-1", company: "Jet", lat: 40.400, lng: 49.852, battery: 60, basePrice: 0.50, pricePerMin: 0.18, status: "available", color: "#f1c40f", type: "scooter", lastSeen: "1 dəq əvvəl", range: 12 },
  { id: "jet-2", company: "Jet", lat: 40.415, lng: 49.870, battery: 100, basePrice: 0.50, pricePerMin: 0.18, status: "charging", color: "#f1c40f", type: "scooter", lastSeen: "20 dəq əvvəl", range: 20 },
  { id: "jet-3", company: "Jet", lat: 40.370, lng: 49.830, battery: 75, basePrice: 0.50, pricePerMin: 0.18, status: "available", color: "#f1c40f", type: "scooter", lastSeen: "3 dəq əvvəl", range: 14 },
  { id: "jet-4", company: "Jet", lat: 40.409, lng: 49.867, battery: 33, basePrice: 0.50, pricePerMin: 0.18, status: "available", color: "#f1c40f", type: "scooter", lastSeen: "15 dəq əvvəl", range: 5 },

  // Lime - Blue (#3498db)
  { id: "lime-1", company: "Lime", lat: 40.365, lng: 49.832, battery: 45, basePrice: 0.45, pricePerMin: 0.22, status: "available", color: "#3498db", type: "bike", lastSeen: "1 dəq əvvəl", range: 10 },
  { id: "lime-2", company: "Lime", lat: 40.370, lng: 49.840, battery: 78, basePrice: 0.45, pricePerMin: 0.22, status: "available", color: "#3498db", type: "bike", lastSeen: "6 dəq əvvəl", range: 16 },
  { id: "lime-3", company: "Lime", lat: 40.393, lng: 49.860, battery: 90, basePrice: 0.45, pricePerMin: 0.22, status: "available", color: "#3498db", type: "bike", lastSeen: "2 dəq əvvəl", range: 19 },

  // Wings - Orange (#e67e22)
  { id: "wings-1", company: "Wings", lat: 40.385, lng: 49.855, battery: 90, basePrice: 0.30, pricePerMin: 0.15, status: "available", color: "#e67e22", type: "scooter", lastSeen: "4 dəq əvvəl", range: 18 },
  { id: "wings-2", company: "Wings", lat: 40.390, lng: 49.840, battery: 30, basePrice: 0.30, pricePerMin: 0.15, status: "available", color: "#e67e22", type: "scooter", lastSeen: "8 dəq əvvəl", range: 5 },
  { id: "wings-3", company: "Wings", lat: 40.373, lng: 49.855, battery: 65, basePrice: 0.30, pricePerMin: 0.15, status: "busy", color: "#e67e22", type: "scooter", lastSeen: "12 dəq əvvəl", range: 12 },

  // Bird - Purple (#9b59b6)
  { id: "bird-1", company: "Bird", lat: 40.385, lng: 49.850, battery: 65, basePrice: 0.35, pricePerMin: 0.25, status: "available", color: "#9b59b6", type: "scooter", lastSeen: "1 dəq əvvəl", range: 11 },
  { id: "bird-2", company: "Bird", lat: 40.378, lng: 49.862, battery: 80, basePrice: 0.35, pricePerMin: 0.25, status: "available", color: "#9b59b6", type: "scooter", lastSeen: "9 dəq əvvəl", range: 14 },
];

// Heatmap hotspot data (areas with high scooter frequency)
export const heatmapData = [
  { lat: 40.375, lng: 49.845, intensity: 0.9, name: "28 May Meydanı" },
  { lat: 40.380, lng: 49.853, intensity: 0.8, name: "Sahil Bulvarı" },
  { lat: 40.365, lng: 49.837, intensity: 0.75, name: "İçərişəhər" },
  { lat: 40.400, lng: 49.860, intensity: 0.7, name: "Nərimanov" },
  { lat: 40.390, lng: 49.840, intensity: 0.65, name: "Nizami" },
  { lat: 40.370, lng: 49.829, intensity: 0.6, name: "Elmlər Akademiyası" },
  { lat: 40.384, lng: 49.870, intensity: 0.55, name: "Port Baku" },
  { lat: 40.356, lng: 49.833, intensity: 0.5, name: "Dənizkənarı Bağ" },
  { lat: 40.410, lng: 49.870, intensity: 0.45, name: "Koroğlu" },
];
