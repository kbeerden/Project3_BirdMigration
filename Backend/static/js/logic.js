// Initialize the map
var map = L.map('flamingosMap').setView([20, 0], 3);  // Default view

// Add a tile layer (base map)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Fetch flamingos data from the Flask API
fetch('http://localhost:5000/api/birds')
.then(response => response.json())
.then(data => {
    var flamingos = data.flamingos;

    // Loop through each flamingo record and add a marker to the map
    flamingos.forEach(flamingo => {
        var lat = flamingo.LAT_DD;
        var lon = flamingo.LON_DD;
        var speciesName = flamingo.SPECIES_NAME;
        var description = flamingo.AGE_DESCRIPTION;

        // Create a marker and bind a popup with some information
        L.marker([lat, lon]).addTo(map)
            .bindPopup(`<strong>Species:</strong> ${speciesName}<br><strong>Description:</strong> ${description}`);
    });
})
.catch(error => {
    console.error("Error fetching bird data:", error);
});
