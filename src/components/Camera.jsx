import React, { useRef, useState, useEffect } from 'react';
import { Camera as CameraIcon, Upload, Image, RefreshCw } from 'lucide-react';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import './Camera.css';

const Camera = ({ onCapture }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const [facingMode, setFacingMode] = useState('user'); // 'user' for front, 'environment' for back
    const isNative = Capacitor.isNativePlatform();

    useEffect(() => {
        // Always try to start the live preview first
        startWebCamera();
        return () => stopWebCamera();
    }, [facingMode]);

    const startWebCamera = async () => {
        try {
            stopWebCamera();
            setError(null);

            // Check if API exists
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Camera API not available");
            }

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
                videoRef.current.play().catch(e => console.log('Video play error:', e));
            }

        } catch (err) {
            console.error("Web Camera failed, falling back to native/upload:", err);
            setError(true); // This triggers the fallback UI
        }
    };

    const stopWebCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const handleWebCapture = () => {
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

    const handleNativeCapture = async () => {
        try {
            const image = await CapacitorCamera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Camera
            });

            if (image.dataUrl) {
                onCapture(image.dataUrl);
            }
        } catch (e) {
            console.log("User cancelled or error", e);
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
                /* Fallback UI (Native Button or Upload) */
                <div className="native-camera-ui center">
                    <div className="upload-prompt">
                        <CameraIcon size={64} color="var(--neon-green)" />
                        <p className="neon-text" style={{ marginTop: '20px' }}>
                            {isNative ? "READY TO SCAN" : "CAMERA ACCESS NEEDED"}
                        </p>
                        <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '10px', maxWidth: '300px', textAlign: 'center' }}>
                            {isNative
                                ? "Tap below to open the native camera."
                                : "Allow camera access or upload a photo."}
                        </p>

                        {isNative ? (
                            <button
                                className="upload-btn-large"
                                onClick={handleNativeCapture}
                                style={{ marginTop: '30px' }}
                            >
                                OPEN CAMERA
                            </button>
                        ) : (
                            <button
                                className="upload-btn-large"
                                onClick={startWebCamera}
                                style={{ marginTop: '20px', marginBottom: '10px' }}
                            >
                                TRY CAMERA AGAIN
                            </button>
                        )}

                        <button className="text-btn" onClick={triggerFileUpload} style={{ marginTop: '20px' }}>
                            {isNative ? "Or upload from gallery" : "UPLOAD PHOTO"}
                        </button>
                    </div>
                </div>
            ) : (
                /* Live Preview UI */
                <>
                    <div className="video-wrapper">
                        <video ref={videoRef} autoPlay playsInline muted className="camera-feed" />
                        <div className="scan-line"></div>
                        <button className="switch-camera-btn" onClick={switchCamera}>
                            <RefreshCw size={24} />
                        </button>
                    </div>

                    <div className="camera-controls">
                        <button className="icon-btn" onClick={triggerFileUpload}>
                            <Image size={28} />
                        </button>

                        <button className="capture-btn" onClick={handleWebCapture}>
                            <div className="capture-btn-inner">
                                <CameraIcon size={48} color="#000" />
                            </div>
                            <div className="capture-glow"></div>
                        </button>

                        <div style={{ width: '50px' }}></div>
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
