export const mockZones = [
  {
    id: "zone-1",
    name: "Mərkəzi Sürüş Zonası",
    type: "allowed",
    color: "#2ecc71",
    coords: [
      [40.370, 49.820],
      [40.400, 49.820],
      [40.400, 49.880],
      [40.370, 49.880]
    ]
  },
  {
    id: "zone-2",
    name: "Dənizkənarı Bulvar (Məhdud)",
    type: "restricted",
    color: "#e74c3c",
    coords: [
      [40.360, 49.830],
      [40.372, 49.835],
      [40.375, 49.860],
      [40.355, 49.855]
    ]
  },
  {
    id: "zone-3",
    name: "İçərişəhər Parkinq",
    type: "parking",
    color: "#3498db",
    coords: [
      [40.365, 49.835],
      [40.368, 49.835],
      [40.368, 49.840],
      [40.365, 49.840]
    ]
  },
  {
    id: "zone-4",
    name: "Port Baku Parkinq",
    type: "parking",
    color: "#3498db",
    coords: [
      [40.377, 49.860],
      [40.381, 49.860],
      [40.381, 49.866],
      [40.377, 49.866]
    ]
  },
  {
    id: "zone-5",
    name: "Koroğlu Sürüş Zonası",
    type: "allowed",
    color: "#2ecc71",
    coords: [
      [40.405, 49.863],
      [40.415, 49.863],
      [40.415, 49.876],
      [40.405, 49.876]
    ]
  },
  {
    id: "zone-6",
    name: "Biləcəri Qadağan Zonası",
    type: "restricted",
    color: "#e74c3c",
    coords: [
      [40.400, 49.820],
      [40.408, 49.820],
      [40.408, 49.830],
      [40.400, 49.830]
    ]
  }
];

export const mobilityLayers = {
  metro: [
    { name: "28 May", lat: 40.380, lng: 49.849 },
    { name: "Sahil", lat: 40.371, lng: 49.846 },
    { name: "İçərişəhər", lat: 40.366, lng: 49.836 },
    { name: "Elmlər Akademiyası", lat: 40.375, lng: 49.815 },
    { name: "Nəriman Nərimanov", lat: 40.403, lng: 49.871 },
    { name: "Xalqlar Dostluğu", lat: 40.396, lng: 49.885 },
    { name: "Əhmədli", lat: 40.387, lng: 49.906 },
    { name: "Koroğlu", lat: 40.409, lng: 49.868 },
    { name: "Qara Qarayev", lat: 40.416, lng: 49.897 },
  ],
  parking: [
    { name: "Park Bulvar Parking", lat: 40.372, lng: 49.852 },
    { name: "Port Baku Parking", lat: 40.378, lng: 49.862 },
    { name: "28 May Parking", lat: 40.382, lng: 49.851 },
    { name: "Sahil Mall Parking", lat: 40.369, lng: 49.851 },
  ],
  bikeLanes: [
    [[40.360, 49.830], [40.365, 49.840], [40.370, 49.850], [40.375, 49.865]],
    [[40.365, 49.832], [40.372, 49.835], [40.378, 49.830]],
    [[40.380, 49.848], [40.385, 49.856], [40.390, 49.862]],
    [[40.370, 49.860], [40.375, 49.865], [40.380, 49.870], [40.385, 49.875]],
  ],
  busStops: [
    { name: "İstiqlaliyyət Küçəsi", lat: 40.373, lng: 49.843 },
    { name: "Nizami Küçəsi", lat: 40.378, lng: 49.848 },
    { name: "Hüseyn Cavid pr.", lat: 40.382, lng: 49.854 },
    { name: "Rəşid Behbudov", lat: 40.369, lng: 49.836 },
    { name: "Neftçilər pr.", lat: 40.365, lng: 49.846 },
    { name: "Füzuli meydanı", lat: 40.376, lng: 49.843 },
    { name: "Bayıl", lat: 40.355, lng: 49.837 },
    { name: "Lökbatan", lat: 40.400, lng: 49.838 },
  ]
};

// Location search database
export const locationDatabase = [
  // Metro Stations
  { name: "28 May Metro", type: "metro", lat: 40.380, lng: 49.849, icon: "🚇" },
  { name: "Sahil Metro", type: "metro", lat: 40.371, lng: 49.846, icon: "🚇" },
  { name: "İçərişəhər Metro", type: "metro", lat: 40.366, lng: 49.836, icon: "🚇" },
  { name: "Elmlər Akademiyası Metro", type: "metro", lat: 40.375, lng: 49.815, icon: "🚇" },
  { name: "Nəriman Nərimanov Metro", type: "metro", lat: 40.403, lng: 49.871, icon: "🚇" },
  { name: "Koroğlu Metro", type: "metro", lat: 40.409, lng: 49.868, icon: "🚇" },
  // Districts
  { name: "Nərimanov Rayonu", type: "district", lat: 40.405, lng: 49.862, icon: "🏘️" },
  { name: "Nizami Rayonu", type: "district", lat: 40.380, lng: 49.840, icon: "🏘️" },
  { name: "Yasamal Rayonu", type: "district", lat: 40.390, lng: 49.820, icon: "🏘️" },
  { name: "Sabunçu Rayonu", type: "district", lat: 40.426, lng: 49.895, icon: "🏘️" },
  { name: "Binəqədi Rayonu", type: "district", lat: 40.427, lng: 49.836, icon: "🏘️" },
  // Popular Places
  { name: "İçərişəhər", type: "place", lat: 40.366, lng: 49.836, icon: "🏰" },
  { name: "Dənizkənarı Milli Park", type: "place", lat: 40.366, lng: 49.849, icon: "🌳" },
  { name: "Heydar Əliyev Mərkəzi", type: "place", lat: 40.390, lng: 49.868, icon: "🏛️" },
  { name: "Park Bulvar", type: "place", lat: 40.371, lng: 49.852, icon: "🛍️" },
  { name: "Port Baku Mall", type: "place", lat: 40.378, lng: 49.863, icon: "🛍️" },
  { name: "Sahil Mall", type: "place", lat: 40.369, lng: 49.851, icon: "🛍️" },
  { name: "Bakı Olimpiya Stadionu", type: "place", lat: 40.400, lng: 49.957, icon: "🏟️" },
  { name: "Baku Crystal Hall", type: "place", lat: 40.363, lng: 49.859, icon: "🎵" },
  { name: "Şəhidlər Xiyabanı", type: "place", lat: 40.370, lng: 49.833, icon: "🕊️" },
  { name: "Gənclik Mall", type: "place", lat: 40.408, lng: 49.868, icon: "🛍️" },
  { name: "Hüseynov Market", type: "place", lat: 40.375, lng: 49.843, icon: "🛒" },
  { name: "Nizami Küçəsi", type: "place", lat: 40.378, lng: 49.848, icon: "🛍️" },
  { name: "Bayıl Logu Körpüsü", type: "place", lat: 40.350, lng: 49.840, icon: "🌉" },
  { name: "Atəşgah Məbədi", type: "place", lat: 40.402, lng: 49.957, icon: "🔥" },
];
