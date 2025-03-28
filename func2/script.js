let trendChart, fertilizerChart, irrigationChart;
const history = {
    yields: [],
    fertilizers: [],
    irrigations: [],
    timestamps: []
};

function initializeCharts() {
    if (!document.getElementById('yieldTrendChart')) return;
    const chartConfig = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                title: { display: true, text: 'Yield (kg)' }
            }
        }
    };

    // Yield Trend Chart
    const trendCtx = document.getElementById('yieldTrendChart').getContext('2d');
    trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Yield Trend',
                data: [],
                borderColor: '#48bb78',
                tension: 0.4
            }]
        },
        options: {
            ...chartConfig,
            scales: {
                x: { title: { display: true, text: 'Last 10 Changes' } },
                y: { title: { display: true, text: 'Yield (kg)' } }
            }
        }
    });

    // Fertilizer vs Yield Chart
    const fertilizerCtx = document.getElementById('fertilizerYieldChart').getContext('2d');
    fertilizerChart = new Chart(fertilizerCtx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Fertilizer Impact',
                data: [],
                backgroundColor: '#4299e1'
            }]
        },
        options: {
            ...chartConfig,
            scales: {
                x: { 
                    title: { display: true, text: 'Fertilizer (kg/ha)' },
                    min: 0,
                    max: 300
                }
            }
        }
    });

    // Irrigation vs Yield Chart
    const irrigationCtx = document.getElementById('irrigationYieldChart').getContext('2d');
    irrigationChart = new Chart(irrigationCtx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Irrigation Impact',
                data: [],
                backgroundColor: '#9f7aea'
            }]
        },
        options: {
            ...chartConfig,
            scales: {
                x: { 
                    title: { display: true, text: 'Irrigation (mm/week)' },
                    min: 0,
                    max: 100
                }
            }
        }
    });
}

function updateCharts(currentYield, fertilizer, irrigation) {
    const timestamp = new Date().toLocaleTimeString();
    
    // Add to history (keep last 15 entries)
    history.yields.push(currentYield);
    history.fertilizers.push(fertilizer);
    history.irrigations.push(irrigation);
    history.timestamps.push(timestamp);
    
    if(history.yields.length > 15) {
        history.yields.shift();
        history.fertilizers.shift();
        history.irrigations.shift();
        history.timestamps.shift();
    }

    // Update Trend Chart
    trendChart.data.labels = history.timestamps;
    trendChart.data.datasets[0].data = history.yields;
    
    // Update Fertilizer Chart
    fertilizerChart.data.datasets[0].data = 
        history.fertilizers.map((f, i) => ({ x: f, y: history.yields[i] }));
    
    // Update Irrigation Chart
    irrigationChart.data.datasets[0].data = 
        history.irrigations.map((ir, i) => ({ x: ir, y: history.yields[i] }));
    
    // Update all charts
    trendChart.update();
    fertilizerChart.update();
    irrigationChart.update();
}
document.addEventListener('DOMContentLoaded', function() {
    setupInput('fieldSize', 'fieldSizeValue');
    setupInput('fertilizer', 'fertilizerValue');
    setupInput('irrigation', 'irrigationValue');
    setupInput('daysToHarvest', 'daysToHarvestValue');

    initializeCharts();
    
    const { totalYield, fertilizer, irrigation } = calculateYield();
    updateCharts(totalYield, fertilizer, irrigation);
});

function setupInput(rangeId, numberId) {
    const rangeInput = document.getElementById(rangeId);
    const numberInput = document.getElementById(numberId);

    function update() {
        numberInput.value = rangeInput.value;
        const { totalYield, fertilizer, irrigation } = calculateYield();
        updateCharts(totalYield, fertilizer, irrigation);
    }

    rangeInput.addEventListener('input', update);
    numberInput.addEventListener('input', update);
}


function calculateYield() {
    const fieldSize = parseFloat(document.getElementById('fieldSize').value);
    const fertilizer = parseFloat(document.getElementById('fertilizer').value);
    const irrigation = parseFloat(document.getElementById('irrigation').value);
    const days = parseFloat(document.getElementById('daysToHarvest').value);

    const baseYieldPerHectare = 3000;
    const fertilizerFactor = Math.min(1 + (fertilizer * 0.006) - (fertilizer**2 * 0.00001), 2.5);
    const irrigationFactor = irrigation < 40 ? 0.5 + (irrigation/80) :
                            irrigation > 60 ? 1.5 - (irrigation/200) :
                            1 + ((irrigation - 40) * 0.025);
    const daysFactor = Math.min(1 + (days - 60) * 0.01, 2.0);

    const totalYield = baseYieldPerHectare * fieldSize * fertilizerFactor * irrigationFactor * daysFactor;

    document.getElementById('yieldValue').textContent = Math.round(totalYield).toLocaleString();
    document.getElementById('factorField').textContent = `${fieldSize.toFixed(1)} ha`;
    document.getElementById('factorFertilizer').textContent = `${fertilizerFactor.toFixed(2)}x`;
    document.getElementById('factorIrrigation').textContent = `${irrigationFactor.toFixed(2)}x`;
    document.getElementById('factorDays').textContent = `${daysFactor.toFixed(2)}x`;

    return { totalYield, fertilizer, irrigation };
}

