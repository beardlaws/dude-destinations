import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import TavernCard from "@/components/tavern-card";
import DudeApprovedBadge from "@/components/dude-approved-badge";
import { getTaverns, getTavernBySlug } from "@/lib/tavern-service";
import { getEmbedUrl, getPlatformLabel } from "@/lib/video-utils";
import {
  ArrowLeft,
  MapPin,
  Star,
  Play,
  ExternalLink,
  Navigation,
  Youtube,
  Compass,
  ChevronRight,
} from "lucide-react";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

interface TavernDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Dynamic rendering - Supabase client uses cookies() which isn't available at build time
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: TavernDetailPageProps) {
  const { slug } = await params;
  const tavern = await getTavernBySlug(slug);
  if (!tavern) return { title: "Tavern Not Found" };
  return {
    title: `${tavern.name} | The Dude Network Tavern Tour`,
    description: tavern.short_description,
  };
}

export default async function TavernDetailPage({ params }: TavernDetailPageProps) {
  const { slug } = await params;
  const tavern = await getTavernBySlug(slug);
  if (!tavern) notFound();

  const allTaverns = await getTaverns();
  const relatedTaverns = allTaverns
    .filter((t) => (t.region === tavern.region || t.featured) && t.slug !== tavern.slug)
    .slice(0, 3);

  const isYouTube = tavern.video_url?.includes("youtube") || tavern.video_url?.includes("youtu.be");
  const isTikTok = tavern.video_url?.includes("tiktok");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-20">
        <div className="relative">
          <div className="absolute inset-0 h-[500px] lg:h-[600px]">
            <Image src={tavern.thumbnail} alt={tavern.name} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
          </div>
          <div className="relative">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <Link href="/#dude-destination" className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors bg-black/30 backdrop-blur-sm px-4 py-2 rounded-sm">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dude Destinations</span>
              </Link>
            </div>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-44 pb-12">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="px-4 py-2 bg-amber text-darker-wood text-sm font-black tracking-wide rounded-sm shadow-lg">STOP #{tavern.stop_number}</div>
                {tavern.dudeApproved && <DudeApprovedBadge size="lg" variant="detail" />}
                <div className="flex items-center gap-1.5 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-sm">
                  <Star className="w-4 h-4 fill-amber text-amber" />
                  <span className="text-sm font-bold text-white">{tavern.rating.toFixed(1)}</span>
                </div>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-foreground mb-4 leading-tight max-w-3xl">{tavern.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-6">
                <MapPin className="w-5 h-5 text-amber" />
                <span className="text-lg">{tavern.city}, {tavern.county} County &bull; {tavern.region}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-8">
                {tavern.tags.map((tag) => <span key={tag} className="px-3 py-1.5 bg-amber/10 text-amber text-sm font-semibold rounded-sm border border-amber/20">{tag}</span>)}
              </div>
              <div className="flex flex-wrap gap-4">
                {tavern.video_url && (
                  <a href={tavern.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-6 py-4 bg-amber text-darker-wood font-bold rounded-sm hover:bg-amber-bright transition-all shadow-lg hover:shadow-amber/30">
                    <Play className="w-5 h-5" />
                    <span>Watch Review</span>
                    <span className={`ml-2 flex items-center gap-1.5 px-2 py-1 rounded-sm ${isYouTube ? "bg-red-600/20" : "bg-white/20"}`}>
                      {isYouTube ? <Youtube className="w-4 h-4" /> : isTikTok ? <TikTokIcon className="w-4 h-4" /> : null}
                      <span className="text-xs font-semibold">{isYouTube ? "YouTube" : isTikTok ? "TikTok" : ""}</span>
                    </span>
                  </a>
                )}
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${tavern.name}, ${tavern.city}, ${tavern.state}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-4 border-2 border-amber/50 text-amber font-bold rounded-sm hover:bg-amber/10 transition-all">
                  <Navigation className="w-5 h-5" />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-[1fr,340px] gap-12 lg:gap-16">
            <div>
              <div className="mb-10">
                <p className="text-xl lg:text-2xl text-foreground leading-relaxed font-medium">{tavern.short_description}</p>
              </div>
              {tavern.video_url && (
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${isYouTube ? "bg-red-500/10" : "bg-white/10"}`}>
                      {isYouTube ? <Youtube className="w-5 h-5 text-red-500" /> : isTikTok ? <TikTokIcon className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-amber" />}
                    </div>
                    <div>
                      <h2 className="font-serif text-xl font-bold text-foreground">Watch the Review</h2>
                      <p className="text-sm text-muted-foreground">{isYouTube ? "Full video review on YouTube" : isTikTok ? "Quick clip on TikTok" : "Video review"}</p>
                    </div>
                  </div>
                  <div className="relative bg-card rounded-sm overflow-hidden border border-border aspect-video">
                    {isYouTube ? (
                      <iframe src={getEmbedUrl(tavern.video_url, "youtube")} title={tavern.video_title} className="w-full h-full border-0" allowFullScreen loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-card to-muted p-8">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isTikTok ? "bg-white/10" : "bg-amber/10"}`}>
                          {isTikTok ? <TikTokIcon className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-amber" />}
                        </div>
                        <p className="text-lg font-semibold text-foreground mb-2 text-center">{tavern.video_title}</p>
                        <p className="text-sm text-muted-foreground mb-6 text-center">{isTikTok ? "TikTok videos open in the TikTok app" : "Click below to watch"}</p>
                        <a href={tavern.video_url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 px-6 py-3 font-bold rounded-sm transition-all ${isTikTok ? "bg-white text-black hover:bg-white/90" : "bg-amber text-darker-wood hover:bg-amber-bright"}`}>
                          <ExternalLink className="w-4 h-4" />
                          Watch on {getPlatformLabel(isTikTok ? "tiktok" : "youtube")}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="mb-12">
                <h2 className="font-serif text-2xl lg:text-3xl font-bold text-foreground mb-6">The Full Story</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-base lg:text-lg text-foreground/90 leading-relaxed whitespace-pre-line">{tavern.long_description}</p>
                </div>
              </div>
              <div className="pt-8 border-t border-border">
                <Link href="/" className="inline-flex items-center gap-3 text-amber hover:text-amber-bright transition-colors group">
                  <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                  <span className="font-bold">Back to Dude Destination</span>
                </Link>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-card border border-border rounded-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30">
                  <h3 className="text-sm font-bold tracking-wider uppercase text-muted-foreground">Stop Details</h3>
                </div>
                <div className="p-5 space-y-5">
                  {tavern.dudeApproved && (
                    <div className="flex items-center gap-3 p-3 bg-amber/10 border border-amber/20 rounded-sm">
                      <DudeApprovedBadge size="sm" variant="card" />
                      <span className="text-xs text-muted-foreground">Officially visited and reviewed</span>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold tracking-wider uppercase text-muted-foreground mb-1">Location</p>
                    <p className="text-foreground font-medium">{tavern.city}, Ohio</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-wider uppercase text-muted-foreground mb-1">County</p>
                    <p className="text-foreground font-medium">{tavern.county} County</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-wider uppercase text-muted-foreground mb-1">Region</p>
                    <p className="text-foreground font-medium">{tavern.region}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-wider uppercase text-muted-foreground mb-1">Rating</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.floor(tavern.rating) ? "fill-amber text-amber" : "text-muted-foreground"}`} />)}
                      </div>
                      <span className="font-bold text-foreground">{tavern.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  {tavern.video_url && (
                    <div>
                      <p className="text-xs font-bold tracking-wider uppercase text-muted-foreground mb-2">Video Platform</p>
                      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-sm ${isYouTube ? "bg-red-500/10 border border-red-500/30" : "bg-white/5 border border-white/20"}`}>
                        {isYouTube ? <Youtube className="w-4 h-4 text-red-500" /> : isTikTok ? <TikTokIcon className="w-4 h-4 text-white" /> : null}
                        <span className="text-sm font-semibold text-foreground">{getPlatformLabel(isYouTube ? "youtube" : "tiktok")}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-border">
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${tavern.name}, ${tavern.city}, Ohio`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-amber text-darker-wood font-bold text-sm rounded-sm hover:bg-amber-bright transition-all">
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </a>
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber/10 to-amber/5 border border-amber/20 rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Compass className="w-6 h-6 text-amber" />
                  <h3 className="font-serif text-lg font-bold text-foreground">Explore the Map</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Discover more stops on the Ohio Tavern Tour.</p>
                <Link href="/" className="inline-flex items-center gap-2 text-amber font-semibold text-sm hover:text-amber-bright transition-colors">
                  View Dude Destinations
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {relatedTaverns.length > 0 && (
            <div className="mt-20 pt-16 border-t border-border">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="font-serif text-2xl lg:text-3xl font-bold text-foreground mb-2">More Stops to Explore</h2>
                  <p className="text-muted-foreground">Check out these nearby taverns on the tour</p>
                </div>
                <Link href="/#dude-destination" className="hidden sm:inline-flex items-center gap-2 text-amber font-semibold hover:text-amber-bright transition-colors">
                  View all stops
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedTaverns.map((relatedTavern) => <TavernCard key={relatedTavern.id} tavern={relatedTavern} />)}
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
