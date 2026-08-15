/**
 * data.js - Data Store & LocalStorage Management for MUT House Hunter
 */

const STORAGE_KEY = 'mut_house_hunter_listings';
const ADMIN_AUTH_KEY = 'mut_house_hunter_admin_auth';

// Default initial house listings near Murang'a University of Technology (MUT)
const DEFAULT_HOUSES = [
  {
    id: 'house-101',
    title: 'Sunrise Heights Modern Bedsitter',
    description: 'Spacious and brightly lit bedsitter with tiled floor, modern kitchenette, private balcony, instant shower, and 24/7 borehole water supply. Quiet environment ideal for studying, just 5 minutes walk to MUT Main Gate.',
    price: 6500,
    rooms: 'Bedsitter',
    location: 'Near MUT Main Gate, Murang\'a',
    mapLink: 'https://maps.google.com/?q=Muranga+University+of+Technology',
    landlordName: 'Mama Wambui',
    landlordPhone: '0712345678',
    available: true,
    views: 142,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80'
    ],
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'house-102',
    title: 'Kiharu Park Single Room',
    description: 'Affordable and clean single room with shared clean washrooms, perimeter wall with security fence, token electricity, and fast WiFi connection available upon subscription.',
    price: 3800,
    rooms: 'Single Room',
    location: 'Kiharu Estate, Murang\'a',
    mapLink: 'https://maps.google.com/?q=Kiharu+Muranga',
    landlordName: 'Mr. Kamau',
    landlordPhone: '0723456789',
    available: true,
    views: 98,
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
    ],
    createdAt: '2026-08-03T14:30:00Z'
  },
  {
    id: 'house-103',
    title: 'Executive 1-Bedroom Apartment',
    description: 'Spacious 1-bedroom apartment featuring an open plan living room, modern kitchen cabinets, private balcony, hot shower, ample parking space, and CCTV security.',
    price: 11000,
    rooms: '1 Bedroom',
    location: 'University Way, Murang\'a',
    mapLink: 'https://maps.google.com/?q=Muranga+Town',
    landlordName: 'Dr. Njuguna',
    landlordPhone: '0734567890',
    available: true,
    views: 215,
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80'
    ],
    createdAt: '2026-08-04T09:15:00Z'
  },
  {
    id: 'house-104',
    title: 'Apex Student Haven Bedsitter',
    description: 'Self-contained bedsitter specially designed for students. Includes study desk area, high speed fibre internet ready, secure gate with caretaker on site, and regular trash collection.',
    price: 5500,
    rooms: 'Bedsitter',
    location: 'Near MUT Back Gate, Murang\'a',
    mapLink: 'https://maps.google.com/?q=Muranga+University+of+Technology',
    landlordName: 'Madam Grace',
    landlordPhone: '0745678901',
    available: true,
    views: 180,
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    ],
    createdAt: '2026-08-05T11:20:00Z'
  },
  {
    id: 'house-105',
    title: 'Greenview 2-Bedroom Residential House',
    description: 'Perfect for shared living among friends or staff. Generous sitting room, dining area, master ensuite, full kitchen with pantry, backup water tank, and peaceful garden courtyard.',
    price: 16000,
    rooms: '2 Bedroom',
    location: 'Milimani Estate, Murang\'a',
    mapLink: 'https://maps.google.com/?q=Milimani+Muranga',
    landlordName: 'Eng. Mwangi',
    landlordPhone: '0756789012',
    available: false,
    views: 310,
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
    ],
    createdAt: '2026-08-06T16:45:00Z'
  }
];

// Initialize LocalStorage Data
function initStorage() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_HOUSES));
  }
}

// Fetch all houses
function getAllHouses() {
  initStorage();
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : DEFAULT_HOUSES;
  } catch (err) {
    console.error('Failed to read houses from localStorage:', err);
    return DEFAULT_HOUSES;
  }
}

