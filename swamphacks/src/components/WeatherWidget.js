import { useEffect, useState } from "react";
// import { View, Text, StyleSheet } from "react-native";
import { getCurrentWeather } from "../api/weather";
import { View, Text, StyleSheet, Image } from "react-native";


const IMAGES = {
  cloudy: require('../../assets/images/newicons/cloudy.png'),
  cold: require('../../assets/images/newicons/cold.png'),
  rain: require('../../assets/images/newicons/rain.png'),
  snowy: require('../../assets/images/newicons/snowy.png'),
  sunny_cloudy: require('../../assets/images/newicons/sunny_cloudy.png'),
  sunny: require('../../assets/images/newicons/sunny.png'),
};

function getWeatherVibe(weather) {
  const temp = weather.temperature;
  const condition = weather.condition.toLowerCase();

  if (temp <= 5) {
    return {
      message: "Stay warm ❄️",
      image: IMAGES.cold,
    };
  }

  if (temp <= 12) {
    return {
      message: "Layer up 🧥",
      image: IMAGES.cloudy,
    };
  }

  if (condition.includes("rain")) {
    return {
      message: "Don’t forget an umbrella ☔",
      image: IMAGES.rain,
    };
  }

  if (condition.includes("snow")) {
    return {
      message: "Snow day vibes ☃️",
      image: IMAGES.snowy,
    };
  }

  if (condition.includes("sun")) {
    return {
      message: "Sunny & cute ☀️",
      image: IMAGES.sunny,
    };
  }

  return {
    message: "Have a cute day ✨",
    image: IMAGES.sunny_cloudy,
  };
}


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

  const vibe = getWeatherVibe(weather);

  return (
    <View style={styles.row}>
        <View style={styles.vibeBlock}>
            <Image source={vibe.image} style={styles.vibeImage}/>
            <Text style={styles.vibeText}>{vibe.message}</Text>
            </View>
        
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
  },
  vibeBlock: {
  flex: 1,
  alignItems: "flex-start",
  justifyContent: "center",
},

vibeImage: {
  width: 40,
  height: 40,
  resizeMode: "contain",
  marginBottom: 4,
},

vibeText: {
  fontSize: 12,
  color: "#52796F",
  fontWeight: "500",
},

});
