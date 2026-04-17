type MovingGridProps = {
  className?: string;
  /** Tile size in px — controls the perceived density of the grid. */
  cell?: number;
  /** Animation speed (seconds per full tile loop). Higher = slower. */
  speed?: number;
  /** Overall opacity of the grid layer. */
  opacity?: number;
};

// Pure-CSS animated dotted grid. No JS per-frame, no framer-motion —
// just a tiled background-image that translates on a keyframe loop.
// Radial mask fades the edges so it reads as a texture, not a box.
export function MovingGrid({
  className = "",
  cell = 28,
  speed = 18,
  opacity = 0.45,
}: MovingGridProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        opacity,
        maskImage:
          "radial-gradient(ellipse 70% 60% at 50% 50%, black 40%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 70% 60% at 50% 50%, black 40%, transparent 100%)",
      }}
    >
      <div
        className="absolute inset-0 [animation:movingGridShift_var(--mg-speed)_linear_infinite]"
        style={
          {
            "--mg-speed": `${speed}s`,
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(31,59,45,0.28) 1px, transparent 0)",
            backgroundSize: `${cell}px ${cell}px`,
          } as React.CSSProperties
        }
      />
      <style>{`
        @keyframes movingGridShift {
          0%   { background-position: 0 0; }
          100% { background-position: ${cell}px ${cell}px; }
        }
      `}</style>
    </div>
  );
}
