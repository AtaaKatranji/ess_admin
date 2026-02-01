"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/app/context/I18nContext";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  className?: string;
  variant?: "sidebar" | "default";
}

export default function LanguageToggle({
  className,
  variant = "default"
}: LanguageToggleProps) {
  const { lang, setLang } = useI18n();

  const isSidebar = variant === "sidebar";

  return (
    <div className={cn("flex items-center", className)}>
      <Button
        variant={isSidebar ? "ghost" : "outline"}
        size="sm"
        onClick={() => setLang(lang === "ar" ? "en" : "ar")}
        className={cn(
          "h-8 px-2 text-xs font-bold transition-all",
          isSidebar ? [
            "border border-slate-700 text-slate-300",
            "hover:bg-blue-600/20 hover:text-white hover:border-blue-500/50",
          ] : [
            "border-gray-200 text-gray-700",
            "hover:bg-gray-100 hover:text-blue-600",
          ],
          "active:scale-95"
        )}
        aria-label="Toggle language"
      >
        {lang === "ar" ? "EN" : "AR"}
      </Button>
    </div>
  );
}


