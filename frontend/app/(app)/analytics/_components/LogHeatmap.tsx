import { motion } from "framer-motion";

export function LogHeatmap() {
  return (
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 35 }, (_, index) => {
        // Simulating activity levels
        const level = (index * 7) % 10;
        const opacity = level > 7 ? 1 : level > 4 ? 0.6 : 0.2;
        
        return (
          <motion.div 
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.01 }}
            className="group relative aspect-square rounded-md bg-forest transition-all hover:ring-2 hover:ring-teal hover:ring-offset-2"
            style={{ opacity }}
          >
            <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 rounded bg-forest px-2 py-1 text-[10px] text-white group-hover:block whitespace-nowrap">
              Day {index + 1}: {level * 200} kcal
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
