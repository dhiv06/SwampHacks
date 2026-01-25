import { GoogleGenerativeAI } from "@google/generative-ai";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy'; 
import * as Calendar from 'expo-calendar';
import { Image } from 'react-native';
import { Asset } from 'expo-asset'; 
import { getCurrentWeather } from './weather'; 

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_KEY);

// CONFIG: "gemini-1.5-pro-latest" is the correct alias for the current API
const MODEL_PRO = "gemini-2.0-pro-latest"; 
const MODEL_FLASH = "gemini-2.0-flash"; 
const CLOSET_KEY = 'user_closet_v7'; // Bumped version to v7 to ensure fresh database
const IMG_DIR = FileSystem.documentDirectory + 'closet_images/';

/* ----------------------- */
/* UTILS & HELPERS */
/* ----------------------- */

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

async function getBase64FromAsset(assetModule) {
  try {
    const asset = Asset.fromModule(assetModule);
    await asset.downloadAsync();
    const uri = asset.localUri || asset.uri;
    return await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  } catch (e) {
    console.error("Base64 Conversion Error:", e);
    return null;
  }
}

/* ----------------------- */
/* PHASE 1: AI ANALYSIS */
/* ----------------------- */

const SYSTEM_PROMPT = `
  SYSTEM INSTRUCTION: You are a luxury fashion archivist.
  IMPORTANT: If the item is jewelry (necklace, ring, watch) or a bag, you MUST use category: "accessory".
  TASK: Return this exact JSON:
  { 
    "category": "top" | "bottom" | "outerwear" | "shoes" | "accessory", 
    "sub_category": "string",
    "details": { "color": "string", "material": "string" }, 
    "vibes": ["vibe1", "vibe2"] 
  }
`;

async function runAIAnalysis(base64Data) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_FLASH, 
      generationConfig: { responseMimeType: "application/json" }
    });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT }, { inlineData: { data: base64Data, mimeType: "image/jpeg" } }] }]
    });
    return safeJSONParse(result?.response?.text(), null);
  } catch (e) { return null; }
}

export async function deconstructItem(imageUri) {
  const manipulated = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 1024 } }], 
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  
  const metadata = await runAIAnalysis(manipulated.base64);
  if (metadata) return await finalizeItem(metadata, manipulated.uri);
  return null;
}

async function finalizeItem(metadata, tempUri) {
  const newId = generateId();
  const permanentUri = await saveImageToDisk(tempUri, newId);

  let cat = metadata.category ? metadata.category.toLowerCase() : "";
  const synonyms = ["jewelry", "jewellery", "necklace", "ring", "bracelet", "earring", "watch", "bag", "handbag", "purse"];
  if (synonyms.some(s => cat.includes(s) || metadata.sub_category.toLowerCase().includes(s))) {
    metadata.category = "accessory";
  }

  const fullItem = { id: newId, ...metadata, imageUri: permanentUri };
  await saveToPhoneCloset(fullItem);
  return fullItem;
}

/* ----------------------- */
/* PHASE 2: STORAGE & SEEDING */
/* ----------------------- */

export async function seedProjectAssets() {
  try {
    const existingData = await AsyncStorage.getItem(CLOSET_KEY);
    // Remove the check below if you want to force re-seed every reload while debugging
    if (existingData && JSON.parse(existingData).length > 0) return; 

    let closet = [];
    const localAssets = [
      { id: 'shoes-blue', module: require('../../assets/images/clothingimages/blueshoes.webp') },
      { id: 'jewelry-gold', module: require('../../assets/images/clothingimages/gold.jpg') },
      { id: 'jacket-1', module: require('../../assets/images/clothingimages/jacket1.webp') },
      { id: 'jacket-2', module: require('../../assets/images/clothingimages/jacket2.jpg') },
      { id: 'jacket-3', module: require('../../assets/images/clothingimages/jacket3.webp') },
      { id: 'jeans-1', module: require('../../assets/images/clothingimages/jeans1.webp') },
      { id: 'jeans-2', module: require('../../assets/images/clothingimages/jeans2.webp') },
      { id: 'jeans-3', module: require('../../assets/images/clothingimages/jeans3.webp') },
      { id: 'shoes-red', module: require('../../assets/images/clothingimages/redshoes.avif') },
      { id: 'jewelry-rose', module: require('../../assets/images/clothingimages/rosegold.avif') },
      { id: 'jewelry-silver', module: require('../../assets/images/clothingimages/silver.jpg') },
      { id: 'top-1', module: require('../../assets/images/clothingimages/top1.webp') },
      { id: 'top-2', module: require('../../assets/images/clothingimages/top2.jpg') },
      { id: 'top-3', module: require('../../assets/images/clothingimages/top3.webp') },
      { id: 'top-4', module: require('../../assets/images/clothingimages/top4.jpg') },
      { id: 'top-5', module: require('../../assets/images/clothingimages/top5.jpg') },
      { id: 'top-6', module: require('../../assets/images/clothingimages/top6.jpg') },
      { id: 'shoes-white', module: require('../../assets/images/clothingimages/whiteshoes.webp') },
      { id: 'shoes-white-2', module: require('../../assets/images/clothingimages/whiteshoes2.webp') } 
    ];

    for (const item of localAssets) {
      console.log(`Seeding: ${item.id}`);
      const imageUri = Image.resolveAssetSource(item.module).uri;
      
      let metadata = {
        category: "unknown",
        sub_category: "Imported Item",
        details: { color: "unknown" },
        vibes: ["classic"]
      };

      if (item.id.includes('jewelry')) { metadata.category = "accessory"; metadata.sub_category = "Jewelry"; }
      else if (item.id.includes('shoes')) { metadata.category = "shoes"; }
      else if (item.id.includes('jacket')) { metadata.category = "outerwear"; }
      else if (item.id.includes('jeans') || item.id.includes('bottom')) { metadata.category = "bottom"; }
      else if (item.id.includes('top')) { metadata.category = "top"; }

      closet.push({ ...metadata, id: item.id, imageUri: imageUri, isStatic: true });
    }

    await AsyncStorage.setItem(CLOSET_KEY, JSON.stringify(closet));
  } catch (e) { console.error("Seeding failed:", e); }
}

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

