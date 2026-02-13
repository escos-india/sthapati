"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { USER_CATEGORIES, COA_REGEX } from "@/lib/constants";
import { signIn } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

interface CategorySelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    intent?: "login" | "signup";
}

export function CategorySelectionModal({ isOpen, onClose, intent = "signup" }: CategorySelectionModalProps) {
    const { toast } = useToast();
    const [category, setCategory] = useState<string>("");
    const [coaNumber, setCoaNumber] = useState("");
    const [phone, setPhone] = useState("");

    const handleNext = () => {
        if (!category) {
            toast({
                title: "Category Required",
                description: "Please select a category to proceed.",
                variant: "destructive",
            });
            return;
        }

        if (category === "Architect") {
            if (!coaNumber) {
                toast({
                    title: "COA Number Required",
                    description: "Please enter your COA number.",
                    variant: "destructive",
                });
                return;
            }
            if (!COA_REGEX.test(coaNumber)) {
                toast({
                    title: "Invalid COA Number",
                    description: "Format must be CA/YYYY/XXXXX (e.g., CA/1998/12345)",
                    variant: "destructive",
                });
                return;
            }
        }

        // Phone is required for everyone in the new flow
        if (!phone || phone.length < 10) {
            toast({
                title: "Contact Number Required",
                description: "Please enter a valid contact number.",
                variant: "destructive",
            });
            return;
        }

        // Store in sessionStorage for retrieval after OAuth callback
        sessionStorage.setItem("registration_category", category);
        sessionStorage.setItem("registration_phone", phone);
        if (category === "Architect") {
            sessionStorage.setItem("registration_coa_number", coaNumber);
        }

        // Set auth_mode cookie to 'signup' to bypass strict login checks
        document.cookie = "auth_mode=signup; path=/; max-age=300";

        // Trigger Google Sign In
        // We pass intent to callbackUrl so auth/complete knows what to do
        signIn("google", {
            callbackUrl: `/auth/complete?intent=${intent}`,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 text-white border-slate-800">
                <DialogHeader>
                    <DialogTitle>Select Your Category</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Please select your role to continue with Google.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="google-category" className="font-bold">I am a...</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger id="google-category" className="bg-slate-800 border-slate-700">
                                <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 text-white border-slate-700">
                                {USER_CATEGORIES.filter((cat) => cat !== "Job Seeker").map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {category === "Architect" && (
                        <div className="space-y-2">
                            <Label htmlFor="google-coa" className="font-bold">Council of Architecture (CoA) Number</Label>
                            <Input
                                id="google-coa"
                                placeholder="CA/YYYY/XXXXX"
                                className="bg-slate-800 border-slate-700"
                                value={coaNumber}
                                onChange={(e) => setCoaNumber(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="google-phone" className="font-bold">Contact Number</Label>
                        <Input
                            id="google-phone"
                            placeholder="9876543210"
                            className="bg-slate-800 border-slate-700"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleNext} className="bg-cyan-500 hover:bg-cyan-600 text-white">Next</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
