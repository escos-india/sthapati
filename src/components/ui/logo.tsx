import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('relative w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16', className)}>
      <Image 
        src="https://i.ibb.co/kWWqdQv/logo-sta.png" 
        alt="Sthapati Logo" 
        fill
        sizes="(max-width: 768px) 48px, (max-width: 1024px) 56px, 64px"
        className="dark:invert object-contain"
      />
    </div>
  );
}
