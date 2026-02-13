'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// A simple utility to determine if a color is light or dark
const isColorLight = (r: number, g: number, b: number): boolean => {
  // Using the YIQ formula to determine brightness
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 128;
};

export function DynamicHeroText({ imageUrl }: { imageUrl: string }) {
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textShadow, setTextShadow] = useState('2px 2px 8px rgba(0, 0, 0, 0.7)');
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
      if (!context) return;
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0, 1, 1); // Draw a 1x1 pixel of the image

      const [r, g, b] = context.getImageData(0, 0, 1, 1).data;

      if (isColorLight(r, g, b)) {
        setTextColor('#000000'); // Dark text for light backgrounds
        setTextShadow('2px 2px 8px rgba(255, 255, 255, 0.5)');
      } else {
        setTextColor('#FFFFFF'); // Light text for dark backgrounds
        setTextShadow('2px 2px 8px rgba(0, 0, 0, 0.7)');
      }
    };
  }, [imageUrl]);

  return (
    <div className="relative z-20 flex flex-col items-center justify-center h-full pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        className="w-full max-w-4xl"
      >
        <motion.h1 
          className="text-4xl md:text-6xl font-bold font-headline"
          style={{ color: textColor, textShadow: textShadow }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Connect & Build
        </motion.h1>
        <motion.h2 
          className="text-lg md:text-xl font-semibold mb-8 text-balance"
          style={{ color: textColor, textShadow: textShadow }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          The Premier Network for the ACE Industry.
        </motion.h2>
      </motion.div>
    </div>
  );
}
