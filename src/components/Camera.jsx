import React, { useRef, useState, useEffect } from 'react';
import { Camera as CameraIcon, Upload, Image, RefreshCw } from 'lucide-react';
import './Camera.css';

const Camera = ({ onCapture }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const [facingMode, setFacingMode] = useState('user'); // 'user' for front, 'environment' for back

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [facingMode]);

    const startCamera = async () => {
        try {
            // Stop existing stream first
            stopCamera();
            setError(null);

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false,
            });

            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                // Ensure video plays
                videoRef.current.play().catch(e => console.log('Video play error:', e));
            }

        } catch (err) {
            console.error("Camera error:", err);
            console.error("Error name:", err.name);
            console.error("Error message:", err.message);
            setError(true);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            onCapture(imageDataUrl);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onCapture(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current.click();
    };

    const switchCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    return (
        <div className="camera-container glass">
            {error ? (
                <div className="camera-fallback">
                    <div className="upload-prompt">
                        <Upload size={64} color="var(--neon-green)" />
                        <p className="neon-text" style={{ marginTop: '20px' }}>CAMERA ACCESS NEEDED</p>
                        <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '10px', maxWidth: '320px', textAlign: 'center' }}>
                            Click "Allow" when your browser asks for camera permission, or upload a photo instead.
                        </p>
                        <button
                            className="upload-btn-large"
                            onClick={startCamera}
                            style={{ marginTop: '20px', marginBottom: '10px' }}
                        >
                            TRY CAMERA AGAIN
                        </button>
                        <button className="upload-btn-large" onClick={triggerFileUpload}>
                            UPLOAD PHOTO
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="video-wrapper">
                        <video ref={videoRef} autoPlay playsInline muted className="camera-feed" />
                        <div className="scan-line"></div>

                        {/* Camera switch button */}
                        <button className="switch-camera-btn" onClick={switchCamera}>
                            <RefreshCw size={24} />
                        </button>
                    </div>

                    <div className="camera-controls">
                        <button className="icon-btn" onClick={triggerFileUpload}>
                            <Image size={28} />
                        </button>

                        <button className="capture-btn" onClick={handleCapture}>
                            <div className="capture-btn-inner">
                                <CameraIcon size={48} color="#000" />
                            </div>
                            <div className="capture-glow"></div>
                        </button>

                        <div style={{ width: '50px' }}></div> {/* Spacer for symmetry */}
                    </div>
                </>
            )}

            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
            />
        </div>
    );
};

export default Camera;
