export function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-black/10 bg-white p-5">
      <h2 className="mb-4 text-[22px] font-semibold">{title}</h2>
      {children}
    </section>
  );
}
