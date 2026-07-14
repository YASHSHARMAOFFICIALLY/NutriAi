import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account",
  description: "Secure account actions for your myNutriAI nutrition workspace.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthActionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
