/**
 * Shared Perks Store
 * Initially empty. Perks can be added and managed dynamically from the Admin Panel.
 */

export interface PerkItem {
  id: string;
  brand: string;
  brandColor: string;
  discount: string;
  condition: string;
  xpCost: number;
  image: string;
  category: "food" | "shopping" | "entertainment" | "travel" | "tech";
  code: string;
  createdAt?: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __coroast_admin_perks: PerkItem[] | undefined;
}

if (!global.__coroast_admin_perks) {
  global.__coroast_admin_perks = [];
}

export function getPerks(): PerkItem[] {
  return global.__coroast_admin_perks || [];
}

export function addPerk(perk: Omit<PerkItem, "id">): PerkItem {
  const newPerk: PerkItem = {
    ...perk,
    id: `perk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  global.__coroast_admin_perks = [newPerk, ...(global.__coroast_admin_perks || [])];
  return newPerk;
}

export function deletePerk(id: string): boolean {
  if (!global.__coroast_admin_perks) return false;
  const initialLen = global.__coroast_admin_perks.length;
  global.__coroast_admin_perks = global.__coroast_admin_perks.filter((p) => p.id !== id);
  return global.__coroast_admin_perks.length < initialLen;
}
