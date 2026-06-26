"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Settings, LogOut, User, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "ตั้งค่า", icon: Settings },
];

export function UserMenu() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email ?? null);
      }
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const initial = email ? email.charAt(0).toUpperCase() : "";
  const displayName = email ? email.split("@")[0] : "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className="flex items-center gap-2.5 rounded-full px-1.5 py-1.5 hover:bg-muted transition-all duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {/* Avatar circle — 36px, Cal.com spec */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-[13px] font-semibold text-foreground border border-border">
              {initial ? initial : <User className="h-4 w-4" />}
            </div>
            {email && (
              <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate pr-1">
                {displayName}
              </span>
            )}
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-xl">
        {email && (
          <>
            <div className="flex flex-col space-y-0.5 px-3 py-2">
              <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                ลงชื่อเข้าใช้ด้วย
              </span>
              <span className="truncate text-sm font-medium text-foreground">
                {email}
              </span>
            </div>
            <DropdownMenuSeparator className="my-1" />
          </>
        )}
        <DropdownMenuItem
          onClick={handleLogout}
          variant="destructive"
          className="cursor-pointer rounded-lg transition-colors"
        >
          <LogOut className="mr-2 h-4 w-4" />
          ออกจากระบบ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header — 64px, Cal.com top-nav style */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-8">
            {/* Mobile hamburger — icon-circular 36px */}
            <button
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-full border border-border text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            {/* Logo — Manrope display */}
            <Link href="/" className="flex items-center gap-1.5 group">
              <span className="font-display text-[22px] font-bold tracking-tight text-foreground">
                <span className="text-muted-foreground font-semibold">฿</span>ank
                <span className="text-foreground">Me</span>
              </span>
            </Link>

            {/* Desktop nav — Cal.com pill-group */}
            <nav className="hidden md:block">
              <div className="pill-group">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "pill-group-item inline-flex items-center gap-1.5 no-underline",
                    )}
                    data-active={pathname === item.href ? "true" : undefined}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>

          {/* Right: Theme Toggle + User */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>

        {/* Mobile nav — full-width sheet */}
        {mobileOpen && (
          <nav className="border-t border-border/50 bg-background md:hidden animate-fade-in-up">
            <div className="mx-auto max-w-[1200px] px-5 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors no-underline",
                    pathname === item.href
                      ? "bg-card text-foreground shadow-card"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* Main content — max 1200px centered, Cal.com spacing */}
      <main className="flex-1 mx-auto w-full max-w-[1200px] px-5 py-8">{children}</main>
    </div>
  );
}