"use client";

import logo from "@/assets/logo.png";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { UserButton } from "@clerk/nextjs";
import { CreditCard, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { t } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 p-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={logo}
            alt="Logo"
            width={35}
            height={35}
            className="rounded-full"
          />
          <span className="text-xl font-bold tracking-tight">
            AideeResume
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/resumes" className="flex items-center gap-2">
            <FileText className="size-4" />
            {t("nav.resumes") as string}
          </Link>
          <LanguageSelector />
          {isMounted && (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: {
                    width: 35,
                    height: 35,
                  },
                },
              }}
            >
              <UserButton.MenuItems>
                <UserButton.Link
                  label={t("nav.billing") as string}
                  labelIcon={<CreditCard className="size-4" />}
                  href="/billing"
                />
              </UserButton.MenuItems>
            </UserButton>
          )}
        </div>
      </div>
    </header>
  );
}