// Save all houses to localStorage
function saveAllHouses(houses) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(houses));
    // Trigger custom event so UI updates instantly
    window.dispatchEvent(new Event('housesUpdated'));
  } catch (err) {
    console.error('Failed to save houses to localStorage:', err);
  }
}

// Add a new house listing
function addHouse(houseData) {
  const houses = getAllHouses();
  const newHouse = {
    id: 'house-' + Date.now(),
    title: houseData.title,
    description: houseData.description || '',
    price: Number(houseData.price),
    rooms: houseData.rooms,
    location: houseData.location,
    mapLink: houseData.mapLink || '',
    landlordName: houseData.landlordName,
    landlordPhone: houseData.landlordPhone,
    available: houseData.available !== undefined ? Boolean(houseData.available) : true,
    views: 0,
    images: houseData.images && houseData.images.length > 0 ? houseData.images : [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
    ],
    createdAt: new Date().toISOString()
  };
  
  houses.unshift(newHouse);
  saveAllHouses(houses);
  return newHouse;
}

// Update existing house listing
function updateHouse(id, houseData) {
  const houses = getAllHouses();
  const index = houses.findIndex(h => h.id === id);
  if (index === -1) return null;
  
  houses[index] = {
    ...houses[index],
    title: houseData.title,
    description: houseData.description || '',
    price: Number(houseData.price),
    rooms: houseData.rooms,
    location: houseData.location,
    mapLink: houseData.mapLink || '',
    landlordName: houseData.landlordName,
    landlordPhone: houseData.landlordPhone,
    available: houseData.available !== undefined ? Boolean(houseData.available) : houses[index].available,
    images: houseData.images && houseData.images.length > 0 ? houseData.images : houses[index].images,
    updatedAt: new Date().toISOString()
  };
  
  saveAllHouses(houses);
  return houses[index];
}

// Delete house listing
function deleteHouse(id) {
  const houses = getAllHouses();
  const filtered = houses.filter(h => h.id !== id);
  saveAllHouses(filtered);
  return true;
}

// Toggle house availability status
function toggleHouseAvailability(id) {
  const houses = getAllHouses();
  const house = houses.find(h => h.id === id);
  if (house) {
    house.available = !house.available;
    saveAllHouses(houses);
    return house;
  }
  return null;
}

// Increment view count for house
function incrementHouseViews(id) {
  const houses = getAllHouses();
  const house = houses.find(h => h.id === id);
  if (house) {
    house.views = (house.views || 0) + 1;
    saveAllHouses(houses);
  }
}

const PAYMENTS_KEY = 'mut_house_hunter_payments';

function isVisitingFeePaid(houseId) {
  try {
    const raw = localStorage.getItem(PAYMENTS_KEY);
    const payments = raw ? JSON.parse(raw) : [];
    return payments.some(p => p.houseId === houseId);
  } catch (e) {
    return false;
  }
}

function recordVisitingFeePayment(houseId, phone, mpesaRef) {
  try {
    const raw = localStorage.getItem(PAYMENTS_KEY);
    const payments = raw ? JSON.parse(raw) : [];
    payments.push({
      houseId,
      phone,
      mpesaRef: mpesaRef || 'RKB' + Math.floor(100000 + Math.random() * 900000) + 'X',
      amount: 100,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
    window.dispatchEvent(new Event('paymentUpdated'));
  } catch (e) {
    console.error('Failed to save payment record:', e);
  }
}

// Developer Admin Authentication helper
function isDeveloperAuthenticated() {
  return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
}

function setDeveloperAuthenticated(status) {
  if (status) {
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
  } else {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
  }
}

// Expose globally
window.DataStore = {
  getAllHouses,
  saveAllHouses,
  addHouse,
  updateHouse,
  deleteHouse,
  toggleHouseAvailability,
  incrementHouseViews,
  isDeveloperAuthenticated,
  setDeveloperAuthenticated,
  isVisitingFeePaid,
  recordVisitingFeePayment
};
