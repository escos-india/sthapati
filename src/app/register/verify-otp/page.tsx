"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/ui/logo";
import { Loader2 } from "lucide-react";
import { COA_REGEX } from "@/lib/constants";

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // States
  const [step, setStep] = useState<"otp" | "coa">("otp");
  const [otp, setOtp] = useState("");
  const [coaNumber, setCoaNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Data
  const [phone, setPhone] = useState("");
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const phoneParam = searchParams.get("phone");
    const dataParam = searchParams.get("data");

    if (!phoneParam || !dataParam) {
      router.push("/register");
      return;
    }

    setPhone(phoneParam);
    try {
      setUserData(JSON.parse(decodeURIComponent(dataParam)));
    } catch (e) {
      router.push("/register");
    }
  }, [searchParams, router]);

  const handleVerifyOTP = () => {
    if (otp !== "000000") {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct OTP.",
        variant: "destructive",
      });
      return;
    }

    // OTP Correct
    if (userData?.category === "Architect") {
      setStep("coa");
    } else {
      createAccount();
    }
  };

  const createAccount = async () => {
    setIsProcessing(true);
    try {
      // Prepare payload
      // If Architect, add COA number to userData
      const finalUserData = { ...userData };
      if (userData.category === "Architect") {
        if (!coaNumber) {
          toast({ title: "COA Number Required", variant: "destructive" });
          setIsProcessing(false);
          return;
        }
        if (!COA_REGEX.test(coaNumber)) {
          toast({
            title: "Invalid COA Number",
            description: "Format must be CA/YYYY/XXXXX",
            variant: "destructive"
          });
          setIsProcessing(false);
          return;
        }
        finalUserData.coa_number = coaNumber;
      }

      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp, // Pass OTP for backend validation too
          phone,
          userData: finalUserData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create account");
      }

      if (data.user.status === "pending") {
        // Architect Pending Screen
        router.push("/auth/status?state=pending");
      } else {
        // Non-Architect Success -> Login
        toast({
          title: "Account created successfully",
          description: "Redirecting to login...",
        });
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Card className="bg-gray-900 border-slate-800 rounded-lg">
        <CardHeader className="p-8 md:p-12 pb-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-slate-800 p-4 rounded-full">
              <Logo />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">
            {step === "otp" ? "Verify Your Phone" : "Architect Verification"}
          </CardTitle>
          <CardDescription className="text-slate-300 pt-2">
            {step === "otp"
              ? <span>We sent a 6-digit OTP to <span className="font-semibold">{phone}</span></span>
              : "Please provide your Council of Architecture number."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 md:p-12 pt-0">
          <div className="space-y-6">

            {step === "otp" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="font-bold">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="bg-slate-800 border-slate-700 rounded-md placeholder:text-slate-500 text-center text-2xl tracking-widest"
                  />
                  <p className="text-xs text-slate-400 text-center">
                    For testing, use: <span className="font-mono font-bold">000000</span>
                  </p>
                </div>
                <Button
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-md"
                  onClick={handleVerifyOTP}
                  disabled={otp.length !== 6}
                >
                  Verify OTP
                </Button>
              </div>
            )}

            {step === "coa" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="coa" className="font-bold">COA Number</Label>
                  <Input
                    id="coa"
                    placeholder="CA/YYYY/XXXXX"
                    value={coaNumber}
                    onChange={(e) => setCoaNumber(e.target.value)}
                    className="bg-slate-800 border-slate-700 rounded-md"
                  />
                </div>
                <Button
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-md"
                  onClick={createAccount}
                  disabled={isProcessing || !coaNumber}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit for Approval"
                  )}
                </Button>
              </div>
            )}

            {step === "otp" && (
              <p className="text-center text-sm text-slate-400">
                Didn't receive OTP?{" "}
                <button
                  className="font-semibold text-cyan-400 hover:text-cyan-300"
                  onClick={() => toast({ title: "OTP Resent", description: "Check your phone." })}
                >
                  Resend
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-sans">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <VerifyOTPContent />
      </Suspense>
    </div>
  );
}

