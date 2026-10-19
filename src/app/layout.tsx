import type { Metadata } from "next";
import Link from "next/link";
import { Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";

const bengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali", "latin"],
});

export const metadata: Metadata = {
  title: "সবজি বাজার দর",
  description: "বাংলাদেশের সবজির দৈনিক, মাসিক ও বাৎসরিক বাজার দর বিশ্লেষণ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn" className={`${bengali.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="border-b border-line bg-surface">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="text-lg font-semibold text-accent">
              সবজি বাজার দর
            </Link>
            <span className="text-sm text-muted">কোন মাসে কোন সবজির দাম কেমন</span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
