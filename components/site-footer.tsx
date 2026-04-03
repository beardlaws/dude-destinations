import Link from "next/link";
import Image from "next/image";
import { Youtube, Instagram, Facebook, Twitter } from "lucide-react";

// TikTok icon (not in lucide-react)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const footerLinks = {
  Explore: [
    { label: "The Tavern Map", href: "#map" },
    { label: "Featured Taverns", href: "#taverns" },
    { label: "Latest Reviews", href: "#reviews" },
    { label: "All Stops", href: "#taverns" },
  ],
  Network: [
    { label: "About the Tour", href: "#about" },
    { label: "Submit a Tavern", href: "#submit" },
    { label: "Categories", href: "#filters" },
    { label: "Contact Us", href: "#" },
  ],
};

const socialLinks = [
  { icon: Youtube, label: "YouTube", href: "https://www.youtube.com/@the_dudenetwork" },
  { icon: TikTokIcon, label: "TikTok", href: "https://www.tiktok.com/@thedudenetwork" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/the_dudenetwork" },
  { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/profile.php?id=100078662463395" },
  { icon: Twitter, label: "Twitter / X", href: "https://twitter.com/The_DudeNetwork" },
];

export default function SiteFooter() {
  return (
    <footer className="bg-darker-wood border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber/30 group-hover:border-amber transition-colors">
                <Image
                  src="/images/dude-network-logo.png"
                  alt="The Dude Network"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-bold tracking-widest text-amber uppercase leading-none">
                  The Dude Network
                </div>
                <div className="text-xs text-muted-foreground tracking-[0.2em] uppercase leading-none mt-0.5">
                  Tavern Tour
                </div>
              </div>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-sm mb-6 text-sm">
              Ohio taverns, cold drinks, local legends, and the stories worth stopping for. 
              We&apos;re on the road so you know where to go.
            </p>
            
            {/* YouTube Subscribe CTA */}
            <a
              href="https://www.youtube.com/@the_dudenetwork?sub_confirmation=1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 mb-5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-sm transition-colors"
            >
              <Youtube className="w-4 h-4" />
              Subscribe on YouTube
            </a>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-amber hover:border-amber transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-xs font-bold tracking-widest uppercase text-amber mb-4">
                {section}
              </h3>
              <ul className="flex flex-col gap-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} The Dude Network Tavern Tour. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground italic">
            Drink local. Drive safe. Tip your bartender.
          </p>
        </div>
      </div>
    </footer>
  );
}
