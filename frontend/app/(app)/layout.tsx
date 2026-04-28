import { AppShell } from "./_components/AppShell";
import { ToastProvider } from "@/lib/toast";

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AppShell>{children}</AppShell>
    </ToastProvider>
  );
}
