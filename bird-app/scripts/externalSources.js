import { map } from './map.js';
import L from 'leaflet'; // If using npm install leaflet

const apiKeyParks = import.meta.env.VITE_API_KEY_PARKS;
const apiKeyBirds = import.meta.env.VITE_API_KEY_BIRDS;
const apiKeyGeoName = import.meta.env.VITE_API_KEY_GEONAME

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

export async function getStateCode(latitude, longitude){
    const cacheKey = 'stateData';
    let stateData = getCachedData(cacheKey);
    if (!stateData) {
        try{
            let response = await fetch(`api.geonames.org/countrySubdivisionJSON?lat=${latitude}&lng${longitude}&username=${apiKeyGeoName}`);
            if (!response.ok) throw new Error('Failed to fetch state data');
            stateData = await response.json();
            cacheData(cacheKey, stateData);
        } catch (error) {
            console.error('Error fetching state data:', error);
            document.querySelector('.pageHeading').textContent = 'Failed to load state data';
            return;
        }
    }
}

export async function loadRecentSightingsBirdData() {
    const cacheKey = 'birdData';
    let birdData = getCachedData(cacheKey);

    if (!birdData) {
        try {
            const response = await fetch(`https://api.ebird.org/v2/data/obs/US/recent`, {
                headers: { 'X-eBirdApiToken': apiKeyBirds }
            });
            if (!response.ok) throw new Error('Failed to fetch bird data');
            birdData = await response.json();
            cacheData(cacheKey, birdData);
        } catch (error) {
            console.error('Error fetching bird data:', error);
            document.querySelector('.pageHeading').textContent = 'Failed to load bird data';
            return;
        }
    }

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

export async function loadNPSData() {
    const cacheKey = 'npsData';
    let npsData = getCachedData(cacheKey);

    if (!npsData) {
        try {
            const response = await fetch(`developer.nps.gov/api/v1/parks?stateCode=${stateCode}&limit=50&&api_key=${apiKeyParks}`);
            if (!response.ok) throw new Error('Failed to fetch NPS data');
            npsData = await response.json();
            cacheData(cacheKey, npsData);
        } catch (error) {
            console.error('Error fetching NPS data:', error);
            document.querySelector('.pageHeading').textContent = 'Failed to load park data';
            return;
        }
    }

    npsData.data.forEach(park => {
        if (park.latitude && park.longitude) {
            L.marker([park.latitude, park.longitude])
                .addTo(map)
                .bindPopup(`<b>${park.fullName}</b><br>${park.description}`);
        }
    });
}