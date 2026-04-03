"use server";

import { createClient } from "@/lib/supabase/server";

// Types matching our database schema
export interface Tavern {
  id: string;
  slug: string;
  name: string;
  city: string;
  county: string;
  state: string;
  region: string;
  address: string;
  short_description: string;
  long_description: string | null;
  thumbnail: string | null;
  tags: string[];
  video_title: string | null;
  video_url: string | null;
  video_platform: "youtube" | "tiktok";
  latitude: number;
  longitude: number;
  featured: boolean;
  dude_approved: boolean;
  rating: number;
  stop_number: number | null;
  created_at: string;
  updated_at: string;
}

// For creating/updating taverns
export interface TavernInput {
  slug: string;
  name: string;
  city: string;
  county: string;
  state?: string;
  region: string;
  address: string;
  short_description: string;
  long_description?: string;
  thumbnail?: string;
  tags?: string[];
  video_title?: string;
  video_url?: string;
  video_platform?: "youtube" | "tiktok";
  latitude: number;
  longitude: number;
  featured?: boolean;
  dude_approved?: boolean;
  rating?: number;
  stop_number?: number;
}

// Fetch all taverns
export async function getTaverns(): Promise<Tavern[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("taverns")
    .select("*")
    .order("stop_number", { ascending: true });

  if (error) {
    console.error("Error fetching taverns:", error);
    return [];
  }

  return data || [];
}

// Fetch a single tavern by slug
export async function getTavernBySlug(slug: string): Promise<Tavern | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("taverns")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching tavern:", error);
    return null;
  }

  return data;
}

// Fetch a single tavern by ID
export async function getTavernById(id: string): Promise<Tavern | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("taverns")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching tavern:", error);
    return null;
  }

  return data;
}

// Fetch featured taverns
export async function getFeaturedTaverns(): Promise<Tavern[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("taverns")
    .select("*")
    .eq("featured", true)
    .order("stop_number", { ascending: true });

  if (error) {
    console.error("Error fetching featured taverns:", error);
    return [];
  }

  return data || [];
}

// Fetch taverns that have video reviews
export async function getTavernsWithVideos(limit: number = 5): Promise<Tavern[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("taverns")
    .select("*")
    .not("video_url", "is", null)
    .neq("video_url", "")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching taverns with videos:", error);
    return [];
  }

  return data || [];
}

// Fetch Dude Approved taverns
export async function getDudeApprovedTaverns(): Promise<Tavern[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("taverns")
    .select("*")
    .eq("dude_approved", true)
    .order("stop_number", { ascending: true });

  if (error) {
    console.error("Error fetching dude approved taverns:", error);
    return [];
  }

  return data || [];
}

// Create a new tavern
export async function createTavern(tavern: TavernInput): Promise<Tavern | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("taverns")
    .insert([tavern])
    .select()
    .single();

  if (error) {
    console.error("Error creating tavern:", error);
    return null;
  }

  return data;
}

// Update an existing tavern
export async function updateTavern(id: string, tavern: Partial<TavernInput>): Promise<Tavern | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("taverns")
    .update(tavern)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating tavern:", error);
    return null;
  }

  return data;
}

// Delete a tavern
export async function deleteTavern(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("taverns")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting tavern:", error);
    return false;
  }

  return true;
}

// Get computed stats from tavern data
export async function getTavernStats() {
  const supabase = await createClient();
  const { data: taverns, error } = await supabase
    .from("taverns")
    .select("city, county, state, video_url, dude_approved");

  if (error || !taverns) {
    return {
      totalStops: 0,
      citiesCovered: 0,
      countiesCovered: 0,
      statesCovered: 0,
      videoReviews: 0,
      dudeApprovedCount: 0,
      milesTraveled: "4,200+",
    };
  }

  return {
    totalStops: taverns.length,
    citiesCovered: new Set(taverns.map((t) => t.city)).size,
    countiesCovered: new Set(taverns.map((t) => t.county)).size,
    statesCovered: new Set(taverns.map((t) => t.state)).size,
    videoReviews: taverns.filter((t) => t.video_url && t.video_url.length > 0).length,
    dudeApprovedCount: taverns.filter((t) => t.dude_approved).length,
    milesTraveled: "4,200+",
  };
}

// Get unique regions for filtering
export async function getRegions(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("taverns")
    .select("region");

  if (error || !data) {
    return [];
  }

  return Array.from(new Set(data.map((t) => t.region))).sort();
}

// Get unique states for filtering
export async function getStates(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("taverns")
    .select("state");

  if (error || !data) {
    return [];
  }

  return Array.from(new Set(data.map((t) => t.state))).sort();
}

// Get next stop number
export async function getNextStopNumber(): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("taverns")
    .select("stop_number")
    .order("stop_number", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return 1;
  }

  return (data[0].stop_number || 0) + 1;
}
