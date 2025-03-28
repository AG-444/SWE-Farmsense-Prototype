const marketData = {
    wheat: { basePrice: 2800, trend: 0.05, historicalData: [
        {year: 2020, price: 2004},
        {year: 2021, price: 2411},
        {year: 2022, price: 2802},
        {year: 2023, price: 2093},
        {year: 2024, price: 2089},
        {year: 2025, price: 2800}
    ]},
    rice: { basePrice: 4042, trend: -0.02, historicalData: [
        {year: 2020, price: 3500},
        {year: 2021, price: 3800},
        {year: 2022, price: 4100},
        {year: 2023, price: 4200},
        {year: 2024, price: 4150},
        {year: 2025, price: 4042}
    ]},
    corn: { basePrice: 2200, trend: 0.03, historicalData: [
        {year: 2020, price: 1800},
        {year: 2021, price: 1950},
        {year: 2022, price: 2050},
        {year: 2023, price: 2100},
        {year: 2024, price: 2150},
        {year: 2025, price: 2200}
    ]},
    soybeans: { basePrice: 3788, trend: 0.01, historicalData: [
        {year: 2020, price: 3500},
        {year: 2021, price: 3600},
        {year: 2022, price: 3650},
        {year: 2023, price: 3700},
        {year: 2024, price: 3750},
        {year: 2025, price: 3788}
    ]}
};

let priceTrendChart;

function predictPrice() {
    const cropType = document.getElementById('cropType').value;
    const yield = parseFloat(document.getElementById('yield').value);

    if (isNaN(yield) || yield <= 0) {
        showError('Please enter a valid yield value.');
        return;
    }

    const crop = marketData[cropType];
    if (!crop) {
        showError('Invalid crop type.');
        return;
    }

    const basePrice = crop.basePrice;
    const trend = crop.trend;
    const predictedPrice = basePrice * (1 + trend);
    const totalValue = predictedPrice * yield;

    displayResults(cropType, yield, predictedPrice, totalValue, trend);
    updatePriceTrendChart(cropType);
}

function displayResults(cropType, yield, price, totalValue, trend) {
    const priceEstimate = document.getElementById('priceEstimate');
    const marketTrend = document.getElementById('marketTrend');

    priceEstimate.innerHTML = `
        <p><strong>Crop:</strong> ${cropType.charAt(0).toUpperCase() + cropType.slice(1)}</p>
        <p><strong>Estimated Price:</strong> ₹${price.toFixed(2)} per quintal</p>
        <p><strong>Your Yield:</strong> ${yield} quintals</p>
        <p><strong>Total Estimated Value:</strong> ₹${totalValue.toFixed(2)}</p>
    `;

    const trendDirection = trend > 0 ? 'upward' : 'downward';
    const trendPercentage = Math.abs(trend * 100).toFixed(1);
    marketTrend.innerHTML = `
        <p>Market Trend: <span class="${trendDirection}">${trendDirection} (${trendPercentage}%)</span></p>
    `;

    document.getElementById('results').style.display = 'block';
}

function updatePriceTrendChart(cropType) {
    const ctx = document.getElementById('priceTrendChart').getContext('2d');
    const cropData = marketData[cropType].historicalData;

    if (priceTrendChart) {
        priceTrendChart.destroy();
    }

    priceTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: cropData.map(d => d.year),
            datasets: [{
                label: `${cropType.charAt(0).toUpperCase() + cropType.slice(1)} Price (₹/quintal)`,
                data: cropData.map(d => d.price),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Price (₹/quintal)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    }
                }
            }
        }
    });
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => errorDiv.style.display = 'none', 5000);
}
