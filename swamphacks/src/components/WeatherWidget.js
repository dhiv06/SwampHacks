import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { getCurrentWeather } from "../api/weather";

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    async function loadWeather() {
      try {
        const data = await getCurrentWeather(29.65, -82.34);
        setWeather(data);
      } catch (error) {
        console.error("Failed to load weather:", error);
      }
    }

    loadWeather();
  }, []);

  if (!weather) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.temp}>{weather.temperature}°C</Text>
      <Text style={styles.condition}>{weather.condition}</Text>
      <Text style={styles.humidity}>Humidity: {weather.humidity}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 10,
    borderRadius: 10,
    zIndex: 1000
  },
  temp: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold"
  },
  condition: {
    color: "white",
    fontSize: 14
  },
  humidity: {
    color: "white",
    fontSize: 12
  }
});
