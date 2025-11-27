import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Share2, Sparkles, LogIn } from 'lucide-react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google-generativeai";
import { ref, push, set } from 'firebase/database';
import { signInWithPopup } from 'firebase/auth';
import { database, auth, googleProvider } from '../firebase-config';
import './StickerCreator.css';

const StickerCreator = ({ image, onClose, rating }) => {
    const canvasRef = useRef(null);
    const [borderColor, setBorderColor] = useState('#00ff9d');
    const [borderWidth, setBorderWidth] = useState(8);
    const [stickerSize, setStickerSize] = useState(200);
    const [isPublic, setIsPublic] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emojis, setEmojis] = useState([]);
    const [user, setUser] = useState(null);

    // Popular emojis for selection
    const availableEmojis = ['🔥', '❤️', '⭐', '✨', '💯', '👑', '😍', '🎉', '💪', '🌟', '💎', '🚀'];

    useEffect(() => {
        // Check if user is already logged in
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (image && canvasRef.current) {
            drawSticker();
        }
    }, [image, borderColor, borderWidth, stickerSize, emojis, user]);

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

    const drawSticker = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Use 2x resolution for higher quality (retina display)
        const scale = 2;
        const displaySize = stickerSize;
        const actualSize = stickerSize * scale;

        // Set canvas size
        canvas.width = actualSize;
        canvas.height = actualSize;
        canvas.style.width = `${displaySize}px`;
        canvas.style.height = `${displaySize}px`;

        // Scale context for retina
        ctx.scale(scale, scale);

        // Clear canvas
        ctx.clearRect(0, 0, displaySize, displaySize);

        // Create image
        const img = new Image();
        img.onload = () => {
            // Draw circular clipping path
            ctx.save();
            ctx.beginPath();
            ctx.arc(displaySize / 2, displaySize / 2, (displaySize / 2) - borderWidth, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();

            // Draw image
            const size = Math.min(img.width, img.height);
            const x = (img.width - size) / 2;
            const y = (img.height - size) / 2;
            ctx.drawImage(img, x, y, size, size, borderWidth, borderWidth, displaySize - borderWidth * 2, displaySize - borderWidth * 2);

            ctx.restore();

            // Draw border
            ctx.beginPath();
            ctx.arc(displaySize / 2, displaySize / 2, (displaySize / 2) - borderWidth / 2, 0, Math.PI * 2);
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = borderWidth;
            ctx.stroke();

            // Draw emojis
            if (emojis.length > 0) {
                const emojiSize = Math.floor(displaySize * 0.15); // 15% of sticker size
                ctx.font = `${emojiSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Position emojis around the circle
                const radius = (displaySize / 2) - borderWidth - (emojiSize / 2);
                const center = displaySize / 2;

                emojis.forEach((emoji, index) => {
                    // Distribute emojis evenly around the circle
                    const angle = (index * (2 * Math.PI / 3)) - (Math.PI / 2); // Start from top
                    const x = center + radius * Math.cos(angle);
                    const y = center + radius * Math.sin(angle);

                    // Add shadow for better visibility
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                    ctx.shadowBlur = 4;
                    ctx.shadowOffsetX = 2;
                    ctx.shadowOffsetY = 2;

                    ctx.fillText(emoji, x, y);

                    // Reset shadow
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                });
            }

            // Draw rating score in center
            const centerX = displaySize / 2;
            const centerY = displaySize / 2;

            // Get compliment based on rating
            const getCompliment = (score) => {
                if (score === 10) return 'ABSOLUTE FIRE';
                if (score >= 9) return 'ELITE DRIP';
                if (score >= 8) return 'MAJOR FLEX';
                if (score >= 7) return 'CLEAN FIT';
                if (score >= 6) return 'SOLID VIBE';
                if (score >= 5) return 'DECENT LOOK';
                return 'KEEP TRYING';
            };

            const compliment = getCompliment(rating);

            // Draw semi-transparent background circle for score
            ctx.beginPath();
            ctx.arc(centerX, centerY, displaySize * 0.18, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fill();

            // Draw rating number
            ctx.font = `bold ${Math.floor(displaySize * 0.2)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Special fire effect for 10/10
            if (rating === 10) {
                // Fire glow effect
                ctx.shadowColor = '#ff6600';
                ctx.shadowBlur = 20;
                ctx.fillStyle = '#ff6600';
                ctx.fillText(rating, centerX, centerY - displaySize * 0.03);

                // Add fire emoji
                ctx.shadowBlur = 0;
                ctx.font = `${Math.floor(displaySize * 0.12)}px Arial`;
                ctx.fillText('🔥', centerX + displaySize * 0.15, centerY - displaySize * 0.03);
            } else {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 4;
                ctx.fillStyle = '#ffffff';
                ctx.fillText(rating, centerX, centerY - displaySize * 0.03);
            }

            // Draw compliment text
            ctx.shadowBlur = 2;
            ctx.font = `bold ${Math.floor(displaySize * 0.055)}px Arial`;
            ctx.fillStyle = rating === 10 ? '#ffcc00' : '#00ff9d';
            ctx.fillText(compliment, centerX, centerY + displaySize * 0.08);

            // Draw User Name (if logged in)
            if (user && user.displayName) {
                const name = user.displayName.split(' ')[0]; // First name only
                const nameY = centerY + displaySize * 0.35;

                // Background pill for name
                ctx.font = `bold ${Math.floor(displaySize * 0.06)}px Arial`;
                const textWidth = ctx.measureText(name).width;
                const padding = displaySize * 0.04;

                ctx.beginPath();
                ctx.roundRect(centerX - textWidth / 2 - padding / 2, nameY - displaySize * 0.04, textWidth + padding, displaySize * 0.08, 10);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.fill();
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = 2;
                ctx.stroke();

                // Name text
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = 'transparent';
                ctx.fillText(name, centerX, nameY);
            }

            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        };
        img.src = image;
    };

    const handleEmojiSelect = (emoji) => {
        if (emojis.length < 3 && !emojis.includes(emoji)) {
            setEmojis([...emojis, emoji]);
        }
    };

    const handleEmojiRemove = (emojiToRemove) => {
        setEmojis(emojis.filter(e => e !== emojiToRemove));
    };

    const handleSubmit = async () => {
        if (!canvasRef.current) return;

        setIsSubmitting(true);
        try {
            const stickerData = canvasRef.current.toDataURL('image/png');

            if (isPublic) {
                if (!user) {
                    alert("Please sign in to share your sticker!");
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

                // Save to Firebase (Only if safety check passed)
                const stickersRef = ref(database, 'stickers');
                const newStickerRef = push(stickersRef);

                await set(newStickerRef, {
                    image: stickerData,
                    rating: rating,
                    timestamp: Date.now(),
                    size: stickerSize,
                    emojis: emojis,
                    userName: user.displayName,
                    userId: user.uid
                });

                // Feedback for user
                alert("✨ Sticker shared to the live background!");
            }

            // Download sticker
            const link = document.createElement('a');
            link.href = stickerData;
            link.download = `fit-sticker-${rating}.png`;
            link.click();

            onClose();
        } catch (error) {
            console.error('Error creating sticker:', error);
            alert('Failed to create sticker. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="sticker-creator-overlay" onClick={onClose}>
            <div className="sticker-creator-modal glass" onClick={(e) => e.stopPropagation()}>
                <div className="sticker-creator-header">
                    <h3 className="neon-text">
                        <Sparkles size={24} /> CREATE STICKER
                    </h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="sticker-preview">
                    <canvas ref={canvasRef} className="sticker-canvas" />
                </div>

                {/* Emoji Picker Section */}
                <div className="control-group">
                    <label>Add Emojis ({emojis.length}/3)</label>

                    {/* Selected Emojis */}
                    {emojis.length > 0 && (
                        <div className="selected-emojis">
                            {emojis.map((emoji, index) => (
                                <div key={index} className="emoji-badge">
                                    <span>{emoji}</span>
                                    <button
                                        className="emoji-remove-btn"
                                        onClick={() => handleEmojiRemove(emoji)}
                                        aria-label="Remove emoji"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Emoji Picker */}
                    <div className="emoji-picker">
                        {availableEmojis.map((emoji) => (
                            <button
                                key={emoji}
                                className={`emoji-btn ${emojis.includes(emoji) ? 'selected' : ''}`}
                                onClick={() => handleEmojiSelect(emoji)}
                                disabled={emojis.length >= 3 && !emojis.includes(emoji)}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="sticker-controls">
                    <div className="control-group">
                        <label>Border Color</label>
                        <div className="color-options">
                            {['#00ff9d', '#ff00ff', '#00d4ff', '#ffcc00', '#ff0080'].map(color => (
                                <button
                                    key={color}
                                    className={`color-btn ${borderColor === color ? 'active' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setBorderColor(color)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="control-group">
                        <label>Border Width: {borderWidth}px</label>
                        <input
                            type="range"
                            min="2"
                            max="20"
                            value={borderWidth}
                            onChange={(e) => setBorderWidth(Number(e.target.value))}
                            className="slider"
                        />
                    </div>

                    <div className="control-group">
                        <label>Size: {stickerSize}px</label>
                        <input
                            type="range"
                            min="100"
                            max="300"
                            value={stickerSize}
                            onChange={(e) => setStickerSize(Number(e.target.value))}
                            className="slider"
                        />
                    </div>

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
                            {isPublic ? 'Share & Download' : 'Download Only'}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default StickerCreator;
