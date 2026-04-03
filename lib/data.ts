// Mock data for The Dude Network Tavern Tour
// TODO: Replace with Supabase queries when database is connected

export type TavernTag =
  | "Hidden Gem"
  | "Cold Beer"
  | "Great Wings"
  | "Historic Spot"
  | "Best Atmosphere"
  | "Small Town Stop"
  | "Road Trip Worthy"
  | "Live Music"
  | "Local Legend"
  | "Dive Bar";

export interface Tavern {
  id: string;
  slug: string;
  name: string;
  city: string;
  county: string;
  region: string;
  address: string;
  shortDescription: string;
  longDescription: string;
  thumbnail: string;
  tags: TavernTag[];
  videoTitle: string;
  videoUrl: string;
  videoPlatform: "youtube" | "tiktok";
  latitude: number;
  longitude: number;
  featured: boolean;
  dudeApproved: boolean;
  rating: number;
  stopNumber: number;
}

export interface VideoReview {
  id: string;
  tavernId: string;
  tavernName: string;
  city: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  videoPlatform: "youtube" | "tiktok";
  description: string;
  publishedAt: string;
  featured: boolean;
}

// TODO: Replace with Supabase query: SELECT * FROM taverns WHERE featured = true
export const taverns: Tavern[] = [
  {
    id: "1",
    slug: "kellys-corner-bar",
    name: "Kelly's Corner Bar",
    city: "Chillicothe",
    county: "Ross",
    region: "South Ohio",
    address: "247 N Paint St, Chillicothe, OH 45601",
    shortDescription:
      "A no-frills corner bar that's been pouring cold ones since 1958. Dark, loud, and perfect.",
    longDescription:
      "Kelly's Corner Bar is exactly what Ohio tavern culture is about. Vinyl bar stools that have seen decades of regulars, a jukebox that only plays country and classic rock, and Bud on draft for $2.50. The wings are legendary — dry rub, crispy, served in a basket with a side of blue cheese. Don't let the unmarked door fool you: this place is a living piece of Ross County history. The regulars will treat you like family by your second beer.",
    thumbnail: "/images/tavern-1.jpg",
    tags: ["Hidden Gem", "Cold Beer", "Great Wings", "Historic Spot"],
    videoTitle: "Stop #4 — Kelly's Corner Bar, Chillicothe OH",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    videoPlatform: "youtube",
    latitude: 39.332,
    longitude: -82.982,
    featured: true,
    dudeApproved: true,
    rating: 4.8,
    stopNumber: 4,
  },
  {
    id: "2",
    slug: "the-rusty-rail",
    name: "The Rusty Rail",
    city: "Zanesville",
    county: "Muskingum",
    region: "Southeast Ohio",
    address: "412 Main St, Zanesville, OH 43701",
    shortDescription:
      "Former railroad workers' bar with 100 years of grit baked into the walls. Order the rail special.",
    longDescription:
      "The Rusty Rail sits one block from the old Muskingum River rail yards, and you can feel it. The building dates to 1921, and the current owner's grandfather opened the bar here in 1947. The tap selection rotates local Ohio craft alongside the classics. There's a back room with darts and shuffleboard, and on Friday nights a local band squeezes onto a tiny corner stage. This is a destination stop.",
    thumbnail: "/images/tavern-2.jpg",
    tags: ["Historic Spot", "Live Music", "Road Trip Worthy", "Local Legend"],
    videoTitle: "Stop #7 — The Rusty Rail, Zanesville OH",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    videoPlatform: "youtube",
    latitude: 39.9403,
    longitude: -82.0132,
    featured: true,
    dudeApproved: true,
    rating: 4.6,
    stopNumber: 7,
  },
  {
    id: "3",
    slug: "petes-place",
    name: "Pete's Place",
    city: "McConnelsville",
    county: "Morgan",
    region: "Southeast Ohio",
    address: "19 W Main St, McConnelsville, OH 43756",
    shortDescription:
      "Tiny river town gem. Pete himself still tends bar and knows every customer by name.",
    longDescription:
      "Population 1,600. One bar worth talking about. Pete's Place is a single-room bar on the main drag of McConnelsville, right off the Muskingum River. Pete has been behind the bar for 34 years. The Ohio State memorabilia covers every inch of wall space. The kitchen does Friday fish fry that draws people from three counties. Cash only. ATM in the back. Worth every penny.",
    thumbnail: "/images/tavern-3.jpg",
    tags: ["Hidden Gem", "Small Town Stop", "Local Legend", "Dive Bar"],
    videoTitle: "Stop #11 — Pete's Place, McConnelsville OH",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    videoPlatform: "youtube",
    latitude: 39.6467,
    longitude: -81.8566,
    featured: true,
    dudeApproved: true,
    rating: 4.9,
    stopNumber: 11,
  },
  {
    id: "4",
    slug: "the-taproom-at-brewster",
    name: "The Taproom at Brewster",
    city: "Brewster",
    county: "Stark",
    region: "Northeast Ohio",
    address: "102 Wabash Ave S, Brewster, OH 44613",
    shortDescription:
      "Best patio in Stark County, cold craft drafts, and wings that people drive 45 minutes for.",
    longDescription:
      "Don't let the industrial surroundings fool you. The Taproom at Brewster has built a loyal following on the strength of its 20-tap beer list, half-price wing nights, and a covered patio that fits 80 people. The bartenders are fast and the crowd is real. This is the kind of bar that makes you feel like a regular on your first visit. We gave it our highest Atmosphere rating of the entire tour so far.",
    thumbnail: "/images/tavern-4.jpg",
    tags: ["Great Wings", "Cold Beer", "Best Atmosphere", "Road Trip Worthy"],
    videoTitle: "Stop #14 — The Taproom at Brewster, OH",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    videoPlatform: "youtube",
    latitude: 40.7067,
    longitude: -81.8413,
    featured: true,
    dudeApproved: true,
    rating: 4.7,
    stopNumber: 14,
  },
  {
    id: "5",
    slug: "deans-bar-and-grill",
    name: "Dean's Bar & Grill",
    city: "Gallipolis",
    county: "Gallia",
    region: "South Ohio",
    address: "318 2nd Ave, Gallipolis, OH 45631",
    shortDescription:
      "River town classic. Catfish on the menu, cold Stroh's on tap, and stories that go back decades.",
    longDescription:
      "Gallipolis sits right on the Ohio River, and Dean's Bar & Grill has been fueling the town since 1963. The catfish sandwich is undefeated. Stroh's on draft — yes, still. The back wall is covered in photos going back to the '70s. Dean's grandson now runs the place and hasn't changed a thing, which is exactly the right call. This is where south Ohio comes to exhale.",
    thumbnail: "/images/tavern-5.jpg",
    tags: ["Historic Spot", "Small Town Stop", "Local Legend", "Hidden Gem"],
    videoTitle: "Stop #18 — Dean's Bar & Grill, Gallipolis OH",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    videoPlatform: "tiktok",
    latitude: 38.8312,
    longitude: -82.1977,
    featured: true,
    dudeApproved: true,
    rating: 4.5,
    stopNumber: 18,
  },
  {
    id: "6",
    slug: "black-horse-saloon",
    name: "Black Horse Saloon",
    city: "Mt. Vernon",
    county: "Knox",
    region: "Central Ohio",
    address: "11 S Main St, Mt Vernon, OH 43050",
    shortDescription:
      "Old-school Knox County bar with a pool table, a dartboard, and zero pretension.",
    longDescription:
      "Mt. Vernon is the kind of Ohio small city that still has a real downtown, and Black Horse Saloon is its anchor bar. Pool table in the back, covered patio out front, and a burger that beats any chain within 40 miles. The crowd skews blue-collar and friendly. The bartender will talk football with you for an hour. We hit this stop on a Tuesday and it was packed — which tells you everything.",
    thumbnail: "/images/tavern-6.jpg",
    tags: ["Cold Beer", "Best Atmosphere", "Dive Bar", "Road Trip Worthy"],
    videoTitle: "Stop #21 — Black Horse Saloon, Mt. Vernon OH",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    videoPlatform: "youtube",
    latitude: 40.3934,
    longitude: -82.4852,
    featured: true,
    dudeApproved: true,
    rating: 4.6,
    stopNumber: 21,
  },
  {
    id: "7",
    slug: "farmhouse-tap",
    name: "Farmhouse Tap",
    city: "Millersburg",
    county: "Holmes",
    region: "Northeast Ohio",
    address: "65 N Washington St, Millersburg, OH 44654",
    shortDescription:
      "Amish country's best-kept secret. Great local drafts and food that's anything but plain.",
    longDescription:
      "You wouldn't expect a craft tap bar in the heart of Holmes County's Amish country, but Millersburg is full of surprises. Farmhouse Tap pours Ohio craft brews alongside a rotating selection of regionals. The kitchen turns out elevated bar food — think fried perch, Ohio cheese boards, and house-smoked meats. The vibe is warm and unhurried. This one made our short list for Best New Discovery of the tour.",
    thumbnail: "/images/tavern-7.jpg",
    tags: ["Hidden Gem", "Road Trip Worthy", "Best Atmosphere", "Local Legend"],
    videoTitle: "Stop #24 — Farmhouse Tap, Millersburg OH",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    videoPlatform: "tiktok",
    latitude: 40.5534,
    longitude: -81.9185,
    featured: false,
    dudeApproved: false,
    rating: 4.8,
    stopNumber: 24,
  },
  {
    id: "8",
    slug: "the-original-nick-bar",
    name: "The Original Nick Bar",
    city: "Portsmouth",
    county: "Scioto",
    region: "South Ohio",
    address: "826 Gallia St, Portsmouth, OH 45662",
    shortDescription:
      "They've been pouring since Prohibition ended and they haven't stopped. This is the real thing.",
    longDescription:
      "The Original Nick Bar in Portsmouth may be the oldest continuously-operating tavern we've visited. The bar itself is solid oak, original to the 1933 build. The back bar back bar mirror has a crack in it from 1957 that nobody ever fixed because why would you. The town has had its struggles, but Nick Bar is still here, still serving, still exactly what a tavern is supposed to be. We stayed four hours. No regrets.",
    thumbnail: "/images/tavern-8.jpg",
    tags: ["Historic Spot", "Dive Bar", "Local Legend", "Cold Beer"],
    videoTitle: "Stop #27 — The Original Nick Bar, Portsmouth OH",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    videoPlatform: "youtube",
    latitude: 38.7318,
    longitude: -82.9977,
    featured: false,
    dudeApproved: false,
    rating: 4.9,
    stopNumber: 27,
  },
];

