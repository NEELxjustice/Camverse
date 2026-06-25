"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Hotspot } from "@/lib/fallback-data";

interface HotspotMarkerProps {
  hotspot: Hotspot;
  visible: boolean;
  active: boolean;
  onClick: () => void;
  brandColor: string; // Tailwind hex color code, e.g. "#f97316", "#ef4444", "#10b981"
}

export default function HotspotMarker({
  hotspot,
  visible,
  active,
  onClick,
  brandColor,
}: HotspotMarkerProps) {
  // Translate colors for tailwind class configurations
  const colorMap: Record<string, { bg: string; border: string; glow: string }> = {
    "#f97316": {
      bg: "bg-orange-500",
      border: "border-orange-400",
      glow: "rgba(249,115,22,0.4)",
    },
    "#ef4444": {
      bg: "bg-red-500",
      border: "border-red-400",
      glow: "rgba(239,68,68,0.4)",
    },
    "#10b981": {
      bg: "bg-emerald-500",
      border: "border-emerald-400",
      glow: "rgba(16,185,129,0.4)",
    },
  };

  const colors = colorMap[brandColor] || {
    bg: "bg-sky-500",
    border: "border-sky-400",
    glow: "rgba(56,189,248,0.4)",
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key={hotspot.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            e.stopPropagation(); // prevent dragging triggers
            onClick();
          }}
          style={{
            top: `${hotspot.yPercent}%`,
            left: `${hotspot.xPercent}%`,
            transform: "translate(-50%, -50%)",
          }}
          className="absolute z-30 flex h-6 w-6 items-center justify-center -translate-x-1/2 -translate-y-1/2 focus:outline-none"
        >
          {/* Pulsing ring */}
          <motion.span
            animate={{
              scale: [1, 2.2, 1],
              opacity: [0.8, 0, 0.8],
            }}
            transition={{
              duration: 2.0,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ backgroundColor: colors.glow }}
            className="absolute h-full w-full rounded-full"
          />

          {/* Central button core */}
          <span
            className={`relative flex h-3 w-3 rounded-full border border-white ${
              colors.bg
            } transition-all duration-300 ${
              active
                ? "scale-[1.6] ring-4 ring-offset-2 ring-offset-slate-950 ring-white"
                : "hover:scale-[1.3]"
            }`}
          />

          {/* Small Tooltip on Hover */}
          <span className="pointer-events-none absolute bottom-full mb-2 scale-0 rounded bg-slate-950/90 border border-slate-800 px-2 py-1 text-[10px] font-semibold text-slate-100 uppercase tracking-wider transition-all duration-200 group-hover:scale-100 whitespace-nowrap z-40">
            {hotspot.label}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
