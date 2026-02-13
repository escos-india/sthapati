"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BackgroundSlideshowProps {
    initialImages: string[];
}

export function BackgroundSlideshow({ initialImages }: BackgroundSlideshowProps) {
    const [images, setImages] = useState<string[]>(initialImages);
    const [currentImage, setCurrentImage] = useState(0);

    // Still keep the API fetch for real-time updates if user adds images via admin without reload? 
    // User asked to populate DEFAULT from folder. Passing initialImages covers the load.
    // We can keep the fetch as an enhancement or remove it if user just wants fs.
    // Let's keep it to ensure it syncs with admin panel actions if they happen.
    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await fetch('/api/admin/landing-images');
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        setImages(data);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch background images:', error);
            }
        };
        fetchImages();
    }, []);

    useEffect(() => {
        if (images.length === 0) return;
        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % images.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [images]);

    return (
        <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
            <AnimatePresence>
                <motion.div
                    key={currentImage}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                >
                    {images[currentImage] && (
                        <img
                            src={images[currentImage]}
                            role="presentation"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center',
                            }}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
            <div
                className="absolute inset-0 z-10"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
            ></div>
        </div>
    );
}