export async function deleteItem(id) {
  try {
    const fullCloset = await getFullCloset();
    const itemToDelete = fullCloset.find(i => i.id === id);
    if (itemToDelete?.imageUri?.startsWith('file://')) {
      await FileSystem.deleteAsync(itemToDelete.imageUri, { idempotent: true });
    }
    const newCloset = fullCloset.filter(i => i.id !== id);
    await AsyncStorage.setItem(CLOSET_KEY, JSON.stringify(newCloset));
    return true;
  } catch (e) { return false; }
}

/* ----------------------- */
/* PHASE 3: SHOPPING STYLIST */
/* ----------------------- */

export async function getPeakOutfit(latitude, longitude, eventDescription = "") {
  try {
    const fullCloset = await getFullCloset();
    if (!fullCloset.length) return { error: "Add your first item!" };

    // Extract valid IDs to force AI to behave
    const validIds = fullCloset.map(i => i.id);
    const lightCloset = fullCloset.map(({ imageUri, ...rest }) => rest);
    
    let weather = { temperature: 20, condition: "Unknown" };
    try { weather = await getCurrentWeather(latitude, longitude); } catch (e) {}

    const prompt = `
      You are a Vogue stylist.
      Weather: ${weather.temperature}°C, ${weather.condition}. Event: ${eventDescription}.
      
      AVAILABLE INVENTORY (JSON): 
      ${JSON.stringify(lightCloset)}

      CRITICAL RULE: 
      You MUST select outfit items ONLY from the "AVAILABLE INVENTORY" provided above.
      Return the "id" exactly as it appears. Do not invent IDs.
      
      TASKS:
      1. Create a full outfit.
      2. Use Google Search to find 3 real affordable items that would elevate this look.

      RETURN JSON:
      {
        "outfit_ids": { 
          "top": "EXACT_ID_FROM_INVENTORY", 
          "bottom": "EXACT_ID_FROM_INVENTORY", 
          "shoes": "EXACT_ID_FROM_INVENTORY", 
          "accessory": "EXACT_ID_FROM_INVENTORY", 
          "outerwear": "EXACT_ID_FROM_INVENTORY_OR_NULL"
        },
        "color_scheme_analysis": "Briefly explain the color theory used.",
        "reasoning": "Why this works for the weather/event.",
        "shopping_suggestions": [
           { "item_name": "string", "price_estimate": "$XX", "store": "Store Name", "why": "short reason" },
           { "item_name": "string", "price_estimate": "$XX", "store": "Store Name", "why": "short reason" },
           { "item_name": "string", "price_estimate": "$XX", "store": "Store Name", "why": "short reason" }
        ]
      }
    `;

    // STRATEGY: Try Pro (Search enabled). If fails -> Try Flash (No Search).
    
    try {
      console.log("Attempting Gemini Pro...");
      const model = genAI.getGenerativeModel({ 
        model: MODEL_PRO,
        tools: [{ googleSearch: {} }],
        generationConfig: { responseMimeType: "application/json" }
      });
      const result = await model.generateContent(prompt);
      const parsed = safeJSONParse(result?.response?.text());
      if (parsed && parsed.outfit_ids) return parsed;
      throw new Error("Pro result invalid");

    } catch(err) {
      console.log("Pro/Search failed. Switching to Flash Backup.", err);
      
      // FALLBACK: Flash (Guaranteed to work, but no live search links)
      const modelFallback = genAI.getGenerativeModel({ 
        model: MODEL_FLASH, 
        generationConfig: { responseMimeType: "application/json" }
      });
      
      const fallbackPrompt = prompt + "\n NOTE: Google Search is unavailable, so invent plausible shopping suggestions based on general knowledge.";
      
      const result = await modelFallback.generateContent(fallbackPrompt);
      return safeJSONParse(result?.response?.text());
    }

  } catch (error) {
    console.log("Critical Stylist Failure", error);
    return { error: "Stylist is offline." };
  }
}

/* ----------------------- */
/* PHASE 4: MORNING PREP */
/* ----------------------- */
export async function getMorningWardrobePrep(latitude, longitude) {
  try {
    const weather = await getCurrentWeather(latitude, longitude);
    const closet = (await getFullCloset()).map(({ imageUri, ...rest }) => rest);
    const prompt = `Weather: ${weather.temperature}°C. Suggest item from: ${JSON.stringify(closet)}. JSON: { "briefing": "string", "suggested_item_ids": [] }`;
    const model = genAI.getGenerativeModel({ model: MODEL_FLASH, generationConfig: { responseMimeType: "application/json" } });
    const result = await model.generateContent(prompt);
    return safeJSONParse(result?.response?.text());
  } catch (e) {
    return { briefing: "Ready for the day!", suggested_item_ids: [] };
  }
}