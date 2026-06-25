import { getCameras } from "@/lib/db-client";
import CameraCard from "@/components/CameraCard";
import { Camera, Eye, Layers, Sliders } from "lucide-react";

export const revalidate = 3600; // Cache page for 1 hour

export default async function Home() {
  const cameras = await getCameras();

  return (
    <div className="min-h-screen bg-[#070913] text-white">
      {/* Background ambient glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="absolute top-80 right-1/4 h-[600px] w-[600px] rounded-full bg-violet-500/5 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        {/* Header Section */}
        <header className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-950/30 px-3.5 py-1 text-xs font-semibold tracking-wider text-sky-400 uppercase">
            <Camera className="h-3.5 w-3.5" />
            Virtual Camera Showroom
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl uppercase font-sans">
            Camverse<span className="text-sky-500">.</span>
          </h1>
          <p className="text-lg leading-relaxed text-slate-400">
            Get a genuine hands-on feel for premium cameras before stepping foot in a shop.
            Rotate the body in 360°, interact with physical button hotspots, and click through live brand-accurate menu systems.
          </p>
        </header>

        {/* Feature Highlights */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 border-t border-slate-900 pt-10">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-sky-400">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                360° Rotatable Bodies
              </h4>
              <p className="mt-1 text-xs text-slate-400 leading-normal">
                Draggable vector wireframes showing exact camera forms from every angle.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-purple-400">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Active Button Hotspots
              </h4>
              <p className="mt-1 text-xs text-slate-400 leading-normal">
                Click controls, mode dials, viewfinders, and port slots to see what they do.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-orange-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Menu System Simulators
              </h4>
              <p className="mt-1 text-xs text-slate-400 leading-normal">
                Brand-accurate menu layouts with plain-language option guides.
              </p>
            </div>
          </div>
        </div>

        {/* Camera Showroom Catalog Grid */}
        <section className="mt-16 border-t border-slate-900 pt-16">
          <h2 className="text-xl font-bold uppercase tracking-widest text-slate-400 mb-8">
            Select a Body to Explore
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cameras.map((camera) => (
              <CameraCard key={camera.id} camera={camera} />
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-24 border-t border-slate-950 bg-slate-950/20 py-8 text-center text-xs text-slate-500 font-mono tracking-widest">
        CAMVERSE SHIFT V1.0  |  ALL RIGHTS RESERVED 2026
      </footer>
    </div>
  );
}
