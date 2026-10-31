import type { Destination } from '@travel-planner/shared'

/**
 * Returns the destination's image collection from the API, ordered by stable
 * position. Images live in the database (`destination_images`); the hero image
 * is the first entry.
 *
 * Destinations with fewer than five images (migration gaps, incomplete data)
 * render only their real images — fabricated substitute photos are never
 * shown. Use `hasCompleteGallery` to flag such records for remediation.
 */
export function getDestinationGallery(destination: Destination): string[] {
  if (!destination) return []

  const urls: string[] = []

  // 1. Ordered collection from the API (preferred source)
  if (Array.isArray(destination.images) && destination.images.length > 0) {
    const ordered = [...destination.images].sort((a, b) => a.position - b.position)
    for (const image of ordered) {
      if (image?.url && !urls.includes(image.url)) urls.push(image.url)
    }
  }

  // 2. Fixtures / legacy payloads may only carry the flat url list
  if (urls.length === 0 && Array.isArray(destination.galleryImages)) {
    for (const url of destination.galleryImages) {
      if (url && !urls.includes(url)) urls.push(url)
    }
  }

  // 3. Last resort: the single hero image
  if (urls.length === 0 && destination.heroImage) {
    urls.push(destination.heroImage)
  }

  return urls
}

/** True when the destination carries the full five-image collection. */
export function hasCompleteGallery(destination: Destination): boolean {
  return getDestinationGallery(destination).length >= 5
}
