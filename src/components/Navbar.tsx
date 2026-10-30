"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    {
      href: "/",
      label: "বাজার দর",
      icon: "📊",
      isActive: pathname === "/" || pathname.startsWith("/crop/"),
    },
    {
      href: "/planner",
      label: "লাভজনক রোপণ",
      icon: "💰",
      isActive: pathname.startsWith("/planner"),
    },
    {
      href: "/cultivation",
      label: "চাষাবাদ",
      icon: "🌱",
      isActive: pathname.startsWith("/cultivation"),
    },
    {
      href: "/diseases",
      label: "রোগবালাই ও ওষুধ",
      icon: "🩺",
      isActive: pathname.startsWith("/diseases"),
    },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 md:px-6">
        {/* Brand / Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-xs transition-transform group-hover:scale-105">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20m0-20a8 8 0 0 1 8 8c0 4-4 8-8 12M12 2a8 8 0 0 0-8 8c0 4 4 8 8 12" />
            </svg>
          </span>
          <div>
            <span className="text-base font-bold text-ink group-hover:text-accent transition-colors">
              সবজি বাজার দর
            </span>
            <span className="hidden sm:block text-[11px] text-muted leading-none">
              কাঁচাবাজার ও আধুনিক কৃষি সহায়িকা
            </span>
          </div>
        </Link>

        {/* Navigation Links as Segmented Pill */}
        <nav className="flex items-center gap-1 p-1 rounded-2xl border border-line bg-page shadow-2xs">
          {navLinks.map((link) => {
            const active = link.isActive;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
                  active
                    ? "bg-surface text-ink shadow-2xs font-bold"
                    : "text-muted hover:text-ink"
                }`}
              >
                <span>{link.icon}</span>
                <span className="whitespace-nowrap">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Live Status indicator */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-line bg-page px-3 py-1 text-xs text-muted">
          <span className="inline-block h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span>বাজার ও কৃষি লাইভ</span>
        </div>
      </div>
    </header>
  );
}
