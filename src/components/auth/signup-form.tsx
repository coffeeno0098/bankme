"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";

interface Props {
  onSwitchToLogin?: () => void;
  onSuccess?: () => void;
}

export function SignupForm({ onSwitchToLogin, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "รหัสผ่านไม่ตรงกัน" });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: "error", text: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" });
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage({
        type: "error",
        text:
          error.message.includes("already registered")
            ? "อีเมลนี้ถูกใช้สมัครแล้ว — ลองเข้าสู่ระบบแทน"
            : error.message,
      });
    } else {
      setMessage({
        type: "success",
        text: "สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี",
      });
      onSuccess?.();
    }

    setLoading(false);
  }

  return (
    <div className="w-full max-w-sm animate-fade-in-up">
      <div className="bg-card rounded-2xl p-8 space-y-7 shadow-card">
        {/* Header — Manrope display */}
        <div className="text-center space-y-2">
          <h1 className="font-display text-[28px] font-bold tracking-tight text-foreground leading-tight">
            สมัครสมาชิก
          </h1>
          <p className="text-sm text-muted-foreground">
            สร้างบัญชีเพื่อเริ่มบันทึกรายรับรายจ่าย
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="signup-email" className="text-sm font-medium text-foreground">อีเมล</Label>
            <Input
              id="signup-email"
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
            <Label htmlFor="signup-password" className="text-sm font-medium text-foreground">รหัสผ่าน</Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
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

          <div className="space-y-1.5">
            <Label htmlFor="signup-confirm" className="text-sm font-medium text-foreground">ยืนยันรหัสผ่าน</Label>
            <div className="relative">
              <Input
                id="signup-confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="pr-10 h-10 rounded-lg bg-background border-border"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full h-10 rounded-lg font-semibold text-sm" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังสมัครสมาชิก...
              </>
            ) : (
              "สมัครสมาชิก"
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

        {onSwitchToLogin && (
          <p className="text-center text-sm text-muted-foreground">
            มีบัญชีอยู่แล้ว?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-semibold text-foreground hover:underline"
            >
              เข้าสู่ระบบ
            </button>
          </p>
        )}
      </div>
    </div>
  );
}