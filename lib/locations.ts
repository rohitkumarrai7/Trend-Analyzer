// Major cities with Twitter WOEID (Where On Earth ID)
// Twitter trends are available for ~400 locations worldwide

export interface Location {
    name: string;
    country: string;
    woeid: number;
    lat: number;
    lng: number;
    population?: number;
}

export const LOCATIONS: Location[] = [
    // India
    { name: 'Worldwide', country: 'Global', woeid: 1, lat: 20, lng: 0 },
    { name: 'India', country: 'India', woeid: 23424848, lat: 20.5937, lng: 78.9629 },
    { name: 'Delhi', country: 'India', woeid: 20070458, lat: 28.6139, lng: 77.2090, population: 32000000 },
    { name: 'Mumbai', country: 'India', woeid: 2295411, lat: 19.0760, lng: 72.8777, population: 21000000 },
    { name: 'Bangalore', country: 'India', woeid: 2295420, lat: 12.9716, lng: 77.5946, population: 12000000 },
    { name: 'Hyderabad', country: 'India', woeid: 2295414, lat: 17.3850, lng: 78.4867, population: 10000000 },
    { name: 'Chennai', country: 'India', woeid: 2295424, lat: 13.0827, lng: 80.2707, population: 11000000 },
    { name: 'Kolkata', country: 'India', woeid: 2295386, lat: 22.5726, lng: 88.3639, population: 14800000 },
    { name: 'Pune', country: 'India', woeid: 2295412, lat: 18.5204, lng: 73.8567, population: 6800000 },
    { name: 'Ahmedabad', country: 'India', woeid: 2295387, lat: 23.0225, lng: 72.5714, population: 8000000 },
    { name: 'Jaipur', country: 'India', woeid: 2295401, lat: 26.9124, lng: 75.7873, population: 4000000 },
    { name: 'Lucknow', country: 'India', woeid: 2295377, lat: 26.8467, lng: 80.9462, population: 3500000 },
    { name: 'Surat', country: 'India', woeid: 2295405, lat: 21.1702, lng: 72.8311, population: 6500000 },

    // USA
    { name: 'United States', country: 'USA', woeid: 23424977, lat: 37.0902, lng: -95.7129 },
    { name: 'New York', country: 'USA', woeid: 2459115, lat: 40.7128, lng: -74.0060, population: 8300000 },
    { name: 'Los Angeles', country: 'USA', woeid: 2442047, lat: 34.0522, lng: -118.2437, population: 3900000 },
    { name: 'Chicago', country: 'USA', woeid: 2379574, lat: 41.8781, lng: -87.6298, population: 2700000 },
    { name: 'Houston', country: 'USA', woeid: 2424766, lat: 29.7604, lng: -95.3698, population: 2300000 },
    { name: 'San Francisco', country: 'USA', woeid: 2487956, lat: 37.7749, lng: -122.4194, population: 880000 },
    { name: 'Seattle', country: 'USA', woeid: 2490383, lat: 47.6062, lng: -122.3321, population: 750000 },
    { name: 'Miami', country: 'USA', woeid: 2450022, lat: 25.7617, lng: -80.1918, population: 450000 },
    { name: 'Boston', country: 'USA', woeid: 2367105, lat: 42.3601, lng: -71.0589, population: 700000 },
    { name: 'Las Vegas', country: 'USA', woeid: 2436704, lat: 36.1699, lng: -115.1398, population: 650000 },
    { name: 'Washington DC', country: 'USA', woeid: 2514815, lat: 38.9072, lng: -77.0369, population: 700000 },

    // UK & Europe
    { name: 'United Kingdom', country: 'UK', woeid: 23424975, lat: 55.3781, lng: -3.4360 },
    { name: 'London', country: 'UK', woeid: 44418, lat: 51.5074, lng: -0.1278, population: 9000000 },
    { name: 'Manchester', country: 'UK', woeid: 28218, lat: 53.4808, lng: -2.2426, population: 550000 },
    { name: 'Birmingham', country: 'UK', woeid: 12723, lat: 52.4862, lng: -1.8904, population: 1150000 },
    { name: 'Paris', country: 'France', woeid: 615702, lat: 48.8566, lng: 2.3522, population: 2200000 },
    { name: 'Berlin', country: 'Germany', woeid: 638242, lat: 52.5200, lng: 13.4050, population: 3600000 },
    { name: 'Madrid', country: 'Spain', woeid: 766273, lat: 40.4168, lng: -3.7038, population: 3300000 },
    { name: 'Rome', country: 'Italy', woeid: 721943, lat: 41.9028, lng: 12.4964, population: 2800000 },
    { name: 'Amsterdam', country: 'Netherlands', woeid: 727232, lat: 52.3676, lng: 4.9041, population: 870000 },

    // Asia Pacific
    { name: 'Japan', country: 'Japan', woeid: 23424856, lat: 36.2048, lng: 138.2529 },
    { name: 'Tokyo', country: 'Japan', woeid: 1118370, lat: 35.6762, lng: 139.6503, population: 14000000 },
    { name: 'Osaka', country: 'Japan', woeid: 15015370, lat: 34.6937, lng: 135.5023, population: 2700000 },
    { name: 'Singapore', country: 'Singapore', woeid: 23424948, lat: 1.3521, lng: 103.8198, population: 5900000 },
    { name: 'Hong Kong', country: 'China', woeid: 24865698, lat: 22.3193, lng: 114.1694, population: 7500000 },
    { name: 'Seoul', country: 'South Korea', woeid: 1132599, lat: 37.5665, lng: 126.9780, population: 9700000 },
    { name: 'Sydney', country: 'Australia', woeid: 1105779, lat: -33.8688, lng: 151.2093, population: 5300000 },
    { name: 'Melbourne', country: 'Australia', woeid: 1103816, lat: -37.8136, lng: 144.9631, population: 5000000 },
    { name: 'Dubai', country: 'UAE', woeid: 1940345, lat: 25.2048, lng: 55.2708, population: 3400000 },

    // South America
    { name: 'Brazil', country: 'Brazil', woeid: 23424768, lat: -14.2350, lng: -51.9253 },
    { name: 'São Paulo', country: 'Brazil', woeid: 455827, lat: -23.5505, lng: -46.6333, population: 12300000 },
    { name: 'Rio de Janeiro', country: 'Brazil', woeid: 455825, lat: -22.9068, lng: -43.1729, population: 6700000 },
    { name: 'Buenos Aires', country: 'Argentina', woeid: 468739, lat: -34.6037, lng: -58.3816, population: 3100000 },
    { name: 'Mexico City', country: 'Mexico', woeid: 116545, lat: 19.4326, lng: -99.1332, population: 9200000 },

    // Africa & Middle East
    { name: 'South Africa', country: 'South Africa', woeid: 23424942, lat: -30.5595, lng: 22.9375 },
    { name: 'Johannesburg', country: 'South Africa', woeid: 1582504, lat: -26.2041, lng: 28.0473, population: 5800000 },
    { name: 'Cairo', country: 'Egypt', woeid: 1521894, lat: 30.0444, lng: 31.2357, population: 10000000 },
    { name: 'Lagos', country: 'Nigeria', woeid: 1398823, lat: 6.5244, lng: 3.3792, population: 15000000 },
    { name: 'Nairobi', country: 'Kenya', woeid: 1528488, lat: -1.2921, lng: 36.8219, population: 4400000 },
];

