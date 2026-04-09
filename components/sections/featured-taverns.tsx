import TavernCard from "@/components/tavern-card";
import Link from "next/link";
import DudeApprovedBadge from "@/components/dude-approved-badge";
import type { Tavern } from "@/lib/tavern-service";

interface FeaturedTavernsProps {
  taverns: Tavern[];
  dudeApprovedCount: number;
}

export default function FeaturedTaverns({ taverns, dudeApprovedCount }: FeaturedTavernsProps) {
  // Get Dude Approved stops, sorted by most recent (highest stop_number first)
  const dudeApproved = taverns
    .filter((t) => t.dude_approved)
    .sort((a, b) => (b.stop_number || 0) - (a.stop_number || 0));
  const displayTaverns = dudeApproved.slice(0, 6);

  return (
    <section id="taverns" className="py-16 lg:py-24 bg-dark-wood">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <DudeApprovedBadge size="md" variant="default" />
              <span className="text-xs text-muted-foreground font-medium">
                {dudeApprovedCount} verified stops
              </span>
            </div>
            <h2 className="font-serif text-3xl lg:text-5xl font-black text-foreground">
              Latest Dude Approved Stops
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg leading-relaxed">
              These are the stops we&apos;ve personally visited, reviewed, and can confidently recommend. Every Dude Approved tavern has earned its stamp.
            </p>
          </div>
          <Link
            href="/#dude-destination"
            className="flex-shrink-0 px-5 py-2.5 border border-border text-sm font-bold uppercase tracking-wider text-muted-foreground hover:border-amber/50 hover:text-foreground rounded-sm transition-colors"
          >
            Explore the Map
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayTaverns.map((tavern) => (
            <TavernCard key={tavern.id} tavern={tavern} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Want to see all the stops on our tour?
          </p>
          <Link
            href="/#dude-destination"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber text-darker-wood font-bold rounded-sm hover:bg-amber-bright transition-colors"
          >
            View Dude Destinations
          </Link>
        </div>
      </div>
    </section>
  );
}
