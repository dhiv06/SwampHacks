import { getCurrentWeather } from "./weather.js";

const latitude = 29.65;
const longitude = -82.34;

const weather = await getCurrentWeather(latitude, longitude);

console.log("Temperature:", weather.temperature);
console.log("Condition:", weather.condition);
console.log("Humidity:", weather.humidity);

// import fetch from 'node-fetch';

// const latitude = 29.65;
// const longitude = -82.34;

// const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m`;

// async function getWeather() {
//   try {
//     const response = await fetch(url);
//     const data = await response.json();
//     console.log('Weather data:', data);
//   } catch (error) {
//     console.error('Error fetching weather:', error);
//   }
// }

// getWeather();