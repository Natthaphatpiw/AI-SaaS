import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";
import LanguageProvider from "@/lib/i18n/LanguageProvider";
import type { Metadata } from "next";
import { Noto_Sans_Thai, Inter } from 'next/font/google';
import "../globals.css";

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai'],
  variable: '--font-noto-sans-thai',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Authentication - AI Resume Builder",
  description: "Sign in or sign up to AI Resume Builder",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="th" className={`${notoSansThai.variable} ${inter.variable}`}>
        <body className="font-sans">
          <LanguageProvider>
            {children}
            <Toaster />
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
