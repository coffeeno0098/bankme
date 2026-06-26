"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Eye, EyeOff } from "lucide-react";

const REMEMBER_EMAIL_KEY = "bankme_remember_email";

export function LoginForm({ onSwitchToSignup }: { onSwitchToSignup?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  // Load remembered email on mount
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const msg =
        error.message.includes("Invalid login")
          ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
          : error.message;
      setMessage({ type: "error", text: msg });
    } else {
      // Remember email if checked
      if (remember) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
      router.push("/");
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <div className="w-full max-w-sm animate-fade-in-up">
      {/* Card container — Cal.com rounded-xl, surface-card */}
      <div className="bg-card rounded-2xl p-8 space-y-7 shadow-card">
        {/* Logo — Manrope display */}
        <div className="text-center space-y-2">
          <h1 className="font-display text-[28px] font-bold tracking-tight text-foreground leading-tight">
            <span className="text-muted-foreground font-semibold">฿</span>ank
            <span className="text-foreground">Me</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            เข้าสู่ระบบเพื่อจัดการรายรับรายจ่าย
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">อีเมล</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-10 rounded-lg bg-background border-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">รหัสผ่าน</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="current-password"
                className="pr-10 h-10 rounded-lg bg-background border-border"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(v) => setRemember(!!v)}
            />
            <Label htmlFor="remember" className="text-sm font-normal cursor-pointer text-muted-foreground">
              จดจำฉันไว้
            </Label>
          </div>

          <Button type="submit" className="w-full h-10 rounded-lg font-semibold text-sm" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังเข้าสู่ระบบ...
              </>
            ) : (
              "เข้าสู่ระบบ"
            )}
          </Button>

          {message && (
            <p
              className={`text-center text-sm ${
                message.type === "success" ? "text-income" : "text-expense"
              }`}
            >
              {message.text}
            </p>
          )}
        </form>

        {onSwitchToSignup && (
          <p className="text-center text-sm text-muted-foreground">
            ยังไม่มีบัญชี?{" "}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="font-semibold text-foreground hover:underline"
            >
              สมัครสมาชิก
            </button>
          </p>
        )}
      </div>
    </div>
  );
}