const iconElement = document.querySelector(".weather-icon i");
const tempElement = document.querySelector(".temperature-value");
const descElement = document.querySelector(".temperature-description");
const locationElement = document.querySelector(".location");
const notificationElement = document.querySelector(".notification");

const weather = {};
weather.temperature = { unit: "celsius" };

const key = "82005d27a116c2880c8f0fcb866998a0";

if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(setPosition, showError);
} else {
    displayNotification("Browser doesn't Support Geolocation");
}

function setPosition(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    getWeather(latitude, longitude);
}

function showError(error) {
    displayNotification(error.message);
}

function displayNotification(message) {
    notificationElement.style.display = "block";
    notificationElement.innerHTML = `<p>${message}</p>`;
}

function getWeather(latitude, longitude) {
    let currentWeatherAPI = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}&units=metric`;
    let forecastAPI = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${key}&units=metric`;

    fetch(currentWeatherAPI)
        .then(response => response.json())
        .then(data => {
            weather.temperature.value = Math.floor(data.main.temp);
            weather.temperature.unit = "celsius";  
            weather.description = data.weather[0].description;
            weather.iconId = data.weather[0].id;
            weather.city = data.name;
            weather.country = data.sys.country;
        })
        .then(() => {
            displayWeather();
        });

    fetch(forecastAPI)
        .then(response => response.json())
        .then(data => {
            displayForecast(data.list);
        });
}

function displayWeather() {
    iconElement.className = `wi wi-owm-${weather.iconId}`;
    let temperature = weather.temperature.value;

    if (weather.temperature.unit === "fahrenheit") {
        temperature = Math.floor(celsiusToFahrenheit(temperature));
        tempElement.innerHTML = `${temperature}°<span>F</span>`;
    } else {
        tempElement.innerHTML = `${temperature}°<span>C</span>`;
    }

    descElement.innerHTML = weather.description;
    locationElement.innerHTML = `${weather.city}, ${weather.country}`;
}

function celsiusToFahrenheit(temperature) {
    return (temperature * 9 / 5) + 32;
}

tempElement.addEventListener("click", function () {
    if (weather.temperature.value === undefined) return;

    if (weather.temperature.unit === "celsius") {
        weather.temperature.unit = "fahrenheit";
    } else {
        weather.temperature.unit = "celsius";
    }
    displayWeather();
});

function displayForecast(forecastList) {
    let forecastContainer = document.querySelector(".forecast-container");
    forecastContainer.innerHTML = ""; 

    let daysProcessed = [];

    forecastList.forEach(forecast => {
        let date = new Date(forecast.dt * 1000);
        let day = date.toLocaleDateString("en-US", { weekday: 'long' });

        if (!daysProcessed.includes(day)) {
            daysProcessed.push(day);

            let dateString = date.toLocaleDateString("en-US", {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
            });

            let temp = Math.floor(forecast.main.temp);
            let description = forecast.weather[0].description;
            let iconId = forecast.weather[0].id;

            forecastContainer.innerHTML += `
                <div class="forecast-item">
                    <p class="forecast-date">${dateString}</p>
                    <i class="wi wi-owm-${iconId}"></i>
                    <p>${temp}°C</p>
                    <p>${description}</p>
                </div>`;
        }
    });
}

document.getElementById("search-button").addEventListener("click", function () {
    const city = document.getElementById("search-input").value;
    if (city) {
        getWeatherByCity(city);
    }
});

// Function to fetch weather by city name
function getWeatherByCity(city) {
    let api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=metric`;
    let forecastAPI = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}&units=metric`;

    fetch(api)
        .then(response => response.json())
        .then(data => {
            if (parseInt(data.cod) !== 200) {
                displayNotification("City not found");
            } else {
                notificationElement.style.display = "none";

                weather.temperature.value = Math.floor(data.main.temp);
                weather.temperature.unit = "celsius"; 
                weather.description = data.weather[0].description;
                weather.iconId = data.weather[0].id;
                weather.city = data.name;
                weather.country = data.sys.country;

                displayWeather();
            }
        })
        .catch(error => console.error("Error fetching weather data: ", error));

    fetch(forecastAPI)
        .then(response => response.json())
        .then(data => {
            displayForecast(data.list);
        });
}

// Dark mode toggle
const darkModeButton = document.getElementById("dark-mode-button");
darkModeButton.addEventListener("click", () => {
    document.body.classList.toggle("dark");
 
    if (document.body.classList.contains("dark")) {
        darkModeButton.innerHTML = '<i class="wi wi-moon-full"></i>';
    } else {
        darkModeButton.innerHTML = '<i class="wi wi-day-sunny"></i>';
    }
});
