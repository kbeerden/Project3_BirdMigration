// Initialize variables
let ageData = {};
let sexData = {};
let chart;

// Function to fetch data based on selected species
function fetchDataForSelectedSpecies(selectedSpecies) {
    fetch(`http://localhost:5000/api/birdAgeDistribution/${selectedSpecies}`)
    .then(response => response.json())
    .then(data => {
        // Assuming the data has 'AGE_DESCRIPTION' and 'SEX_DESCRIPTION' columns
        const ageColumn = data.map((row) => row.AGE_DESCRIPTION);
        const sexColumn = data.map((row) => row.SEX_DESCRIPTION);
        
        // Count unique values in the 'AGE_DESCRIPTION' and 'SEX_DESCRIPTION' columns
        ageData = countUniqueValues(ageColumn);
        sexData = countUniqueValues(sexColumn);
        
        // Update or render the chart
        if (chart) {
            chart.destroy();
        }
        renderChart();
    })
    .catch(error => {
        console.error("Error fetching data:", error);
    });
}

// Function to count unique values in an array
function countUniqueValues(arr) {
    const counts = {};
    for (const value of arr) {
        counts[value] = (counts[value] || 0) + 1;
    }
    return counts;
}

// Function to render the doughnut chart
function renderChart() {
    const ctx = document.getElementById("doughnutChart").getContext("2d");
    // Define colors for SEX_DESCRIPTION
    const sexColors = {
        Male: "rgba(0, 0, 255, 0.6)", // Blue for males
        Female: "rgba(255, 192, 203, 0.6)", // Pink for females
    };
    // Create an array of unique colors for AGE_DESCRIPTION
    const ageColors = [
        "rgba(255, 99, 132, 0.6)",
        "rgba(54, 162, 235, 0.6)",
        "rgba(255, 206, 86, 0.6)",
        "rgba(75, 192, 192, 0.6)",
        "rgba(153, 102, 255, 0.6)",
        "rgba(255, 159, 64, 0.6)",
        "rgba(50, 200, 50, 0.6)",
    ];
    chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: [...Object.keys(ageData), ...Object.keys(sexData)],
            datasets: [
                {
                    label: "Age",
                    data: Object.values(ageData),
                    backgroundColor: ageColors.slice(0, Object.keys(ageData).length),
                },
                {
                    label: "Sex",
                    data: Object.values(sexData),
                    backgroundColor: Object.keys(sexData).map((sex) => sexColors[sex]),
                },
            ],
        },
    });
}

// Call the fetchDataForSelectedSpecies function when the species is selected
document.getElementById("birdSpecies").addEventListener("change", function() {
    const selectedSpecies = this.value;
    fetchDataForSelectedSpecies(selectedSpecies);
});
