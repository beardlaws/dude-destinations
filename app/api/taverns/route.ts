import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ids = searchParams.get("ids");

  if (!ids) {
    return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
  }

  const idArray = ids.split(",").filter(Boolean);

  if (idArray.length === 0) {
    return NextResponse.json([]);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("taverns")
      .select("*")
      .in("id", idArray)
      .order("stop_number", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to fetch taverns" }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
