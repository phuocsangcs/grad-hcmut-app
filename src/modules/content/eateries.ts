import type { Budget, Eatery } from './schema';
import { listEateries } from './loaders';

export type EateryFilter = {
  budget?: Budget;
  bigGroup?: boolean;
  carParking?: boolean;
  maxDistanceMin?: number;
};

/** Lọc đơn giản, thiếu field nào thì bỏ qua điều kiện đó. Sắp theo khoảng cách. */
export function filterEateries(filter: EateryFilter = {}, source: Eatery[] = listEateries()): Eatery[] {
  return source
    .filter((e) => {
      if (filter.budget && e.budget !== filter.budget) return false;
      if (filter.bigGroup && !e.bigGroup) return false;
      if (filter.carParking && !e.carParking) return false;
      if (filter.maxDistanceMin !== undefined && e.distanceMin > filter.maxDistanceMin) return false;
      return true;
    })
    .sort((a, b) => a.distanceMin - b.distanceMin);
}

/** Link Google Maps mở thẳng quán, dùng được trong webview Zalo. */
export function eateryMapsUrl(e: Eatery): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.mapsQuery)}`;
}
