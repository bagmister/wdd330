import { loadpageSection } from './utils.mjs';
import { initMap, latitude, longitude } from './map.js';
import { loadRecentSightingsBirdData, loadNPSDataparksByState, getStateCode } from './externalSources.js';
import { map } from './map.js';

const partialFilePath = '/partials';
const headerContainer = document.querySelector('.headerForPage');
const footerContainer = document.querySelector('.footerForPage');

document.addEventListener('DOMContentLoaded', async () => {
    headerContainer.innerHTML = '';
    footerContainer.innerHTML = '';

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

    loadContent(window.location.pathname);
});

async function loadContent(url) {
    const pageHeading = document.querySelector('.pageHeading');

    headerContainer.innerHTML = '';
    footerContainer.innerHTML = '';
    pageHeading.innerHTML = '';

    await Promise.all([
        loadpageSection(0, partialFilePath),
        loadpageSection(1, partialFilePath)
    ]);

    map.eachLayer(layer => {
        if (layer instanceof L.TileLayer) return;
        map.removeLayer(layer);
    });

    if (url.includes('birdwatching')) {
        pageHeading.textContent = 'Local Bird Sightings';
        await loadRecentSightingsBirdData();
    } else if (url.includes('nationalPark')) {
        pageHeading.textContent = 'Closest National Park Info';
        const stateCode = await getStateCode(latitude, longitude);
        if (stateCode) {
            await loadNPSDataparksByState(stateCode);
        } else {
            pageHeading.textContent = 'Failed to load park data';
        }
    } else {
        pageHeading.textContent = 'Home';
        await loadRecentSightingsBirdData();
    }
}