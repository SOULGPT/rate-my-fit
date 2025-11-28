import React from 'react';
import { Sparkles, Camera, Share2, Shield, Smartphone, Zap } from 'lucide-react';
import './LandingPage.css';

const LandingPage = ({ onStart, onOpenLegal }) => {
    return (
        <div className="landing-page">
            {/* Hero Section */}
            <header className="landing-hero">
                <div className="hero-content">
                    <h1 className="landing-logo neon-text">DRIPR8</h1>
                    <p className="hero-subtitle">The Ultimate AI Fashion Critic</p>
                    <p className="hero-description">
                        Rate your fit, collect premium holographic cards, and flex your style with AI-powered analysis.
                    </p>

                    <div className="cta-group">
                        <button className="cta-btn primary neon-border" onClick={onStart}>
                            <Camera size={24} />
                            <span>SCAN MY FIT</span>
                        </button>
                        <div className="store-buttons">
                            <button className="store-btn glass" onClick={() => alert("Coming soon to App Store!")}>
                                <img src="https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg" alt="Apple" />
                                <span>iOS App</span>
                            </button>
                            <button className="store-btn glass" onClick={() => alert("Coming soon to Play Store!")}>
                                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Android_robot.svg" alt="Android" />
                                <span>Android</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section className="features-section">
                <h2 className="section-title">WHY DRIPR8?</h2>
                <div className="features-grid">
                    <div className="feature-card glass">
                        <div className="feature-icon"><Zap color="#ccff00" size={32} /></div>
                        <h3>AI RATINGS</h3>
                        <p>Get an instant 1-10 rating on your outfit based on color, trend, and silhouette.</p>
                    </div>
                    <div className="feature-card glass">
                        <div className="feature-icon"><Sparkles color="#ff00ff" size={32} /></div>
                        <h3>PREMIUM CARDS</h3>
                        <p>Turn your fits into collectible holographic trading cards with rarity tiers.</p>
                    </div>
                    <div className="feature-card glass">
                        <div className="feature-icon"><Share2 color="#00ffff" size={32} /></div>
                        <h3>FLEX ONLINE</h3>
                        <p>Share your legendary cards directly to Instagram, TikTok, and Snapchat.</p>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <h2 className="section-title">HOW IT WORKS</h2>
                <div className="steps">
                    <div className="step">
                        <span className="step-number">1</span>
                        <p>Snap a photo of your outfit.</p>
                    </div>
                    <div className="step">
                        <span className="step-number">2</span>
                        <p>Wait for AI analysis.</p>
                    </div>
                    <div className="step">
                        <span className="step-number">3</span>
                        <p>Get your rating & card.</p>
                    </div>
                </div>
            </section>

            {/* Footer / Legal */}
            <footer className="landing-footer">
                <div className="footer-links">
                    <button className="text-btn" onClick={() => onOpenLegal('privacy')}>Privacy Policy</button>
                    <button className="text-btn" onClick={() => onOpenLegal('terms')}>Terms of Service</button>
                    <button className="text-btn" onClick={() => window.location.href = 'mailto:support@dripr8.com'}>Support</button>
                </div>
                <p className="copyright">© 2025 DRIPR8. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
