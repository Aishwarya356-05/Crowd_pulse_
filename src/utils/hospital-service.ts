export interface Bed {
  id: string;
  type: 'General' | 'ICU' | 'Emergency' | 'Ventilator';
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';
}

export interface Ambulance {
  id: string;
  hospitalId: string;
  coordinates: [number, number];
  status: 'In-Base' | 'Responding' | 'In-Transit' | 'Maintenance';
  lastIncidentId?: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number]; // [lat, lng]
  contact: string;
  beds: Bed[];
  specialties: string[];
}

const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'h1',
    name: "St. John's Medical College Hospital",
    address: 'Sarjapur Main Rd, John Nagar, Koramangala',
    coordinates: [12.9344, 77.6121],
    contact: '080 2206 5000',
    beds: [
      { id: 'h1-b1', type: 'ICU', status: 'Available' },
      { id: 'h1-b2', type: 'ICU', status: 'Occupied' },
      { id: 'h1-b3', type: 'General', status: 'Available' },
      { id: 'h1-b4', type: 'Ventilator', status: 'Available' },
    ],
    specialties: ['Cardiology', 'Neurology', 'Emergency'],
  },
  {
    id: 'h2',
    name: 'Manipal Hospital Old Airport Road',
    address: '98, HAL Old Airport Rd, Kodihalli',
    coordinates: [12.9592, 77.6444],
    contact: '1800 102 5555',
    beds: [
      { id: 'h2-b1', type: 'ICU', status: 'Occupied' },
      { id: 'h2-b2', type: 'ICU', status: 'Occupied' },
      { id: 'h2-b3', type: 'ICU', status: 'Available' },
      { id: 'h2-b4', type: 'Emergency', status: 'Available' },
    ],
    specialties: ['Oncology', 'Organ Transplant', 'Trauma'],
  },
  {
    id: 'h3',
    name: 'Fortis Hospital Bannerghatta Road',
    address: '154, 9, Bannerghatta Main Rd, opposite IIM-B',
    coordinates: [12.8951, 77.5984],
    contact: '096633 67253',
    beds: [
      { id: 'h3-b1', type: 'ICU', status: 'Available' },
      { id: 'h3-b2', type: 'General', status: 'Occupied' },
      { id: 'h3-b3', type: 'Ventilator', status: 'Occupied' },
    ],
    specialties: ['Cardiac Sciences', 'Orthopaedics', 'Emergency'],
  },
  {
    id: 'h4',
    name: 'Apollo Hospitals Jayanagar',
    address: '212, 2nd Main Rd, Jayanagar 7th Block',
    coordinates: [12.9216, 77.5841],
    contact: '080 2202 5000',
    beds: [
      { id: 'h4-b1', type: 'ICU', status: 'Available' },
      { id: 'h4-b2', type: 'General', status: 'Available' },
    ],
    specialties: ['Emergency', 'Nephrology'],
  },
  {
    id: 'h5',
    name: 'Aster CMI Hospital Hebbal',
    address: 'Kirloskar Rd, Sahakar Nagar, Hebbal',
    coordinates: [13.0622, 77.5944],
    contact: '080 4342 0100',
    beds: [
      { id: 'h5-b1', type: 'ICU', status: 'Available' },
      { id: 'h5-b2', type: 'Ventilator', status: 'Occupied' },
    ],
    specialties: ['Gastrosciences', 'Emergency'],
  },
  {
    id: 'h6',
    name: 'Narayana Health City',
    address: 'Bommasandra Industrial Area, Hosur Road',
    coordinates: [12.8222, 77.6841],
    contact: '080 7122 2222',
    beds: [
      { id: 'h6-b1', type: 'ICU', status: 'Available' },
      { id: 'h6-b2', type: 'General', status: 'Available' },
      { id: 'h6-b3', type: 'Emergency', status: 'Available' },
    ],
    specialties: ['Cardiac Surgery', 'Trauma'],
  },
  {
    id: 'h7',
    name: 'BGS Gleneagles Global Hospital',
    address: 'Kengeri, Uttarahalli Road',
    coordinates: [12.9022, 77.5041],
    contact: '080 2625 5555',
    beds: [
      { id: 'h7-b1', type: 'ICU', status: 'Occupied' },
      { id: 'h7-b2', type: 'General', status: 'Available' },
    ],
    specialties: ['Liver Transplant', 'Emergency'],
  },
  {
    id: 'h8',
    name: 'Cloudnine Hospital Indiranagar',
    address: '7th Main Rd, HAL 2nd Stage, Indiranagar',
    coordinates: [12.9722, 77.6341],
    contact: '080 4020 2222',
    beds: [
      { id: 'h8-b1', type: 'Emergency', status: 'Available' },
      { id: 'h8-b2', type: 'General', status: 'Available' },
    ],
    specialties: ['Maternity', 'Pediatrics'],
  },
  {
    id: 'h9',
    name: 'Sakra World Hospital',
    address: 'Sy no 52/2 & 52/3, Devarabeesanahalli',
    coordinates: [12.9362, 77.6881],
    contact: '080 4969 4969',
    beds: [
      { id: 'h9-b1', type: 'ICU', status: 'Available' },
      { id: 'h9-b2', type: 'Ventilator', status: 'Available' },
    ],
    specialties: ['Neurology', 'Orthopaedics'],
  },
  {
    id: 'h10',
    name: 'Columbia Asia Hospital Whitefield',
    address: 'Survey No. 10P & 12P, Ramagondanahalli',
    coordinates: [12.9562, 77.7481],
    contact: '080 3989 8969',
    beds: [
      { id: 'h10-b1', type: 'ICU', status: 'Occupied' },
      { id: 'h10-b2', type: 'General', status: 'Available' },
    ],
    specialties: ['General Surgery', 'Emergency'],
  },
  {
    id: 'h11',
    name: 'Rainbow Children Hospital Marathahalli',
    address: 'Survey No. 8/5, Marathahalli',
    coordinates: [12.9462, 77.7081],
    contact: '1800 2122',
    beds: [
      { id: 'h11-b1', type: 'Emergency', status: 'Available' },
      { id: 'h11-b2', type: 'General', status: 'Available' },
    ],
    specialties: ['Pediatrics', 'Neonatology'],
  },
  {
    id: 'h12',
    name: 'MS Ramaiah Memorial Hospital',
    address: 'MSR Nagar, MSRIT Post',
    coordinates: [13.0362, 77.5681],
    contact: '080 2360 8888',
    beds: [
      { id: 'h12-b1', type: 'ICU', status: 'Available' },
      { id: 'h12-b2', type: 'General', status: 'Occupied' },
    ],
    specialties: ['Multi-specialty', 'Emergency'],
  },
  {
    id: 'h13',
    name: 'Vydehi Institute of Medical Sciences',
    address: 'Whitefield, Bangalore - 560066',
    coordinates: [12.9762, 77.7281],
    contact: '080 2841 3381',
    beds: [
      { id: 'h13-b1', type: 'ICU', status: 'Available' },
      { id: 'h13-b2', type: 'General', status: 'Available' },
    ],
    specialties: ['Cardiology', 'Oncology'],
  }
];

