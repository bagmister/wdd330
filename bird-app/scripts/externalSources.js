const apiKeyParks = import.meta.env.apiKeyParks
const apiKeyBirds = import.meta.env.apiKeyBirds

function cacheData(key, data, ttl = 24 * 60 * 60 * 1000) {
    const now = new Date().getTime();
    localStorage.setItem(key, JSON.stringify({ data, expiry: now + ttl }));
}

function getCachedData(key) {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    const { data, expiry } = JSON.parse(cached);
    if (new Date().getTime() > expiry) {
        localStorage.removeItem(key);
        return null;
    }
    return data;
}

// Fetch bird migration data from eBird API
async function loadBirdData() {
    const cacheKey = 'birdData';
    let birdData = getCachedData(cacheKey);

    if (!birdData) {
        try {
            // Example: Fetch recent observations for a region (e.g., US)
            const response = await fetch(`https://api.ebird.org/v2/data/obs/US/recent`, {
                headers: { 'X-eBirdApiToken': EBIRD_API_KEY }
            });
            if (!response.ok) throw new Error('Failed to fetch bird data');
            birdData = await response.json();
            cacheData(cacheKey, birdData);
        } catch (error) {
            console.error('Error fetching bird data:', error);
            return;
        }
    }

    // Plot bird data as GeoJSON
    const geojson = {
        type: 'FeatureCollection',
        features: birdData.map(observation => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [observation.lng, observation.lat]
            },
            properties: {
                species: observation.comName,
                date: observation.obsDt
            }
        }))
    };

    L.geoJSON(geojson, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<b>${feature.properties.species}</b><br>Observed: ${feature.properties.date}`);
        }
    }).addTo(map);
}

// Fetch NPS data
async function loadNPSData() {
    const cacheKey = 'npsData';
    let npsData = getCachedData(cacheKey);

    if (!npsData) {
        try {
            const response = await fetch(`https://developer.nps.gov/api/v1/parks?limit=50&api_key=${NPS_API_KEY}`);
            if (!response.ok) throw new Error('Failed to fetch NPS data');
            npsData = await response.json();
            cacheData(cacheKey, npsData);
        } catch (error) {
            console.error('Error fetching NPS data:', error);
            return;
        }
    }

    // Plot NPS data as markers
    npsData.data.forEach(park => {
        if (park.latitude && park.longitude) {
            L.marker([park.latitude, park.longitude])
                .addTo(map)
                .bindPopup(`<b>${park.fullName}</b><br>${park.description}`);
        }
    });
}