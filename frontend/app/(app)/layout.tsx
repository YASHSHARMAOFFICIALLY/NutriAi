import type { Metadata } from "next";
import { AppShell } from "./_components/AppShell";
import { ToastProvider } from "@/lib/toast";

export const metadata: Metadata = {
  title: "Workspace",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AppShell>{children}</AppShell>
    </ToastProvider>
  );
}
