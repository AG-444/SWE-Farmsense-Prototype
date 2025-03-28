document.addEventListener('DOMContentLoaded', () => {
    // Setup input synchronization
    setupInput('nitrogenFertilizer', 'nitrogenFertilizerValue');
    setupInput('irrigation', 'irrigationValue');
    setupInput('livestock', 'livestockValue');
    setupInput('tillage', 'tillageValue');
    setupInput('pesticides', 'pesticidesValue');
    setupInput('fuel', 'fuelValue');

    // Initialize charts
    initializeCharts();
    
    // Add calculate button handler
    document.getElementById('calculateBtn').addEventListener('click', calculateCarbonFootprint);
});

document.getElementById('calculateBtn').addEventListener('click', function() {
    this.classList.add('calculating');
    calculateCarbonFootprint();
    setTimeout(() => this.classList.remove('calculating'), 1000);
  });
  

let trendChart, factorChart;
const history = [];

function setupInput(rangeId, numberId) {
    const range = document.getElementById(rangeId);
    const number = document.getElementById(numberId);
    
    range.addEventListener('input', () => {
        number.value = range.value;
    });
    
    number.addEventListener('input', () => {
        range.value = number.value;
    });
}

function initializeCharts() {
    // Trend Chart
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Carbon Footprint Trend',
                data: [],
                borderColor: '#48bb78',
                tension: 0.4
            }]
        }
    });

    // Factor Impact Chart
    const factorCtx = document.getElementById('factorChart').getContext('2d');
    factorChart = new Chart(factorCtx, {
        type: 'bar',
        data: {
            labels: ['Nitrogen', 'Irrigation', 'Livestock', 'Tillage', 'Pesticides', 'Fuel'],
            datasets: [{
                label: 'CO₂ Contribution',
                data: [],
                backgroundColor: ['#4299e1', '#9f7aea', '#48bb78', '#f6ad55', '#f56565', '#4a5568']
            }]
        }
    });
}

function calculateCarbonFootprint() {
    // Get values
    const inputs = {
        nitrogen: parseFloat(document.getElementById('nitrogenFertilizer').value),
        irrigation: parseFloat(document.getElementById('irrigation').value),
        livestock: parseFloat(document.getElementById('livestock').value),
        tillage: parseFloat(document.getElementById('tillage').value),
        pesticides: parseFloat(document.getElementById('pesticides').value),
        fuel: parseFloat(document.getElementById('fuel').value)
    };

    // Carbon coefficients (kg CO₂e per unit)
    const coefficients = {
        nitrogen: 4.3,   // per kg
        irrigation: 0.2, // per mm
        livestock: 25,   // per head
        tillage: 12,     // per tillage
        pesticides: 3.5, // per kg
        fuel: 2.7        // per liter
    };

    // Calculate contributions
    const contributions = {
        nitrogen: inputs.nitrogen * coefficients.nitrogen,
        irrigation: inputs.irrigation * coefficients.irrigation,
        livestock: inputs.livestock * coefficients.livestock,
        tillage: inputs.tillage * coefficients.tillage,
        pesticides: inputs.pesticides * coefficients.pesticides,
        fuel: inputs.fuel * coefficients.fuel
    };

    // Total carbon footprint
    const total = Object.values(contributions).reduce((a, b) => a + b, 0);

    // Update display
    document.getElementById('carbonValue').textContent = Math.round(total).toLocaleString();

    // Update charts
    updateCharts(total, contributions);
}

function updateCharts(total, contributions) {
    // Update trend chart
    history.push(total);
    if(history.length > 15) history.shift();
    
    trendChart.data.labels = Array.from({length: history.length}, (_, i) => i + 1);
    trendChart.data.datasets[0].data = history;
    trendChart.update();

    // Update factor chart
    factorChart.data.datasets[0].data = Object.values(contributions);
    factorChart.update();
}
