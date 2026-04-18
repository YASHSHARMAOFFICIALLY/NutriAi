import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — NutriAI",
  description: "Sign in to NutriAI and start knowing exactly what you eat.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
