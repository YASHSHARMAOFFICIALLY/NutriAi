import Link from "next/link";
import { ChartLineUp, ForkKnife, ShieldCheck, Sparkle } from "@phosphor-icons/react/dist/ssr";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f8f8f3] text-[#101510]">
      <div className="grid min-h-screen lg:grid-cols-[minmax(520px,0.88fr)_1.12fr]">
        <section className="flex items-center justify-center px-5 py-10">
          <div className="w-full max-w-[430px]">
            <Link href="/" className="mb-10 flex items-center gap-3 font-semibold">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-[#173c2b] text-white">
                <ForkKnife size={18} weight="bold" />
              </span>
              <span>
                <span className="block leading-none">NutriAI</span>
                <span className="mt-1 block text-[11px] font-medium text-[#5f675f]">Meals · targets · coach</span>
              </span>
            </Link>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#0f8b8d]">Account</p>
            <h1 className="mt-3 text-[40px] font-semibold leading-[1.02]">{title}</h1>
            {subtitle ? <p className="mt-4 text-[15px] leading-7 text-[#5f675f]">{subtitle}</p> : null}
            <div className="mt-8 rounded-lg border border-black/10 bg-white p-5 shadow-[0_16px_48px_rgba(16,21,16,0.07)]">
              {children}
            </div>
            {footer ? <div className="mt-6 text-center text-[13px] text-[#5f675f]">{footer}</div> : null}
          </div>
        </section>

        <section className="hidden bg-[#173c2b] p-6 lg:block">
          <div className="flex h-full flex-col justify-between overflow-hidden rounded-xl border border-white/12 bg-[#101510]/28 p-8 text-white">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#d7ff68] px-3 py-1 text-[12px] font-bold text-[#101510]">private workspace</span>
              <ShieldCheck size={24} weight="duotone" className="text-[#d7ff68]" />
            </div>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#d7ff68]">Today preview</p>
              <h2 className="mt-4 max-w-xl text-[56px] font-semibold leading-[0.94]">
                Your login returns to a live meal budget.
              </h2>
              <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
                {[
                  ["310", "kcal left"],
                  ["70g", "protein gap"],
                  ["12d", "streak"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-lg border border-white/14 bg-white/10 p-4">
                    <p className="text-[30px] font-semibold">{value}</p>
                    <p className="mt-1 text-[12px] text-white/58">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-white p-5 text-[#101510]">
                <Sparkle size={24} weight="duotone" className="text-[#0f8b8d]" />
                <p className="mt-4 text-[14px] font-semibold">Coach uses saved meals, targets, allergies, and active challenge context.</p>
              </div>
              <div className="rounded-lg bg-[#d7ff68] p-5 text-[#101510]">
                <ChartLineUp size={24} weight="duotone" />
                <p className="mt-4 text-[14px] font-semibold">Recommendations rank meals by score, frequency, recency, and remaining macros.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
