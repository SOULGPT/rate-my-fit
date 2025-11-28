import React, { useState } from 'react';
import { RefreshCw, Share2, X as XIcon, Instagram, Facebook, MessageCircle, Download, Sparkles } from 'lucide-react';
import StickerCreator from './StickerCreator';
import './Results.css';

const Results = ({ data, onRetake, image }) => {
    const [showShareModal, setShowShareModal] = useState(false);
    const [showStickerCreator, setShowStickerCreator] = useState(false);

    if (!data) return null;

    const { rating, summary, items, scores } = data;

    const handleShare = async () => {
        // Try native Web Share API first (works on mobile)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'DRIPR8',
                    text: `I got a ${rating}/10 on my fit! ${summary}`,
                    url: window.location.href,
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setShowShareModal(true);
                }
            }
        } else {
            setShowShareModal(true);
        }
    };

    const shareToInstagram = () => {
        // Instagram doesn't have direct URL sharing, so we download the image
        downloadImage();
        alert('Image downloaded! Now open Instagram and upload from your gallery.');
    };

    const shareToWhatsApp = () => {
        const text = encodeURIComponent(`I got a ${rating}/10 on my fit! ${summary}\n\nCheck it out: ${window.location.href}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const shareToFacebook = () => {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    };

    const shareToX = () => {
        const text = encodeURIComponent(`I got a ${rating}/10 on my fit! ${summary}`);
        const url = encodeURIComponent(window.location.href);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    };

    const downloadImage = () => {
        if (image) {
            const link = document.createElement('a');
            link.href = image;
            link.download = `my-fit-${rating}-10.jpg`;
            link.click();
        }
    };

    return (
        <>
            <div className="results-container glass">
                <div className="results-header">
                    {image && <img src={image} alt="Your Fit" className="captured-image neon-border" />}
                    <h2 className="neon-text title">FIT CHECK</h2>
                    <div className="rating-circle neon-border">
                        <span className="rating-number">{rating}</span>
                        <span className="rating-max">/10</span>
                    </div>
                    <p className="summary-text">{summary}</p>
                </div>

                <div className="scores-section">
                    <ScoreBar label="STYLE" value={scores.style} color="var(--neon-blue)" />
                    <ScoreBar label="COLORS" value={scores.colors} color="var(--neon-pink)" />
                    <ScoreBar label="TREND" value={scores.trend} color="var(--neon-green)" />
                    <ScoreBar label="DRIP LEVEL" value={scores.drip} max={100} color="#ffcc00" isTrip={true} />
                </div>

                <div className="items-list">
                    <h3 className="section-title">THE DRIP</h3>
                    {items.map((item, index) => (
                        <div key={index} className="item-card glass">
                            <div className="item-header">
                                <span className="item-name">{item.name}</span>
                                <span className="item-price">{item.price}</span>
                            </div>
                            <div className="item-details">{item.details}</div>
                            {item.brand && <div className="item-brand">Possible: {item.brand}</div>}
                        </div>
                    ))}
                </div>

                <div className="actions">
                    <button className="action-btn retake" onClick={onRetake}>
                        <RefreshCw size={20} /> RETAKE
                    </button>
                    <button className="action-btn sticker" onClick={() => setShowStickerCreator(true)}>
                        <Sparkles size={20} /> STICKER
                    </button>
                    <button className="action-btn share" onClick={handleShare}>
                        <Share2 size={20} /> FLEX
                    </button>
                </div>
            </div>

            {showStickerCreator && (
                <StickerCreator
                    image={image}
                    rating={rating}
                    data={data}
                    onClose={() => setShowStickerCreator(false)}
                />
            )}

            {showShareModal && (
                <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
                    <div className="share-modal glass" onClick={(e) => e.stopPropagation()}>
                        <div className="share-modal-header">
                            <h3 className="neon-text">FLEX YOUR FIT</h3>
                            <button className="close-btn" onClick={() => setShowShareModal(false)}>
                                <XIcon size={24} />
                            </button>
                        </div>

                        <div className="share-options">
                            <button className="share-option instagram" onClick={shareToInstagram}>
                                <Instagram size={32} />
                                <span>Instagram</span>
                            </button>

                            <button className="share-option whatsapp" onClick={shareToWhatsApp}>
                                <MessageCircle size={32} />
                                <span>WhatsApp</span>
                            </button>

                            <button className="share-option facebook" onClick={shareToFacebook}>
                                <Facebook size={32} />
                                <span>Facebook</span>
                            </button>

                            <button className="share-option twitter" onClick={shareToX}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                <span>X (Twitter)</span>
                            </button>

                            <button className="share-option download" onClick={downloadImage}>
                                <Download size={32} />
                                <span>Download</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const ScoreBar = ({ label, value, max = 10, color, isTrip }) => {
    const percentage = Math.min(100, (value / max) * 100);

    return (
        <div className="score-row">
            <div className="score-label">{label}</div>
            <div className="score-track">
                <div
                    className={`score-fill ${isTrip ? 'trip-animation' : ''}`}
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                ></div>
            </div>
            <div className="score-value">{value}</div>
        </div>
    );
};

export default Results;
