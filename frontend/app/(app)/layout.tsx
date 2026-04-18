import { AppSidebar } from "./_components/AppSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <AppSidebar />
      <div className="ml-[240px]">{children}</div>
    </div>
  );
}
