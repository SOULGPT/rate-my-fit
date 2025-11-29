import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Share2, Sparkles, LogIn } from 'lucide-react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { ref, push, set } from 'firebase/database';
import { signInWithPopup, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { database, auth, googleProvider } from '../firebase-config';
import './StickerCreator.css';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

const StickerCreator = ({ image, onClose, rating, data }) => {
    const canvasRef = useRef(null);
    const [isPublic, setIsPublic] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState(null);
    const isNative = Capacitor.isNativePlatform();

    // Card Dimensions (Standard Trading Card Ratio)
    const CARD_WIDTH = 400;
    const CARD_HEIGHT = 560;
    const SCALE = 2; // High res export

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (image && canvasRef.current) {
            drawCard();
        }
    }, [image, user, rating, data]);

    const getRarity = (score) => {
        if (score === 10) return { title: 'LEGENDARY', color: '#ffd700', bg: 'linear-gradient(135deg, #ffd700, #ffaa00)', border: '#ffd700', icon: '⚡' };
        if (score >= 8) return { title: 'ULTRA RARE', color: '#ff00ff', bg: 'linear-gradient(135deg, #ff00ff, #00ffff)', border: '#ff00ff', icon: '💎' };
        if (score >= 6) return { title: 'RARE', color: '#00d4ff', bg: 'linear-gradient(135deg, #00d4ff, #0055ff)', border: '#00d4ff', icon: '⭐' };
        return { title: 'COMMON', color: '#00ff9d', bg: 'linear-gradient(135deg, #00ff9d, #008844)', border: '#00ff9d', icon: '🟢' };
    };

    const drawCard = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rarity = getRarity(rating);

        // Set high resolution
        canvas.width = CARD_WIDTH * SCALE;
        canvas.height = CARD_HEIGHT * SCALE;
        canvas.style.width = `${CARD_WIDTH}px`;
        canvas.style.height = `${CARD_HEIGHT}px`;
        ctx.scale(SCALE, SCALE);

        // --- 1. Background: Deep Galaxy ---
        const bgGradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
        bgGradient.addColorStop(0, '#050510');
        bgGradient.addColorStop(0.5, '#1a0b2e');
        bgGradient.addColorStop(1, '#000000');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

        // Add subtle noise/texture
        for (let i = 0; i < 1000; i++) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.05})`;
            ctx.fillRect(Math.random() * CARD_WIDTH, Math.random() * CARD_HEIGHT, 2, 2);
        }

        // --- 2. Holo Foil Effect (Rainbow Overlay) ---
        const holoGradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
        holoGradient.addColorStop(0, 'rgba(255, 0, 0, 0.1)');
        holoGradient.addColorStop(0.2, 'rgba(255, 255, 0, 0.1)');
        holoGradient.addColorStop(0.4, 'rgba(0, 255, 0, 0.1)');
        holoGradient.addColorStop(0.6, 'rgba(0, 255, 255, 0.1)');
        holoGradient.addColorStop(0.8, 'rgba(0, 0, 255, 0.1)');
        holoGradient.addColorStop(1, 'rgba(255, 0, 255, 0.1)');

        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = holoGradient;
        ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
        ctx.globalCompositeOperation = 'source-over';

        // --- 3. Premium Gold/Holo Border ---
        const borderGradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
        if (rating >= 8) {
            // Rainbow/Gold for high tiers
            borderGradient.addColorStop(0, '#ffd700');
            borderGradient.addColorStop(0.25, '#ff00ff');
            borderGradient.addColorStop(0.5, '#00ffff');
            borderGradient.addColorStop(0.75, '#ffd700');
            borderGradient.addColorStop(1, '#ff00ff');
        } else {
            // Standard rarity color
            borderGradient.addColorStop(0, rarity.color);
            borderGradient.addColorStop(1, '#ffffff');
        }

        // Outer Glow
        ctx.shadowColor = rarity.color;
        ctx.shadowBlur = 20;
        ctx.strokeStyle = borderGradient;
        ctx.lineWidth = 15;
        ctx.strokeRect(7.5, 7.5, CARD_WIDTH - 15, CARD_HEIGHT - 15);
        ctx.shadowBlur = 0;

        // Inner Metallic Trim
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(18, 18, CARD_WIDTH - 36, CARD_HEIGHT - 36);

        // --- 4. Header (Name + HP) ---
        ctx.fillStyle = '#fff';
        ctx.font = '900 28px Outfit, sans-serif';
        ctx.textAlign = 'left';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        const userName = user ? user.displayName.split(' ')[0].toUpperCase() : 'PLAYER';
        ctx.fillText(userName, 35, 60);

        // HP / Drip Level
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ff3b30'; // Red for HP
        ctx.fillText(`HP ${data?.scores?.drip || 100}`, CARD_WIDTH - 35, 60);
        ctx.shadowBlur = 0;

        // --- 5. Main Image Frame ---
        const img = new Image();
        img.onload = () => {
            const imgX = 35;
            const imgY = 80;
            const imgW = CARD_WIDTH - 70;
            const imgH = 280;

            // Frame Background
            ctx.fillStyle = '#000';
            ctx.fillRect(imgX, imgY, imgW, imgH);

            // Draw Image
            const size = Math.min(img.width, img.height);
            const sx = (img.width - size) / 2;
            const sy = (img.height - size) / 2;
            ctx.drawImage(img, sx, sy, size, size, imgX, imgY, imgW, imgH);

            // Inner Shadow on Image
            const innerShadow = ctx.createLinearGradient(0, imgY, 0, imgY + imgH);
            innerShadow.addColorStop(0, 'rgba(0,0,0,0.2)');
            innerShadow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = innerShadow;
            ctx.fillRect(imgX, imgY, imgW, imgH);

            // Gold Bevel Frame
            ctx.strokeStyle = rarity.color;
            ctx.lineWidth = 4;
            ctx.strokeRect(imgX, imgY, imgW, imgH);

            // Corner Accents
            ctx.fillStyle = rarity.color;
            ctx.fillRect(imgX - 2, imgY - 2, 10, 10);
            ctx.fillRect(imgX + imgW - 8, imgY - 2, 10, 10);
            ctx.fillRect(imgX - 2, imgY + imgH - 8, 10, 10);
            ctx.fillRect(imgX + imgW - 8, imgY + imgH - 8, 10, 10);

            // --- 6. Rarity Ribbon ---
            const ribbonY = imgY + imgH + 20;
            const ribbonH = 36;

            // Ribbon Gradient
            const ribbonGrad = ctx.createLinearGradient(35, ribbonY, CARD_WIDTH - 35, ribbonY);
            ribbonGrad.addColorStop(0, 'rgba(0,0,0,0)');
            ribbonGrad.addColorStop(0.2, rarity.color);
            ribbonGrad.addColorStop(0.8, rarity.color);
            ribbonGrad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = ribbonGrad;
            ctx.fillRect(35, ribbonY, CARD_WIDTH - 70, ribbonH);

            // Rarity Text
            ctx.fillStyle = '#000';
            ctx.font = '900 italic 18px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${rarity.icon} ${rarity.title} EDITION`, CARD_WIDTH / 2, ribbonY + 24);

            // --- 7. Outfit Breakdown ---
            const statsY = ribbonY + 50;
            ctx.textAlign = 'left';
            ctx.font = '500 14px Outfit, sans-serif';

            const items = data?.items || [];
            let currentY = statsY;

            items.slice(0, 3).forEach(item => {
                // Gold Bullet
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.moveTo(45, currentY - 5);
                ctx.lineTo(50, currentY);
                ctx.lineTo(45, currentY + 5);
                ctx.lineTo(40, currentY);
                ctx.fill();

                // Item Name
                ctx.fillStyle = '#fff';
                ctx.font = '700 14px Outfit, sans-serif';
                const itemName = item.name.length > 22 ? item.name.substring(0, 22) + '...' : item.name;
                ctx.fillText(itemName.toUpperCase(), 60, currentY);

                // Brand/Detail
                ctx.fillStyle = '#aaa';
                ctx.font = '12px Outfit, sans-serif';
                const detail = item.brand || item.details || 'Unknown';
                ctx.fillText(detail, 60, currentY + 16);

                currentY += 40;
            });

            // --- 8. Rating Badge (Bottom Right) ---
            const badgeX = CARD_WIDTH - 60;
            const badgeY = CARD_HEIGHT - 60;

            // Glow
            ctx.shadowColor = rarity.color;
            ctx.shadowBlur = 15;

            // Circle
            ctx.beginPath();
            ctx.arc(badgeX, badgeY, 40, 0, Math.PI * 2);
            ctx.fillStyle = '#000';
            ctx.fill();
            ctx.strokeStyle = rarity.color;
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Score
            ctx.fillStyle = rarity.color;
            ctx.font = '900 36px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(rating, badgeX, badgeY + 10);

            ctx.font = '10px Outfit, sans-serif';
            ctx.fillStyle = '#fff';
            ctx.fillText('/10', badgeX + 25, badgeY + 10);

            // 8. Copyright / App Name
            ctx.textAlign = 'left';
            ctx.font = '10px Arial';
            ctx.fillStyle = '#555';
            ctx.fillText('© 2025 DRIPR8', 30, CARD_HEIGHT - 30);

            // --- 9. Special Edition Seal (Moved to Top Right of Image) ---
            const sealX = CARD_WIDTH - 60;
            const sealY = 115;

            // Gold Gradient Seal
            const sealGrad = ctx.createRadialGradient(sealX, sealY, 5, sealX, sealY, 22);
            sealGrad.addColorStop(0, '#ffd700');
            sealGrad.addColorStop(1, '#b8860b');

            ctx.beginPath();
            ctx.arc(sealX, sealY, 22, 0, Math.PI * 2);
            ctx.fillStyle = sealGrad;
            ctx.fill();

            // Emboss ring
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = '#000';
            ctx.font = '900 7px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("LIMITED", sealX, sealY - 2);
            ctx.fillText("DROP", sealX, sealY + 8);

            // --- 10. Sparkles (Animated Feel) ---
            for (let i = 0; i < 15; i++) {
                const sx = Math.random() * CARD_WIDTH;
                const sy = Math.random() * CARD_HEIGHT;
                const size = Math.random() * 3;

                ctx.fillStyle = '#fff';
                ctx.shadowColor = '#fff';
                ctx.shadowBlur = 5;
                ctx.beginPath();
                ctx.arc(sx, sy, size, 0, Math.PI * 2);
                ctx.fill();

                // Star shape
                if (i % 3 === 0) {
                    ctx.beginPath();
                    ctx.moveTo(sx, sy - size * 3);
                    ctx.lineTo(sx, sy + size * 3);
                    ctx.moveTo(sx - size * 3, sy);
                    ctx.lineTo(sx + size * 3, sy);
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
            ctx.shadowBlur = 0;
        };
        img.src = image;
    };

    const handlePublicToggle = async (e) => {
        const checked = e.target.checked;
        if (checked && !user) {
            try {
                if (isNative) {
                    // Native Sign In
                    const googleUser = await GoogleAuth.signIn();
                    const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
                    const result = await signInWithCredential(auth, credential);
                    setUser(result.user);
                    setIsPublic(true);
                } else {
                    // Web Sign In
                    const result = await signInWithPopup(auth, googleProvider);
                    setUser(result.user);
                    setIsPublic(true);
                }
            } catch (error) {
                console.error("Login failed:", error);
                setIsPublic(false);
            }
        } else {
            setIsPublic(checked);
        }
    };

    const handleSubmit = async () => {
        if (!canvasRef.current) return;

        setIsSubmitting(true);
        try {
            const stickerData = canvasRef.current.toDataURL('image/png');

            if (isPublic) {
                if (!user) {
                    alert("Please sign in to share your card!");
                    setIsSubmitting(false);
                    return;
                }

                // DOUBLE VERIFICATION: Scan image again before public upload
                const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
                if (apiKey) {
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
                            CRITICAL SAFETY SCAN:
                            Does this image contain ANY nudity, sexual content, underwear, swimwear, suggestive poses, violence, gore, or inappropriate gestures?
                            Answer ONLY "UNSAFE" or "SAFE".
                        `;

                        // Remove header from data URL
                        const base64Image = stickerData.split(',')[1];

                        const result = await model.generateContent([
                            prompt,
                            { inlineData: { data: base64Image, mimeType: "image/png" } },
                        ]);

                        const response = await result.response;
                        const text = response.text().trim().toUpperCase();

                        if (text.includes("UNSAFE") || (response.promptFeedback && response.promptFeedback.blockReason)) {
                            throw new Error("SAFETY_VIOLATION");
                        }

                    } catch (safetyError) {
                        console.error("Safety check failed:", safetyError);
                        alert("This content is not allowed. Please upload a safe image.");
                        setIsSubmitting(false);
                        return; // STOP HERE
                    }
                }

                // Save to Firebase
                const stickersRef = ref(database, 'stickers');
                const newStickerRef = push(stickersRef);

                await set(newStickerRef, {
                    image: stickerData,
                    rating: rating,
                    timestamp: Date.now(),
                    type: 'card', // Mark as card
                    userName: user.displayName,
                    userId: user.uid
                });

                alert("✨ Premium Card shared to the live background!");
            }

            // Convert data URL to Blob for sharing
            const res = await fetch(stickerData);
            const blob = await res.blob();
            const file = new File([blob], `rate-my-fit-${rating}.png`, { type: 'image/png' });

            // Try Native Share (Mobile)
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        title: 'DRIPR8',
                        text: `I got a ${rating}/10 on DRIPR8! ⚡ Check out my premium card!`,
                        url: window.location.origin, // Share App Link
                        files: [file]
                    });
                } catch (shareError) {
                    console.log('Share cancelled or failed:', shareError);
                    // Fallback to download if share fails/cancelled
                    const link = document.createElement('a');
                    link.href = stickerData;
                    link.download = `fit-card-${rating}.png`;
                    link.click();
                }
            } else {
                // Fallback for Desktop / Unsupported Browsers
                const link = document.createElement('a');
                link.href = stickerData;
                link.download = `fit-card-${rating}.png`;
                link.click();

                // Copy link to clipboard as a bonus
                try {
                    await navigator.clipboard.writeText(`Check out DRIPR8: ${window.location.origin}`);
                    alert("Card downloaded! App link copied to clipboard to share.");
                } catch (e) {
                    // Ignore clipboard error
                }
            }

            onClose();
        } catch (error) {
            console.error('Error creating card:', error);
            alert(`Failed to create card: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="sticker-creator-overlay" onClick={onClose}>
            <div className="sticker-creator-modal glass card-mode" onClick={(e) => e.stopPropagation()}>
                <div className="sticker-creator-header">
                    <h3 className="neon-text">
                        <Sparkles size={24} /> PREMIUM CARD
                    </h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="sticker-preview card-preview">
                    <canvas ref={canvasRef} className="sticker-canvas card-canvas" />
                </div>

                <div className="sticker-controls">
                    <div className="control-group">
                        <label className="toggle-label" style={{ opacity: (isNative && !user) ? 0.5 : 1 }}>
                            <input
                                type="checkbox"
                                checked={isPublic}
                                onChange={handlePublicToggle}
                            />
                            <span>
                                {user ? `Share as ${user.displayName.split(' ')[0]}` : 'Share publicly (Sign in required)'}
                            </span>
                        </label>
                    </div>
                </div>

                <button
                    className="create-sticker-btn"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Creating...' : (
                        <>
                            {isPublic ? <Share2 size={20} /> : <Download size={20} />}
                            {isPublic ? 'Share & Collect Card' : 'Download Card'}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default StickerCreator;
