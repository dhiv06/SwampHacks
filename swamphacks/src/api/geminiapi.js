import { GoogleGenerativeAI } from "@google/generative-ai";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';
// FIXED: Added /legacy back as requested
import * as FileSystem from 'expo-file-system/legacy'; 
import * as Calendar from 'expo-calendar';
import { getCurrentWeather } from './weather'; 

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_KEY);

// CONFIG: We define both models here
const MODEL_PRO = "gemini-2.0-pro"; 
const MODEL_FLASH = "gemini-2.0-flash"; 

/* ----------------------- */
/* UTILS & HELPERS */
/* ----------------------- */

const CLOSET_KEY = 'user_closet_v5'; // Bump version
const IMG_DIR = FileSystem.documentDirectory + 'closet_images/';

async function ensureDirExists() {
  const dirInfo = await FileSystem.getInfoAsync(IMG_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(IMG_DIR, { intermediates: true });
  }
}

function safeJSONParse(text, fallback = null) {
  try {
    if (!text) return fallback;
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch {
    return fallback;
  }
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function saveImageToDisk(tempUri, id) {
  await ensureDirExists();
  const filename = `${id}.jpg`;
  const destination = IMG_DIR + filename;
  await FileSystem.copyAsync({ from: tempUri, to: destination });
  return destination;
}

/* ----------------------- */
/* PHASE 1: ROBUST DECONSTRUCTOR */
/* ----------------------- */

export async function deconstructItem(imageUri) {
  // 1. High Quality Image Processing (burns credits, better results)
  const manipulated = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 1024 } }], 
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  
  const base64Data = manipulated.base64;

  const prompt = `
    SYSTEM INSTRUCTION: You are a luxury fashion archivist. Identify the item with extreme precision.
    TASK: Analyze this image and return this exact JSON structure:
    { 
      "category": "top" | "bottom" | "outerwear" | "shoes" | "accessory", 
      "sub_category": "string (e.g. 'Distressed Dad Jeans', 'Silk Camisole')",
      "details": { "color": "specific color name", "material": "guessed material", "pattern": "" }, 
      "care_tips": "1 sentence expert care tip",
      "vibes": ["list", "of", "3", "vibes"] 
    }
  `;

  // 2. Try PRO Model first
  try {
    console.log("Attempting Gemini 1.5 Pro...");
    const model = genAI.getGenerativeModel({ 
      model: MODEL_PRO,
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Data, mimeType: "image/jpeg" } }] }]
    });

    const metadata = safeJSONParse(result?.response?.text(), null);
    if (metadata) return await finalizeItem(metadata, manipulated.uri);
    throw new Error("Pro returned empty");

  } catch (error) {
    console.log("Pro failed, switching to Flash...", error.message);
    
    // 3. Fallback to FLASH Model (Guaranteed to work)
    try {
      const modelFlash = genAI.getGenerativeModel({ 
        model: MODEL_FLASH,
        generationConfig: { responseMimeType: "application/json" }
      });

      const result = await modelFlash.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Data, mimeType: "image/jpeg" } }] }]
      });

      const metadata = safeJSONParse(result?.response?.text(), null);
      if (metadata) return await finalizeItem(metadata, manipulated.uri);
    } catch (e) {
      console.error("Critical Failure:", e);
      return null;
    }
  }
}

// Helper to save item after AI success
async function finalizeItem(metadata, tempUri) {
  const newId = generateId();
  const permanentUri = await saveImageToDisk(tempUri, newId);
  const fullItem = { id: newId, ...metadata, imageUri: permanentUri };
  await saveToPhoneCloset(fullItem);
  return fullItem;
}

/* ----------------------- */
/* PHASE 2: STORAGE */
/* ----------------------- */

async function saveToPhoneCloset(fullItemObject) {
  try {
    const existing = await AsyncStorage.getItem(CLOSET_KEY);
    const closet = existing ? JSON.parse(existing) : [];
    closet.push(fullItemObject);
    await AsyncStorage.setItem(CLOSET_KEY, JSON.stringify(closet));
  } catch (e) { console.error("Storage Error:", e); }
}

