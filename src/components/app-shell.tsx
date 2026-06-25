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
import { LayoutDashboard, Settings, Wallet, LogOut, User, Menu, X, ChevronDown } from "lucide-react";

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
          <Button
            variant="ghost"
            className="flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring transition-all duration-200"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary shadow-inner border border-primary/20">
              {initial ? initial : <User className="h-4 w-4" />}
            </div>
            {email && (
              <div className="hidden sm:flex items-center gap-1">
                <span className="text-sm font-medium text-foreground max-w-[100px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56 p-1.5">
        {email && (
          <>
            <div className="flex flex-col space-y-0.5 px-2 py-1.5">
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
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
          className="cursor-pointer focus:bg-destructive/10 focus:text-destructive dark:focus:bg-destructive/20 rounded-md transition-colors"
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
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
              <Wallet className="h-5 w-5 text-primary" />
              <span className="hidden sm:inline">BankMe</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-secondary text-secondary-foreground"
                    : "hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <UserMenu />
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="border-t bg-background md:hidden">
            <div className="container px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-secondary text-secondary-foreground"
                      : "hover:bg-muted hover:text-foreground"
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

      {/* Main content */}
      <main className="flex-1 container px-4 py-6">{children}</main>
    </div>
  );
}