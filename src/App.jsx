import React, { useState } from 'react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import Camera from './components/Camera';
import Results from './components/Results';
import BackgroundLoop from './components/BackgroundLoop';
import { Sparkles } from 'lucide-react';
import './App.css';

const App = () => {
  const [view, setView] = useState('camera'); // camera, analyzing, results
  const [analysisData, setAnalysisData] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const handleCapture = async (imageDataUrl) => {
    setCapturedImage(imageDataUrl);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      alert("Setup Error: API Key is missing in environment variables. Please set VITE_GEMINI_API_KEY.");
      return;
    }

    setView('analyzing');

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        ]
      });

      const prompt = `
        Analyze this outfit photo with high precision.
        
        1. BRAND RECOGNITION: Look closely for logos, signature design patterns (e.g., Nike Swoosh, Adidas stripes, Gucci print, Supreme box logo), and specific style markers to identify brands for:
           - Top
           - Bottom
           - Shoes (Be very specific, e.g., "Nike Air Jordan 1", "Yeezy 350")
           - Accessories
        
        2. RATING (0-10): Be CRITICAL and honest. Do NOT default to 7.
           - Use the full range: 2-4 for poor effort, 5-6 for average, 7-8 for good, 9 for amazing, 10 ONLY for absolute perfection.
           - If the fit is basic, rate it lower (5-6).
           - If it's unique and well-coordinated, rate it higher (8-9).
        
        3. ANALYSIS:
           - For each item: color, specific detail, style category (streetwear, luxury, vintage, techwear, etc.), estimated price range ($), and DETECTED BRAND (if unsure, say "Unbranded" or "Similar to [Brand]").
        
        4. SCORES (0-10):
           - Style: Creativity and silhouette.
           - Colors: Coordination and palette.
           - Trend: How current is the look?
           - Drip Level: 0-1000 (be generous for fire fits).
        
        5. SUMMARY: A short, bold, energetic, Gen Z style summary (max 2 sentences). Use slang like "clean", "fire", "mid", "drip".

        Return ONLY raw valid JSON with this structure:
        {
          "rating": number,
          "summary": "string",
          "items": [ { "name": "string", "details": "string", "price": "string", "brand": "string" } ],
          "scores": { "style": number, "colors": number, "trend": number, "drip": number }
        }
      `;

      // Remove header from data URL
      const base64Image = imageDataUrl.split(',')[1];

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: "image/jpeg",
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();
      console.log("Raw AI Response:", text);

      // Robust JSON extraction
      let jsonString = text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }

      try {
        const data = JSON.parse(jsonString);
        setAnalysisData(data);
        setView('results');
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.log("Failed Text:", text);
        throw new Error("Failed to parse AI response. Please try again.");
      }

    } catch (error) {
      console.error("Analysis failed:", error);
      alert(`Analysis failed: ${error.message || "Unknown error"}. Please check your API key and try again.`);
      setView('camera');
    }
  };

  return (
    <div className="app">
      <BackgroundLoop />

      <div className="header">
        <h1 className="logo neon-text">RATE MY FIT</h1>
      </div>

      <main className="main-content">
        {view === 'camera' && (
          <Camera onCapture={handleCapture} />
        )}

        {view === 'analyzing' && (
          <div className="analyzing-screen center">
            <div className="loader">
              <Sparkles size={64} className="sparkle-icon" />
              <div className="analyzing-text neon-text">AI ANALYZING FIT...</div>
              <div className="analyzing-subtext">CALCULATING DRIP LEVELS</div>
            </div>
          </div>
        )}

        {view === 'results' && (
          <Results data={analysisData} image={capturedImage} onRetake={() => setView('camera')} />
        )}
      </main>
    </div>
  );
};

export default App;
