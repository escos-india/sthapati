"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Logo from "@/components/ui/logo";

export default function VerifyPhonePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        // Check for mode
        const searchParams = new URLSearchParams(window.location.search);
        const mode = searchParams.get("mode");

        // Load Phone.Email script
        const script = document.createElement("script");
        script.src = "https://www.phone.email/sign_in_button_v1.js";
        script.async = true;
        document.body.appendChild(script);

        // Define listener
        (window as any).phoneEmailListener = async (userObj: any) => {
            const { user_json_url } = userObj;
            setIsVerifying(true);

            try {
                const response = await fetch("/api/auth/phone/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_json_url, mode }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Verification failed");
                }

                toast({
                    title: "Phone Verified!",
                    description: "Verification successful.",
                });

                if (mode === "reset" && data.resetToken) {
                    router.push(`/auth/reset-password?token=${data.resetToken}`);
                    return;
                }

                // Handle Redirects based on Role/Status
                if (data.status === "pending" || data.category === "Architect") {
                    // Redirect to Pending Approval
                    router.push("/auth/status?state=pending");
                } else {
                    // Active user
                    // Redirect to Login
                    router.push("/login?verified=true");
                }

            } catch (error) {
                toast({
                    title: "Verification Error",
                    description: error instanceof Error ? error.message : "Failed to verify phone.",
                    variant: "destructive",
                });
                setIsVerifying(false);
            }
        };

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
            delete (window as any).phoneEmailListener;
        };
    }, [router, toast]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-900 dark:text-white transition-colors duration-300">
            <Card className="w-full max-w-md bg-white dark:bg-gray-900 border-slate-200 dark:border-slate-800 shadow-xl">
                <CardHeader className="text-center flex flex-col items-center">
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full mb-4">
                        <Logo />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Verify Phone Number</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">
                        Please verify your phone number to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-8 relative min-h-[100px]">
                    <div className="pe_signin_button" data-client-id="17904867030004902042"></div>

                    {isVerifying && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-10 rounded-md">
                            <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
