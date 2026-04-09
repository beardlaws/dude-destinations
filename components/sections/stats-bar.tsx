import { MapPin, Star, Video, Route, CheckCircle } from "lucide-react";

interface StatsBarProps {
  stats: {
    totalStops: number;
    citiesCovered: number;
    countiesCovered: number;
    statesCovered: number;
    videoReviews: number;
    dudeApprovedCount: number;
    milesTraveled: string;
  };
}

export default function StatsBar({ stats: tavernStats }: StatsBarProps) {
  const stats = [
    {
      icon: MapPin,
      value: tavernStats.totalStops.toString(),
      label: "Taverns Visited",
      sublabel: "and counting",
    },
    {
      icon: CheckCircle,
      value: tavernStats.dudeApprovedCount.toString(),
      label: "Dude Approved",
      sublabel: "officially reviewed",
    },
    {
      icon: Star,
      value: tavernStats.countiesCovered.toString(),
      label: "Counties Covered",
      sublabel: `across ${tavernStats.citiesCovered} cities`,
    },
    {
      icon: Video,
      value: tavernStats.videoReviews.toString(),
      label: "Video Reviews",
      sublabel: "on YouTube, TikTok & Facebook",
    },
    {
      icon: Route,
      value: tavernStats.milesTraveled,
      label: "Miles Traveled",
      sublabel: "all Ohio roads",
    },
  ];

  return (
    <section className="bg-dark-wood border-y border-border py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-0 lg:divide-x lg:divide-border">
          {stats.map(({ icon: Icon, value, label, sublabel }) => (
            <div
              key={label}
              className="flex flex-col items-center text-center gap-2 lg:px-6"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-amber flex-shrink-0" />
                <span className="font-serif text-3xl lg:text-4xl font-black text-foreground">
                  {value}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground tracking-wide">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
