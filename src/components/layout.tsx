"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Home, Calendar, Plus, User } from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "Beranda" },
  { href: "/my-sessions", icon: Calendar, label: "Sesi Saya" },
  { href: "/create-session", icon: Plus, label: "Buat Sesi" },
  { href: "/login", icon: User, label: "Masuk" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-surface-secondary/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏸</span>
            <span className="text-lg font-extrabold text-onSurface">
              Badminton <span className="text-brand-primary">Kuy</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-2 rounded-pill px-4 py-2 text-sm font-bold transition-all",
                    isActive
                      ? "bg-brand-primary text-on-brand-primary"
                      : "text-onSurface hover:bg-surface-tertiary"
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface-secondary/90 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold transition-all",
                  isActive ? "text-brand-primary" : "text-muted"
                )}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
