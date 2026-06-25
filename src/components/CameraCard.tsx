"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Camera } from "@/lib/fallback-data";
import { ArrowRight, Cpu, Tag } from "lucide-react";

interface CameraCardProps {
  camera: Camera;
}

export default function CameraCard({ camera }: CameraCardProps) {
  // Brand color map for border glows
  const brandColors: Record<string, string> = {
    Sony: "hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] hover:border-orange-500/40",
    Canon: "hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:border-red-500/40",
    Fujifilm: "hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-500/40",
  };

  const glowClass = brandColors[camera.brand] || "hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] hover:border-sky-500/40";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className={`group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/45 p-4 backdrop-blur-xl transition-all duration-300 ${glowClass}`}
    >
      <div>
        {/* Aspect Ratio container for Camera Hero Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-900/50">
          <Image
            src={`/${camera.slug}.png`}
            alt={camera.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
          {/* Brand Tag overlay */}
          <span className="absolute top-3 left-3 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold tracking-wider text-slate-300 uppercase border border-slate-800">
            {camera.brand}
          </span>
        </div>

        {/* Content details */}
        <div className="mt-4 space-y-2">
          <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-sky-400 transition-colors">
            {camera.name}
          </h3>
          <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
            {camera.bestFor}
          </p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-900 space-y-4">
        {/* Specs and Pricing grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-slate-500" />
            <span className="truncate">{camera.sensor.split(" ")[0]}</span>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <Tag className="h-3.5 w-3.5 text-slate-500" />
            <span className="font-semibold text-slate-200">
              ${camera.priceUSD.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action button link */}
        <Link href={`/camera/${camera.slug}`}>
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-800">
            Enter Simulator
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