export async function getFullCloset() {
  const data = await AsyncStorage.getItem(CLOSET_KEY);
  return data ? JSON.parse(data) : [];
}

/* ----------------------- */
/* PHASE 3: STYLIST (WITH FALLBACK) */
/* ----------------------- */

export async function getPeakOutfit(latitude, longitude, eventDescription = "") {
  try {
    const fullCloset = await getFullCloset();
    if (!fullCloset.length) return { error: "Add your first item!" };

    // Optimize payload
    const lightCloset = fullCloset.map(({ imageUri, ...rest }) => rest);
    let weather = { temperature: 20, condition: "Unknown" };
    try { weather = await getCurrentWeather(latitude, longitude); } catch (e) {}

    const prompt = `
      You are a Vogue stylist. 
      CONTEXT: Weather ${weather.temperature}°C, ${weather.condition}. Event: ${eventDescription}.
      INVENTORY: ${JSON.stringify(lightCloset)}

      TASK:
      Pick an outfit from inventory matching the vibe.
      RETURN JSON:
      {
        "outfit_ids": { "top": "id", "bottom": "id", "outerwear": "id", "shoes": "id" },
        "reasoning": "Reasoning referencing the trends",
        "missing_item_suggestion": "string"
      }
    `;

    // Attempt Pro
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_PRO, generationConfig: { responseMimeType: "application/json" }});
      const result = await model.generateContent(prompt);
      return safeJSONParse(result?.response?.text());
    } catch (err) {
      console.log("Stylist Pro failed, using Flash.");
      // Fallback Flash
      const modelFlash = genAI.getGenerativeModel({ model: MODEL_FLASH, generationConfig: { responseMimeType: "application/json" }});
      const result = await modelFlash.generateContent(prompt);
      return safeJSONParse(result?.response?.text());
    }

  } catch (error) {
    console.error("Styling Error:", error);
    return { error: "Stylist is offline." };
  }
}

/* ----------------------- */
/* PHASE 4: MORNING PREP */
/* ----------------------- */

export async function getMorningWardrobePrep(latitude, longitude) {
  // We just use Flash for this one to keep it snappy on load
  const model = genAI.getGenerativeModel({
    model: MODEL_FLASH,
    generationConfig: { responseMimeType: "application/json" }
  });

  try {
    let eventSummary = "No specific events";
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status === 'granted') {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const calendarIds = calendars.filter(c => c.isPrimary).map(c => c.id);
      if(calendarIds.length > 0) {
        const start = new Date(); start.setHours(0,0,0,0);
        const end = new Date(); end.setHours(23,59,59,999);
        const events = await Calendar.getEventsAsync(calendarIds, start, end);
        if (events.length) eventSummary = events.slice(0, 5).map(e => e.title).join(', ');
      }
    }

    const weather = await getCurrentWeather(latitude, longitude);
    const closet = (await getFullCloset()).map(({ imageUri, ...rest }) => rest);

    const prompt = `
      Weather: ${weather.temperature}°C, ${weather.condition}
      Schedule: ${eventSummary}
      Closet: ${JSON.stringify(closet)}

      Return JSON:
      { 
        "briefing": "Vibe check summary", 
        "suggested_item_ids": [], 
        "outfit_tip": "Styling advice" 
      }
    `;

    const result = await model.generateContent(prompt);
    return safeJSONParse(result?.response?.text(), { briefing: "Good morning!", suggested_item_ids: [] });
  } catch (e) {
    return { briefing: "Ready for anything!", suggested_item_ids: [] };
  }
}

/* ----------------------- */
/* PHASE 5: CLEANUP */
/* ----------------------- */

export async function deleteItem(id) {
  try {
    const fullCloset = await getFullCloset();
    const itemToDelete = fullCloset.find(i => i.id === id);
    if (itemToDelete?.imageUri) {
      await FileSystem.deleteAsync(itemToDelete.imageUri, { idempotent: true });
    }
    const newCloset = fullCloset.filter(i => i.id !== id);
    await AsyncStorage.setItem(CLOSET_KEY, JSON.stringify(newCloset));
  } catch (e) { console.error(e); }
}