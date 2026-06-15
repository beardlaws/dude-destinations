"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const navLinks = [
  { id: "map", label: "The Map", href: "/#dude-destination" },
  { id: "taverns", label: "Taverns", href: "/#taverns" },
  { id: "reviews", label: "Reviews", href: "/#reviews" },
  { id: "about", label: "About", href: "/#about" },
  { id: "submit", label: "Submit a Stop", href: "/#submit" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-darker-wood/95 backdrop-blur-md border-b border-border shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber/30 group-hover:border-amber transition-colors">
              <Image
                src="/images/dude-network-logo.png"
                alt="The Dude Network"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="leading-tight hidden sm:block">
              <div className="text-sm font-bold tracking-widest text-amber uppercase leading-none">
                The Dude Network
              </div>
              <div className="text-xs text-muted-foreground tracking-[0.2em] uppercase leading-none mt-0.5">
                Tavern Tour
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="text-sm font-semibold tracking-wider uppercase text-muted-foreground hover:text-amber transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/#dude-destination"
              className="px-5 py-2 text-sm font-bold tracking-wider uppercase bg-amber text-darker-wood rounded-sm hover:bg-amber-bright transition-colors duration-200"
            >
              Explore the Map
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden bg-darker-wood/98 border-t border-border">
          <nav className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-4" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="text-base font-semibold tracking-wider uppercase text-foreground hover:text-amber transition-colors py-1"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/#dude-destination"
              className="mt-2 px-5 py-3 text-sm font-bold tracking-wider uppercase bg-amber text-darker-wood rounded-sm text-center hover:bg-amber-bright transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Explore the Map
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
