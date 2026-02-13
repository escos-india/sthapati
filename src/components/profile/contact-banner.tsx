"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactBannerProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    phone?: string | null;
    name: string;
}

export function ContactBanner({ isOpen, onClose, email, phone, name }: ContactBannerProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4"
                >
                    <div className="max-w-4xl mx-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-800 p-6 relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-800"
                            onClick={onClose}
                        >
                            <X className="h-5 w-5" />
                        </Button>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                                    Contact {name}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                                    Get in touch directly for inquiries and orders.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                {phone && (
                                    <Button size="lg" className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg shadow-green-500/20" asChild>
                                        <a href={`tel:${phone}`}>
                                            <Phone className="mr-2 h-5 w-5" />
                                            Call Now
                                        </a>
                                    </Button>
                                )}
                                <Button size="lg" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20" asChild>
                                    <a href={`mailto:${email}`}>
                                        <Mail className="mr-2 h-5 w-5" />
                                        Send Email
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
