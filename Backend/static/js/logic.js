// Initialize the map
var locationChart; // Global variable to store the chart
var GOOGLE_API_KEY = "AIzaSyC390MqWnBBXnSVPspWbArPel_k0GEEBus"
var map = L.map('flamingosMap').setView([9.75, -85], 2);  // Centered roughly on Costa Rica with a zoom level that includes both North and South America

// Add a tile layer (base map)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
// Global variable to store the marker group
var markerGroup;

function showMarkers() {
    document.getElementById('flamingosMap').style.display = 'block';
    document.getElementById('locationDistributionChart').style.display = 'none';

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
function getBandedStateFromLatLon(lat, lon, callback) {
    var endpoint = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${GOOGLE_API_KEY}`;

    fetch(endpoint)
        .then(response => response.json())
        .then(data => {
            if (data.status === "OK") {
                const results = data.results;
                for (let i = 0; i < results.length; i++) {
                    const component = results[i].address_components.find(comp => 
                        comp.types.includes("administrative_area_level_1") || 
                        comp.types.includes("country")
                    );
                    if (component) {
                        if (component.types.includes("administrative_area_level_1")) {
                            callback(component.long_name); // This is the state or province
                        } else {
                            callback(component.short_name); // This is the country code
                        }
                        return;
                    }
                }
                callback(null); // Location not found
            } else {
                console.error("Error fetching state:", data.status);
                callback(null);
            }
        })
        .catch(error => {
            console.error("Error fetching state:", error);
            callback(null);
        });
}
// Function to generate a random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function showLocationDistributionChart() {
    console.log("Executing showLocationDistributionChart...");
    
    // Get the dropdown value (species)
    const selectedSpecies = document.getElementById('birdSpecies').value;
    
    document.getElementById('flamingosMap').style.display = 'none';
    document.getElementById('locationDistributionChart').style.display = 'block';
    
    fetch(`http://localhost:5000/api/birds`)
    .then(response => response.json())
    .then(data => {
        console.log("Fetched data:", data);
        
        // Filter the data based on the dropdown value (species)
        const birds = data[selectedSpecies];
        
        const statePromises = birds.map(bird => 
            new Promise(resolve => {
                getBandedStateFromLatLon(bird.LAT_DD, bird.LON_DD, state => {
                    console.log("State:", state);
                    resolve(state);
                });
            })
        );

        Promise.all(statePromises).then(locations => {
            console.log("All states resolved:", locations);
            const locationCounts = countUniqueValues(locations);

            const locationLabels = Object.keys(locationCounts);
            const locationData = Object.values(locationCounts);

            // Generate a dynamic color array for the states
            const backgroundColors = locationLabels.map(() => getRandomColor());
            const borderColors = backgroundColors.map(color => shadeColor(color, -10)); // Darken each color by 10% for the border

            // Adjust the labels based on the criteria
            for (let i = 0; i < locationLabels.length; i++) {
                if (locationLabels[i].length === 2) { // Assuming country codes are 2 characters
                    locationLabels[i] += " (Country)";
                } else if (["ON", "BC", "QC", /* other Canadian provinces */].includes(locationLabels[i])) {
                    locationLabels[i] += " (Province)";
                } else {
                    locationLabels[i] += " (State)";
                }
            }

            // If the chart already exists, destroy it
            if (locationChart) {
                locationChart.destroy();
            }

            console.log("Initializing chart...");
            // Create the donut chart
            const ctx = document.getElementById('locationDistributionChart').getContext('2d');
            locationChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: locationLabels,
                    datasets: [{
                        label: 'Number of Band Events',
                        data: locationData,
                        backgroundColor: backgroundColors, // Use the dynamic color array
                        borderColor: borderColors,       // Use the darkened colors for the border
                        borderWidth: 1
                    }]
                }
            });
        });
    })
    .catch(error => {
        console.error("Error fetching bird data:", error);
    });
}
// Function to shade a color (used for border color)
function shadeColor(color, percent) {
    const R = parseInt(color.substring(1, 3), 16);
    const G = parseInt(color.substring(3, 5), 16);
    const B = parseInt(color.substring(5, 7), 16);

    const getHex = (num) => {
        const hex = num.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };

    return "#" + getHex(Math.round(R * (100 + percent) / 100)) + getHex(Math.round(G * (100 + percent) / 100)) + getHex(Math.round(B * (100 + percent) / 100));
}

function countUniqueValues(arr) {
    return arr.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {});
}
