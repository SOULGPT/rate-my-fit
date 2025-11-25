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
        Analyze this outfit photo.
        Identify items: top, bottom, shoes, accessories.
        For each item: color, detail, style (streetwear, casual, luxury, etc), estimated price range ($), possible brand.
        Rate the overall outfit 0-10.
        Give scores (0-10) for: Style, Colors, Trend.
        Give a "Drip Level" score (0-1000).
        Provide a short, bold, energetic, Gen Z style summary (max 2 sentences).
        Return ONLY raw valid JSON with this structure (no markdown code blocks, no other text):
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
