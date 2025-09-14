// frontend/src/app/auth/page.tsx
"use client";
import AuthForm from "../dashboard/components/AuthForm";

export default function AuthPage() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <AuthForm />
    </main>
  );
}
