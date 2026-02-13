"use client";

import { Suspense } from "react";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Logo from "@/components/ui/logo";
import { AlertCircle, Clock, UserX, Ban } from "lucide-react";

function AuthErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    let title = "Authentication Error";
    let description = "An unexpected error occurred. Please try again.";
    let icon = <AlertCircle className="w-12 h-12 text-red-500" />;
    let cta = (
        <Button asChild className="w-full bg-cyan-500 hover:bg-cyan-600">
            <Link href="/login">Back to Login</Link>
        </Button>
    );

    if (error === "AccountNotFound") {
        title = "Account Not Found";
        description = "Please register first to continue.";
        icon = <UserX className="w-12 h-12 text-slate-400" />;
        cta = (
            <Button asChild className="w-full bg-cyan-500 hover:bg-cyan-600">
                <Link href="/register">Go to Register</Link>
            </Button>
        );
    } else if (error === "ProfileUnderReview") {
        title = "Profile Under Admin Approval";
        description = "Your profile is currently under review. You will be notified once approved by our admin team.";
        icon = <Clock className="w-12 h-12 text-yellow-500" />;
        cta = (
            <Button asChild className="w-full bg-slate-700 hover:bg-slate-600">
                <Link href="/login">Back to Login</Link>
            </Button>
        );
    } else if (error === "AccountBanned") {
        title = "Account Banned";
        description = "Your account has been banned due to policy violations. Please contact support.";
        icon = <Ban className="w-12 h-12 text-red-600" />;
    } else if (error === "AccountRejected") {
        title = "Application Rejected";
        description = "Your application has been rejected. Please contact support for more information.";
        icon = <UserX className="w-12 h-12 text-red-500" />;
    }

    return (
        <main className="min-h-screen bg-slate-900 text-white font-sans flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-800 rounded-lg shadow-2xl p-8 text-center space-y-6 border border-slate-700">
                <div className="flex justify-center">
                    <Logo />
                </div>

                <div className="flex justify-center py-4">
                    <div className="bg-slate-900 p-4 rounded-full border border-slate-700">
                        {icon}
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <p className="text-slate-400">{description}</p>
                </div>

                <div className="pt-4">
                    {cta}
                </div>
            </div>
        </main>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>}>
            <AuthErrorContent />
        </Suspense>
    );
}
