document.addEventListener('DOMContentLoaded', function() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.addEventListener('click', startAnalysis);
});

async function startAnalysis() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Detecting Location...';
    
    try {
        // Get user's location
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        // Get location details (city, region)
        const locationDetails = await getLocationDetails(latitude, longitude);
        displayLocation(locationDetails);
        
        // Get weather data
        const weatherData = await getWeatherData(latitude, longitude);
        displayWeather(weatherData);
        
        // Generate recommendations
        const regionType = document.getElementById('region').value;
        const soilType = document.getElementById('soilType').value;
        generateRecommendations(weatherData, locationDetails, regionType, soilType);
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('locationInfo').innerHTML = `
            <p class="error">⚠️ ${error.message}</p>
            <p>Please ensure location permissions are enabled and try again.</p>
        `;
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Get Crop Recommendations';
    }
}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser"));
        }
        
        navigator.geolocation.getCurrentPosition(
            position => resolve(position),
            error => {
                let message;
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        message = "Location permission denied. Please enable permissions.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = "Location information unavailable.";
                        break;
                    case error.TIMEOUT:
                        message = "Location request timed out.";
                        break;
                    default:
                        message = "Unknown error occurred while getting location.";
                }
                reject(new Error(message));
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });
}

async function getLocationDetails(latitude, longitude) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
        );
        
        if (!response.ok) throw new Error('Failed to fetch location details');
        const data = await response.json();
        
        return {
            city: data.address.city || data.address.town || data.address.village,
            region: data.address.state || data.address.region,
            country: data.address.country,
            displayName: data.display_name,
            coordinates: { latitude, longitude }
        };
    } catch (error) {
        throw new Error('Could not determine your location details');
    }
}

async function getWeatherData(latitude, longitude) {
    const apiKey = 'db661f9e234ebd931cced791cf153cba'; // Your OpenWeatherMap API key
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.cod && data.cod !== 200) {
            throw new Error(data.message || 'Weather data unavailable');
        }
        
        return {
            temp: data.main.temp,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            pressure: data.main.pressure,
            rainfall: data.rain ? data.rain['1h'] || 0 : 0,
            conditions: data.weather[0].main,
            locationName: data.name
        };
    } catch (error) {
        throw new Error('Failed to fetch weather data');
    }
}

function displayLocation(location) {
    const locationHTML = `
        <h3>📍 Your Location</h3>
        ${location.city ? `<p><strong>City:</strong> ${location.city}</p>` : ''}
        ${location.region ? `<p><strong>Region:</strong> ${location.region}</p>` : ''}
        ${location.country ? `<p><strong>Country:</strong> ${location.country}</p>` : ''}
        <p><small>Coordinates: ${location.coordinates.latitude.toFixed(4)}, ${location.coordinates.longitude.toFixed(4)}</small></p>
    `;
    document.getElementById('locationInfo').innerHTML = locationHTML;
}

function displayWeather(weather) {
    const weatherHTML = `
        <h3>🌤️ Current Weather Conditions</h3>
        <p><span class="weather-icon">🌡️</span> Temperature: ${weather.temp}°C</p>
        <p><span class="weather-icon">💧</span> Humidity: ${weather.humidity}%</p>
        <p><span class="weather-icon">🌬️</span> Wind Speed: ${weather.windSpeed} m/s</p>
        ${weather.rainfall > 0 ? `<p><span class="weather-icon">🌧️</span> Rainfall: ${weather.rainfall} mm/h</p>` : ''}
        <p><span class="weather-icon">🌈</span> Conditions: ${weather.conditions}</p>
    `;
    document.getElementById('weatherData').innerHTML = weatherHTML;
}

function generateRecommendations(weather, location, regionType, soilType) {
    // Determine automatic region type if selected
    const finalRegionType = regionType === 'automatic' ? 
        detectRegionType(location, weather) : 
        regionType;

    const crops = getCropDatabase();
    const scoredCrops = scoreCrops(crops, weather, finalRegionType, soilType);
    displayRecommendations(scoredCrops, location);
}

function detectRegionType(location, weather) {
    // Simple automatic region detection (can be enhanced)
    if (weather.temp > 28 && weather.humidity > 60) return 'tropical';
    if (weather.temp < 10 || location.country?.toLowerCase().includes('canada')) return 'temperate';
    if (weather.rainfall < 300 && weather.humidity < 40) return 'arid';
    return 'temperate'; // Default fallback
}

