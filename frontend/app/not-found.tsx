import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f8f3] px-5 text-[#101510]">
      <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#0f8b8d]">404</p>
      <h1 className="mt-3 text-[36px] font-semibold leading-tight md:text-[48px]">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-center text-[16px] leading-7 text-[#5f675f]">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-[#101510] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#173c2b]"
        >
          Go home
        </Link>
        <Link
          href="/ai-meal-scanner"
          className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-5 py-3 text-[14px] font-semibold transition hover:border-[#173c2b]/30"
        >
          Try meal scanner
        </Link>
      </div>
    </div>
  );
}
