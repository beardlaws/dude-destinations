'use server';

import { Tavern } from './data';

// In-memory store for taverns - replace with Supabase when ready
// TODO: Replace with Supabase: INSERT, UPDATE, DELETE operations on taverns table
let tavernStore: Tavern[] = [];

// Initialize with mock data
export function initializeTavernStore(initialData: Tavern[]): void {
  tavernStore = JSON.parse(JSON.stringify(initialData));
}

// Get all taverns
export function getAllTaverns(): Tavern[] {
  return JSON.parse(JSON.stringify(tavernStore));
}

// Get tavern by ID
export function getTavernById(id: string): Tavern | null {
  const tavern = tavernStore.find((t) => t.id === id);
  return tavern ? JSON.parse(JSON.stringify(tavern)) : null;
}

// Get tavern by slug
export function getTavernBySlug(slug: string): Tavern | null {
  const tavern = tavernStore.find((t) => t.slug === slug);
  return tavern ? JSON.parse(JSON.stringify(tavern)) : null;
}

// Create tavern
export function createTavern(tavern: Tavern): Tavern {
  // TODO: Replace with Supabase:
  // const { data, error } = await supabase
  //   .from('taverns')
  //   .insert([tavern])
  //   .select()
  //   .single();

  tavernStore.push(JSON.parse(JSON.stringify(tavern)));
  return tavern;
}

// Update tavern
export function updateTavern(id: string, updates: Partial<Tavern>): Tavern | null {
  // TODO: Replace with Supabase:
  // const { data, error } = await supabase
  //   .from('taverns')
  //   .update(updates)
  //   .eq('id', id)
  //   .select()
  //   .single();

  const index = tavernStore.findIndex((t) => t.id === id);
  if (index === -1) return null;

  tavernStore[index] = { ...tavernStore[index], ...updates };
  return JSON.parse(JSON.stringify(tavernStore[index]));
}

// Delete tavern
export function deleteTavern(id: string): boolean {
  // TODO: Replace with Supabase:
  // const { error } = await supabase
  //   .from('taverns')
  //   .delete()
  //   .eq('id', id);

  const index = tavernStore.findIndex((t) => t.id === id);
  if (index === -1) return false;

  tavernStore.splice(index, 1);
  return true;
}

// Reorder taverns (update stopNumbers)
export function reorderTaverns(orders: Array<{ id: string; stopNumber: number }>): Tavern[] {
  // TODO: Replace with Supabase:
  // const updates = orders.map(order =>
  //   supabase
  //     .from('taverns')
  //     .update({ stop_number: order.stopNumber })
  //     .eq('id', order.id)
  // );

  for (const order of orders) {
    const index = tavernStore.findIndex((t) => t.id === order.id);
    if (index !== -1) {
      tavernStore[index].stopNumber = order.stopNumber;
    }
  }

  return JSON.parse(JSON.stringify(tavernStore));
}

// Get featured taverns
export function getFeaturedTaverns(): Tavern[] {
  return tavernStore.filter((t) => t.featured).sort((a, b) => a.stopNumber - b.stopNumber);
}
