require ('dotenv').config();

const input = document.getElementById('city-input');
const suggestions = document.getElementById('city-list');
const weatherInfo = document.getElementById('weather-info');


// requête API qui permet d'afficher une liste de ville en fonction de l'input du user
const searchCity = async (cityName) => {
  const url = `https://api.api-ninjas.com/v1/city?name=${cityName}&limit=10`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Api-Key': process.env.API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la requête API');
    }

    const cities = await response.json();
    return cities;
  } catch (error) {
    console.error('Erreur :', error);
    return [];
  }
};

// requête API pour récupérer la météo de la ville selectionner
const weatherData = async (cityName) => {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${process.env.WEATHER_API_KEY}&units=metric&lang=fr`;

  try {
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Erreur lors de la requête API météo');
    }

    const weather = await response.json();
    return weather;
  } catch (error) {
    console.error('Erreur :', error);
    return null;
  }
};

// fonction qui gère l'affichage des infos météo
function displayWeather(data) {
  if (!data || !data.list || !data.list.length) {
    weatherInfo.innerHTML = `<p>Aucune donnée météo disponible.</p>`;
    return;
  }

  const dailyForecasts = {};

  // Regrouper les prévisions par jour
  data.list.forEach(entry => {
    const date = entry.dt_txt.split(' ')[0];
    if (!dailyForecasts[date]) {
      dailyForecasts[date] = {
        minTemp: entry.main.temp_min,
        maxTemp: entry.main.temp_max,
        descriptions: [entry.weather[0].description],
        icons: [entry.weather[0].icon],
      };
    } else {
      dailyForecasts[date].minTemp = Math.min(dailyForecasts[date].minTemp, entry.main.temp_min);
      dailyForecasts[date].maxTemp = Math.max(dailyForecasts[date].maxTemp, entry.main.temp_max);
    }
  });

  const sortedDates = Object.keys(dailyForecasts).sort().slice(0, 5);

  const cityInfo = `<h3>Weather in ${data.city.name}, ${data.city.country}</h3>`;
  const forecasts = sortedDates.map(date => {
    const forecast = dailyForecasts[date];
    const description = [...new Set(forecast.descriptions)].join(', ');
    const icon = forecast.icons[0];
    const iconUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`;

    return `
      <div>
        <img src="${iconUrl}" alt="${description}" title="${description}" />
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Temperature:</strong> Min ${forecast.minTemp}°C</p>
        <p><strong>Temperature:</strong> Max ${forecast.maxTemp}°C</p>
        <p><strong>Conditions:</strong> ${description}</p>
      </div>
    `;
  }).join('');

  weatherInfo.innerHTML = `${cityInfo}${forecasts}`;
}

// afficher les suggestions de villes
input.addEventListener('keyup', async () => {
  const query = input.value.trim();

  if (query.length < 3) {
    suggestions.innerHTML = '';
    return;
  }

  const cities = await searchCity(query);
  suggestions.innerHTML = '';

  cities.forEach((city) => {
    const option = document.createElement('option');
    option.value = `${city.name}, ${city.country}`;
    suggestions.appendChild(option);
  });
});


// Bouton qui gère la sélection de ville et qui lance la requete API
const searchButton = document.getElementById('search-weather');

searchButton.addEventListener('click', async () => {
  const selectedCity = input.value.split(',')[0].trim();
  if (!selectedCity) {
    weatherInfo.innerHTML = `<p>Veuillez sélectionner une ville valide.</p>`;
    return;
  }

  const weather = await weatherData(selectedCity);
  if (weather) {
    displayWeather(weather);
    console.log(weather);
  }
});