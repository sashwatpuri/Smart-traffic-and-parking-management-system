import TrafficSignal from '../models/TrafficSignal.js';
import ParkingSpot from '../models/ParkingSpot.js';
import ParkingZone from '../models/ParkingZone.js';

const INTERSECTIONS = [
  { signalId: 'SIG001', name: 'MG Road & FC Road',          lat: 18.5204, lng: 73.8567 },
  { signalId: 'SIG002', name: 'Shivaji Nagar Station',      lat: 18.5308, lng: 73.8474 },
  { signalId: 'SIG003', name: 'Deccan Gymkhana',            lat: 18.5164, lng: 73.8395 },
  { signalId: 'SIG004', name: 'Pune University Circle',     lat: 18.5590, lng: 73.8261 },
  { signalId: 'SIG005', name: 'Hadapsar Junction',          lat: 18.5074, lng: 73.9264 },
  { signalId: 'SIG006', name: 'Kothrud Square',             lat: 18.5074, lng: 73.8088 }
];

const PARKING_ZONES = [
  { zoneId: 'HUB-SIDD', zone: 'Siddheshwar Temple',      count: 168, pricePerHour: 80,  lat: 17.6744, lng: 75.9064 },
  { zoneId: 'HUB-BALI', zone: 'Balives (Old Mill)',      count: 168, pricePerHour: 50,  lat: 17.6780, lng: 75.9100 },
  { zoneId: 'HUB-NAVI', zone: 'Navi Peth Market',        count: 168, pricePerHour: 100, lat: 17.6800, lng: 75.9050 },
  { zoneId: 'HUB-RAIL', zone: 'Solapur Railway Station', count: 168, pricePerHour: 40,  lat: 17.6690, lng: 75.9220 },
  { zoneId: 'HUB-BHUI', zone: 'Bhuikot Fort Area',       count: 168, pricePerHour: 30,  lat: 17.6710, lng: 75.9130 },
  { zoneId: 'HUB-HOTG', zone: 'Hotgi Road (Soham Mall)', count: 168, pricePerHour: 120, lat: 17.6600, lng: 75.9300 },
  { zoneId: 'HUB-STAN', zone: 'ST Stand (Central)',      count: 168, pricePerHour: 60,  lat: 17.6700, lng: 75.9000 },
  { zoneId: 'ZONE-1',   zone: 'Zone 1',                  count: 120, pricePerHour: 20,  lat: 17.6750, lng: 75.9200 },
  { zoneId: 'ZONE-2',   zone: 'Zone 2',                  count: 120, pricePerHour: 20,  lat: 17.6760, lng: 75.9210 },
  { zoneId: 'ZONE-3',   zone: 'Zone 3',                  count: 120, pricePerHour: 25,  lat: 17.6770, lng: 75.9220 },
  { zoneId: 'ZONE-4',   zone: 'Zone 4',                  count: 120, pricePerHour: 30,  lat: 17.6780, lng: 75.9230 },
  { zoneId: 'ZONE-5',   zone: 'Zone 5',                  count: 120, pricePerHour: 35,  lat: 17.6790, lng: 75.9240 },
  { zoneId: 'ZONE-6',   zone: 'Zone 6',                  count: 120, pricePerHour: 15,  lat: 17.6800, lng: 75.9250 },
  { zoneId: 'ZONE-7',   zone: 'Zone 7',                  count: 120, pricePerHour: 10,  lat: 17.6810, lng: 75.9260 },
  { zoneId: 'ZONE-8',   zone: 'Zone 8',                  count: 120, pricePerHour: 10,  lat: 17.6820, lng: 75.9270 }
];

