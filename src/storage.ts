import { Vessel, Port, CargoType, Crew, Voyage, TrackingLog, MaintenanceRecord } from './types';

export const initialVessels: Vessel[] = [
  { id: 'v1', name: 'KM Nusantara Prima', type: 'Container', dwt: 15000, speed: 18.5, status: 'Berlayar', currentLocation: 'Selat Sunda', yearBuilt: 2018 },
  { id: 'v2', name: 'KM Samudera Jaya', type: 'Bulk Carrier', dwt: 28000, speed: 14.2, status: 'Sandar', currentLocation: 'Pelabuhan Tanjung Priok', yearBuilt: 2015 },
  { id: 'v3', name: 'KM Baruna Express', type: 'Ro-Ro', dwt: 8500, speed: 21.0, status: 'Berlayar', currentLocation: 'Selat Madura', yearBuilt: 2021 },
  { id: 'v4', name: 'KM Petro Tanker 01', type: 'Tanker', dwt: 42000, speed: 12.8, status: 'Perawatan', currentLocation: 'Docking Surabaya', yearBuilt: 2012 },
  { id: 'v5', name: 'KM Mina Sejahtera', type: 'General Cargo', dwt: 5000, speed: 10.5, status: 'Standby', currentLocation: 'Pelabuhan Makassar', yearBuilt: 2019 }
];

export const initialPorts: Port[] = [
  { id: 'p1', code: 'JKT', name: 'Pelabuhan Tanjung Priok', country: 'Indonesia', coordinates: '-6.105, 106.877' },
  { id: 'p2', code: 'SBY', name: 'Pelabuhan Tanjung Perak', country: 'Indonesia', coordinates: '-7.199, 112.733' },
  { id: 'p3', code: 'SUB', name: 'Pelabuhan Soekarno-Hatta', country: 'Indonesia', coordinates: '-5.135, 119.412' },
  { id: 'p4', code: 'BLW', name: 'Pelabuhan Belawan', country: 'Indonesia', coordinates: '3.785, 98.685' },
  { id: 'p5', code: 'SGP', name: 'Port of Singapore', country: 'Singapore', coordinates: '1.290, 103.851' }
];

export const initialCargoTypes: CargoType[] = [
  { id: 'c1', name: 'Container 20ft / 40ft', category: 'General', ratePerTon: 450000 },
  { id: 'c2', name: 'Batu Bara (Coal)', category: 'Dry Bulk', ratePerTon: 220000 },
  { id: 'c3', name: 'Minyak Mentah (Crude Oil)', category: 'Liquid Bulk', ratePerTon: 650000 },
  { id: 'c4', name: 'Kendaraan Bermotor (Ro-Ro)', category: 'Vehicles', ratePerTon: 850000 },
  { id: 'c5', name: 'Bahan Pokok (Sembako)', category: 'Consumer Goods', ratePerTon: 310000 }
];

export const initialCrew: Crew[] = [
  { id: 'cr1', name: 'Capt. Rahmat Hidayat', position: 'Kapten', phone: '081234567890', certification: 'ANT-I' },
  { id: 'cr2', name: 'Ahmad Fauzi, S.Tr.Pel', position: 'Mualim 1', phone: '081345678901', certification: 'ANT-II' },
  { id: 'cr3', name: 'Bambang Sudarmono', position: 'KKM', phone: '081567890123', certification: 'ATT-I' }
];

export const initialVoyages: Voyage[] = [
  { id: 'voy1', noVoyage: 'VOY-2026-001', vesselName: 'KM Nusantara Prima', origin: 'Pelabuhan Tanjung Priok', destination: 'Port of Singapore', cargoType: 'Container 20ft / 40ft', tonnage: 12000, revenue: 5400000000, status: 'In Transit', departureDate: '2026-10-01', arrivalDate: '2026-10-05' },
  { id: 'voy2', noVoyage: 'VOY-2026-002', vesselName: 'KM Baruna Express', origin: 'Pelabuhan Tanjung Perak', destination: 'Pelabuhan Soekarno-Hatta', cargoType: 'Kendaraan Bermotor (Ro-Ro)', tonnage: 4500, revenue: 3825000000, status: 'In Transit', departureDate: '2026-10-02', arrivalDate: '2026-10-04' },
  { id: 'voy3', noVoyage: 'VOY-2026-003', vesselName: 'KM Samudera Jaya', origin: 'Pelabuhan Belawan', destination: 'Pelabuhan Tanjung Priok', cargoType: 'Batu Bara (Coal)', tonnage: 25000, revenue: 5500000000, status: 'Scheduled', departureDate: '2026-10-05', arrivalDate: '2026-10-09' }
];

export const initialTrackingLogs: TrackingLog[] = [
  { id: 'tr1', voyageId: 'voy1', lat: -5.2, lng: 106.5, speed: 16.5, weather: 'Cerah', note: 'Navigasi lancar, cuaca mendukung', timestamp: new Date().toISOString() }
];

export const initialMaintenance: MaintenanceRecord[] = [
  { id: 'm1', vesselName: 'KM Petro Tanker 01', type: 'Drydock', cost: 1500000000, date: '2026-09-15', description: 'Drydock tahunan di Surabaya' }
];

// LocalStorage persistence helpers
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem('oceanfleet_' + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem('oceanfleet_' + key, JSON.stringify(data));
  } catch (e) {
    console.error("Storage error:", e);
  }
}
