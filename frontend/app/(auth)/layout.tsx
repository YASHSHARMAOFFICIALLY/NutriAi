import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in - NutriAI",
  description: "Access your NutriAI nutrition workspace.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
