import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Share2, Sparkles, LogIn } from 'lucide-react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { ref, push, set } from 'firebase/database';
import { signInWithPopup } from 'firebase/auth';
import { database, auth, googleProvider } from '../firebase-config';
import './StickerCreator.css';

const StickerCreator = ({ image, onClose, rating, data }) => {
    const canvasRef = useRef(null);
    const [isPublic, setIsPublic] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState(null);

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

        // 1. Draw Card Background
        const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
        if (rating === 10) {
            gradient.addColorStop(0, '#2a2a2a');
            gradient.addColorStop(0.5, '#443300'); // Gold tint
            gradient.addColorStop(1, '#1a1a1a');
        } else if (rating >= 8) {
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(0.5, '#300030'); // Purple tint
            gradient.addColorStop(1, '#000000');
        } else {
            gradient.addColorStop(0, '#1a1a1a');
            gradient.addColorStop(1, '#000000');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

        // 2. Draw Holographic/Neon Border
        ctx.lineWidth = 12;
        ctx.strokeStyle = rarity.border;
        ctx.strokeRect(6, 6, CARD_WIDTH - 12, CARD_HEIGHT - 12);

        // Inner thin border
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(16, 16, CARD_WIDTH - 32, CARD_HEIGHT - 32);

        // 3. Header (Name + Drip Level)
        ctx.fillStyle = rarity.color;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        const userName = user ? user.displayName.split(' ')[0].toUpperCase() : 'PLAYER';
        ctx.fillText(userName, 30, 55);

        // HP / Drip Level
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ff3b30';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(`HP ${data?.scores?.drip || 100}`, CARD_WIDTH - 30, 55);

        // 4. Main Image (The Fit)
        const img = new Image();
        img.onload = () => {
            const imgX = 30;
            const imgY = 70;
            const imgW = CARD_WIDTH - 60;
            const imgH = 280;

            // Image Border
            ctx.fillStyle = '#000';
            ctx.fillRect(imgX - 4, imgY - 4, imgW + 8, imgH + 8);

            // Draw Image (Cover fit)
            const size = Math.min(img.width, img.height);
            const sx = (img.width - size) / 2;
            const sy = (img.height - size) / 2;
            ctx.drawImage(img, sx, sy, size, size, imgX, imgY, imgW, imgH);

            // Image Frame Effect
            ctx.strokeStyle = rarity.color;
            ctx.lineWidth = 4;
            ctx.strokeRect(imgX, imgY, imgW, imgH);

            // 5. Rarity Strip
            const stripY = imgY + imgH + 15;
            ctx.fillStyle = rarity.color;
            ctx.fillRect(30, stripY, CARD_WIDTH - 60, 30);

            ctx.fillStyle = '#000';
            ctx.font = 'bold italic 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${rarity.icon} ${rarity.title} OUTFIT`, CARD_WIDTH / 2, stripY + 22);

            // 6. Stats / Breakdown
            const statsY = stripY + 50;
            ctx.textAlign = 'left';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#fff';

            const items = data?.items || [];
            let currentY = statsY;

            items.slice(0, 3).forEach(item => {
                // Bullet point
                ctx.fillStyle = rarity.color;
                ctx.beginPath();
                ctx.arc(40, currentY - 5, 4, 0, Math.PI * 2);
                ctx.fill();

                // Text
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 14px Arial';
                const itemName = item.name.length > 25 ? item.name.substring(0, 25) + '...' : item.name;
                ctx.fillText(itemName.toUpperCase(), 55, currentY);

                // Brand/Detail
                ctx.fillStyle = '#aaa';
                ctx.font = '12px Arial';
                const detail = item.brand || item.details || 'Unknown';
                ctx.fillText(detail, 55, currentY + 16);

                currentY += 40;
            });

            // 7. Footer Score
            ctx.fillStyle = rarity.color;
            ctx.font = 'bold 40px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`${rating}/10`, CARD_WIDTH - 40, CARD_HEIGHT - 30);

            ctx.font = '12px Arial';
            ctx.fillStyle = '#aaa';
            ctx.fillText('RATING', CARD_WIDTH - 40, CARD_HEIGHT - 70);

            // 8. Copyright / App Name
            ctx.textAlign = 'left';
            ctx.font = '10px Arial';
            ctx.fillStyle = '#555';
            ctx.fillText('© 2025 RATE MY FIT', 30, CARD_HEIGHT - 30);
        };
        img.src = image;
    };

    const handlePublicToggle = async (e) => {
        const checked = e.target.checked;
        if (checked && !user) {
            try {
                const result = await signInWithPopup(auth, googleProvider);
                setUser(result.user);
                setIsPublic(true);
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

            // Download
            const link = document.createElement('a');
            link.href = stickerData;
            link.download = `fit-card-${rating}.png`;
            link.click();

            onClose();
        } catch (error) {
            console.error('Error creating card:', error);
            alert('Failed to create card. Please try again.');
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
                        <label className="toggle-label" style={{ opacity: 1 }}>
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
