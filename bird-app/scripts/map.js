let map;

// Initialize the map after partial is loaded
function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Initialize Leaflet map
    map = L.map('map', {
        center: [39.8283, -98.5795], // Default: Geographic center of USA
        zoom: 4,
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

    // Load bird migration and NPS data
    loadBirdData();
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
                alert('Unable to retrieve your location. Using default view.');
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
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