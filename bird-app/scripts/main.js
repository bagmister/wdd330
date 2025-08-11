import { loadpageSection } from './utils.mjs';
import { initMap } from './map.js';
import { loadRecentSightingsBirdData, loadNPSData, getStateCode } from './externalSources.js';

const partialFilePath = '/partials';
const headerContainer = document.querySelector('.headerForPage');
const footerContainer = document.querySelector('.footerForPage');
headerContainer.innerHTML = '';
footerContainer.innerHTML = '';

document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
        loadpageSection(0, partialFilePath), 
        loadpageSection(1, partialFilePath) 
    ]);
    initMap();

    
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = e.target.getAttribute('href');
            loadContent(href);
        });
    });
});

function loadContent(url) {
    const pageHeading = document.querySelector('.pageHeading');
    window.map.eachLayer(layer => {
        if (layer !== window.map._layers[Object.keys(window.map._layers)[0]]) {
            window.map.removeLayer(layer);
        }
    });
    if (url.includes('birdwatching')) {
        pageHeading.textContent = 'Local Bird Sightings';
        loadRecentSightingsBirdData();
    } else if (url.includes('nationalPark')) {
        pageHeading.textContent = 'Closest National Park Info';
        loadNPSData();
    } else {
        pageHeading.textContent = 'Home';
        loadBirdData();
        loadNPSData();
    }
    getUserLocation();
}