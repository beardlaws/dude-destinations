"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles, Landmark, Music, Home, Map, Beer,
  Flame, Play, MapPin, Star, Youtube, Facebook,
  Shuffle, X, ChevronRight
} from "lucide-react";
import type { Tavern } from "@/lib/tavern-service";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

const TAVERN_CATEGORIES = [
  { id: "Hidden Gem",       label: "Hidden Gem",       icon: Sparkles, desc: "Off the beaten path" },
  { id: "Historic Spot",    label: "Historic Spot",    icon: Landmark, desc: "Stories in the walls" },
  { id: "Great Wings",      label: "Great Wings",      icon: Flame,    desc: "Pull over to eat" },
  { id: "Best Atmosphere",  label: "Best Atmosphere",  icon: Music,    desc: "The vibe hits different" },
  { id: "Small Town Stop",  label: "Small Town Stop",  icon: Home,     desc: "Blink and you'll miss it" },
  { id: "Road Trip Worthy", label: "Road Trip Worthy", icon: Map,      desc: "Worth adding miles" },
  { id: "Live Music",       label: "Live Music",       icon: Music,    desc: "Cold beer and a live set" },
  { id: "Dive Bar",         label: "Dive Bar",         icon: Beer,     desc: "Proud of it" },
];

interface CategoriesSectionProps {
  taverns: Tavern[];
}