// Get location by WOEID
export const getLocationByWoeid = (woeid: number): Location | undefined => {
    return LOCATIONS.find(loc => loc.woeid === woeid);
};

// Get location by name (fuzzy search)
export const searchLocations = (query: string): Location[] => {
    const lowerQuery = query.toLowerCase();
    return LOCATIONS.filter(
        loc =>
            loc.name.toLowerCase().includes(lowerQuery) ||
            loc.country.toLowerCase().includes(lowerQuery)
    ).slice(0, 10);
};

// Get nearby locations
export const getNearbyLocations = (lat: number, lng: number, limit = 5): Location[] => {
    return LOCATIONS
        .filter(loc => loc.woeid !== 1) // Exclude worldwide
        .map(loc => ({
            ...loc,
            distance: Math.sqrt(
                Math.pow(loc.lat - lat, 2) + Math.pow(loc.lng - lng, 2)
            ),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);
};

// Popular locations for quick select
export const POPULAR_LOCATIONS = LOCATIONS.filter(loc =>
    ['New York', 'London', 'Tokyo', 'Mumbai', 'Singapore', 'Dubai', 'Sydney', 'Delhi'].includes(loc.name)
);

// Default location
export const DEFAULT_LOCATION = LOCATIONS.find(loc => loc.name === 'Delhi') || LOCATIONS[0];
