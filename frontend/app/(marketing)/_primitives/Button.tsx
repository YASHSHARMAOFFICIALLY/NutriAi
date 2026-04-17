import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type CommonProps = {
  children: ReactNode;
  variant?: "primary" | "ghost";
  size?: "md" | "lg";
  className?: string;
};

type AnchorProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type NativeButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonProps = AnchorProps | NativeButtonProps;

const SIZE = {
  md: "px-7 py-3 text-[15px]",
  lg: "px-10 py-4 text-base",
} as const;

// Primary = sage fill + 6px white border + inset gradient from bottom (forest glow)
// + soft outer lift shadow. Hover scales + brightens. No outline ring.
const PRIMARY =
  "relative inline-flex items-center justify-center gap-2 rounded-full font-semibold text-white " +
  "bg-sage border-[6px] border-white " +
  "shadow-[0_6px_20px_rgba(31,59,45,0.10),inset_0_-14px_22px_rgba(31,59,45,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] " +
  "transition-[transform,filter,box-shadow] duration-200 ease-out " +
  "hover:scale-[1.03] hover:brightness-[1.05] active:scale-[0.99] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-600 focus-visible:ring-offset-2 focus-visible:ring-offset-cream";

// Ghost = underlined link-button with subtle hover fill.
const GHOST =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium text-ink " +
  "underline decoration-ink-muted/40 underline-offset-[6px] decoration-[1.5px] " +
  "transition-colors duration-200 hover:decoration-ink hover:bg-ink/5";

export function Button(props: ButtonProps) {
  const { children, variant = "primary", size = "md", className = "" } = props;
  const base = variant === "primary" ? PRIMARY : GHOST;
  const classes = `${base} ${SIZE[size]} ${className}`;

  if ("href" in props && props.href !== undefined) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } = props as NativeButtonProps;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
