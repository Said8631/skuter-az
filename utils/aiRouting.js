export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function recommendRoutes(userLocation, destination, scooters) {
  const walkingSpeed = 5; // km/h
  const scooterSpeed = 15; // km/h

  let routes = [];

  for (let s of scooters) {
    const walkDist = calculateDistance(userLocation.lat, userLocation.lng, s.lat, s.lng);
    const rideDist = calculateDistance(s.lat, s.lng, destination.lat, destination.lng);
    
    // Check if within battery range
    const maxRange = (s.battery / 100) * 20; // assumed 20km for 100%
    if (rideDist > maxRange) continue;

    const walkTimeMin = (walkDist / walkingSpeed) * 60;
    const rideTimeMin = (rideDist / scooterSpeed) * 60;
    const totalTime = walkTimeMin + rideTimeMin;
    
    // Calculated cost: base price to unlock + price per min
    // Ensure if time is extremely short, it is rounded to at least 1 minute of ride time
    const actualRideTime = Math.max(1, rideTimeMin);
    const cost = s.basePrice + (actualRideTime * s.pricePerMin);

    routes.push({
        type: "direct",
        code: s.company.toLowerCase(),
        company: s.company,
        scooter: s,
        walkTime: Math.round(walkTimeMin),
        rideTime: Math.round(rideTimeMin),
        totalTime: Math.round(totalTime),
        cost: Number(cost.toFixed(2)),
        steps: [
          `Piyada: ${s.company} skuterinə qədər (${Math.round(walkTimeMin)} dəq)`,
          `Skuterlə: İstədiyiniz yerə qədər (${Math.round(actualRideTime)} dəq)`
        ],
        path: [
           [userLocation.lat, userLocation.lng], // walk start
           [s.lat, s.lng], // walk end, scooter start
           [destination.lat, destination.lng] // scooter end
        ]
    });
  }

  // Sort by cost + time score
  routes.sort((a,b) => (a.totalTime * 0.5 + a.cost * 10) - (b.totalTime * 0.5 + b.cost * 10));
  
  // Return top 3 variants, mark the first one as recommended
  const topRoutes = routes.slice(0, 3);
  if (topRoutes.length > 0) {
      topRoutes[0].recommended = true;
      topRoutes[0].name = "Ən Yaxşı Seçim";
      if(topRoutes[1]) topRoutes[1].name = "Alternativ";
      if(topRoutes[2]) topRoutes[2].name = "Alternativ";
  }

  return topRoutes;
}
