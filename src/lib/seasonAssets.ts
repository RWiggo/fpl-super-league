// Loads per-season badges + kits from Supabase tables `team_badges_resolved`
// and `team_kits` and exposes synchronous lookups. Components call
// `useSeasonAssets()` once (e.g. inside Layout) to trigger the fetch and
// re-render when the data arrives. Other components can then call
// `getDbSeasonBadge(managerId, seasonId)` / `getDbSeasonKit(...)` synchronously.
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

const badgeMap = new Map<string, string>();
const kitMap = new Map<string, string>();
const latestBadgeSeason = new Map<string, number>();
const latestKitSeason = new Map<string, number>();
let status: "idle" | "loading" | "loaded" = "idle";
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function ensureSeasonAssets() {
  if (status !== "idle") return;
  status = "loading";
  Promise.all([
    supabase.from("team_badges_resolved").select("manager_id,season_id,badge_url,badge_season"),
    supabase.from("team_kits").select("manager_id,season_id,home_kit_url"),
  ])
    .then(([b, k]) => {
      (b.data ?? []).forEach((r: any) => {
        if (!r.badge_url) return;
        // team_badges_resolved carries forward the most recent explicit badge into every
        // later season row (labelled with that later season's id), so a naive season_id
        // match is never actually "exact". badge_season is the real season the badge_url
        // was recorded for - only treat it as exact when the two agree.
        if (r.season_id === r.badge_season) {
          badgeMap.set(`${r.manager_id}|${r.season_id}`, r.badge_url);
        }
        const prev = latestBadgeSeason.get(String(r.manager_id)) ?? 0;
        if (r.badge_season > prev) latestBadgeSeason.set(String(r.manager_id), r.badge_season);
      });
      (k.data ?? []).forEach((r: any) => {
        if (!r.home_kit_url) return;
        kitMap.set(`${r.manager_id}|${r.season_id}`, r.home_kit_url);
        const prev = latestKitSeason.get(String(r.manager_id)) ?? 0;
        if (r.season_id > prev) latestKitSeason.set(String(r.manager_id), r.season_id);
      });
      status = "loaded";
      notify();
    })
    .catch(() => {
      status = "idle"; // allow retry on next mount
    });
}

export function getDbSeasonBadge(
  managerId: string | number | null | undefined,
  seasonId: string | number | null | undefined,
  opts?: { exact?: boolean },
): string | null {
  if (managerId == null) return null;
  if (seasonId != null) {
    const direct = badgeMap.get(`${managerId}|${seasonId}`);
    if (direct) return direct;
    if (opts?.exact) return null;
  }
  const latest = latestBadgeSeason.get(String(managerId));
  if (latest) return badgeMap.get(`${managerId}|${latest}`) ?? null;
  return null;
}

export function getDbSeasonKit(
  managerId: string | number | null | undefined,
  seasonId: string | number | null | undefined,
): string | null {
  if (managerId == null) return null;
  if (seasonId != null) {
    const direct = kitMap.get(`${managerId}|${seasonId}`);
    if (direct) return direct;
  }
  const latest = latestKitSeason.get(String(managerId));
  if (latest) return kitMap.get(`${managerId}|${latest}`) ?? null;
  return null;
}

export function useSeasonAssets() {
  const [, setV] = useState(0);
  useEffect(() => {
    ensureSeasonAssets();
    const cb = () => setV((v) => v + 1);
    listeners.add(cb);
    if (status === "loaded") cb();
    return () => {
      listeners.delete(cb);
    };
  }, []);
}