// Roulette modal component
function RouletteModal({
  tavern,
  isSpinning,
  onClose,
  onRespin,
}: {
  tavern: Tavern | null;
  isSpinning: boolean;
  onClose: () => void;
  onRespin: () => void;
}) {
  const isYouTube = tavern?.video_url?.includes("youtube") || tavern?.video_url?.includes("youtu.be");
  const isFacebook = tavern?.video_url?.includes("facebook") || tavern?.video_url?.includes("fb.watch");
  const PlatformIcon = isYouTube ? Youtube : isFacebook ? Facebook : TikTokIcon;
  const platformLabel = isYouTube ? "YouTube" : isFacebook ? "Facebook" : "TikTok";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-darker-wood border border-amber/40 rounded-sm overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-amber px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-darker-wood" />
            <span className="font-black text-darker-wood uppercase tracking-wider text-sm">
              Road Trip Roulette
            </span>
          </div>
          <button onClick={onClose} className="text-darker-wood/70 hover:text-darker-wood">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSpinning ? (
          <div className="p-12 flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-amber border-t-transparent rounded-full animate-spin" />
            <p className="text-amber font-bold uppercase tracking-widest text-sm animate-pulse">
              Picking your stop...
            </p>
          </div>
        ) : tavern ? (
          <>
            {/* Tavern image */}
            <div className="relative aspect-video">
              <Image
                src={tavern.thumbnail || "/images/tavern-placeholder.jpg"}
                alt={tavern.name}
                fill
                className="object-cover"
                onError={undefined}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-darker-wood via-transparent to-transparent" />
              <div className="absolute top-3 left-3 px-3 py-1 bg-amber text-darker-wood text-xs font-black uppercase tracking-wider rounded-sm">
                Stop #{tavern.stop_number}
              </div>
              {tavern.dude_approved && (
                <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-amber to-amber-bright text-darker-wood text-[10px] font-black rounded-sm flex items-center gap-1">
                  <span>✓</span> DUDE APPROVED
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-serif text-2xl font-black text-foreground leading-tight">
                    {tavern.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-3.5 h-3.5 text-amber" />
                    <span>{tavern.city}, {tavern.state}</span>
                    {tavern.rating > 0 && (
                      <>
                        <span className="text-border">•</span>
                        <Star className="w-3.5 h-3.5 fill-amber text-amber" />
                        <span>{tavern.rating.toFixed(1)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                {tavern.short_description}
              </p>

              {/* Tags */}
              {tavern.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {tavern.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-amber/10 text-amber text-xs font-semibold rounded-sm border border-amber/20">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Link
                  href={`/taverns/${tavern.slug}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber text-darker-wood font-bold text-sm uppercase tracking-wider rounded-sm hover:bg-amber-bright transition-colors"
                  onClick={onClose}
                >
                  <ChevronRight className="w-4 h-4" />
                  Read Full Story
                </Link>
                {tavern.video_url && (
                  <a
                    href={tavern.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 border border-border text-muted-foreground text-sm font-bold uppercase tracking-wider rounded-sm hover:border-amber/50 hover:text-foreground transition-colors"
                  >
                    <PlatformIcon className="w-4 h-4" />
                    {platformLabel}
                  </a>
                )}
              </div>

              {/* Respin */}
              <button
                onClick={onRespin}
                className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 border border-border/50 text-muted-foreground text-xs font-bold uppercase tracking-wider rounded-sm hover:border-amber/30 hover:text-foreground transition-colors"
              >
                <Shuffle className="w-3.5 h-3.5" />
                Spin Again
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function CategoriesSection({ taverns }: CategoriesSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filteredTaverns, setFilteredTaverns] = useState<Tavern[]>([]);
  const [rouletteOpen, setRouletteOpen] = useState(false);
  const [rouletteTavern, setRouletteTavern] = useState<Tavern | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    if (!activeCategory) {
      setFilteredTaverns([]);
      return;
    }
    const filtered = taverns.filter((t) => t.tags?.includes(activeCategory));
    setFilteredTaverns(filtered);
  }, [activeCategory, taverns]);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  const spinRoulette = () => {
    const pool = taverns.filter((t) => t.dude_approved);
    if (!pool.length) return;

    setRouletteOpen(true);
    setIsSpinning(true);
    setRouletteTavern(null);

    // Spin for dramatic effect
    setTimeout(() => {
      const pick = pool[Math.floor(Math.random() * pool.length)];
      setRouletteTavern(pick);
      setIsSpinning(false);
    }, 1200);
  };

  return (
    <section id="filters" className="py-16 lg:py-24 bg-dark-wood border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header + Roulette */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="text-center lg:text-left">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-amber mb-3">
              Browse by Category
            </p>
            <h2 className="font-serif text-3xl lg:text-4xl font-black text-foreground mb-2">
              Find Your Kind of Stop
            </h2>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              Pick a vibe and we'll show you every stop that fits. Or let fate decide.
            </p>
          </div>

          {/* Road Trip Roulette CTA */}
          <button
            onClick={spinRoulette}
            className="group flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-amber to-amber-bright text-darker-wood font-black uppercase tracking-wider text-sm rounded-sm hover:shadow-lg hover:shadow-amber/30 transition-all hover:scale-105 flex-shrink-0"
          >
            <Shuffle className="w-5 h-5 group-hover:animate-spin" />
            Road Trip Roulette
          </button>
        </div>

        {/* Category pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {TAVERN_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            const count = taverns.filter((t) => t.tags?.includes(cat.id)).length;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`group relative overflow-hidden rounded-sm border p-4 text-left transition-all duration-200 ${
                  isActive
                    ? "border-amber bg-amber/10 shadow-md shadow-amber/10"
                    : "border-border bg-card hover:border-amber/50 hover:bg-secondary"
                }`}
              >
                <div className={`w-8 h-8 rounded-sm flex items-center justify-center mb-2.5 transition-colors ${
                  isActive ? "bg-amber text-darker-wood" : "bg-muted/50 text-muted-foreground group-hover:bg-amber/20 group-hover:text-amber"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className={`text-sm font-bold leading-tight mb-0.5 ${isActive ? "text-amber" : "text-foreground"}`}>
                  {cat.label}
                </p>
                <p className="text-xs text-muted-foreground">{count} stops</p>
                {isActive && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber" />}
              </button>
            );
          })}
        </div>

        {/* Video grid for active category */}
        {activeCategory && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-bold text-foreground">
                <span className="text-amber">{activeCategory}</span> Stops
                <span className="text-muted-foreground font-normal text-base ml-2">
                  — {filteredTaverns.length} {filteredTaverns.length === 1 ? "stop" : "stops"}
                </span>
              </h3>
              <button
                onClick={() => setActiveCategory(null)}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-sm hover:border-amber/40 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>

            {filteredTaverns.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No stops with this tag yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTaverns.map((tavern) => {
                  const isYT = tavern.video_url?.includes("youtube") || tavern.video_url?.includes("youtu.be");
                  const isFB = tavern.video_url?.includes("facebook") || tavern.video_url?.includes("fb.watch");
                  const PIcon = isYT ? Youtube : isFB ? Facebook : TikTokIcon;
                  const pLabel = isYT ? "YouTube" : isFB ? "Facebook" : "TikTok";

                  return (
                    <div key={tavern.id} className="group bg-card border border-border rounded-sm overflow-hidden hover:border-amber/50 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30">
                      {/* Thumbnail */}
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={tavern.thumbnail || "/images/tavern-placeholder.jpg"}
                          alt={tavern.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={undefined}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber text-darker-wood text-[10px] font-black rounded-sm">
                          #{tavern.stop_number}
                        </div>
                        {tavern.video_url && (
                          <a
                            href={tavern.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40"
                          >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isYT ? "bg-red-600" : isFB ? "bg-[#1877F2]" : "bg-white"}`}>
                              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                            </div>
                          </a>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3.5">
                        <h4 className="font-bold text-sm text-foreground leading-snug mb-1 line-clamp-1 group-hover:text-amber transition-colors">
                          {tavern.name}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                          <MapPin className="w-3 h-3 text-amber" />
                          <span>{tavern.city}, {tavern.state}</span>
                          {tavern.rating > 0 && (
                            <>
                              <span className="mx-1">·</span>
                              <Star className="w-3 h-3 fill-amber text-amber" />
                              <span>{tavern.rating.toFixed(1)}</span>
                            </>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/taverns/${tavern.slug}`}
                            className="flex-1 text-center py-1.5 bg-amber/10 text-amber text-xs font-bold rounded-sm hover:bg-amber/20 transition-colors"
                          >
                            Full Story
                          </Link>
                          {tavern.video_url && (
                            <a
                              href={tavern.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-2.5 py-1.5 border border-border text-xs font-bold text-muted-foreground rounded-sm hover:border-amber/40 hover:text-foreground transition-colors"
                            >
                              <PIcon className="w-3 h-3" />
                              {pLabel}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Road Trip Roulette Modal */}
      {rouletteOpen && (
        <RouletteModal
          tavern={rouletteTavern}
          isSpinning={isSpinning}
          onClose={() => setRouletteOpen(false)}
          onRespin={spinRoulette}
        />
      )}
    </section>
  );
}

