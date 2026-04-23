import { motion } from "framer-motion";
import { Sparkle, Database, ShieldCheck, Cpu } from "@phosphor-icons/react/dist/ssr";

export function AnalyzingState() {
  const steps = [
    { icon: Cpu, label: "Initializing Vision Engine", color: "text-teal" },
    { icon: Database, label: "Querying Food Database", color: "text-forest" },
    { icon: ShieldCheck, label: "Verifying Nutritional Data", color: "text-lime" },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="relative mb-8">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 10, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="h-32 w-32 rounded-full border-4 border-dashed border-teal/30"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Sparkle size={48} weight="fill" className="text-forest" />
          </motion.div>
        </div>
        
        {/* Scanning line effect */}
        <motion.div
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal to-transparent shadow-[0_0_15px_rgba(15,139,141,0.5)]"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-[24px] font-bold text-forest tracking-tight">Intelligence at work...</h2>
        <div className="flex flex-col gap-3">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.4 }}
              className="flex items-center gap-3 rounded-xl bg-surface-alt px-5 py-3 border border-border"
            >
              <step.icon size={18} weight="bold" className={step.color} />
              <span className="text-[14px] font-bold text-forest/80">{step.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
