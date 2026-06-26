"use client";

import { useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "signup">("login");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {tab === "login" ? (
        <LoginForm onSwitchToSignup={() => setTab("signup")} />
      ) : (
        <SignupForm
          onSwitchToLogin={() => setTab("login")}
          onSuccess={() => setTab("login")}
        />
      )}
    </div>
  );
}