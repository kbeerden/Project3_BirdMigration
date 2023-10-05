// Initialize the map
var map = L.map('flamingosMap').setView([20, 0], 3);  // Default view

// Add a tile layer (base map)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
// Global variable to store the marker group
var markerGroup;

function showMarkers() {
    var selectedSpecies = document.getElementById("birdSpecies").value;

    // If markerGroup exists, clear it
    if (markerGroup) {
        markerGroup.clearLayers();
    }

    fetch(`http://localhost:5000/api/birds`)
    .then(response => response.json())
    .then(data => {
        var birds = data[selectedSpecies];
        var markers = {};  // Object to store markers

        // Create a new marker group
        markerGroup = L.layerGroup().addTo(map);

        // Loop through each bird record and add/update a marker on the map
        birds.forEach(bird => {
            var lat = bird.LAT_DD;
            var lon = bird.LON_DD;
            var speciesName = bird.SPECIES_NAME;
            var description = bird.AGE_DESCRIPTION;

            // Check if lat or lon is "nan" and skip this iteration if true
            if (lat === "nan" || lon === "nan") {
                return;  // Skip to the next iteration
            }

            // Create a unique key for the lat-lon combination
            var key = `${lat}-${lon}`;

            // If marker already exists, update its count
            if (markers[key]) {
                markers[key].count += 1;
                markers[key].marker.bindPopup(`<strong>Species:</strong> ${speciesName}<br><strong>Description:</strong> ${description}<br><strong>Count:</strong> ${markers[key].count}`);
            } else {
                // Create a new marker and set its count to 1
                var marker = L.marker([lat, lon])
                    .bindPopup(`<strong>Species:</strong> ${speciesName}<br><strong>Description:</strong> ${description}<br><strong>Count:</strong> 1`);
                markers[key] = {
                    marker: marker,
                    count: 1
                };
                // Add the marker to the marker group
                markerGroup.addLayer(marker);
            }
        });
    })
    .catch(error => {
        if (error instanceof SyntaxError) {
            console.error("Received invalid JSON:", error);
        } else {
            console.error("Error fetching bird data:", error);
        }
    });
}
