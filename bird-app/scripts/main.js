import { loadpageSection } from "./utils.mjs";
const partialFilePath = "/partials";

document.addEventListener("DOMContentLoaded", () => {
  loadpageSection(0, partialFilePath);
  loadpageSection(1, partialFilePath);
   fetch('map.html')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load map partial');
            return response.text();
        })
        .then(html => {
            document.getElementById('map-container').innerHTML = html;
            // Initialize map after partial is loaded
            initMap();
        })
        .catch(error => {
            console.error('Error loading partial:', error);
            document.getElementById('map-container').innerHTML = '<p>Error loading map. Please try again.</p>';
        });
});

