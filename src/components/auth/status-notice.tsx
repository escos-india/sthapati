"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

interface StatusNoticeProps {
  title: string;
  description: string;
  subtext?: string;
  ctaLabel?: string;
  ctaHref?: string;
  showSignOut?: boolean;
}

export function StatusNotice({
  title,
  description,
  subtext,
  ctaLabel = "Return home",
  ctaHref = "/",
  showSignOut = true,
}: StatusNoticeProps) {
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-[2rem] border border-slate-100 bg-white p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        <div className="flex flex-col items-center space-y-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600/80">Status</p>

          <div className="space-y-2 max-w-lg">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
            <p className="text-lg text-slate-600 leading-relaxed">{description}</p>
          </div>

          {subtext && (
            <div className="rounded-xl bg-slate-50 px-6 py-3">
              <p className="text-sm font-medium text-slate-600">{subtext}</p>
            </div>
          )}

          <div className="pt-4 flex flex-col gap-3 w-full sm:w-auto sm:flex-row">
            <Button asChild className="rounded-full bg-slate-900 px-8 py-6 text-base font-semibold text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all hover:shadow-xl hover:-translate-y-0.5">
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
            {showSignOut && (
              <Button
                variant="outline"
                className="rounded-full border-slate-200 px-8 py-6 text-base font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                {signingOut ? "Signing out…" : "Go to Login Page"}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

