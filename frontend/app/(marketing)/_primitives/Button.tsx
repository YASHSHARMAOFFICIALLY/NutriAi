import Link from "next/link";

export function Button({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center justify-center rounded-md bg-[#173c2b] px-5 py-3 text-[14px] font-semibold text-white">
      {children}
    </Link>
  );
}
