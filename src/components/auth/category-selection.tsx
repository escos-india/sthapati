"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const categories = [
  { value: "Architect", caption: "Visionary designers shaping skylines", accent: "from-[#f8dada] via-[#f9eae1] to-white" },
  { value: "Contractor", caption: "Execution experts bringing plans to life", accent: "from-[#d4f6ff] via-[#e8f9ff] to-white" },
  { value: "Builder", caption: "Hands-on creators driving field progress", accent: "from-[#e6ecff] via-[#f1f4ff] to-white" },
  { value: "Agency", caption: "Boutique firms guiding large mandates", accent: "from-[#fce7ff] via-[#fdefff] to-white" },
  { value: "Material Supplier", caption: "Supply partners powering projects", accent: "from-[#fff3d6] via-[#fff6e4] to-white" },
  { value: "Educational Institute", caption: "Institutions nurturing future experts", accent: "from-[#eaf9e8] via-[#f3fcf2] to-white" },
  { value: "Student", caption: "Emerging professionals building portfolios", accent: "from-[#e1f4ff] via-[#eef8ff] to-white" },
  { value: "Professional", caption: "Specialists mastering craft details", accent: "from-[#f1e8ff] via-[#f8f2ff] to-white" },
] as const;

interface CategorySelectionProps {
  userName?: string | null;
  userEmail?: string | null;
}

export function CategorySelection({ userName, userEmail }: CategorySelectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!selectedCategory) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/users/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: selectedCategory }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.message ?? "Unable to save your selection. Please try again.");
      }

      const data = await response.json();
      const status = data?.user?.status;
      if (status === "pending") {
        router.push("/auth/status?state=pending");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Onboarding</p>
        <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white">
          {userName ? `Welcome, ${userName.split(' ')[0]}!` : "Welcome aboard!"}
        </h1>
        <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto">
          Choose the category that best represents your practice. This helps us personalize your dashboard, connect you with relevant opportunities, and route your account to the right review track.
        </p>
        {userEmail && <p className="text-sm text-slate-400">Signed in as {userEmail}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {categories.map((category) => (
          <motion.button
            key={category.value}
            type="button"
            onClick={() => setSelectedCategory(category.value)}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
              "rounded-3xl border p-6 text-left transition-all duration-300 shadow-sm hover:shadow-xl bg-gradient-to-br",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/60",
              selectedCategory === category.value
                ? "border-black/70 shadow-2xl scale-[1.01]"
                : "border-slate-200/80 hover:border-slate-400/70",
              category.accent
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{category.value}</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">{category.caption}</p>
              </div>
              <div
                className={cn(
                  "h-5 w-5 rounded-full border flex items-center justify-center",
                  selectedCategory === category.value ? "border-black bg-black" : "border-slate-400"
                )}
              >
                {selectedCategory === category.value && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <div className="text-slate-500 text-sm">
          Architects are routed to an elevated review track to maintain the premium quality of the collective.
        </div>
        <Button
          size="lg"
          className="rounded-full px-12 py-6 text-base font-semibold shadow-lg hover:shadow-xl"
          disabled={!selectedCategory || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}

