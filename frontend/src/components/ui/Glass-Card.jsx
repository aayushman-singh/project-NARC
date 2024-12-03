import React from 'react';
import { cn } from "@/lib/utils";

const GlassCard = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "backdrop-blur-md bg-white/10 rounded-xl border border-white/20 shadow-xl",
        "p-6 transition-all duration-300 hover:bg-white/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
