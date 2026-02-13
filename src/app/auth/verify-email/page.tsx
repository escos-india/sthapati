"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail } from "lucide-react";

export default function VerifyEmailPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { toast } = useToast();

    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session?.user && !sent) {
            // Auto-send OTP on load if logged in
            sendOtp();
        }
    }, [status, session]);

    const sendOtp = async () => {
        if (!session?.user?.email) return;
        setIsSending(true);
        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: session.user.email }),
            });

            if (res.ok) {
                setSent(true);
                toast({ title: "OTP Sent", description: `We sent a code to ${session.user.email}` });
            } else {
                toast({ title: "Failed to send OTP", variant: "destructive" });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    const handleVerify = async () => {
        if (!otp) return;
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ otp }),
            });

            if (res.ok) {
                toast({ title: "Verified!", description: "Redirecting to Jobs..." });
                // Redirect to jobs as requested
                router.push("/jobs");
                router.refresh();
            } else {
                toast({ title: "Invalid OTP", description: "Please try again.", variant: "destructive" });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Verification failed", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    if (status === "loading") return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white dark:bg-gray-900 border-slate-200 dark:border-slate-800 shadow-xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                            <Mail className="h-6 w-6" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Verify your Email</CardTitle>
                    <CardDescription>
                        Enter the 6-digit code sent to <span className="font-semibold text-foreground">{session?.user?.email}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-center">
                        <Input
                            className="text-center text-2xl tracking-widest h-14 w-40 font-mono"
                            placeholder="000000"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                    </div>
                    <Button
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                        onClick={handleVerify}
                        disabled={isLoading || otp.length < 4}
                    >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify & Continue"}
                    </Button>
                </CardContent>
                <CardFooter className="justify-center">
                    <Button variant="link" onClick={sendOtp} disabled={isSending}>
                        {isSending ? "Sending..." : "Resend Code"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
