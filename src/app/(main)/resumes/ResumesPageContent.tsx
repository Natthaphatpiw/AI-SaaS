"use client";

import React from "react";
import { canCreateResume } from "@/lib/permissions";
import { ResumeServerData } from "@/lib/types";
import { SubscriptionLevel } from "@/lib/subscription";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import CreateResumeButton from "./CreateResumeButton";
import ResumeItem from "./ResumeItem";

interface ResumesPageContentProps {
  resumes: ResumeServerData[];
  totalCount: number;
  subscriptionLevel: SubscriptionLevel;
}

export default function ResumesPageContent({ 
  resumes, 
  totalCount, 
  subscriptionLevel 
}: ResumesPageContentProps) {
  const { t } = useLanguage();

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6">
      <CreateResumeButton
        canCreate={canCreateResume(subscriptionLevel, totalCount)}
      />
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">{t("resumes.title")}</h1>
        <p>{t("resumes.total")}: {totalCount}</p>
      </div>
      <div className="flex w-full grid-cols-2 flex-col gap-3 sm:grid md:grid-cols-3 lg:grid-cols-4">
        {resumes.map((resume) => (
          <ResumeItem key={resume.id} resume={resume} />
        ))}
      </div>
    </main>
  );
} 