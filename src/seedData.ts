import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';

export async function checkAndSeedDatabase() {
  try {
    const vesselsSnap = await getDocs(collection(db, 'vessels'));
    if (vesselsSnap.empty) {
      // Seed default vessels
      const defaultVessels = [
        { name: 'KM Nusantara Prima', type: 'Container', dwt: 15000, speed: 18.5, status: 'Berlayar', currentLocation: 'Selat Sunda', yearBuilt: 2018 },
        { name: 'KM Samudera Jaya', type: 'Bulk Carrier', dwt: 28000, speed: 14.2, status: 'Sandar', currentLocation: 'Pelabuhan Tanjung Priok', yearBuilt: 2015 },
        { name: 'KM Baruna Express', type: 'Ro-Ro', dwt: 8500, speed: 21.0, status: 'Berlayar', currentLocation: 'Selat Madura', yearBuilt: 2021 },
        { name: 'KM Petro Tanker 01', type: 'Tanker', dwt: 42000, speed: 12.8, status: 'Perawatan', currentLocation: 'Docking Surabaya', yearBuilt: 2012 },
        { name: 'KM Mina Sejahtera', type: 'General Cargo', dwt: 5000, speed: 10.5, status: 'Standby', currentLocation: 'Pelabuhan Makassar', yearBuilt: 2019 }
      ];

      for (const v of defaultVessels) {
        await addDoc(collection(db, 'vessels'), v);
      }
    }

    const portsSnap = await getDocs(collection(db, 'ports'));
    if (portsSnap.empty) {
      const defaultPorts = [
        { code: 'JKT', name: 'Pelabuhan Tanjung Priok', country: 'Indonesia', coordinates: '-6.105, 106.877' },
        { code: 'SBY', name: 'Pelabuhan Tanjung Perak', country: 'Indonesia', coordinates: '-7.199, 112.733' },
        { code: 'SUB', name: 'Pelabuhan Soekarno-Hatta', country: 'Indonesia', coordinates: '-5.135, 119.412' },
        { code: 'BLW', name: 'Pelabuhan Belawan', country: 'Indonesia', coordinates: '3.785, 98.685' },
        { code: 'SGP', name: 'Port of Singapore', country: 'Singapore', coordinates: '1.290, 103.851' }
      ];
      for (const p of defaultPorts) {
        await addDoc(collection(db, 'ports'), p);
      }
    }

    const cargoSnap = await getDocs(collection(db, 'cargoTypes'));
    if (cargoSnap.empty) {
      const defaultCargos = [
        { name: 'Container 20ft / 40ft', category: 'General', ratePerTon: 450000 },
        { name: 'Batu Bara (Coal)', category: 'Dry Bulk', ratePerTon: 220000 },
        { name: 'Minyak Mentah (Crude Oil)', category: 'Liquid Bulk', ratePerTon: 650000 },
        { name: 'Kendaraan Bermotor (Ro-Ro)', category: 'Vehicles', ratePerTon: 850000 },
        { name: 'Bahan Pokok (Sembako)', category: 'Consumer Goods', ratePerTon: 310000 }
      ];
      for (const c of defaultCargos) {
        await addDoc(collection(db, 'cargoTypes'), c);
      }
    }

    const voyageSnap = await getDocs(collection(db, 'voyages'));
    if (voyageSnap.empty) {
      const defaultVoyages = [
        { noVoyage: 'VOY-2026-001', vesselName: 'KM Nusantara Prima', origin: 'Pelabuhan Tanjung Priok', destination: 'Port of Singapore', cargoType: 'Container 20ft / 40ft', tonnage: 12000, revenue: 5400000000, status: 'In Transit', departureDate: '2026-10-01', arrivalDate: '2026-10-05' },
        { noVoyage: 'VOY-2026-002', vesselName: 'KM Baruna Express', origin: 'Pelabuhan Tanjung Perak', destination: 'Pelabuhan Soekarno-Hatta', cargoType: 'Kendaraan Bermotor (Ro-Ro)', tonnage: 4500, revenue: 3825000000, status: 'In Transit', departureDate: '2026-10-02', arrivalDate: '2026-10-04' },
        { noVoyage: 'VOY-2026-003', vesselName: 'KM Samudera Jaya', origin: 'Pelabuhan Belawan', destination: 'Pelabuhan Tanjung Priok', cargoType: 'Batu Bara (Coal)', tonnage: 25000, revenue: 5500000000, status: 'Scheduled', departureDate: '2026-10-05', arrivalDate: '2026-10-09' }
      ];
      for (const voy of defaultVoyages) {
        await addDoc(collection(db, 'voyages'), voy);
      }
    }
  } catch (error) {
    console.error("Seeding error:", error);
  }
}
