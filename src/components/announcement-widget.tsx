'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type Announcement = {
    _id: string;
    title?: string;
    message: string;
    createdAt: string;
};

export function AnnouncementWidget() {
    const { data: session, status } = useSession();
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [showFull, setShowFull] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;
        // If no session, we still fetch (guest mode)
        /* if (!session?.user) {
            setAnnouncement(null);
            setIsVisible(false);
            return;
        } */

        const fetchAnnouncement = async () => {
            try {
                const res = await fetch('/api/announcements/active', { cache: 'no-store' });
                if (res.ok) {
                    const data: Announcement[] = await res.json();
                    if (data && data.length > 0) {
                        setAnnouncement(data[0]);
                        setIsVisible(true);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch announcements", error);
            }
        };

        const timer = setTimeout(() => {
            fetchAnnouncement();
        }, 1000);

        return () => clearTimeout(timer);

    }, [session, status]);

    const handleDismiss = async () => {
        setIsVisible(false); // Allow local dismiss for everyone

        if (!announcement || !session?.user) return; // Don't call API if guest

        try {
            await fetch('/api/announcements/dismiss', {
                method: 'POST',
                body: JSON.stringify({ announcementId: announcement._id })
            });
        } catch (e) {
            console.error("Failed to dismiss on backend", e);
        }
    };

    if (!announcement || !isVisible) return null;

    return (
        <>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        key="announcement-widget"
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="fixed bottom-6 right-6 z-50 max-w-sm w-full md:w-auto"
                    >
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-1 rounded-lg shadow-2xl">
                            <div
                                className="bg-gray-900/90 backdrop-blur-md rounded-md p-4 flex items-start gap-4 cursor-pointer hover:bg-gray-900/95 transition-colors"
                                onClick={() => setShowFull(true)}
                            >
                                <div className="bg-blue-500/20 p-2 rounded-full shrink-0">
                                    <Megaphone className="h-6 w-6 text-blue-400" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    {announcement.title && <h4 className="font-semibold text-lg leading-tight">{announcement.title}</h4>}
                                    <p className="text-gray-300 text-sm line-clamp-2">
                                        {!announcement.title && <span className="font-semibold block mb-1">Announcement</span>}
                                        {announcement.message}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-gray-400 hover:text-white -mt-2 -mr-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDismiss();
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Dialog open={showFull} onOpenChange={setShowFull}>
                <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <Megaphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            {announcement.title || 'Announcement'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 max-h-[70vh] overflow-y-auto">
                        <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
                            {announcement.message}
                        </p>
                        <div className="mt-6 text-xs text-slate-400 text-right">
                            Posted on {new Date(announcement.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
