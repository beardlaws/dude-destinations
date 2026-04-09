import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { tavernId, source = "web" } = await request.json();

    if (!tavernId) {
      return NextResponse.json({ error: "Missing tavernId" }, { status: 400 });
    }

    const supabase = await createClient();

    // Insert a view record - the trigger will auto-update the count
    const { error } = await supabase
      .from("tavern_views")
      .insert({ tavern_id: tavernId, source });

    if (error) {
      console.error("Error tracking view:", error);
      return NextResponse.json({ error: "Failed to track view" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in track-view API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