let hospitals = [...INITIAL_HOSPITALS];

export const getHospitals = () => hospitals;

export const updateBedStatus = (hospitalId: string, bedId: string, status: Bed['status']) => {
  hospitals = hospitals.map(h => {
    if (h.id === hospitalId) {
      return {
        ...h,
        beds: h.beds.map(b => b.id === bedId ? { ...b, status } : b)
      };
    }
    return h;
  });
  return hospitals;
};

export const addBed = (hospitalId: string, bed: Omit<Bed, 'id'>) => {
  hospitals = hospitals.map(h => {
    if (h.id === hospitalId) {
      const newId = `${hospitalId}-b${h.beds.length + 1}`;
      return {
        ...h,
        beds: [...h.beds, { ...bed, id: newId }]
      };
    }
    return h;
  });
  return hospitals;
};

let ambulances: Ambulance[] = [
  { id: 'amb1', hospitalId: 'h1', coordinates: [12.9344, 77.6121], status: 'In-Base' },
  { id: 'amb2', hospitalId: 'h2', coordinates: [12.9592, 77.6444], status: 'In-Base' },
  { id: 'amb3', hospitalId: 'h3', coordinates: [12.8951, 77.5984], status: 'In-Base' },
];

export const getAmbulances = () => ambulances;

export const updateAmbulanceLocation = (id: string, coordinates: [number, number]) => {
    ambulances = ambulances.map(a => a.id === id ? { ...a, coordinates } : a);
    return ambulances;
};

export const getNearestAvailableBed = (lat: number, lng: number, type: Bed['type'] = 'General') => {
  // Simple distance-based sorting for demo
  const availableHospitals = hospitals.filter(h => 
    h.beds.some(b => b.type === type && b.status === 'Available')
  );

  return availableHospitals.sort((a, b) => {
    const distA = Math.sqrt(Math.pow(a.coordinates[0] - lat, 2) + Math.pow(a.coordinates[1] - lng, 2));
    const distB = Math.sqrt(Math.pow(b.coordinates[0] - lat, 2) + Math.pow(b.coordinates[1] - lng, 2));
    return distA - distB;
  })[0];
};
