"use server";

import { revalidatePath } from "next/cache";

/**
 * Call this after any tavern create / update / delete
 * so the homepage re-fetches from Supabase on the next visit.
 */
export async function revalidateTaverns() {
  revalidatePath("/");
  revalidatePath("/taverns/[slug]", "page");
}
