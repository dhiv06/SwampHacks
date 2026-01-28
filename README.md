👗 AI Fashion Archivist & Stylist

An intelligent, local-first closet management and outfit styling application powered by Google Gemini 2.0. This project transforms your physical wardrobe into a digital archive, providing real-time styling advice based on weather, events, and current fashion trends.

🚀 The Vision

Most digital closet apps fail because they require too much manual data entry. Our solution uses Computer Vision and LLM Grounding to automate the process. By combining your personal inventory with live weather data and Google Search, we provide a "Vogue-level" stylist in your pocket.

✨ Key Features

1. AI Image Deconstruction

Snap a photo of any item. The runAIAnalysis engine automatically tags:

Category & Sub-category: Intelligent classification (e.g., differentiating between a "top" and an "accessory").

Material & Color: Extracts deep details using computer vision.

Aesthetic Vibes: Assigns styles like "minimalist," "vintage," or "streetwear" to help with curated matching.

2. The "Peak Outfit" Generator

Our stylist engine looks at:

Inventory Matching: Strictly selects items only from your scanned closet IDs.

Weather Grounding: Checks temperature ($^\circ$C) and conditions via GPS coordinates.

Vogue-Level Reasoning: Provides a color theory analysis for why the outfit works for the specific event (e.g., Job Interview vs. Beach Day).

3. Smart Shopping Integration

Using Gemini’s Google Search Tooling, the app identifies "missing pieces" in your look and suggests three real-world products from major retailers to elevate your current wardrobe.

🛠️ Technical Architecture

🧠 The AI Core (Gemini 2.0)

We utilize a multi-model strategy to balance speed and depth:

Gemini 2.0 Flash: Handles rapid image deconstruction and daily morning briefings.

Gemini 2.0 Pro: Powering "Stylist Mode" with Google Search Grounding for real-time fashion trends and shopping suggestions.

Fallback Logic: A robust failover system that switches from Pro to Flash to ensure the user experience is never interrupted.

📱 Mobile Stack & Storage

React Native / Expo: High-performance cross-platform framework for a native feel.

Local-First Architecture: * expo-file-system: Stores high-res images locally for privacy and speed.

AsyncStorage: Manages a lightweight JSON database of clothing metadata.

Contextual Awareness: Integrated with expo-location and real-time Weather APIs.

⚙️ Installation & Setup

1. Prerequisites

Node.js (LTS version recommended).

Expo Go app installed on your iOS or Android device.

Google Gemini API Key: Obtain one for free at Google AI Studio.

2. Clone & Install

# Clone the repository
git clone [https://github.com/your-username/ai-closet-stylist.git](https://github.com/your-username/ai-closet-stylist.git)
cd ai-closet-stylist

# Install dependencies
npm install


3. Environment Configuration

Create a file named .env in the root directory and add your API key:

EXPO_PUBLIC_GEMINI_KEY=YOUR_GEMINI_API_KEY_HERE


4. Running the App

# Start the Expo development server
npx expo start


Scan the QR code with your phone's camera (iOS) or the Expo Go app (Android).

Ensure your phone and computer are on the same Wi-Fi network.

📊 Data Schema

Items are archived using the following structured format to ensure LLM readability:

{
  "id": "1738123456-x9z",
  "category": "outerwear",
  "sub_category": "Leather Biker Jacket",
  "details": {
    "color": "Obsidian Black",
    "material": "Full-grain Leather"
  },
  "vibes": ["edgy", "classic"],
  "imageUri": "file:///closet_images/1738123456-x9z.jpg"
}


🏆 Hackathon Value Proposition

Privacy-Centric: All clothing images remain on the user's device, not a central server.

Hybrid AI Strategy: Optimized for performance by utilizing Flash for vision and Pro for deep reasoning.

Zero-Entry Onboarding: Includes a seedProjectAssets function so judges see a fully functional, stylish closet immediately upon launch.

Developed for the 2026 AI Innovation Hackathon.
