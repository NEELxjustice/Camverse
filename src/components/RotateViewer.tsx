"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Hotspot } from "@/lib/fallback-data";
import HotspotMarker from "./HotspotMarker";
import { MoveHorizontal, RotateCw } from "lucide-react";

interface RotateViewerProps {
  slug: string;
  frameCount: number;
  hotspots: Hotspot[];
  activeHotspot: Hotspot | null;
  onSelectHotspot: (hotspot: Hotspot | null) => void;
  brandColor: string; // custom color theme (e.g. orange, red, green)
}

export default function RotateViewer({
  slug,
  frameCount = 40,
  hotspots,
  activeHotspot,
  onSelectHotspot,
  brandColor,
}: RotateViewerProps) {
  const [frame, setFrame] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [preloaded, setPreloaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, frame: 1 });
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sensitivity: how many pixels of horizontal drag moves one frame
  const SENSITIVITY = 12;

  // Preload all frames on mount
  useEffect(() => {
    let loaded = 0;
    const images: HTMLImageElement[] = [];

    for (let i = 1; i <= frameCount; i++) {
      const img = new window.Image();
      img.src = `/rotations/${slug}/${String(i).padStart(3, "0")}.jpg`;
      img.onload = () => {
        loaded++;
        setLoadedCount(loaded);
        if (loaded === frameCount) {
          setPreloaded(true);
        }
      };
      images.push(img);
    }
  }, [slug, frameCount]);

  // Autoplay intro spin on load
  useEffect(() => {
    if (autoplay && preloaded) {
      autoplayTimerRef.current = setInterval(() => {
        setFrame((prev) => {
          if (prev >= frameCount) {
            // Once we complete a full spin, stop autoplay
            setAutoplay(false);
            if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
            return 1;
          }
          return prev + 1;
        });
      }, 50); // fast smooth rotate
    }

    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, [autoplay, preloaded, frameCount]);

  // Mouse / Touch handlers
  const handleStart = (clientX: number) => {
    setAutoplay(false); // Cancel autoplay immediately on touch/click
    if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);

    setIsDragging(true);
    dragStartRef.current = {
      x: clientX,
      frame: frame,
    };
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    const deltaX = clientX - dragStartRef.current.x;
    const frameShift = Math.floor(deltaX / SENSITIVITY);

    // dragging left rotates camera right (increases frame index)
    let nextFrame = dragStartRef.current.frame - frameShift;
    nextFrame = ((nextFrame - 1) % frameCount + frameCount) % frameCount + 1;
    setFrame(nextFrame);
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  // Helper: check if a hotspot is visible in the current frame (0-indexed ranges vs 1-indexed frames)
  const isHotspotVisible = (hotspot: Hotspot) => {
    const f0 = frame - 1;
    const start = hotspot.frameRangeStart;
    const end = hotspot.frameRangeEnd;

    if (start <= end) {
      return f0 >= start && f0 <= end;
    } else {
      // wraps around (e.g. 32 to 8)
      return f0 >= start || f0 <= end;
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* 360 Rotation Container */}
      <div
        ref={containerRef}
        onMouseDown={(e) => {
          e.preventDefault();
          handleStart(e.clientX);
        }}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
        className={`relative aspect-[1.6] w-full max-w-[640px] overflow-hidden rounded-2xl border border-slate-800 bg-[#0b0f19] ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        } shadow-2xl shadow-black/80`}
      >
        {/* Preload overlay loader */}
        {!preloaded && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0b0f19] gap-4">
            <RotateCw className="h-8 w-8 animate-spin text-sky-400" />
            <span className="text-xs font-semibold tracking-wider text-slate-400">
              PRELOADING SIMULATION FRAMES ({Math.round((loadedCount / frameCount) * 100)}%)
            </span>
          </div>
        )}

        {/* The Frame Viewer Image */}
        {preloaded && (
          <div className="relative h-full w-full pointer-events-none select-none">
            <Image
              src={`/rotations/${slug}/${String(frame).padStart(3, "0")}.jpg`}
              alt={`${slug} frame ${frame}`}
              fill
              className="object-contain"
              priority
            />
          </div>
        )}

        {/* Hotspots Overlay */}
        {preloaded &&
          hotspots.map((hotspot) => {
            const visible = isHotspotVisible(hotspot);
            return (
              <HotspotMarker
                key={hotspot.id}
                hotspot={hotspot}
                visible={visible}
                active={activeHotspot?.id === hotspot.id}
                onClick={() => onSelectHotspot(hotspot)}
                brandColor={brandColor}
              />
            );
          })}

        {/* Quick Hint Overlay */}
        {preloaded && (
          <div className="absolute bottom-3 left-3 pointer-events-none flex items-center gap-1.5 rounded-lg bg-slate-950/80 px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border border-slate-800">
            <MoveHorizontal className="h-3 w-3" />
            Drag to Rotate
          </div>
        )}
      </div>
    </div>
  );
}
