"use client";

import React, { useState, useEffect } from "react";
import { MenuNode } from "@/lib/fallback-data";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, HelpCircle, Monitor, Settings } from "lucide-react";

interface MenuTreeProps {
  brand: string;
  menuNodes: MenuNode[];
}

export default function MenuTree({ brand, menuNodes }: MenuTreeProps) {
  // Find top level nodes (no parentId)
  const topNodes = menuNodes.filter((node) => !node.parentId);

  // States
  const [activeTopId, setActiveTopId] = useState<string | null>(null);
  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [selectedLeafId, setSelectedLeafId] = useState<string | null>(null);

  // Auto-select first item when brand/nodes change
  useEffect(() => {
    if (topNodes.length > 0) {
      setActiveTopId(topNodes[0].id);
      // Auto-select first sub-menu under top menu
      const subs = menuNodes.filter((n) => n.parentId === topNodes[0].id);
      if (subs.length > 0) {
        setActiveSubId(subs[0].id);
        const leaves = menuNodes.filter((n) => n.parentId === subs[0].id);
        if (leaves.length > 0) {
          setSelectedLeafId(leaves[0].id);
        } else {
          setSelectedLeafId(null);
        }
      } else {
        setActiveSubId(null);
        setSelectedLeafId(null);
      }
    }
  }, [brand, menuNodes]);

  // Handle category switch
  const handleTopClick = (id: string) => {
    setActiveTopId(id);
    const subs = menuNodes.filter((n) => n.parentId === id);
    if (subs.length > 0) {
      setActiveSubId(subs[0].id);
      const leaves = menuNodes.filter((n) => n.parentId === subs[0].id);
      if (leaves.length > 0) {
        setSelectedLeafId(leaves[0].id);
      } else {
        setSelectedLeafId(null);
      }
    } else {
      setActiveSubId(null);
      setSelectedLeafId(null);
    }
  };

  // Handle subcategory switch
  const handleSubClick = (id: string) => {
    setActiveSubId(id);
    const leaves = menuNodes.filter((n) => n.parentId === id);
    if (leaves.length > 0) {
      setSelectedLeafId(leaves[0].id);
    } else {
      setSelectedLeafId(null);
    }
  };

  // Render SONY Skin (Modern Sidebar + Help Bar)
  const renderSonySkin = () => {
    const activeTop = topNodes.find((n) => n.id === activeTopId);
    const subNodes = menuNodes.filter((n) => n.parentId === activeTopId);
    const activeSub = subNodes.find((n) => n.id === activeSubId) || subNodes[0];
    const leafNodes = activeSub ? menuNodes.filter((n) => n.parentId === activeSub.id) : [];
    const activeLeaf = leafNodes.find((n) => n.id === selectedLeafId) || leafNodes[0];

    // Sony brand colors
    const categoryColors: Record<string, string> = {
      Shooting: "bg-orange-600 border-l-4 border-orange-400",
      "Exposure/Color": "bg-rose-600 border-l-4 border-rose-400",
      Focus: "bg-purple-600 border-l-4 border-purple-400",
      Playback: "bg-blue-600 border-l-4 border-blue-400",
      Network: "bg-emerald-600 border-l-4 border-emerald-400",
      Setup: "bg-yellow-600 border-l-4 border-yellow-400",
    };

    return (
      <div className="flex flex-col h-[400px] w-full overflow-hidden rounded-xl border border-slate-800 bg-[#121620] font-sans text-sm text-slate-200 shadow-xl">
        {/* Main Interface Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Icon Sidebar */}
          <div className="w-[60px] bg-[#0c0e14] flex flex-col items-center py-2 border-r border-slate-900 gap-1.5">
            <div className="mb-2 text-slate-500">
              <Monitor className="h-4 w-4" />
            </div>
            {topNodes.map((n) => {
              const isActive = n.id === activeTopId;
              const colorClass = categoryColors[n.label] || "bg-sky-600";
              return (
                <button
                  key={n.id}
                  onClick={() => handleTopClick(n.id)}
                  className={`w-11 h-9 rounded flex items-center justify-center font-bold text-xs uppercase transition-all duration-200 ${
                    isActive
                      ? `${colorClass} text-white shadow-md`
                      : "bg-[#181d29] hover:bg-[#202737] text-slate-400"
                  }`}
                  title={n.label}
                >
                  {n.label.substring(0, 2)}
                </button>
              );
            })}
          </div>

          {/* Middle Columns (Subs and Leaves side-by-side) */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sub menus (folders) */}
            <div className="w-1/3 bg-[#161b27] border-r border-slate-900 overflow-y-auto p-1.5 flex flex-col gap-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1 tracking-wider">
                Groups
              </div>
              {subNodes.map((s) => {
                const isActive = s.id === activeSubId;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSubClick(s.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? "bg-[#222b3d] text-sky-400 border border-sky-500/20"
                        : "hover:bg-[#1a2130] text-slate-300"
                    }`}
                  >
                    <span className="truncate">{s.label}</span>
                    <ChevronRight className="h-3 w-3 opacity-60" />
                  </button>
                );
              })}
            </div>

            {/* Leaf Items */}
            <div className="flex-1 bg-[#121620] overflow-y-auto p-3 flex flex-col gap-1.5">
              <div className="text-[10px] font-bold text-slate-500 uppercase px-1 py-0.5 tracking-wider">
                Settings / Parameters
              </div>
              {leafNodes.length > 0 ? (
                leafNodes.map((l) => {
                  const isActive = l.id === selectedLeafId;
                  return (
                    <button
                      key={l.id}
                      onClick={() => setSelectedLeafId(l.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center justify-between text-xs transition-all border ${
                        isActive
                          ? "bg-[#1d2436] text-white border-orange-500/30 font-semibold shadow-inner"
                          : "bg-[#161a26]/40 hover:bg-[#1b2131]/60 text-slate-300 border-transparent"
                      }`}
                    >
                      <span>{l.label}</span>
                      {isActive && (
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="flex items-center justify-center flex-1 text-slate-500 text-xs italic">
                  Select a category
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Help Banner (Sony Style status bar) */}
        <div className="bg-[#090b0e] border-t border-slate-900 px-4 py-3 flex items-start gap-2.5">
          <HelpCircle className="h-4.5 w-4.5 text-orange-500 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-slate-400">
            <span className="font-bold text-slate-200 block uppercase tracking-wider text-[10px] mb-0.5">
              {activeLeaf ? activeLeaf.label : "Description"}
            </span>
            {activeLeaf && activeLeaf.description
              ? activeLeaf.description
              : "Use the menu to simulate and explore settings. Leaf items show plain-language breakdowns."}
          </div>
        </div>
      </div>
    );
  };

  // Render CANON Skin (Top Tabs + List + Detail Accordion)
  const renderCanonSkin = () => {
    const activeTop = topNodes.find((n) => n.id === activeTopId);
    const subNodes = menuNodes.filter((n) => n.parentId === activeTopId);

    // Color schema per tab
    const tabColors: Record<string, { tab: string; border: string; accent: string }> = {
      "SHOOT (Red)": { tab: "bg-red-950/80 text-red-400", border: "border-red-600", accent: "bg-red-600" },
      "AF (Magenta)": { tab: "bg-fuchsia-950/80 text-fuchsia-400", border: "border-fuchsia-600", accent: "bg-fuchsia-600" },
      "PLAY (Blue)": { tab: "bg-blue-950/80 text-blue-400", border: "border-blue-600", accent: "bg-blue-600" },
      "NETWORK (Purple)": { tab: "bg-purple-950/80 text-purple-400", border: "border-purple-600", accent: "bg-purple-600" },
      "SETUP (Yellow)": { tab: "bg-yellow-950/80 text-yellow-500", border: "border-yellow-600", accent: "bg-yellow-600" },
    };

    const currentTabStyle = activeTop ? tabColors[activeTop.label] : null;
    const accentClass = currentTabStyle?.accent || "bg-sky-600";
    const borderClass = currentTabStyle?.border || "border-sky-600";

    return (
      <div className="flex flex-col h-[400px] w-full overflow-hidden rounded-xl border border-slate-800 bg-[#0e0e12] font-mono text-sm text-slate-300 shadow-xl">
        {/* Top Tab Headers */}
        <div className="flex bg-[#14141a] border-b border-slate-900 overflow-x-auto select-none">
          {topNodes.map((n) => {
            const isActive = n.id === activeTopId;
            const style = tabColors[n.label] || { tab: "bg-slate-900 text-slate-400", border: "border-slate-800", accent: "bg-slate-400" };
            return (
              <button
                key={n.id}
                onClick={() => handleTopClick(n.id)}
                className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all relative shrink-0 border-b-2 border-transparent ${
                  isActive ? `${style.tab} border-b-2 ${style.border}` : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {n.label.split(" ")[0]}
              </button>
            );
          })}
        </div>

        {/* Content list with nested expansion */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0d0d12]">
          {subNodes.map((sub) => {
            const leaves = menuNodes.filter((l) => l.parentId === sub.id);
            const isSubActive = sub.id === activeSubId;
            return (
              <div key={sub.id} className="rounded-lg bg-[#14141b] border border-slate-900 overflow-hidden">
                <button
                  onClick={() => handleSubClick(sub.id)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#181822] text-left text-xs font-semibold uppercase text-slate-200 tracking-wider hover:bg-[#1d1d2b] transition-all"
                >
                  <span>{sub.label}</span>
                  <ChevronRight
                    className={`h-4 w-4 text-slate-500 transition-transform ${
                      isSubActive ? "rotate-90 text-slate-300" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isSubActive && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden bg-[#0e0e14] divide-y divide-slate-900/60"
                    >
                      {leaves.map((l) => (
                        <div key={l.id} className="p-3 text-xs space-y-1">
                          <div className="font-semibold text-slate-100 flex items-center gap-2">
                            <span className={`h-1.5 w-1.5 rounded-full ${accentClass}`} />
                            {l.label}
                          </div>
                          {l.description && (
                            <p className="text-[11px] text-slate-400 pl-3.5 leading-relaxed">
                              {l.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render FUJIFILM Skin (Monochrome Grid + Retro Screen)
  const renderFujifilmSkin = () => {
    const activeTop = topNodes.find((n) => n.id === activeTopId);
    const subNodes = menuNodes.filter((n) => n.parentId === activeTopId);
    const activeSub = subNodes.find((n) => n.id === activeSubId) || subNodes[0];
    const leafNodes = activeSub ? menuNodes.filter((n) => n.parentId === activeSub.id) : [];

    return (
      <div className="flex flex-col h-[400px] w-full overflow-hidden rounded-xl border border-slate-800 bg-[#161616] font-mono text-sm text-[#e5e5e5] shadow-xl">
        {/* Header bar */}
        <div className="bg-[#262626] border-b border-black px-4 py-2.5 flex justify-between items-center text-xs uppercase tracking-widest text-[#a3a3a3]">
          <span className="flex items-center gap-1.5 font-bold">
            <Settings className="h-3.5 w-3.5" />
            Fuji Setting Simulator
          </span>
          <span className="text-[10px] bg-black px-2 py-0.5 rounded text-[#10b981]">
            X100VI ONLINE
          </span>
        </div>

        <div className="flex flex-1 overflow-hidden bg-black">
          {/* Left index */}
          <div className="w-[80px] bg-[#121212] border-r border-[#262626] flex flex-col py-2">
            {topNodes.map((n) => {
              const isActive = n.id === activeTopId;
              const short = n.label.split(" ")[0];
              return (
                <button
                  key={n.id}
                  onClick={() => handleTopClick(n.id)}
                  className={`w-full py-2.5 text-[10px] text-center tracking-wider transition-all border-b border-[#1e1e1e] font-bold ${
                    isActive
                      ? "bg-black text-[#10b981] border-l-2 border-[#10b981]"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {short}
                </button>
              );
            })}
          </div>

          {/* Main screen area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Submenu Selectors */}
            <div className="flex bg-[#161616] border-b border-[#262626] overflow-x-auto select-none">
              {subNodes.map((s) => {
                const isActive = s.id === activeSubId;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSubClick(s.id)}
                    className={`px-4 py-2 text-[10px] tracking-widest uppercase transition-all ${
                      isActive ? "bg-black text-[#10b981] font-bold" : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {s.label.split(" ")[0]}
                  </button>
                );
              })}
            </div>

            {/* List options */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {leafNodes.map((l) => (
                <div key={l.id} className="border border-[#262626] bg-[#0c0c0c] rounded p-3 space-y-1">
                  <div className="text-[11px] font-bold text-[#10b981] tracking-wider uppercase">
                    {l.label}
                  </div>
                  {l.description && (
                    <p className="text-[10px] leading-relaxed text-neutral-400">
                      {l.description}
                    </p>
                  )}
                </div>
              ))}
              {leafNodes.length === 0 && (
                <div className="text-xs text-neutral-600 italic py-8 text-center">
                  No items under this subcategory.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Branch routing
  switch (brand) {
    case "Sony":
      return renderSonySkin();
    case "Canon":
      return renderCanonSkin();
    case "Fujifilm":
      return renderFujifilmSkin();
    default:
      return renderSonySkin();
  }
}