function getCropDatabase() {
    return [
        {
            name: "Rice",
            suitableRegions: ["tropical", "temperate"],
            soilTypes: ["clay", "loamy"],
            minRainfall: 1000,
            maxRainfall: 2500,
            minTemp: 20,
            maxTemp: 35,
            idealHumidity: [60, 100],
            maxWind: 5,
            description: "Requires standing water during growth period. Ideal for water-retentive soils."
        },
        {
            name: "Wheat",
            suitableRegions: ["temperate"],
            soilTypes: ["loamy"],
            minRainfall: 500,
            maxRainfall: 1000,
            minTemp: 12,
            maxTemp: 25,
            idealHumidity: [40, 70],
            maxWind: 10,
            description: "Winter crop that thrives in cooler temperatures with moderate rainfall."
        },
        {
            name: "Maize",
            suitableRegions: ["tropical", "temperate"],
            soilTypes: ["loamy", "sandy"],
            minRainfall: 600,
            maxRainfall: 1200,
            minTemp: 18,
            maxTemp: 32,
            idealHumidity: [50, 80],
            maxWind: 8,
            description: "Fast-growing crop that requires well-drained soils and warm temperatures."
        },
        {
            name: "Millet",
            suitableRegions: ["arid", "tropical"],
            soilTypes: ["sandy", "loamy"],
            minRainfall: 300,
            maxRainfall: 700,
            minTemp: 25,
            maxTemp: 40,
            idealHumidity: [30, 60],
            maxWind: 12,
            description: "Drought-resistant crop ideal for dry regions with poor soil conditions."
        },
        {
            name: "Potatoes",
            suitableRegions: ["temperate"],
            soilTypes: ["loamy", "sandy"],
            minRainfall: 500,
            maxRainfall: 900,
            minTemp: 15,
            maxTemp: 25,
            idealHumidity: [50, 80],
            maxWind: 6,
            description: "Grows best in cool climates with well-drained soil and consistent moisture."
        }
    ];
}

function scoreCrops(crops, weather, regionType, soilType) {
    return crops.map(crop => {
        let score = 0;
        
        // Region match (30 points)
        if (crop.suitableRegions.includes(regionType)) score += 30;
        
        // Soil type match (20 points)
        if (crop.soilTypes.includes(soilType)) score += 20;
        
        // Temperature suitability (20 points)
        if (weather.temp >= crop.minTemp && weather.temp <= crop.maxTemp) {
            score += 20;
        } else {
            // Partial points for close matches
            const tempDiff = Math.min(
                Math.abs(weather.temp - crop.minTemp),
                Math.abs(weather.temp - crop.maxTemp)
            );
            score += Math.max(0, 20 - tempDiff);
        }
        
        // Rainfall (15 points)
        if (weather.rainfall >= crop.minRainfall && weather.rainfall <= crop.maxRainfall) {
            score += 15;
        } else if (weather.rainfall > 0) {
            // Partial points for rainfall
            const rainDiff = Math.min(
                Math.abs(weather.rainfall - crop.minRainfall),
                Math.abs(weather.rainfall - crop.maxRainfall)
            );
            score += Math.max(0, 15 - rainDiff/50);
        }
        
        // Humidity (10 points)
        if (weather.humidity >= crop.idealHumidity[0] && 
            weather.humidity <= crop.idealHumidity[1]) {
            score += 10;
        }
        
        // Wind tolerance (5 points)
        if (weather.windSpeed <= crop.maxWind) score += 5;
        
        return { ...crop, score };
    }).filter(crop => crop.score >= 60) // Filter out low scoring crops
      .sort((a, b) => b.score - a.score); // Sort by score descending
}

function displayRecommendations(crops, location) {
    let recommendationsHTML = `<h3>🌾 Recommended Crops for ${location.city || 'Your Location'}</h3>`;
    
    if (crops.length === 0) {
        recommendationsHTML += `
            <div class="crop-card">
                <p>No suitable crops found for current conditions.</p>
                <p>Consider adjusting your farming techniques or soil amendments.</p>
            </div>
        `;
    } else {
        crops.forEach(crop => {
            const suitabilityPercentage = Math.min(100, Math.round(crop.score));
            recommendationsHTML += `
                <div class="crop-card">
                    <h4>${crop.name} <span class="score-badge">${suitabilityPercentage}% match</span></h4>
                    <p>📊 <strong>Conditions Analysis:</strong> ${crop.description}</p>
                    <p>🌡️ <strong>Ideal Temperature:</strong> ${crop.minTemp}°C - ${crop.maxTemp}°C</p>
                    <p>💧 <strong>Rainfall Needed:</strong> ${crop.minRainfall}mm - ${crop.maxRainfall}mm annually</p>
                    <p>🌬️ <strong>Max Wind Tolerance:</strong> ${crop.maxWind} m/s</p>
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${suitabilityPercentage}%"></div>
                    </div>
                </div>
            `;
        });
    }

    document.getElementById('recommendations').innerHTML = recommendationsHTML;
}
