interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, description, children }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
      <div className="pt-1">
        <h2 className="text-[14px] font-semibold text-ink">{title}</h2>
        {description && (
          <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">{description}</p>
        )}
      </div>
      <div className="rounded-2xl border border-white/70 bg-white/60 shadow-[0_4px_20px_rgba(31,59,45,0.05)] backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
}

export function SettingsRow({
  label,
  sublabel,
  children,
  last,
}: {
  label: string;
  sublabel?: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-6 py-4 ${
        !last ? "border-b border-ink/[0.05]" : ""
      }`}
    >
      <div>
        <p className="text-[14px] font-medium text-ink">{label}</p>
        {sublabel && <p className="text-[12px] text-ink-muted">{sublabel}</p>}
      </div>
      <div className="ml-6 shrink-0">{children}</div>
    </div>
  );
}
