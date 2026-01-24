import { GoogleGenerativeAI } from "@google/generative-ai";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';
import { getCurrentWeather } from '../api/weather'; 
import * as Calendar from 'expo-calendar';

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_KEY);

/* ----------------------- */
/* UTILS */
/* ----------------------- */

function safeJSONParse(text, fallback = null) {
  try {
    if (!text) return fallback;
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * HELPER: Compress Image
 */
async function processImageForStorage(uri) {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 600 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  return result.base64;
}

/* ----------------------- */
/* PHASE 1: DECONSTRUCTOR */
/* ----------------------- */

export async function deconstructItem(imageUri) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    systemInstruction: "You are a textile expert. Return ONLY valid JSON.",
    generationConfig: { responseMimeType: "application/json" }
  });

  try {
    const base64Data = await processImageForStorage(imageUri);

    const prompt = `Analyze this image and return this exact JSON structure:
    { 
      "category": "top" | "bottom" | "outerwear" | "accessory", 
      "details": { "color": "", "material": "", "pattern": "", "neckline": "" }, 
      "care_tips": "",
      "sustainability": 5, 
      "est_value": 0, 
      "vibes": [] 
    }`;

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
        ]
      }]
    });

    const metadata = safeJSONParse(result?.response?.text(), null);
    if (!metadata || !metadata.category) return null;

    await saveToPhoneCloset(metadata, base64Data);
    return metadata;
  } catch (error) {
    console.error("Deconstruct Error:", error);
    return null;
  }
}

/* ----------------------- */
/* PHASE 2: STORAGE */
/* ----------------------- */

async function saveToPhoneCloset(metadata, base64Image) {
  try {
    const existing = await AsyncStorage.getItem('user_closet');
    const closet = existing ? JSON.parse(existing) : [];

    closet.push({
      id: generateId(),
      ...metadata,
      image: base64Image
    });

    await AsyncStorage.setItem('user_closet', JSON.stringify(closet));
  } catch (e) {
    console.error("Storage Save Error:", e);
  }
}

export async function getFullCloset() {
  const data = await AsyncStorage.getItem('user_closet');
  return data ? JSON.parse(data) : [];
}

/* ----------------------- */
/* PHASE 3: SMART STYLIST */
/* ----------------------- */

export async function getPeakOutfit(latitude, longitude, userVibe, budget, eventDescription = "") {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    tools: [{ googleSearch: {} }],
    systemInstruction: "You are a celebrity stylist. Return ONLY JSON. Do NOT invent IDs or links.",
    generationConfig: { responseMimeType: "application/json" }
  });

  try {
    const fullCloset = await getFullCloset();
    if (!fullCloset.length) return { error: "Add your first item!" };

    const lightCloset = fullCloset.map(({ image, ...rest }) => rest);
    const weather = await getCurrentWeather(latitude, longitude);

    const prompt = `
      CONTEXT: Weather ${weather.temperature}°C, ${weather.condition}. Event: ${eventDescription}.
      CLOSET: ${JSON.stringify(lightCloset)}

      TASK:
      1. Use ONLY provided IDs.
      2. Identify a wardrobe gap.
      3. Suggest stores if possible, otherwise return empty arrays.

      JSON:
      {
        "outfit": { "top_id": "", "bottom_id": "", "accessory_id": "" },
        "wardrobe_gap": { "item": "", "local_stores": [], "online_links": [] },
        "stylist_note": ""
      }
    `;

    const result = await model.generateContent(prompt);
    return safeJSONParse(result?.response?.text(), { error: "Styling failed." });
  } catch (error) {
    console.error("Styling Error:", error);
    return { error: "Stylist is offline." };
  }
}

/* ----------------------- */
/* PHASE 4: MORNING PREP */
/* ----------------------- */

export async function getMorningWardrobePrep(latitude, longitude) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    let eventSummary = "a quiet day";

    if (status === 'granted') {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const calendarIds = calendars.map(c => c.id);
      const start = new Date(); start.setHours(0,0,0,0);
      const end = new Date(); end.setHours(23,59,59,999);
      const events = await Calendar.getEventsAsync(calendarIds, start, end);
      if (events.length) eventSummary = events.map(e => e.title).join(', ');
    }

    const weather = await getCurrentWeather(latitude, longitude);
    const closet = (await getFullCloset()).map(({ image, ...rest }) => rest);

    const prompt = `
      Weather: ${weather.temperature}°C
      Schedule: ${eventSummary}
      Closet: ${JSON.stringify(closet)}

      Return JSON:
      { "briefing": "", "selected_ids": [], "pro_tip": "", "vibe_check": "" }
    `;

    const result = await model.generateContent(prompt);
    return safeJSONParse(result?.response?.text(), {
      briefing: "Ready for anything!",
      selected_ids: [],
      pro_tip: "",
      vibe_check: ""
    });
  } catch {
    return { briefing: "Ready for anything!", selected_ids: [], pro_tip: "" };
  }
}

/* ----------------------- */
/* PHASE 5: UTILS */
/* ----------------------- */

export async function clearCloset() {
  await AsyncStorage.removeItem('user_closet');
}

/* ----------------------- */
/* PHASE 6: INSPO MATCHER */
/* ----------------------- */

export async function getInspiredOutfit(inspirationImageUri, userVibe = "casual") {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  try {
    const closet = (await getFullCloset()).map(({ image, ...rest }) => rest);
    const inspirationBase64 = await processImageForStorage(inspirationImageUri);

    const prompt = `
      Analyze the inspiration image.
      Match items from this closet ONLY: ${JSON.stringify(closet)}

      Return JSON:
      {
        "inspiration_analysis": "",
        "recommended_ids": [],
        "why_it_works": "",
        "missing_link": ""
      }
    `;

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { data: inspirationBase64, mimeType: "image/jpeg" } }
        ]
      }]
    });

    return safeJSONParse(result?.response?.text(), { error: "Inspo failed." });
  } catch {
    return { error: "Could not process inspiration." };
  }
}
