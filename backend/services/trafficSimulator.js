import TrafficSignal from '../models/TrafficSignal.js';
import ParkingSpot from '../models/ParkingSpot.js';

const INTERSECTIONS = [
  { signalId: 'SIG001', name: 'Main St & 1st Ave', lat: 40.7128, lng: -74.0060 },
  { signalId: 'SIG002', name: 'Main St & 2nd Ave', lat: 40.7138, lng: -74.0070 },
  { signalId: 'SIG003', name: 'Park Ave & 1st St', lat: 40.7148, lng: -74.0080 },
  { signalId: 'SIG004', name: 'Park Ave & 2nd St', lat: 40.7158, lng: -74.0090 },
  { signalId: 'SIG005', name: 'Broadway & 5th Ave', lat: 40.7168, lng: -74.0100 },
  { signalId: 'SIG006', name: 'Central Plaza', lat: 40.7178, lng: -74.0110 }
];

const PARKING_ZONES = [
  { zone: 'Zone A', count: 20, lat: 40.7128, lng: -74.0060 },
  { zone: 'Zone B', count: 15, lat: 40.7148, lng: -74.0080 },
  { zone: 'Zone C', count: 25, lat: 40.7168, lng: -74.0100 }
];

export async function initializeTrafficSimulation(io) {
  // Initialize traffic signals
  for (const intersection of INTERSECTIONS) {
    const exists = await TrafficSignal.findOne({ signalId: intersection.signalId });
    if (!exists) {
      await TrafficSignal.create({
        signalId: intersection.signalId,
        location: {
          name: intersection.name,
          lat: intersection.lat,
          lng: intersection.lng
        },
        status: 'green',
        currentTimer: 30,
        vehicleCount: Math.floor(Math.random() * 50),
        congestionLevel: 'low',
        connectedSignals: INTERSECTIONS
          .filter(i => i.signalId !== intersection.signalId)
          .slice(0, 2)
          .map(i => i.signalId)
      });
    }
  }

  // Initialize parking spots
  for (const zone of PARKING_ZONES) {
    for (let i = 1; i <= zone.count; i++) {
      const spotId = `${zone.zone}-${String(i).padStart(3, '0')}`;
      const exists = await ParkingSpot.findOne({ spotId });
      if (!exists) {
        await ParkingSpot.create({
          spotId,
          zone: zone.zone,
          location: {
            name: `${zone.zone} Parking`,
            lat: zone.lat + (Math.random() - 0.5) * 0.01,
            lng: zone.lng + (Math.random() - 0.5) * 0.01
          },
          status: Math.random() > 0.3 ? 'available' : 'occupied',
          type: Math.random() > 0.9 ? 'disabled' : 'regular',
          pricePerHour: 20,
          currency: 'INR'
        });
      }
    }
  }

  // Enforce standard India pricing across all existing spots.
  await ParkingSpot.updateMany({}, { $set: { pricePerHour: 20, currency: 'INR' } });

  // Simulate traffic updates
  setInterval(async () => {
    const signals = await TrafficSignal.find({ mode: 'auto' });
    
    for (const signal of signals) {
      const vehicleCount = Math.floor(Math.random() * 100);
      let congestionLevel = 'low';
      let timer = 30;

      if (vehicleCount > 70) {
        congestionLevel = 'high';
        timer = 60;
      } else if (vehicleCount > 40) {
        congestionLevel = 'medium';
        timer = 45;
      }

      // Cycle through signals
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
  }, 5000);

  console.log('✅ Traffic simulation initialized');
}
