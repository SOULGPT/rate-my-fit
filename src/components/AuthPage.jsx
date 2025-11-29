import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase-config';
import { LogIn, ArrowLeft } from 'lucide-react';
import './AuthPage.css';

import { Capacitor } from '@capacitor/core';

const AuthPage = ({ onBack, onLoginSuccess }) => {
    const [error, setError] = useState(null);
    const isNative = Capacitor.isNativePlatform();

    const handleGoogleSignIn = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
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

                {isNative ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#aaa', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                        <p>Sign in is currently available on the web version only.</p>
                        <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>You can still use all features as a guest!</p>
                    </div>
                ) : (
                    <button className="google-btn" onClick={handleGoogleSignIn}>
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                        <span>Sign in with Google</span>
                    </button>
                )}

                <p className="terms">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
