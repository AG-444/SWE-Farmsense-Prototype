const RAINFALL_THRESHOLD = 500; // Annual rainfall in mm

async function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const [annualRainfall, forecast] = await Promise.all([
                    getAnnualRainfall(latitude, longitude),
                    get7DayForecast(latitude, longitude)
                ]);
                calculateEfficiency(annualRainfall, forecast);
            },
            (error) => showError('Location access denied. Using default values.')
        );
    } else {
        showError('Geolocation not supported. Using default values.');
    }
}

async function get7DayForecast(lat, lon) {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=rain_sum&forecast_days=7`
        );
        const data = await response.json();
        return data.daily;
    } catch {
        return null;
    }
}

async function getAnnualRainfall(lat, lon) {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=rain_sum&past_days=365`
        );
        const data = await response.json();
        return data.daily.rain_sum.reduce((a, b) => a + b, 0);
    } catch {
        return RAINFALL_THRESHOLD; // Fallback value
    }
}

function calculateEfficiency(annualRainfall, forecast) {
    // Get user inputs
    const irrigationType = document.getElementById('irrigationType').value;
    const cropType = document.getElementById('cropType').value;
    const soilType = document.getElementById('soilType').value;
    const hasMulching = document.getElementById('mulching').checked;
    const hasSensors = document.getElementById('sensors').checked;
    const hasSlope = document.getElementById('slope').checked;

    // Efficiency calculation (hypothetical model)
    let score = 0;
    
    // Irrigation type (0-40 points)
    const irrigationScores = {
        drip: 40,
        sprinkler: 30,
        flood: 10,
        manual: 5
    };
    score += irrigationScores[irrigationType];

    // Soil type adjustment (0-20 points)
    const soilFactors = {
        sandy: 10,
        loamy: 20,
        clay: 15
    };
    score += soilFactors[soilType];

    // Crop water needs (0-20 points)
    const cropFactors = {
        wheat: 15,
        rice: 5,
        corn: 10,
        vegetables: 18
    };
    score += cropFactors[cropType];

    // Additional factors (0-20 points)
    if(hasMulching) score += 8;
    if(hasSensors) score += 10;
    if(hasSlope) score -= 5; // Negative impact

    // Rainfall adjustment (±20 points)
    const rainfallFactor = annualRainfall > RAINFALL_THRESHOLD ? -10 : 10;
    score += rainfallFactor;

    // Cap score between 0-100
    const efficiency = Math.min(Math.max(score, 0), 100);
    showResults(efficiency, annualRainfall, forecast);
}

function showResults(efficiency, rainfall, forecast) {
    // 1. Display Efficiency Score
    const efficiencyElement = document.getElementById('efficiencyScore');
    efficiencyElement.innerHTML = `
        <span class="efficiency-value">${efficiency}%</span>
        <span class="efficiency-label">Water Use Efficiency</span>
    `;

    // 2. Generate Core Recommendations
    const recommendations = generateBaseRecommendations(efficiency, rainfall);

    // 3. Add Weather-Advised Recommendations
    if (forecast) {
        recommendations.push(...generateWeatherRecommendations(forecast));
    }

    // 4. Display Recommendations
    const recommendationsElement = document.getElementById('recommendations');
    recommendationsElement.innerHTML = recommendations
        .map(r => `<div class="recommendation-item">${r}</div>`)
        .join('');

    // 5. Show 7-Day Forecast (if available)
    const forecastElement = document.getElementById('weatherForecast');
    if (forecast) {
        forecastElement.innerHTML = `
            <h3>🌧️ 7-Day Rain Forecast</h3>
            <div class="forecast-container">
                ${forecast.time.map((date, index) => `
                    <div class="forecast-day">
                        <span class="forecast-date">${new Date(date).toLocaleDateString([], { weekday: 'short', month: 'short', 'day': 'numeric' })}</span>
                        <span class="forecast-rain ${forecast.rain_sum[index] > 5 ? 'heavy-rain' : forecast.rain_sum[index] > 0 ? 'light-rain' : 'no-rain'}">
                            ${forecast.rain_sum[index] > 0 ? `${forecast.rain_sum[index]} mm` : 'Dry'}
                        </span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // 6. Calculate and Display Water Savings
    const savingsElement = document.getElementById('savingsPotential');
    const potentialImprovement = Math.min(100 - efficiency, 30); // Cap at 30% possible improvement
    savingsElement.innerHTML = `
        <div class="savings-card">
            <h4>Water Savings Potential</h4>
            ${calculateWaterSavings(efficiency, efficiency + potentialImprovement)}
            <div class="savings-meter">
                <div class="current-efficiency" style="width: ${efficiency}%">Current</div>
                <div class="potential-efficiency" style="width: ${potentialImprovement}%">Potential</div>
            </div>
        </div>
    `;
}

function generateBaseRecommendations(efficiency, rainfall) {
    const recommendations = [];
    
    // Efficiency-based recommendations
    if (efficiency < 50) {
        recommendations.push(
            "🚨 Immediate Action Required: Your system is wasting significant water",
            "🔧 Upgrade to drip irrigation for 40-60% better efficiency",
            "📊 Install soil moisture sensors to optimize watering schedules"
        );
    } else if (efficiency < 75) {
        recommendations.push(
            "✅ Good Performance: Some optimization opportunities available",
            "🍂 Add organic mulch to reduce evaporation by 25-50%",
            "⏱️ Implement timed watering during cooler parts of the day"
        );
    } else {
        recommendations.push(
            "🎉 Excellent Efficiency: Your system is performing well",
            "🔍 Consider periodic audits to maintain peak performance",
            "📈 Explore precision irrigation for marginal gains"
        );
    }

    // Rainfall-based recommendations
    if (rainfall > RAINFALL_THRESHOLD) {
        recommendations.push(
            "💧 High Rainfall Area: Consider rainwater harvesting systems",
            "🌧️ Reduce irrigation frequency during wet seasons"
        );
    } else {
        recommendations.push(
            "🌵 Low Rainfall Area: Prioritize drought-resistant crops",
            "🔄 Implement water recycling systems where possible"
        );
    }

    return recommendations;
}

function generateWeatherRecommendations(forecast) {
    const rainyDays = forecast.rain_sum.filter(r => r > 2).length;
    const heavyRainDays = forecast.rain_sum.filter(r => r > 5).length;
    const recommendations = [];

    if (heavyRainDays > 0) {
        recommendations.push(
            `⚠️ ${heavyRainDays} day(s) of heavy rain forecasted - postpone irrigation`
        );
    } else if (rainyDays > 0) {
        recommendations.push(
            `🌦️ ${rainyDays} day(s) of rain expected - reduce watering by 30-50%`
        );
    } else if (forecast.rain_sum.every(r => r === 0)) {
        recommendations.push(
            "☀️ Dry forecast for next 7 days - maintain normal irrigation schedule"
        );
    }

    return recommendations;
}

function calculateWaterSavings(currentEfficiency, improvedEfficiency) {
    const BASE_CONSUMPTION = 10000; // Liters/hectare/year baseline
    const currentUsage = BASE_CONSUMPTION * (100 / currentEfficiency);
    const improvedUsage = BASE_CONSUMPTION * (100 / improvedEfficiency);
    const savings = currentUsage - improvedUsage;
    
    return `
        💧 Potential Water Savings:
        ${Math.round(savings)} liters/hectare annually
        (${Math.round(improvedEfficiency)}% efficiency target)
    `;
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => errorDiv.style.display = 'none', 5000);
}
