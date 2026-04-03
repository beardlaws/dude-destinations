import Link from "next/link";
import { Play, Map } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
        aria-hidden="true"
      />
      {/* Overlays */}
      <div className="absolute inset-0 bg-black/65" aria-hidden="true" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 40%, oklch(0.11 0.005 60) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Vertical neon line accent */}
      <div className="absolute left-8 lg:left-16 top-1/4 bottom-1/4 w-px bg-amber/30" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        {/* Eyebrow */}
        <p className="text-xs font-bold tracking-[0.4em] uppercase text-amber mb-6">
          Ohio Tavern Tour &bull; Est. 2023
        </p>

        {/* Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-black text-foreground leading-none text-balance mb-6">
          The Dude{" "}
          <span className="text-amber">Network</span>
          <br />
          <span className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white/80">
            Tavern Tour
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-4 text-balance">
          Ohio taverns, cold drinks, local legends, and the stories worth stopping for.
        </p>
        <p className="text-sm text-white/50 max-w-xl mx-auto leading-relaxed mb-10">
          We&apos;re traveling every corner of Ohio — finding the real bars, the hidden gems, and the places 
          that make this state worth driving through. Watch the reviews. Plan your stops.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="#dude-destination"
            className="flex items-center gap-2.5 px-8 py-4 text-sm font-bold uppercase tracking-wider bg-amber text-darker-wood rounded-sm hover:bg-amber-bright transition-all duration-200 shadow-lg shadow-amber/20 hover:shadow-amber/40 hover:scale-105"
          >
            <Map className="w-4 h-4" />
            Explore the Map
          </Link>
          <Link
            href="#reviews"
            className="flex items-center gap-2.5 px-8 py-4 text-sm font-bold uppercase tracking-wider border-2 border-white/30 text-white hover:border-amber/60 hover:text-amber rounded-sm transition-all duration-200"
          >
            <Play className="w-4 h-4 fill-current" />
            Watch Latest Stops
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="mt-20 flex flex-col items-center gap-2 opacity-50">
          <div className="w-px h-10 bg-white/40" />
          <p className="text-xs tracking-widest uppercase text-white/50">Scroll</p>
        </div>
      </div>
    </section>
  );
}
