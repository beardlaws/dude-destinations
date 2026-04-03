"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, ChevronRight } from "lucide-react";
import type { Tavern } from "@/lib/data";

interface MapPinMarkerProps {
  tavern: Pick<Tavern, "id" | "slug" | "name" | "city" | "tags" | "thumbnail" | "shortDescription" | "stopNumber">;
  // Position as percentage of Ohio map dimensions
  xPercent: number;
  yPercent: number;
  active?: boolean;
  onClick?: (id: string) => void;
}

export function MapPinMarker({ tavern, xPercent, yPercent, active, onClick }: MapPinMarkerProps) {
  return (
    <button
      className="absolute -translate-x-1/2 -translate-y-full group z-10"
      style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
      onClick={() => onClick?.(tavern.id)}
      aria-label={`${tavern.name} in ${tavern.city}`}
    >
      {/* Stop number label */}
      <div
        className={`absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap transition-all duration-200 ${
          active ? "bg-amber text-darker-wood opacity-100" : "bg-black/70 text-white/80 opacity-0 group-hover:opacity-100"
        }`}
      >
        #{tavern.stopNumber}
      </div>
      {/* Pin */}
      <div
        className={`flex flex-col items-center transition-all duration-200 ${active ? "scale-125" : "hover:scale-110"}`}
      >
        <div
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shadow-lg shadow-black/40 transition-colors ${
            active
              ? "bg-amber border-amber-bright text-darker-wood"
              : "bg-darker-wood border-amber text-amber group-hover:bg-amber group-hover:text-darker-wood"
          }`}
        >
          <MapPin className="w-3.5 h-3.5 fill-current" />
        </div>
        {/* Pointer */}
        <div
          className={`w-0.5 h-2 transition-colors ${active ? "bg-amber" : "bg-amber/70"}`}
        />
        <div
          className={`w-1.5 h-1.5 rounded-full transition-colors ${active ? "bg-amber" : "bg-amber/50"}`}
        />
      </div>
    </button>
  );
}

interface MapSidebarCardProps {
  tavern: Pick<Tavern, "id" | "slug" | "name" | "city" | "tags" | "thumbnail" | "shortDescription" | "stopNumber">;
  active?: boolean;
  onClick?: (id: string) => void;
}

export function MapSidebarCard({ tavern, active, onClick }: MapSidebarCardProps) {
  return (
    <button
      className={`w-full text-left rounded-sm border transition-all duration-200 overflow-hidden flex gap-0 group ${
        active
          ? "border-amber shadow-md shadow-amber/10 bg-card"
          : "border-border hover:border-amber/50 bg-card hover:bg-secondary"
      }`}
      onClick={() => onClick?.(tavern.id)}
      aria-pressed={active}
    >
      {/* Thumbnail */}
      <div className="relative w-20 flex-shrink-0">
        <Image
          src={tavern.thumbnail}
          alt={tavern.name}
          fill
          className="object-cover"
          sizes="80px"
        />
        <div
          className={`absolute inset-0 transition-colors ${
            active ? "bg-black/20" : "bg-black/30"
          }`}
        />
      </div>

      {/* Text */}
      <div className="flex-1 p-3 min-w-0">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          <span
            className={`text-xs font-bold px-1.5 py-0.5 rounded-sm ${
              active ? "bg-amber text-darker-wood" : "bg-secondary text-amber"
            }`}
          >
            #{tavern.stopNumber}
          </span>
          <span className="tracking-wide uppercase font-semibold truncate">{tavern.city}</span>
        </div>
        <h4
          className={`text-sm font-bold leading-snug truncate transition-colors ${
            active ? "text-amber" : "text-foreground group-hover:text-amber"
          }`}
        >
          {tavern.name}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
          {tavern.shortDescription}
        </p>
      </div>

      <div className="flex items-center pr-2 text-muted-foreground">
        <ChevronRight className="w-4 h-4" />
      </div>
    </button>
  );
}
