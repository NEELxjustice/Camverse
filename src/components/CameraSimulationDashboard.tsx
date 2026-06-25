"use client";

import { useState } from "react";
import Link from "next/link";
import { CameraWithDetails } from "@/lib/db-client";
import { Hotspot } from "@/lib/fallback-data";
import RotateViewer from "./RotateViewer";
import MenuTree from "./MenuTree";
import { ChevronLeft, Info, HelpCircle, ShieldCheck } from "lucide-react";

interface CameraSimulationDashboardProps {
  camera: CameraWithDetails;
}

export default function CameraSimulationDashboard({ camera }: CameraSimulationDashboardProps) {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  // Brand-specific accent settings
  const brandThemes: Record<string, { hex: string; text: string; bg: string; border: string }> = {
    Sony: {
      hex: "#f97316",
      text: "text-orange-500",
      bg: "bg-orange-950/20",
      border: "border-orange-500/20",
    },
    Canon: {
      hex: "#ef4444",
      text: "text-red-500",
      bg: "bg-red-950/20",
      border: "border-red-500/20",
    },
    Fujifilm: {
      hex: "#10b981",
      text: "text-emerald-500",
      bg: "bg-emerald-950/20",
      border: "border-emerald-500/20",
    },
  };

  const theme = brandThemes[camera.brand] || {
    hex: "#38bdf8",
    text: "text-sky-500",
    bg: "bg-sky-950/20",
    border: "border-sky-500/20",
  };

  return (
    <div className="min-h-screen bg-[#070913] text-white">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div
          style={{ backgroundColor: theme.hex }}
          className="absolute -top-40 right-1/4 h-[500px] w-[500px] rounded-full opacity-10 blur-[120px]"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <nav className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-400 hover:text-white uppercase transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Showroom
          </Link>
        </nav>

        {/* Title Header */}
        <header className="mb-8 border-b border-slate-900 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400`}>
                {camera.brand}
              </span>
              <span className="text-xs text-slate-500">Virtual Simulator</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl uppercase">
              {camera.name}
            </h1>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-slate-500">Estimated Price:</span>
            <span className={`text-2xl font-bold ${theme.text}`}>
              ${camera.priceUSD.toLocaleString()} USD
            </span>
          </div>
        </header>

        {/* Dashboard Layout Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* LEFT SIDE: 360 Viewer & Hotspot Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-950/20 rounded-2xl border border-slate-900 p-4 backdrop-blur-xl">
              <RotateViewer
                slug={camera.slug}
                frameCount={camera.frameCount}
                hotspots={camera.hotspots}
                activeHotspot={activeHotspot}
                onSelectHotspot={setActiveHotspot}
                brandColor={theme.hex}
              />
            </div>

            {/* Hotspot details info display panel */}
            <div className={`rounded-xl border ${theme.border} ${theme.bg} p-5 transition-all duration-300 min-h-[120px] flex flex-col justify-center`}>
              {activeHotspot ? (
                <div className="space-y-1.5 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Info className={`h-4.5 w-4.5 ${theme.text}`} />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      {activeHotspot.label}
                    </h3>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300 pl-6">
                    {activeHotspot.description}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-slate-400">
                  <HelpCircle className="h-6 w-6 text-slate-500 shrink-0 animate-pulse" />
                  <div className="text-xs">
                    <p className="font-semibold text-slate-300 mb-0.5">INTERACT WITH THE BODY</p>
                    <p className="text-slate-500">
                      Drag to rotate the camera body. Click the glowing hotspots that appear to reveal descriptions of physical controls.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: Tech Specs & Menu Simulator */}
          <div className="lg:col-span-5 space-y-6">
            {/* Spec Box */}
            <section className="bg-slate-950/40 rounded-xl border border-slate-900 p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Technical Specifications
              </h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs border-t border-slate-900/60 pt-3">
                <div className="space-y-0.5">
                  <dt className="text-slate-500 uppercase tracking-wider text-[10px]">Type</dt>
                  <dd className="font-semibold text-slate-200 uppercase">{camera.type.replace(/-/g, " ")}</dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-slate-500 uppercase tracking-wider text-[10px]">Sensor</dt>
                  <dd className="font-semibold text-slate-200">{camera.sensor}</dd>
                </div>
                <div className="col-span-2 space-y-0.5 border-t border-slate-900/40 pt-2">
                  <dt className="text-slate-500 uppercase tracking-wider text-[10px]">Best Suited For</dt>
                  <dd className="font-semibold text-slate-300 leading-normal">{camera.bestFor}</dd>
                </div>
              </dl>
            </section>

            {/* Menu Simulator Accordion Box */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Menu System Simulator
              </h3>
              <MenuTree brand={camera.brand} menuNodes={camera.menuNodes} />
            </section>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-950 bg-slate-950/20 py-8 text-center text-xs text-slate-600 font-mono tracking-widest">
        CAMVERSE WORKSPACE SIMULATOR  |  ALL RIGHTS RESERVED 2026
      </footer>
    </div>
  );
}
