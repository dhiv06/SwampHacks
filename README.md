⚙️ Installation & Setup

1. Prerequisites

Node.js (LTS version recommended).

Expo Go app installed on your iOS or Android device.

Google Gemini API Key: Obtain one for free at Google AI Studio.

2. Clone & Install

# Clone the repository
git clone https://github.com/dhiv06/SwampHacks.git
cd swamphacks

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
