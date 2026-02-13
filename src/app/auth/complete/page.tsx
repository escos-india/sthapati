"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function AuthCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();
  const { toast } = useToast();
  const [viewState, setViewState] = useState<"loading" | "pending" | "success">("loading");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const processAuth = async () => {
      if (status === "loading") return;

      if (status === "unauthenticated") {
        router.push("/login");
        return;
      }

      const intent = searchParams.get("intent");

      // If logging in (and not a new signup flow), check status
      if (intent === "login") {
        // If user is pending architect, show pending screen
        if (session?.user?.status === 'pending') {
          setViewState("pending");
          return;
        }
        // Otherwise go to dashboard
        router.push("/dashboard");
        return;
      }

      // If signing up (or intent is missing/signup), complete profile
      const category = sessionStorage.getItem("registration_category");
      const coaNumber = sessionStorage.getItem("registration_coa_number");
      const phone = sessionStorage.getItem("registration_phone");

      if (!category) {
        // Fallback if no category found (e.g. direct access), go to dashboard/onboarding
        router.push("/dashboard");
        return;
      }

      try {
        const response = await fetch("/api/auth/complete-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category,
            coa_number: coaNumber,
            phone,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to complete profile");
        }

        // Clear storage
        sessionStorage.removeItem("registration_category");
        sessionStorage.removeItem("registration_coa_number");
        sessionStorage.removeItem("registration_phone");

        // Force session update
        await update();

        if (data.status === "pending") {
          setViewState("pending");
        } else {
          setViewState("success");
          // Start countdown
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                router.push("/login");
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      } catch (error) {
        console.error("Auth completion error:", error);
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
        router.push("/login");
      }
    };

    if (viewState === "loading") {
      processAuth();
    }
  }, [status, router, searchParams, toast, update, viewState, session]);

  if (viewState === "pending") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-4">
        <div className="max-w-md w-full bg-slate-800 p-8 rounded-lg text-center space-y-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-white">Account Approval Pending</h2>
          <p className="text-slate-300">
            Your registration request has been submitted for admin approval. You will receive a confirmation within 48 hours.
          </p>
          <Button onClick={() => router.push("/login")} className="w-full bg-cyan-500 hover:bg-cyan-600">
            Go to Login Page
          </Button>
        </div>
      </div>
    );
  }

  if (viewState === "success") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-4">
        <div className="max-w-md w-full bg-slate-800 p-8 rounded-lg text-center space-y-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-green-400">Account created successfully.</h2>
          <p className="text-slate-300">
            You will be redirected to the login page in {countdown} seconds.
          </p>
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-cyan-500" />
          <Button onClick={() => router.push("/login")} className="w-full bg-cyan-500 hover:bg-cyan-600 mt-4">
            Go to Login Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-cyan-500" />
        <h2 className="text-xl font-semibold">Setting up your account...</h2>
      </div>
    </div>
  );
}

export default function AuthCompletePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>}>
      <AuthCompleteContent />
    </Suspense>
  );
}
