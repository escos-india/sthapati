'use client';

import { motion, AnimatePresence } from 'framer-motion';

// Re-exporting AnimatePresence so it can be imported from this module
export { AnimatePresence };

// Defining and exporting motion-enhanced components
export const MotionDiv = motion.div;
export const MotionH1 = motion.h1;
export const MotionP = motion.p;
export const MotionButton = motion.button;
