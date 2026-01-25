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
    return <Text style={styles.loading}> Looking outside...</Text>;
  }

  return (
    <View style={styles.row}>
        <View style={styles.leftSpace} />
        <View style={styles.weatherBlock}>
      <Text style={styles.temp}>{weather.temperature}°C</Text>
      <Text style={styles.condition}>{weather.condition}</Text>
      <Text style={styles.humidity}>Humidity: {weather.humidity}%</Text>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
    row:{
        flexDirection: "row",
        alignItems: "center",
    },
    leftSpace:{
        flex: 1,
    },
    weatherBlock:{
        alignItems: "flex-end",
    },
  temp: {
    color: "#2F3E46",
    fontSize: 18,
    fontWeight: "bold"
  },
  condition: {
    color: "#52796F",
    fontSize: 14
  },
  humidity: {
    color: "#52796F",
    fontSize: 12
  },
  loading: {
    fontSize: 14,
    color: "#52796F",
  }
});
