"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { revalidateTaverns } from "@/lib/actions";
import {
  ArrowLeft,
  Plus,
  X,
  MapPin,
  Video,
  FileText,
  Tag,
  Star,
  Check,
  LogOut,
  Youtube,
  Facebook,
  Compass,
  Save,
  Eye,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";

interface FormData {
  name: string;
  slug: string;
  city: string;
  county: string;
  region: string;
  address: string;
  latitude: string;
  longitude: string;
  thumbnailUrl: string;
  shortDescription: string;
  longDescription: string;
  tags: string[];
  videoTitle: string;
  videoUrl: string;
  videoPlatform: "youtube" | "tiktok" | "facebook";
  featured: boolean;
  dudeApproved: boolean;
  rating: string;
}

interface FormErrors {
  name?: string;
  slug?: string;
  city?: string;
  county?: string;
  region?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  shortDescription?: string;
  videoUrl?: string;
  rating?: string;
}

const AVAILABLE_TAGS = [
  "Hidden Gem",
  "Historic Spot",
  "Great Wings",
  "Cold Beer",
  "Best Atmosphere",
  "Small Town Stop",
  "Road Trip Worthy",
  "Live Music",
  "Local Legend",
  "Dive Bar",
];

const OHIO_REGIONS = [
  "Northeast",
  "Northwest",
  "Central",
  "Southwest",
  "Southeast",
  "South Ohio",
];

// TikTok icon component
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

export default function AdminAddStopPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    slug: "",
    city: "",
    county: "",
    region: "",
    address: "",
    latitude: "",
    longitude: "",
    thumbnailUrl: "",
    shortDescription: "",
    longDescription: "",
    tags: [],
    videoTitle: "",
    videoUrl: "",
    videoPlatform: "youtube",
    featured: false,
    dudeApproved: false,
    rating: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [activeSection, setActiveSection] = useState<"location" | "details" | "video" | "tags">("location");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (formData.name && !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.name, formData.slug]);

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.slug.trim()) newErrors.slug = "Slug is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.county.trim()) newErrors.county = "County is required";
    if (!formData.region) newErrors.region = "Region is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    if (!formData.latitude.trim()) {
      newErrors.latitude = "Latitude is required";
    } else if (isNaN(parseFloat(formData.latitude))) {
      newErrors.latitude = "Must be a valid number";
    }

    if (!formData.longitude.trim()) {
      newErrors.longitude = "Longitude is required";
    } else if (isNaN(parseFloat(formData.longitude))) {
      newErrors.longitude = "Must be a valid number";
    }

    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = "Short description is required";
    }

    if (formData.videoUrl) {
      if (formData.videoPlatform === "youtube" && !formData.videoUrl.includes("youtube.com") && !formData.videoUrl.includes("youtu.be")) {
        newErrors.videoUrl = "Must be a valid YouTube URL";
      }
      if (formData.videoPlatform === "tiktok" && !formData.videoUrl.includes("tiktok.com")) {
        newErrors.videoUrl = "Must be a valid TikTok URL";
      }
      if (formData.videoPlatform === "facebook" && !formData.videoUrl.includes("facebook.com") && !formData.videoUrl.includes("fb.watch")) {
        newErrors.videoUrl = "Must be a valid Facebook URL";
      }
    }

    if (formData.rating && (parseFloat(formData.rating) < 0 || parseFloat(formData.rating) > 5)) {
      newErrors.rating = "Rating must be between 0 and 5";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      if (errors.name || errors.slug || errors.city || errors.region || errors.address || errors.latitude || errors.longitude) {
        setActiveSection("location");
      } else if (errors.shortDescription) {
        setActiveSection("details");
      } else if (errors.videoUrl) {
        setActiveSection("video");
      }
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const { data: maxStop } = await supabase
        .from("taverns")
        .select("stop_number")
        .order("stop_number", { ascending: false })
        .limit(1);

      const nextStopNumber = (maxStop?.[0]?.stop_number ?? 0) + 1;

      const { error } = await supabase
        .from("taverns")
        .insert([
          {
            slug: formData.slug,
            name: formData.name,
            city: formData.city,
            county: formData.county,
            region: formData.region,
            state: "OH",
            address: formData.address,
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            thumbnail: formData.thumbnailUrl || "/images/tavern-placeholder.jpg",
            short_description: formData.shortDescription,
            long_description: formData.longDescription,
            tags: formData.tags,
            video_title: formData.videoTitle,
            video_url: formData.videoUrl,
            video_platform: formData.videoPlatform,
            featured: formData.featured,
            dude_approved: formData.dudeApproved,
            rating: parseFloat(formData.rating) || 0,
            stop_number: nextStopNumber,
          },
        ]);

      if (error) {
        console.error("Error adding tavern:", error);
        setErrors({ name: error.message });
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setShowSuccess(true);
      await revalidateTaverns();

      setTimeout(() => {
        setShowSuccess(false);
        router.push("/admin/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Error:", err);
      setErrors({ name: "An error occurred. Please try again." });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-darker-wood flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const sectionTabs = [
    { id: "location", label: "Location", icon: MapPin },
    { id: "details", label: "Details", icon: FileText },
    { id: "video", label: "Video", icon: Video },
    { id: "tags", label: "Tags", icon: Tag },
  ] as const;

  return (
    <div className="min-h-screen bg-darker-wood">
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.72 0.18 48) 1px, transparent 1px), linear-gradient(90deg, oklch(0.72 0.18 48) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <header className="sticky top-0 z-50 bg-darker-wood/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to site</span>
              </Link>
              <div className="w-px h-6 bg-border hidden sm:block" />
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber" />
                <span className="font-bold text-foreground">Admin Panel</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-border text-muted-foreground hover:text-foreground hover:border-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 px-6 py-4 bg-green-500/20 border border-green-500/40 rounded-sm text-green-400 shadow-lg">
            <Check className="w-5 h-5" />
            <span className="font-semibold">Stop added successfully!</span>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Add New Stop
          </h1>
          <p className="text-muted-foreground">
            Add a new tavern to the Dude Destinations map.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr,380px] gap-8">
          <div className="space-y-6">
            {/* Section tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {sectionTabs.map((tab) => {
                const Icon = tab.icon;
                const hasErrors = (
                  (tab.id === "location" && (errors.name || errors.slug || errors.city || errors.region || errors.address || errors.latitude || errors.longitude)) ||
                  (tab.id === "details" && errors.shortDescription) ||
                  (tab.id === "video" && errors.videoUrl)
                );
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-semibold whitespace-nowrap transition-all ${
                      activeSection === tab.id
                        ? "bg-amber text-darker-wood"
                        : hasErrors
                        ? "bg-red-500/10 border border-red-500/30 text-red-400"
                        : "bg-dark-wood/50 border border-border text-muted-foreground hover:text-foreground hover:border-amber/40"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {hasErrors && <AlertCircle className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>

            <div className="bg-dark-wood/30 border border-border rounded-sm p-6 lg:p-8">
              {/* LOCATION SECTION */}
              {activeSection === "location" && (
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground">
                        Tavern Name <span className="text-amber">*</span>
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="Kelly's Corner Bar"
                        className={`bg-background/50 border-border focus:border-amber ${errors.name ? "border-red-500" : ""}`}
                      />
                      {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground">
                        URL Slug <span className="text-amber">*</span>
                      </label>
                      <Input
                        value={formData.slug}
                        onChange={(e) => updateField("slug", e.target.value)}
                        placeholder="kellys-corner-bar"
                        className={`bg-background/50 border-border focus:border-amber font-mono text-sm ${errors.slug ? "border-red-500" : ""}`}
                      />
                      {errors.slug && <p className="text-xs text-red-400">{errors.slug}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground">
                        City <span className="text-amber">*</span>
                      </label>
                      <Input
                        value={formData.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="Chillicothe"
                        className={`bg-background/50 border-border focus:border-amber ${errors.city ? "border-red-500" : ""}`}
                      />
                      {errors.city && <p className="text-xs text-red-400">{errors.city}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground">
                        County <span className="text-amber">*</span>
                      </label>
                      <Input
                        value={formData.county}
                        onChange={(e) => updateField("county", e.target.value)}
                        placeholder="Ross"
                        className={`bg-background/50 border-border focus:border-amber ${errors.county ? "border-red-500" : ""}`}
                      />
                      {errors.county && <p className="text-xs text-red-400">{errors.county}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground">
                        Region <span className="text-amber">*</span>
                      </label>
                      <Select value={formData.region} onValueChange={(value) => updateField("region", value)}>
                        <SelectTrigger className={`bg-background/50 border-border focus:border-amber ${errors.region ? "border-red-500" : ""}`}>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          {OHIO_REGIONS.map((region) => (
                            <SelectItem key={region} value={region}>{region}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.region && <p className="text-xs text-red-400">{errors.region}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-foreground">
                      Street Address <span className="text-amber">*</span>
                    </label>
                    <Input
                      value={formData.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      placeholder="123 Main St, Chillicothe, OH 45601"
                      className={`bg-background/50 border-border focus:border-amber ${errors.address ? "border-red-500" : ""}`}
                    />
                    {errors.address && <p className="text-xs text-red-400">{errors.address}</p>}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground">
                        Latitude <span className="text-amber">*</span>
                      </label>
                      <Input
                        value={formData.latitude}
                        onChange={(e) => updateField("latitude", e.target.value)}
                        placeholder="39.3320"
                        className={`bg-background/50 border-border focus:border-amber font-mono ${errors.latitude ? "border-red-500" : ""}`}
                      />
                      {errors.latitude && <p className="text-xs text-red-400">{errors.latitude}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground">
                        Longitude <span className="text-amber">*</span>
                      </label>
                      <Input
                        value={formData.longitude}
                        onChange={(e) => updateField("longitude", e.target.value)}
                        placeholder="-82.9820"
                        className={`bg-background/50 border-border focus:border-amber font-mono ${errors.longitude ? "border-red-500" : ""}`}
                      />
                      {errors.longitude && <p className="text-xs text-red-400">{errors.longitude}</p>}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tip: Find coordinates at{" "}
                    <a href="https://www.latlong.net/" target="_blank" rel="noopener noreferrer" className="text-amber hover:underline">
                      latlong.net
                    </a>
                  </p>
                </div>
              )}

              {/* DETAILS SECTION */}
              {activeSection === "details" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-foreground">
                      Thumbnail URL
                    </label>
                    <div className="flex gap-3">
                      <Input
                        value={formData.thumbnailUrl}
                        onChange={(e) => updateField("thumbnailUrl", e.target.value)}
                        placeholder="/images/tavern-new.jpg"
                        className="flex-1 bg-background/50 border-border focus:border-amber font-mono text-sm"
                      />
                      {formData.thumbnailUrl && (
                        <div className="w-12 h-12 rounded-sm overflow-hidden bg-card border border-border flex-shrink-0">
                          <Image
                            src={formData.thumbnailUrl}
                            alt="Preview"
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Leave empty to use a placeholder image</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-foreground">
                      Short Description <span className="text-amber">*</span>
                    </label>
                    <Textarea
                      value={formData.shortDescription}
                      onChange={(e) => updateField("shortDescription", e.target.value)}
                      placeholder="A brief, punchy description that appears on cards (1-2 sentences)"
                      rows={3}
                      className={`bg-background/50 border-border focus:border-amber resize-none ${errors.shortDescription ? "border-red-500" : ""}`}
                    />
                    <div className="flex justify-between">
                      {errors.shortDescription ? (
                        <p className="text-xs text-red-400">{errors.shortDescription}</p>
                      ) : <span />}
                      <p className="text-xs text-muted-foreground">{formData.shortDescription.length}/150 characters</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-foreground">Full Story</label>
                    <Textarea
                      value={formData.longDescription}
                      onChange={(e) => updateField("longDescription", e.target.value)}
                      placeholder="The full tavern story for the detail page. Write like you're telling a friend about this place..."
                      rows={8}
                      className="bg-background/50 border-border focus:border-amber resize-none"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground">Rating (0-5)</label>
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={formData.rating}
                        onChange={(e) => updateField("rating", e.target.value)}
                        placeholder="4.5"
                        className={`bg-background/50 border-border focus:border-amber ${errors.rating ? "border-red-500" : ""}`}
                      />
                      {errors.rating && <p className="text-xs text-red-400">{errors.rating}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground">Featured Stop</label>
                      <button
                        type="button"
                        onClick={() => updateField("featured", !formData.featured)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-sm border transition-all ${
                          formData.featured
                            ? "bg-amber/10 border-amber text-amber"
                            : "bg-background/50 border-border text-muted-foreground hover:border-amber/40"
                        }`}
                      >
                        <span className="font-medium">{formData.featured ? "Featured" : "Not featured"}</span>
                        <Star className={`w-5 h-5 ${formData.featured ? "fill-amber" : ""}`} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground">Dude Approved</label>
                      <button
                        type="button"
                        onClick={() => updateField("dudeApproved", !formData.dudeApproved)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-sm border transition-all ${
                          formData.dudeApproved
                            ? "bg-gradient-to-r from-amber to-amber-bright border-amber text-darker-wood"
                            : "bg-background/50 border-border text-muted-foreground hover:border-amber/40"
                        }`}
                      >
                        <span className="font-medium">{formData.dudeApproved ? "Dude Approved" : "Not approved yet"}</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={formData.dudeApproved ? 3 : 2} className="w-5 h-5">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <p className="text-xs text-muted-foreground">Mark this stop as officially visited and reviewed</p>
                    </div>
                  </div>
                </div>
              )}

              {/* VIDEO SECTION */}
              {activeSection === "video" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-foreground">Video Platform</label>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {/* YouTube */}
                      <button
                        type="button"
                        onClick={() => updateField("videoPlatform", "youtube")}
                        className={`flex items-center gap-4 p-4 rounded-sm border transition-all ${
                          formData.videoPlatform === "youtube"
                            ? "bg-red-500/10 border-red-500 text-red-400"
                            : "bg-background/50 border-border text-muted-foreground hover:border-red-500/40"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-sm flex items-center justify-center ${formData.videoPlatform === "youtube" ? "bg-red-500/20" : "bg-muted/30"}`}>
                          <Youtube className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground">YouTube</p>
                          <p className="text-xs text-muted-foreground">Long-form reviews</p>
                        </div>
                        {formData.videoPlatform === "youtube" && <Check className="w-5 h-5 ml-auto" />}
                      </button>

                      {/* TikTok */}
                      <button
                        type="button"
                        onClick={() => updateField("videoPlatform", "tiktok")}
                        className={`flex items-center gap-4 p-4 rounded-sm border transition-all ${
                          formData.videoPlatform === "tiktok"
                            ? "bg-white/10 border-white text-white"
                            : "bg-background/50 border-border text-muted-foreground hover:border-white/40"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-sm flex items-center justify-center ${formData.videoPlatform === "tiktok" ? "bg-white/10" : "bg-muted/30"}`}>
                          <TikTokIcon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground">TikTok</p>
                          <p className="text-xs text-muted-foreground">Short-form clips</p>
                        </div>
                        {formData.videoPlatform === "tiktok" && <Check className="w-5 h-5 ml-auto" />}
                      </button>

                      {/* Facebook */}
                      <button
                        type="button"
                        onClick={() => updateField("videoPlatform", "facebook")}
                        className={`flex items-center gap-4 p-4 rounded-sm border transition-all ${
                          formData.videoPlatform === "facebook"
                            ? "bg-blue-500/10 border-blue-500 text-blue-400"
                            : "bg-background/50 border-border text-muted-foreground hover:border-blue-500/40"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-sm flex items-center justify-center ${formData.videoPlatform === "facebook" ? "bg-blue-500/20" : "bg-muted/30"}`}>
                          <Facebook className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground">Facebook</p>
                          <p className="text-xs text-muted-foreground">Videos &amp; Reels</p>
                        </div>
                        {formData.videoPlatform === "facebook" && <Check className="w-5 h-5 ml-auto" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-foreground">Video Title</label>
                    <Input
                      value={formData.videoTitle}
                      onChange={(e) => updateField("videoTitle", e.target.value)}
                      placeholder="Stop #28 — Kelly's Corner Bar, Chillicothe OH"
                      className="bg-background/50 border-border focus:border-amber"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-foreground">Video URL</label>
                    <Input
                      value={formData.videoUrl}
                      onChange={(e) => updateField("videoUrl", e.target.value)}
                      placeholder={
                        formData.videoPlatform === "youtube"
                          ? "https://www.youtube.com/watch?v=..."
                          : formData.videoPlatform === "facebook"
                          ? "https://www.facebook.com/watch?v=..."
                          : "https://www.tiktok.com/@dudenetwork/video/..."
                      }
                      className={`bg-background/50 border-border focus:border-amber font-mono text-sm ${errors.videoUrl ? "border-red-500" : ""}`}
                    />
                    {errors.videoUrl ? (
                      <p className="text-xs text-red-400">{errors.videoUrl}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {formData.videoPlatform === "youtube"
                          ? "Supports: youtube.com/watch?v=..., youtu.be/..."
                          : formData.videoPlatform === "facebook"
                          ? "Supports: facebook.com/watch?v=..., fb.watch/..."
                          : "Supports: tiktok.com/@username/video/..."}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAGS SECTION */}
              {activeSection === "tags" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-4">Select Tags</label>
                    <div className="flex flex-wrap gap-3">
                      {AVAILABLE_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-4 py-2 rounded-sm text-sm font-semibold transition-all border ${
                            formData.tags.includes(tag)
                              ? "bg-amber border-amber text-darker-wood"
                              : "bg-background/50 border-border text-muted-foreground hover:border-amber/50 hover:text-foreground"
                          }`}
                        >
                          {tag}
                          {formData.tags.includes(tag) && <Check className="inline-block w-3.5 h-3.5 ml-2" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm font-semibold text-foreground mb-3">Selected ({formData.tags.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-amber/10 text-amber border-amber/30 pr-1">
                            {tag}
                            <button type="button" onClick={() => toggleTag(tag)} className="ml-2 p-0.5 rounded-sm hover:bg-amber/20">
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="lg:hidden">
              <Button type="button" variant="outline" onClick={() => setShowPreview(!showPreview)} className="w-full border-border">
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? "Hide Preview" : "Show Preview"}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className={`lg:block ${showPreview ? "block" : "hidden"}`}>
            <div className="sticky top-24 space-y-6">
              <div className="bg-dark-wood/30 border border-border rounded-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-dark-wood/50">
                  <p className="text-xs font-bold tracking-wider uppercase text-muted-foreground">Live Preview</p>
                </div>
                <div className="p-4">
                  <div className="bg-card border border-border rounded-sm overflow-hidden">
                    <div className="relative aspect-[16/10]">
                      {formData.thumbnailUrl ? (
                        <Image src={formData.thumbnailUrl} alt="Preview" fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-muted flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      {formData.dudeApproved && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-amber to-amber-bright text-darker-wood text-[10px] font-black rounded-sm flex items-center gap-1">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-2.5 h-2.5">
                            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          DUDE APPROVED
                        </div>
                      )}
                      {formData.rating && (
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-black/60 rounded-sm">
                          <Star className="w-3.5 h-3.5 fill-amber text-amber" />
                          <span className="text-xs font-bold text-white">{formData.rating}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-serif text-lg font-bold text-foreground mb-1 line-clamp-1">
                        {formData.name || "Tavern Name"}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3 text-amber" />
                        <span>{formData.city || "City"}, {formData.region || "Region"}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {formData.shortDescription || "Short description will appear here..."}
                      </p>
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {formData.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-amber/10 text-amber text-xs rounded-sm">{tag}</span>
                          ))}
                          {formData.tags.length > 3 && (
                            <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-sm">+{formData.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Video platform preview */}
                {formData.videoUrl && (
                  <div className="px-4 pb-4">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-sm ${
                      formData.videoPlatform === "youtube"
                        ? "bg-red-500/10 border border-red-500/30"
                        : formData.videoPlatform === "facebook"
                        ? "bg-blue-500/10 border border-blue-500/30"
                        : "bg-white/5 border border-white/20"
                    }`}>
                      {formData.videoPlatform === "youtube" ? (
                        <Youtube className="w-4 h-4 text-red-500" />
                      ) : formData.videoPlatform === "facebook" ? (
                        <Facebook className="w-4 h-4 text-blue-400" />
                      ) : (
                        <TikTokIcon className="w-4 h-4 text-white" />
                      )}
                      <span className="text-xs font-medium text-foreground">
                        {formData.videoPlatform === "youtube"
                          ? "YouTube"
                          : formData.videoPlatform === "facebook"
                          ? "Facebook"
                          : "TikTok"}{" "}
                        Video
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-amber hover:bg-amber-bright text-darker-wood font-bold py-6"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-darker-wood border-t-transparent rounded-full animate-spin" />
                    Adding Stop...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Add to Dude Destinations
                  </span>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Stop will appear on the map after submission.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
