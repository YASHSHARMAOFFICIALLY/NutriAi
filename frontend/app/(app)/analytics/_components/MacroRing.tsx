import { motion } from "framer-motion";

export function MacroRing({ macroShare = { protein: 0, carbs: 0, fat: 0 } }: { macroShare?: Record<string, number> }) {
  const colors: Record<string, string> = {
    protein: "bg-teal",
    carbs: "bg-sage",
    fat: "bg-[#b7791f]",
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {Object.entries(macroShare).map(([label, value], i) => (
        <motion.div 
          key={label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-surface-alt p-5 border border-border"
        >
          <div className="relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1">{label}</p>
            <p className="text-[28px] font-bold text-forest leading-none">{value}%</p>
          </div>
          <div className={`absolute bottom-0 right-0 h-1.5 w-full ${colors[label] || "bg-forest"}`} />
        </motion.div>
      ))}
    </div>
  );
}
