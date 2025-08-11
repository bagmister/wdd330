import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { loadRecentSightingsBirdData, loadNPSData, getStateCode } from './externalSources.js';


export let map; // Export for externalSources.js

export function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('Map container not found');
        return;
    }

    // start map and default to Salt Lake City, Utah
    map = L.map('map', {
        center: [40.7608, -111.8910],
        zoom: 10,
        zoomControl: true,
        attributionControl: true
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Load stored map state
    loadMapState();

    // Get user location
    getUserLocation();
    let state = getStateCode()

    // Load bird migration and NPS data
    loadRecentSightingsBirdData();
    loadNPSData();

    // Save map state on move or zoom
    map.on('moveend zoomend', saveMapState);
}

// Get user's geolocation
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                map.setView([latitude, longitude], 10);
                L.marker([latitude, longitude])
                    .addTo(map)
                    .bindPopup('Your Location')
                    .openPopup();
                saveMapState();
            },
            (error) => {
                console.error('Geolocation error:', error.message);
                alert('Unable to retrieve your location or you denied access. Defaulting to Salt Lake City, Utah.');
                map.setView([40.7608, -111.8910], 10);
            }
        );
    } else {
        console.error('Geolocation not supported');
        alert('Geolocation is not supported by your browser. Defaulting to Salt Lake City, Utah.');
        map.setView([40.7608, -111.8910], 10);
    }
}

// Save map state to local storage
function saveMapState() {
    const center = map.getCenter();
    const zoom = map.getZoom();
    localStorage.setItem('mapState', JSON.stringify({
        lat: center.lat,
        lng: center.lng,
        zoom: zoom
    }));
}

// Load map state from local storage
function loadMapState() {
    const mapState = localStorage.getItem('mapState');
    if (mapState) {
        const { lat, lng, zoom } = JSON.parse(mapState);
        map.setView([lat, lng], zoom);
    }
}