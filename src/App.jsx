import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase-config';
import Camera from './components/Camera';
import Results from './components/Results';
import BackgroundLoop from './components/BackgroundLoop';
import LandingPage from './components/LandingPage';
import LegalPage from './components/LegalPage';
import { Sparkles, User, LogOut } from 'lucide-react';
import './App.css';

const App = () => {
  const [view, setView] = useState('landing'); // landing, camera, analyzing, results, auth, privacy, terms
  const [analysisData, setAnalysisData] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [user, setUser] = useState(null);
  const [previousView, setPreviousView] = useState('landing');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Handle URL routing for Privacy/Terms
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/privacy') {
      setView('privacy');
    } else if (path === '/terms') {
      setView('terms');
    }
  }, []);

  const handleAuthClick = () => {
    if (user) {
      if (window.confirm("Sign out?")) {
        signOut(auth);
      }
    } else {
      setPreviousView(view);
      setView('auth');
    }
  };

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
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
        ]
      });

      const prompt = `
        STRICT SAFETY CHECK FIRST:
        Does this image contain ANY nudity, sexual content, underwear, swimwear, suggestive poses, violence, gore, or inappropriate gestures?
        If YES, return JSON: { "unsafe": true, "reason": "content_violation" } and STOP.
        
        If NO (safe outfit), proceed with analysis:
        
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
          "unsafe": boolean,
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

      // Check if response was blocked due to safety
      if (response.promptFeedback && response.promptFeedback.blockReason) {
        throw new Error("SAFETY_BLOCK");
      }

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

        // Explicit safety check from model output
        if (data.unsafe) {
          throw new Error("SAFETY_VIOLATION");
        }

        setAnalysisData(data);
        setView('results');
      } catch (parseError) {
        if (parseError.message === "SAFETY_VIOLATION") {
          throw parseError;
        }
        console.error("JSON Parse Error:", parseError);
        console.log("Failed Text:", text);
        throw new Error("Failed to parse AI response. Please try again.");
      }

    } catch (error) {
      console.error("Analysis failed:", error);

      let errorMessage = "Analysis failed. Please try again.";

      if (error.message.includes("SAFETY") || error.message.includes("blocked")) {
        errorMessage = "This content is not allowed. Please upload a safe image.";
      }

      alert(errorMessage);
      setView('camera');
    }
  };

  return (
    <div className="app">
      <BackgroundLoop />

      {view !== 'landing' && view !== 'privacy' && view !== 'terms' && (
        <div className="header">
          <h1 className="logo neon-text">DRIPR8</h1>
          <button className="auth-btn" onClick={handleAuthClick}>
            {user ? (
              <img src={user.photoURL} alt="Profile" className="user-avatar" />
            ) : (
              <User size={24} color="#fff" />
            )}
          </button>
        </div>
      )}

      <main className="main-content">
        {view === 'landing' && (
          <LandingPage
            onStart={() => setView('camera')}
            onOpenLegal={(type) => setView(type)}
          />
        )}

        {(view === 'privacy' || view === 'terms') && (
          <LegalPage
            type={view}
            onClose={() => setView('landing')}
          />
        )}

        {view === 'auth' && (
          <AuthPage
            onBack={() => setView(previousView)}
            onLoginSuccess={() => setView(previousView)}
          />
        )}

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
