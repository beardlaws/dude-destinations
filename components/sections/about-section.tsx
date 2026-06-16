"use client";

import Image from "next/image";
import { MapPin, Play } from "lucide-react";
import Link from "next/link";
import type { TavernStats } from "@/lib/tavern-service";

interface AboutSectionProps {
  stats?: TavernStats;
}

export default function AboutSection({ stats }: AboutSectionProps) {
  const stopCount = stats?.total ?? 27;

  return (
    <section id="about" className="py-16 lg:py-24 bg-dark-wood border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative aspect-[4/3] rounded-sm overflow-hidden">
              <Image
                src="/images/about-bg.jpg"
                alt="Open Ohio highway on the Dude Network Tavern Tour road trip"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent" />
            </div>
            {/* Floating badge — now dynamic */}
            <div className="absolute -bottom-4 -right-4 lg:-bottom-6 lg:-right-6 bg-amber text-darker-wood p-5 rounded-sm shadow-xl">
              <div className="font-serif text-3xl font-black leading-none">{stopCount}</div>
              <div className="text-xs font-bold uppercase tracking-wider mt-1 leading-none">Stops</div>
              <div className="text-xs font-bold uppercase tracking-wider">Completed</div>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-amber mb-3">
              Our Mission
            </p>
            <h2 className="font-serif text-3xl lg:text-5xl font-black text-foreground mb-6 text-balance">
              About the Tour
            </h2>
            <div className="flex flex-col gap-4 text-muted-foreground leading-relaxed">
              <p>
                The Dude Network Tavern Tour started as a simple question: what are the best taverns 
                in Ohio, and why doesn&apos;t anyone talk about them?
              </p>
              <p>
                We&apos;re not reviewing upscale cocktail bars or trendy gastropubs. We&apos;re finding 
                the real places — corner bars in small towns, neighborhood pubs that&apos;ve been open 
                for 60 years, the spots where locals have been drinking for generations. The places 
                with stories baked into the walls.
              </p>
              <p>
                Every stop gets a full video review, an honest write-up, and a pin on the map. 
                We&apos;re building a living guide to Ohio&apos;s tavern culture — one cold beer at a time.
              </p>
            </div>

            {/* Pillars */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-border">
              {[
                { icon: MapPin, title: "Road Trips", desc: "All corners of Ohio" },
                { icon: Play, title: "Video Reviews", desc: "Honest, on-camera stops" },
                { icon: MapPin, title: "Community", desc: "Built on local tips" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="text-center">
                  <div className="w-10 h-10 rounded-sm bg-amber/15 border border-amber/30 flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-5 h-5 text-amber" />
                  </div>
                  <div className="text-sm font-bold text-foreground">{title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-amber text-darker-wood font-bold uppercase tracking-wider text-sm rounded-sm hover:bg-amber-bright transition-colors shadow-md shadow-amber/20 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Watch Latest Reviews
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
