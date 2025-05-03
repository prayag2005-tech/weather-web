// Initialize the map
const map = L.map('map', {
    center: [20.5937, 78.9629], // Center on India
    zoom: 5, // Initial zoom level
    zoomControl: true // Enable zoom controls
});

// Add a custom tile layer (using CartoDB Positron for a clean map)
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CartoDB</a>'
}).addTo(map);

// Custom Icon for the marker 
const customIcon = L.icon({
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Pin_icon.svg/2048px-Pin_icon.svg.png', // A custom pin image
    iconSize: [30, 30], // Size of the icon
    iconAnchor: [15, 30], // Point of the icon which will correspond to the marker's location
    popupAnchor: [0, -30] // Adjust where the popup shows relative to the icon
});

// Function to capitalize city names capital it
function capitalizeCityName(cityName) {
    return cityName
        .split(' ') // Split by spaces (to handle multi-word cities)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter of each word
        .join(' '); // Join words back together
}

// Fetch weather by city name 
function fetchCityWeather(city) {
    const apiKey = "ffaf13be2ebb140a939f88c2e5b399fd"; // Your OpenWeatherMap API key
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                // Normalize the city name
                const cityName = capitalizeCityName(data.name);

                // Update the weather information
                document.getElementById("weather-info").style.display = "block";
                document.getElementById("city-name").textContent = `${cityName}, ${data.sys.country}`;
                document.getElementById("temperature").textContent = `Temperature: ${data.main.temp}°C`;
                document.getElementById("description").textContent = `Description: ${data.weather[0].description}`;
                document.getElementById("humidity").textContent = `Humidity: ${data.main.humidity}%`;

                // Center the map and add a custom marker
                map.setView([data.coord.lat, data.coord.lon], 10, { animate: true }); // Smooth transition to new city
                L.marker([data.coord.lat, data.coord.lon], { icon: customIcon })
                    .addTo(map)
                    .bindPopup(`<b>${cityName}</b><br>Temperature: ${data.main.temp}°C`)
                    .openPopup();
            } else {
                alert("City not found.");
            }
        })
        .catch(err => console.error(err));
}

// Fetch 5-day forecast by city name
function fetchFiveDayForecast(city) {
    const apiKey = "ffaf13be2ebb140a939f88c2e5b399fd"; // Your OpenWeatherMap API key
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === "200") {
                const forecast = data.list.filter((item, index) => index % 8 === 0); // Get one data point per day
                const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'];

                forecast.forEach((forecastData, index) => {
                    const dayCard = document.getElementById(`day${index + 1}`);
                    dayCard.textContent = `${days[index]}: ${forecastData.main.temp}°C, ${forecastData.weather[0].description}`;
                    dayCard.classList.add('visible');
                });

                document.getElementById("five-day-forecast").style.display = "flex"; // Show the forecast cards
            }
        })
        .catch(err => console.error(err));
}

// Event listeners for buttons
document.getElementById("searchBtn").addEventListener("click", () => {
    const city = document.getElementById("city").value;
    if (!city) {
        alert("Please enter a city name.");
        return;
    }
    fetchCityWeather(city);
    // Do NOT trigger the 5-day forecast here
});

document.getElementById("refreshBtn").addEventListener("click", () => {
    const city = document.getElementById("city").value;
    if (!city) {
        alert("Please enter a city name to refresh weather.");
        return;
    }
    // Refresh the data: Hide forecast and reset current weather info
    document.getElementById("five-day-forecast").style.display = "none";
    document.getElementById("weather-info").style.display = "none";
    document.getElementById("city").value = '';  // Clear the search bar
});

// Event listener for the 5-day forecast button
document.getElementById("forecastBtn").addEventListener("click", () => {
    const city = document.getElementById("city").value;
    if (!city) {
        alert("Please enter a city name to get 5-day forecast.");
        return;
    }
    fetchFiveDayForecast(city);
});

// Function to fetch weather based on latitude and longitude (for map clicks)
function fetchWeatherByCoordinates(lat, lon) {
    const apiKey = "ffaf13be2ebb140a939f88c2e5b399fd"; // Your OpenWeatherMap API key
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                const cityName = data.name;
                const temperature = data.main.temp;
                // Display the temperature in a popup at the clicked location
                L.popup()
                    .setLatLng([lat, lon])
                    .setContent(`<b>${cityName}</b><br>Temperature: ${temperature}°C`)
                    .openOn(map);
            } else {
                console.error("City not found.");
            }
        })
        .catch(err => console.error(err));
}

// Event listener for map clicks (to fetch weather for clicked locations)
map.on('click', function (e) {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;

    // Call the function to fetch weather for the clicked location
    fetchWeatherByCoordinates(lat, lon);
});
