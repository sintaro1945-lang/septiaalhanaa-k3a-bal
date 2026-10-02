export type UserRole = 'admin' | 'manager' | 'dispatcher' | 'captain';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

export interface Vessel {
  id: string;
  name: string;
  type: 'Container' | 'Bulk Carrier' | 'Tanker' | 'Ro-Ro' | 'General Cargo';
  dwt: number;
  speed: number; // knots
  status: 'Berlayar' | 'Sandar' | 'Perawatan' | 'Standby';
  currentLocation: string;
  yearBuilt: number;
}

export interface Port {
  id: string;
  code: string;
  name: string;
  country: string;
  coordinates: string;
}

export interface CargoType {
  id: string;
  name: string;
  category: string;
  ratePerTon: number; // IDR or USD
}

export interface Crew {
  id: string;
  name: string;
  position: 'Kapten' | 'Mualim 1' | 'KKM' | 'ABK' | 'Operasional';
  vesselId?: string;
  phone: string;
  certification: string;
}

export interface Voyage {
  id: string;
  noVoyage: string;
  vesselId?: string;
  vesselName: string;
  origin: string;
  destination: string;
  cargoType: string;
  tonnage: number;
  revenue: number;
  status: 'Scheduled' | 'In Transit' | 'Arrived' | 'Delayed';
  departureDate: string;
  arrivalDate: string;
}

export interface TrackingLog {
  id: string;
  voyageId: string;
  lat: number;
  lng: number;
  speed: number;
  weather: 'Cerah' | 'Berawan' | 'Hujan Ringan' | 'Badai / Ombak Besar';
  note: string;
  timestamp: string;
}

export interface MaintenanceRecord {
  id: string;
  vesselId?: string;
  vesselName: string;
  type: 'Perawatan Berkala' | 'Perbaikan Mesin' | 'Drydock' | 'Bunker BBM';
  cost: number;
  date: string;
  description: string;
}
