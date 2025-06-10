"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Link from "next/link";

interface SuccessContentProps {
  isOneTimePayment: boolean;
}

export default function SuccessContent({ isOneTimePayment }: SuccessContentProps) {
  const { t } = useLanguage();

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-3 py-6 text-center">
      <h1 className="text-3xl font-bold">{t("success.title")}</h1>
      <p>
        {isOneTimePayment
          ? t("success.oneTime")
          : t("success.subscription")}
      </p>
      <Button asChild>
        <Link href="/resumes">{t("success.goToResumes")}</Link>
      </Button>
    </main>
  );
} 