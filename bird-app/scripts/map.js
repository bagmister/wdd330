import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { loadRecentSightingsBirdData, loadNPSDataparksByState, getStateCode } from './externalSources.js';
import { setLocalStorage } from './utils.mjs';

export let latitude = localStorage.getItem("latitude") || 40.7608;
export let longitude = localStorage.getItem("longitude") || -111.8910;
export let map;

export function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('Map container not found');
        return;
    }

    // // Destroy existing map instance if it exists
    // if (map) {
    //     map.remove();
    //     map = null;
    // }

    map = L.map('map', {
        center: [latitude, longitude],
        zoom: 10,
        zoomControl: true,
        attributionControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    loadMapState();

    getUserLocation().then(async () => {
        try {
            const stateCode = await getStateCode(latitude, longitude);
            if (stateCode) {
                await loadNPSDataparksByState(stateCode);
            }
            await loadRecentSightingsBirdData();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    });

    map.on('moveend zoomend', saveMapState);
}

async function getUserLocation() {
    const permissionStatus = localStorage.getItem('geolocationPermission');
    if (permissionStatus === 'denied') {
        console.log('Geolocation previously denied, using default location');
        map.setView([latitude, longitude], 10);
        return;
    }

    if (permissionStatus === 'granted') {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            setLocalStorage("latitude", latitude);
            setLocalStorage("longitude", longitude);
            map.setView([latitude, longitude], 10);
            L.marker([latitude, longitude])
                .addTo(map)
                .bindPopup('Your Location')
                .openPopup();
            saveMapState();
        } catch (error) {
            console.warn('Geolocation error:', error.message);
            handleLocationError(error);
        }
        return;
    }

    if (navigator.geolocation) {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            setLocalStorage("latitude", latitude);
            setLocalStorage("longitude", longitude);
            setLocalStorage("geolocationPermission", "granted");
            map.setView([latitude, longitude], 10);
            L.marker([latitude, longitude])
                .addTo(map)
                .bindPopup('Your Location')
                .openPopup();
            saveMapState();
        } catch (error) {
            console.warn('Geolocation error:', error.message);
            handleLocationError(error);
        }
    } else {
        console.error('Geolocation not supported');
        alert('Geolocation is not supported by your browser. Defaulting to Salt Lake City, Utah.');
        setLocalStorage("latitude", 40.7608);
        setLocalStorage("longitude", -111.8910);
        setLocalStorage("geolocationPermission", "denied");
        map.setView([latitude, longitude], 10);
    }
}

function handleLocationError(error) {
    console.warn('Geolocation error:', error.message);
    setLocalStorage("geolocationPermission", "denied");
    setLocalStorage("latitude", 40.7608);
    setLocalStorage("longitude", -111.8910);
    latitude = 40.7608;
    longitude = -111.8910;
    alert('Unable to retrieve your location or you denied access. Defaulting to Salt Lake City, Utah.');
    map.setView([latitude, longitude], 10);
}

function saveMapState() {
    const center = map.getCenter();
    const zoom = map.getZoom();
    localStorage.setItem('mapState', JSON.stringify({
        lat: center.lat,
        lng: center.lng,
        zoom: zoom
    }));
}

function loadMapState() {
    const mapState = localStorage.getItem('mapState');
    if (mapState) {
        const { lat, lng, zoom } = JSON.parse(mapState);
        map.setView([lat, lng], zoom);
    }
}