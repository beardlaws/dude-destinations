import Link from "next/link";
import { Play, Map } from "lucide-react";
import type { TavernStats } from "@/lib/tavern-service";

interface HeroSectionProps {
  stats: TavernStats;
}

export default function HeroSection({ stats }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
        aria-hidden="true"
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 30%, oklch(0.11 0.005 60) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Amber side accent */}
      <div className="absolute left-8 lg:left-16 top-1/4 bottom-1/4 w-px bg-amber/30" aria-hidden="true" />

      {/* Dude Approved stamp - top right */}
      <div className="absolute top-28 right-8 lg:right-16 hidden lg:flex flex-col items-center gap-1 opacity-70 rotate-12">
        <div className="w-20 h-20 rounded-full border-4 border-amber flex items-center justify-center">
          <div className="text-center">
            <div className="text-amber font-black text-[9px] uppercase tracking-widest leading-tight">Dude</div>
            <div className="text-amber font-black text-[9px] uppercase tracking-widest leading-tight">Approved</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">

        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-12 bg-amber/50" />
          <p className="text-xs font-black tracking-[0.5em] uppercase text-amber">
            Ohio Tavern Tour &bull; Est. 2023
          </p>
          <div className="h-px w-12 bg-amber/50" />
        </div>

        {/* Headline */}
        <h1 className="font-serif font-black leading-none text-balance mb-6">
          <span className="block text-5xl sm:text-6xl lg:text-8xl xl:text-9xl text-white">
            The Dude
          </span>
          <span className="block text-5xl sm:text-6xl lg:text-8xl xl:text-9xl text-amber">
            Network
          </span>
          <span className="block text-2xl sm:text-3xl lg:text-4xl text-white/70 font-bold tracking-widest uppercase mt-2">
            Tavern Tour
          </span>
        </h1>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 my-8">
          <div className="h-px w-16 bg-amber/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber" />
          <div className="h-px w-16 bg-amber/40" />
        </div>

        {/* Tagline - stronger copy */}
        <p className="text-xl sm:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-4 font-medium text-balance">
          Real bars. Real people. Real cold beer.
        </p>
        <p className="text-base text-white/55 max-w-xl mx-auto leading-relaxed mb-12">
          We hit the road so you know where to drink. {stats.totalStops} stops, {stats.statesCovered} states, zero pretentious cocktail bars — just the places worth pulling over for.
        </p>

        {/* Stats strip */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 mb-12">
          {[
            { value: String(stats.totalStops), label: "Stops" },
            { value: String(stats.statesCovered), label: "States" },
            { value: String(stats.countiesCovered), label: "Counties" },
            { value: stats.milesTraveled, label: "Miles" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-amber leading-none">{value}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-white/40 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="#dude-destination"
            className="flex items-center gap-2.5 px-10 py-4 text-sm font-black uppercase tracking-wider bg-amber text-darker-wood rounded-sm hover:bg-amber-bright transition-all duration-200 shadow-lg shadow-amber/25 hover:shadow-amber/50 hover:scale-105"
          >
            <Map className="w-4 h-4" />
            Explore the Map
          </Link>
          <Link
            href="#reviews"
            className="flex items-center gap-2.5 px-10 py-4 text-sm font-black uppercase tracking-wider border-2 border-white/25 text-white hover:border-amber hover:text-amber rounded-sm transition-all duration-200"
          >
            <Play className="w-4 h-4 fill-current" />
            Watch the Reviews
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 flex flex-col items-center gap-2 opacity-40">
          <div className="w-px h-10 bg-white/40" />
          <p className="text-xs tracking-widest uppercase text-white/50">Scroll</p>
        </div>
      </div>
    </section>
  );
}