export async function initializeTrafficSimulation(io) {
  // ── Cleanup ALL parking data for deep synchronization ──
  await ParkingZone.deleteMany({});
  await ParkingSpot.deleteMany({});
  console.log('🧹 Deep cleaned ALL parking data for global sync re-seed');

  // ── Initialize traffic signals ──────────────────────────────────────────────
  for (const intersection of INTERSECTIONS) {
    const exists = await TrafficSignal.findOne({ signalId: intersection.signalId });
    if (!exists) {
      await TrafficSignal.create({
        signalId: intersection.signalId,
        name: intersection.name,
        location: {
          name: intersection.name,
          lat: intersection.lat,
          lng: intersection.lng
        },
        status: 'green',
        currentTimer: 30,
        timings: { green: 30, yellow: 5, red: 30 },
        vehicleCount: Math.floor(Math.random() * 50),
        congestionLevel: 'low',
        connectedSignals: INTERSECTIONS
          .filter(i => i.signalId !== intersection.signalId)
          .slice(0, 2)
          .map(i => i.signalId),
        mode: 'auto',
        isActive: true,
        lastUpdated: new Date()
      });
    }
  }

  // ── Initialize parking zones & spots ────────────────────────────────────────
  for (const zoneData of PARKING_ZONES) {
    // Create zone if it doesn't exist
    const zoneExists = await ParkingZone.findOne({ zoneId: zoneData.zoneId });
    if (!zoneExists) {
      await ParkingZone.create({
        zoneId: zoneData.zoneId,
        name: zoneData.zone,
        location: {
          name: zoneData.zone,
          lat: zoneData.lat,
          lng: zoneData.lng
        },
        totalSpots: zoneData.count,
        pricePerHour: zoneData.pricePerHour,
        currency: 'INR',
        isActive: true,
        stats: {
          available: zoneData.count,
          occupied: 0,
          reserved: 0,
          revenue: 0
        }
      });
    }

    // Create spots for the zone
    for (let i = 1; i <= zoneData.count; i++) {
      const spotId = `${zoneData.zoneId}-${String(i).padStart(3, '0')}`;
      const exists = await ParkingSpot.findOne({ spotId });
      if (!exists) {
        let type = 'regular';
        if (i <= 2) type = 'disabled';
        else if (i === 3) type = 'ev';

        await ParkingSpot.create({
          spotId,
          zoneId: zoneData.zoneId,
          zone: zoneData.zone,
          location: {
            name: `${zoneData.zone} Parking`,
            lat: zoneData.lat + (Math.random() - 0.5) * 0.002,
            lng: zoneData.lng + (Math.random() - 0.5) * 0.002
          },
          status: Math.random() > 0.3 ? 'available' : 'occupied',
          type,
          vehicleCategory: i <= (zoneData.count * 0.4) ? '2-wheeler' : '4-wheeler',
          floor: Math.floor(i / 20),
          pricePerHour: i <= (zoneData.count * 0.4) ? Math.floor(zoneData.pricePerHour * 0.5) : zoneData.pricePerHour,
          currency: 'INR',
          isActive: true
        });
      }
    }
  }

  // Ensure pricing is consistent across all spots
  await ParkingSpot.updateMany(
    { pricePerHour: { $exists: false } },
    { $set: { pricePerHour: 20, currency: 'INR' } }
  );

  // ── Start traffic simulation loop ────────────────────────────────────────────
  setInterval(async () => {
    try {
      const signals = await TrafficSignal.find({ mode: 'auto', isActive: true });

      for (const signal of signals) {
        const vehicleCount = Math.floor(Math.random() * 100);
        let congestionLevel = 'low';
        let timer = signal.timings?.green || 30;

        if (vehicleCount > 80) {
          congestionLevel = 'critical';
          timer = 90;
        } else if (vehicleCount > 60) {
          congestionLevel = 'high';
          timer = 60;
        } else if (vehicleCount > 35) {
          congestionLevel = 'medium';
          timer = 45;
        }

        const statuses = ['green', 'yellow', 'red'];
        const currentIndex = statuses.indexOf(signal.status);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];

        signal.vehicleCount = vehicleCount;
        signal.congestionLevel = congestionLevel;
        signal.currentTimer = timer;
        signal.status = nextStatus;
        signal.lastUpdated = new Date();

        await signal.save();
      }

      io.emit('traffic-update', signals);
    } catch (err) {
      // Silently handle simulation errors — don't crash the server
      console.error('Traffic simulation error:', err.message);
    }
  }, 5000);

  console.log('✅ Traffic simulation initialized with 8 parking zones and 6 signals');
}
