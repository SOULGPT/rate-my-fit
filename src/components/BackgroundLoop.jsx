import React, { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { database } from '../firebase-config';
import './BackgroundLoop.css';

const BackgroundLoop = () => {
  const [stickers, setStickers] = useState([]);

  useEffect(() => {
    // Listen for real-time sticker updates from Firebase
    const stickersRef = ref(database, 'stickers');
    const stickersQuery = query(stickersRef, orderByChild('timestamp'), limitToLast(50));

    const unsubscribe = onValue(stickersQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const stickerArray = Object.entries(data).map(([id, sticker]) => ({
          id,
          ...sticker
        }));
        setStickers(stickerArray);
      }
    }, (error) => {
      console.error('Error fetching stickers:', error);
      // Silently fail - app will show empty background
    });

    return () => unsubscribe();
  }, []);

  // If no stickers yet, show empty background
  if (stickers.length === 0) {
    return (
      <div className="background-loop-container">
        <div className="overlay"></div>
      </div>
    );
  }

  // Duplicate stickers array for seamless loop
  const duplicatedStickers = [...stickers, ...stickers, ...stickers];

  return (
    <div className="background-loop-container">
      <div className="marquee">
        {duplicatedStickers.map((sticker, index) => (
          <img
            key={`${sticker.id}-${index}`}
            src={sticker.image}
            alt="User Sticker"
            className="user-sticker"
            style={{
              width: `${sticker.size || 150}px`,
              height: `${sticker.size || 150}px`
            }}
          />
        ))}
      </div>
      <div className="marquee reverse">
        {duplicatedStickers.map((sticker, index) => (
          <img
            key={`reverse-${sticker.id}-${index}`}
            src={sticker.image}
            alt="User Sticker"
            className="user-sticker"
            style={{
              width: `${sticker.size || 150}px`,
              height: `${sticker.size || 150}px`
            }}
          />
        ))}
      </div>
      <div className="overlay"></div>
    </div>
  );
};

export default BackgroundLoop;
