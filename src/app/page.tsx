
import fs from "fs";
import path from "path";
import { HeroSection } from '@/components/landing/hero-section';
import { CommunityUpdates } from '@/components/landing/community-updates';
import { BackgroundSlideshow } from '@/components/landing/background-slideshow';

export const dynamic = 'force-dynamic'; // Ensure it runs on server to pick up new images

function getImages() {
  try {
    const imagesDir = path.join(process.cwd(), "public/images");
    if (!fs.existsSync(imagesDir)) return [];

    return fs
      .readdirSync(imagesDir)
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => `/images/${file}`);
  } catch (error) {
    console.error("Error reading images directory:", error);
    return [];
  }
}

export default function Home() {
  const images = getImages();

  // Fallback if no images found
  const initialImages = images.length > 0 ? images : [
    "/images/1.png", "/images/2.png", "/images/3.png", "/images/4.png", "/images/5.png"
  ];

  return (
    <div className="relative">
      <HeroSection />

      <BackgroundSlideshow initialImages={initialImages} />

      <div className="bg-transparent">
        <CommunityUpdates />
      </div>
    </div>
  );
}
