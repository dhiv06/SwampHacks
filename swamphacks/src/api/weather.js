// weather.js

const WEATHER_CODE_MAP = {
  0: "Clear",
  1: "Mostly Clear",
  2: "Partly Cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Fog",
  51: "Light Drizzle",
  53: "Drizzle",
  55: "Heavy Drizzle",
  61: "Light Rain",
  63: "Rain",
  65: "Heavy Rain",
  71: "Light Snow",
  73: "Snow",
  75: "Heavy Snow",
  80: "Rain Showers",
  95: "Thunderstorm"
};

export async function getCurrentWeather(latitude, longitude) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&current_weather=true` +
    `&hourly=relativehumidity_2m` +
    `&timezone=auto`;

  const response = await fetch(url);
  const data = await response.json();

  // Current temperature
  const temperature = data.current_weather.temperature;

  // Weather condition from code
  const weatherCode = data.current_weather.weathercode;
  const condition = WEATHER_CODE_MAP[weatherCode] || "Unknown";

  // Match humidity to current time
  const currentTime = data.current_weather.time;
  const timeIndex = data.hourly.time.indexOf(currentTime);
  const humidity = data.hourly.relativehumidity_2m[timeIndex];

  return {
    temperature, // °C
    condition,   // string
    humidity     // %
  };
}
