import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { loadRecentSightingsBirdData, loadNPSData, getStateCode } from './externalSources.js';
import { setLocalStorage } from './utils.mjs';


export let latitude
export let longitude

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

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    loadMapState();

    getUserLocation();
    let state = getStateCode()

    loadRecentSightingsBirdData();
    loadNPSData();

    map.on('moveend zoomend', saveMapState);
}

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                map.setView([latitude, longitude], 10);
                latitude = position.coords.latitude
                longitude = position.coords.longitude
                setLocalStorage("latitude", latitude)
                setLocalStorage("longitude", longitude)
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
                setLocalStorage("latitude", 40.7608)
                setLocalStorage("longitude", -111.8910)
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