// Computed stats from tavern data
export const tavernStats = {
  totalStops: taverns.length,
  citiesCovered: new Set(taverns.map((t) => t.city)).size,
  countiesCovered: new Set(taverns.map((t) => t.county)).size,
  videoReviews: taverns.filter((t) => t.videoUrl && t.videoUrl.length > 0).length,
  dudeApprovedCount: taverns.filter((t) => t.dudeApproved).length,
  milesTraveled: "4,200+", // Manual value until route data exists
};

// TODO: Replace with Supabase query: SELECT * FROM video_reviews ORDER BY published_at DESC LIMIT 5
export const videoReviews: VideoReview[] = [
  {
    id: "v1",
    tavernId: "3",
    tavernName: "Pete's Place",
    city: "McConnelsville",
    title: "The Best Bar Nobody Knows About in Ohio",
    thumbnail: "/images/tavern-3.jpg",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    videoPlatform: "youtube",
    description:
      "We almost drove past Pete's. Glad we didn't. 34-year bartender, Friday fish fry, zero cell service, and the best $3 beer in the state.",
    publishedAt: "2024-11-15",
    featured: true,
  },
  {
    id: "v2",
    tavernId: "1",
    tavernName: "Kelly's Corner Bar",
    city: "Chillicothe",
    title: "Stop #4 — A Chillicothe Classic Since 1958",
    thumbnail: "/images/tavern-1.jpg",
    videoUrl: "https://www.tiktok.com/@dudenetwork/video/123456789",
    videoPlatform: "tiktok",
    description:
      "The wings. The jukebox. The $2.50 Bud draft. Kelly's Corner Bar is everything right about Ohio tavern culture.",
    publishedAt: "2024-10-28",
    featured: false,
  },
  {
    id: "v3",
    tavernId: "8",
    tavernName: "The Original Nick Bar",
    city: "Portsmouth",
    title: "90 Years of Pouring — Portsmouth's Nick Bar",
    thumbnail: "/images/tavern-8.jpg",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    videoPlatform: "youtube",
    description:
      "Built in 1933. Still standing. Still serving. The cracked mirror, the oak bar, and four hours that felt like thirty minutes.",
    publishedAt: "2024-10-12",
    featured: false,
  },
  {
    id: "v4",
    tavernId: "7",
    tavernName: "Farmhouse Tap",
    city: "Millersburg",
    title: "Amish Country's Best-Kept Secret",
    thumbnail: "/images/tavern-7.jpg",
    videoUrl: "https://www.tiktok.com/@dudenetwork/video/987654321",
    videoPlatform: "tiktok",
    description:
      "Craft drafts, smoked meats, and a vibe you can't find on any app. Millersburg delivers.",
    publishedAt: "2024-09-30",
    featured: false,
  },
  {
    id: "v5",
    tavernId: "2",
    tavernName: "The Rusty Rail",
    city: "Zanesville",
    title: "100 Years of Rail Town Grit in Zanesville",
    thumbnail: "/images/tavern-2.jpg",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    videoPlatform: "youtube",
    description:
      "The band was squeezing onto a corner stage when we walked in. We knew immediately this was a special stop.",
    publishedAt: "2024-09-14",
    featured: false,
  },
];

// Tavern filter categories
export const tavernCategories = [
  { id: "hidden-gem", label: "Hidden Gems", icon: "Star" },
  { id: "historic", label: "Historic Taverns", icon: "Building2" },
  { id: "best-wings", label: "Best Wings", icon: "Flame" },
  { id: "best-atmosphere", label: "Best Atmosphere", icon: "Sparkles" },
  { id: "small-town", label: "Small Town Stops", icon: "MapPin" },
  { id: "road-trip", label: "Road Trip Worthy", icon: "Route" },
  { id: "live-music", label: "Live Music", icon: "Music" },
  { id: "dive-bar", label: "Dive Bars", icon: "Beer" },
];

// Mock Ohio tavern map pins
export const mapPins = taverns.map((t) => ({
  id: t.id,
  slug: t.slug,
  name: t.name,
  city: t.city,
  county: t.county,
  address: t.address,
  latitude: t.latitude,
  longitude: t.longitude,
  stopNumber: t.stopNumber,
  tags: t.tags,
  thumbnail: t.thumbnail,
  shortDescription: t.shortDescription,
  dudeApproved: t.dudeApproved,
}));
