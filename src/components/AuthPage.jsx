import React, { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, googleProvider } from '../firebase-config';
import { LogIn, ArrowLeft } from 'lucide-react';
import './AuthPage.css';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

const AuthPage = ({ onBack, onLoginSuccess }) => {
    const [error, setError] = useState(null);
    const isNative = Capacitor.isNativePlatform();

    useEffect(() => {
        if (isNative) {
            GoogleAuth.initialize({
                clientId: import.meta.env.VITE_FIREBASE_CLIENT_ID, // Ensure this env var exists or hardcode if needed
                scopes: ['profile', 'email'],
                grantOfflineAccess: true,
            });
        }
    }, [isNative]);

    const handleGoogleSignIn = async () => {
        try {
            if (isNative) {
                // Native Sign In
                const googleUser = await GoogleAuth.signIn();
                const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
                await signInWithCredential(auth, credential);
            } else {
                // Web Sign In
                await signInWithPopup(auth, googleProvider);
            }
            onLoginSuccess();
        } catch (err) {
            console.error("Login failed:", err);
            setError("Failed to sign in. Please try again.");
        }
    };

    return (
        <div className="auth-page center">
            <div className="auth-card glass">
                <button className="back-btn" onClick={onBack}>
                    <ArrowLeft size={24} />
                </button>

                <h2 className="neon-text title">JOIN THE CREW</h2>
                <p className="subtitle">Sign in to save your fits and share stickers with your name.</p>

                {error && <div className="error-message">{error}</div>}

                <button className="google-btn" onClick={handleGoogleSignIn}>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                    <span>Sign in with Google</span>
                </button>

                <p className="terms">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
