import type { Metadata } from "next";
import { Noto_Sans_Bengali } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const bengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali", "latin"],
});

export const metadata: Metadata = {
  title: "সবজি বাজার দর — বাংলাদেশের সবজির দৈনিক দর, চাষাবাদ ও রোগবালাই সহায়িকা",
  description: "বাংলাদেশের সবজির দৈনিক, মাসিক ও বাৎসরিক বাজার দর বিশ্লেষণ, লাভজনক চাষাবাদ পদ্ধতি ও রোগবালাই দমন",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${bengali.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-page text-ink selection:bg-accent-soft selection:text-accent">
        <Navbar />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>

        <footer className="border-t border-line bg-surface mt-12">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-ink-2 sm:flex-row md:px-6">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ink">সবজি বাজার দর</span>
              <span>•</span>
              <span>বাংলাদেশের কৃষি ও বাজার তথ্য ভান্ডার</span>
            </div>
            <div className="text-center sm:text-right text-muted">
              উপাত্তের উৎস: TCB, DAM (কৃষি বিপণন অধিদপ্তর) ও WFP
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
