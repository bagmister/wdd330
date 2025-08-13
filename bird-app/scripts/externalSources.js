import { map } from './map.js';
import L from 'leaflet';

const apiKeyParks = import.meta.env.VITE_API_KEY_PARKS;
const apiKeyBirds = import.meta.env.VITE_API_KEY_BIRDS;
const apiKeyGeoName = import.meta.env.VITE_API_KEY_GEONAME;

function cacheData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getCachedData(key) {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
}

export async function getStateCode(latitude, longitude) {
    const cacheKey = 'state';
    let stateData = getCachedData(cacheKey);
    let state = stateData?.adminCode1 || null;

    if (!state) {
        try {
            let response = await fetch(`https://secure.geonames.org/countrySubdivisionJSON?lat=${latitude}&lng=${longitude}&username=${apiKeyGeoName}`);
            if (!response.ok) throw new Error('Failed to fetch state data');
            stateData = await response.json();
            state = stateData.adminCode1;
            cacheData(cacheKey, state);
        } catch (error) {
            console.error('Error fetching state data:', error);
            document.querySelector('.pageHeading').textContent = 'Failed to load state data';
            return null;
        }
    }
    return state;
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

export async function loadNPSDataparksByState(stateCode) {
    if (!stateCode) {
        console.error('No state code provided');
        document.querySelector('.pageHeading').textContent = 'No state code available';
        return;
    }

    const cacheKey = 'npsData';
    let npsData = getCachedData(cacheKey);

    if (!npsData) {
        try {
            const response = await fetch(`https://developer.nps.gov/api/v1/parks?stateCode=${stateCode}&limit=50&api_key=${apiKeyParks}`);
            if (!response.ok) throw new Error('Failed to fetch NPS data');
            npsData = await response.json();
            cacheData(cacheKey, npsData);
        } catch (error) {
            console.error('Error fetching NPS data:', error);
            document.querySelector('.pageHeading').textContent = 'Failed to load park data';
            return;
        }
    }
    for (const park of npsData.data) {
        if (park.latitude && park.longitude) {
            const event = await getFirstActivityForPark(park.parkCode);
            L.marker([park.latitude, park.longitude])
                .addTo(map)
                .bindPopup(`
                    <b>${park.fullName}</b><br>
                    ${park.description}<br>
                    <a href="${park.url}" target="_blank">Park Site</a><br>
                    Upcoming activity: ${event}
                `);
        }
    }
}

export async function getFirstActivityForPark(parkCode) {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();


    today = yyyy + '-' + mm  + '-' + dd;

    try {
        const response = await fetch(`https://developer.nps.gov/api/v1/events?parkCode=${parkCode}&dateStart=${today}&api_key=${apiKeyParks}`);
        if (!response.ok) throw new Error('Failed to fetch NPS data');
        let eventData = await response.json();
        if (!eventData.data.length == 0) {
           return `<br>${eventData.data[0].title}: ${eventData.data[0].description}<br>`
        }
        return "No upcoming event"

    } catch (error) {
        console.error('Error fetching NPS event data:', error);
        document.querySelector('.pageHeading').textContent = 'Failed to load park data';
        return;
    }
}