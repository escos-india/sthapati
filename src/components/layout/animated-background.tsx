
"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import imageData from '@/lib/placeholder-images.json';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

export function AnimatedBackground() {
  const images: ImagePlaceholder[] = imageData.placeholderImages;
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (images && images.length) {
      const timer = setInterval(() => {
        setCurrentImage((prev) => (prev + 1) % images.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [images]);

  if (!images || !images.length) {
    return <div className="absolute top-0 left-0 w-full h-full -z-10 bg-black"></div>; // Fallback
  }

  return (
    <div className="absolute top-0 left-0 w-full h-full -z-10">
      <AnimatePresence>
        <motion.div
          key={currentImage}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1.05 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          {images[currentImage] && (
            <Image
              src={images[currentImage]!.imageUrl}
              alt={images[currentImage]!.description}
              fill
              className="object-cover"
              priority={currentImage <= 1}
              loading={currentImage <= 1 ? 'eager' : 'lazy'}
              data-ai-hint={images[currentImage]!.imageHint}
            />
          )}
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-black/40 z-10"></div>
    </div>
  );
}
