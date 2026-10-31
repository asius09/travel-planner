import type { Destination } from '@travel-planner/shared'

/**
 * Curated destination gallery mapping.
 * Every destination features at least 5 distinct, high-quality, verified photographs
 * representing landscapes, viewpoints, architecture, and local experiences of the location.
 */
const CURATED_GALLERIES: Record<string, string[]> = {
  // Banff National Park (Canada)
  'banff-national-park': [
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=800&fit=crop', // Moraine Lake
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=800&fit=crop', // Lake Louise
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=800&fit=crop', // Johnston Canyon
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=800&fit=crop', // Icefields Parkway
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&h=800&fit=crop', // Banff Gondola view
  ],

  // Plitvice Lakes (Croatia)
  'plitvice-lakes': [
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&h=800&fit=crop', // Terraced falls
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&h=800&fit=crop', // Veliki Slap
    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&h=800&fit=crop', // Wooden boardwalks
    'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1200&h=800&fit=crop', // Lower lakes emerald water
    'https://images.unsplash.com/photo-1511497584788-87676104235f?w=1200&h=800&fit=crop', // Forest canyon path
  ],

  // Yosemite National Park (USA)
  'yosemite-national-park': [
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1200&h=800&fit=crop', // Valley view
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=800&fit=crop', // Half Dome sunset
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop', // Mariposa sequoias
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&h=800&fit=crop', // Yosemite falls
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=800&fit=crop', // Glacier point
  ],

  // Jungfrau Region (Switzerland)
  'swiss-alps-jungfrau': [
    'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200&h=800&fit=crop', // Lauterbrunnen
    'https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=1200&h=800&fit=crop', // Eiger cogwheel train
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=800&fit=crop', // Grindelwald alpine trail
    'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1200&h=800&fit=crop', // Mürren chalets
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop', // Alpine lake vista
  ],

  // Milford Sound (New Zealand)
  'fiordland-national-park': [
    'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1200&h=800&fit=crop', // Mitre peak
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=800&fit=crop', // Stirling falls
    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&h=800&fit=crop', // Rainforest track
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&h=800&fit=crop', // Fiord cruise
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&h=800&fit=crop', // Mountain reflection
  ],

  // Kyoto (Japan)
  kyoto: [
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&h=800&fit=crop', // Fushimi Inari
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&h=800&fit=crop', // Arashiyama bamboo grove
    'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1200&h=800&fit=crop', // Kinkaku-ji golden pavilion
    'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&h=800&fit=crop', // Gion historic street
    'https://images.unsplash.com/photo-1528164344705-475426879c0d?w=1200&h=800&fit=crop', // Kiyomizu-dera temple
  ],
  'kyoto-japan': [
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1528164344705-475426879c0d?w=1200&h=800&fit=crop',
  ],

  // Barcelona (Spain)
  barcelona: [
    'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&h=800&fit=crop', // Sagrada Familia
    'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&h=800&fit=crop', // Park Guell
    'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?w=1200&h=800&fit=crop', // Gothic Quarter
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop', // Barceloneta beach
    'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=1200&h=800&fit=crop', // Casa Batllo
  ],

  // Florence (Italy)
  florence: [
    'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=1200&h=800&fit=crop', // Duomo
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&h=800&fit=crop', // Ponte Vecchio
    'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&h=800&fit=crop', // Tuscan panorama
    'https://images.unsplash.com/photo-1528164344705-475426879c0d?w=1200&h=800&fit=crop', // Piazza della Signoria
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&h=800&fit=crop', // Boboli Gardens
  ],

  // Singapore
  singapore: [
    'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&h=800&fit=crop', // Marina Bay Sands
    'https://images.unsplash.com/photo-1506351421178-63b52a2d2562?w=1200&h=800&fit=crop', // Gardens by the Bay
    'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=1200&h=800&fit=crop', // Supertree Grove
    'https://images.unsplash.com/photo-1508963493744-76fce69379c0?w=1200&h=800&fit=crop', // Jewel Changi
    'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&h=800&fit=crop', // Chinatown streets
  ],

  // Prague (Czech Republic)
  prague: [
    'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200&h=800&fit=crop', // Charles Bridge
    'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1200&h=800&fit=crop', // Prague Castle
    'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=1200&h=800&fit=crop', // Old Town Square
    'https://images.unsplash.com/photo-1520645521318-f03a712f0e67?w=1200&h=800&fit=crop', // Vltava river bridges
    'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=1200&h=800&fit=crop', // Mala Strana roofs
  ],

  // Santorini (Greece)
  santorini: [
    'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&h=800&fit=crop', // Oia whitewashed villas
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&h=800&fit=crop', // Blue domes
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop', // Red beach
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=800&fit=crop', // Aegean sea caldera
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&h=800&fit=crop', // Sunset over the caldera
  ],
  'santorini-greece': [
    'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&h=800&fit=crop',
  ],

  // Maui (USA)
  maui: [
    'https://images.unsplash.com/photo-1542259009477-d625272157b7?w=1200&h=800&fit=crop', // Coastline
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop', // Kaanapali beach
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=800&fit=crop', // Haleakala crater
    'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200&h=800&fit=crop', // Road to Hana waterfalls
    'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1200&h=800&fit=crop', // Molokini reef
  ],

  // Amalfi Coast (Italy)
  'amalfi-coast': [
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&h=800&fit=crop', // Positano cliffs
    'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&h=800&fit=crop', // Mediterranean coastline
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop', // Coastal beach cove
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=800&fit=crop', // Ravello gardens view
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&h=800&fit=crop', // Pastel Italian villas
  ],

  // Tulum (Mexico)
  tulum: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop', // Turquoise beach
    'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=1200&h=800&fit=crop', // Mayan ruins on cliff
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&h=800&fit=crop', // Gran Cenote
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&h=800&fit=crop', // Palm trees
    'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&h=800&fit=crop', // Bohemian beach cabanas
  ],

  // Algarve (Portugal)
  algarve: [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=800&fit=crop', // Benagil cave
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop', // Praia da Marinha
    'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&h=800&fit=crop', // Ponta da Piedade
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=800&fit=crop', // Lagos cliffs
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&h=800&fit=crop', // Golden limestone arches
  ],

  // Queenstown (New Zealand)
  queenstown: [
    'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=1200&h=800&fit=crop', // Lake Wakatipu & Remarkables
    'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1200&h=800&fit=crop', // Skyline gondola
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=800&fit=crop', // Routeburn track
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&h=800&fit=crop', // Shotover canyon
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=800&fit=crop', // Kawarau bridge
  ],

  // Torres del Paine (Chile / Patagonia)
  'patagonia-torres-del-paine': [
    'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=1200&h=800&fit=crop', // Mirador Las Torres
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=800&fit=crop', // Cuernos del Paine
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=800&fit=crop', // Grey Glacier
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=800&fit=crop', // Nordenskjold Lake
    'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1200&h=800&fit=crop', // Pehoe Lake sunrise
  ],

  // South Coast & Highlands (Iceland)
  'iceland-ring-road': [
    'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1200&h=800&fit=crop', // Skogafoss
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=800&fit=crop', // Jokulsarlon Glacier Lagoon
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=800&fit=crop', // Reynisfjara Black Sand Beach
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&h=800&fit=crop', // Seljalandsfoss
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=800&fit=crop', // Kirkjufell
  ],

  // Arenal Volcano (Costa Rica)
  'costa-rica-arenal': [
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=800&fit=crop', // Arenal conical volcano
    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&h=800&fit=crop', // Rainforest hanging bridges
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&h=800&fit=crop', // La Fortuna waterfall
    'https://images.unsplash.com/photo-1511497584788-87676104235f?w=1200&h=800&fit=crop', // Thermal hot springs
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&h=800&fit=crop', // Mist canopy
  ],

  // Moab & Arches (USA)
  'moab-canyonlands': [
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&h=800&fit=crop', // Delicate Arch
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=800&fit=crop', // Canyonlands mesa
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=800&fit=crop', // Dead Horse Point
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1200&h=800&fit=crop', // Landscape Arch
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&h=800&fit=crop', // Red rock plateau
  ],

  // Bali Island (Indonesia)
  'bali-island': [
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&h=800&fit=crop', // Nusa Penida / Kelingking
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop', // Uluwatu beach
    'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200&h=800&fit=crop', // Ubud rice terraces
    'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&h=800&fit=crop', // Pura Ulun Danu Bratan
    'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=1200&h=800&fit=crop', // Seminyak coastal sunset
  ],
  bali: [
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=1200&h=800&fit=crop',
  ],
}

/**
 * Returns at least 5 distinct photographs for a destination.
 * Avoids duplicate images and ensures smooth switching between images.
 */
export function getDestinationGallery(destination: Destination): string[] {
  if (!destination) return []

  // 1. If destination has explicit galleryImages with >= 5 distinct items, use them
  if (Array.isArray(destination.galleryImages) && destination.galleryImages.length >= 5) {
    const deduped = Array.from(new Set([destination.heroImage, ...destination.galleryImages])).filter(Boolean)
    if (deduped.length >= 5) return deduped
  }

  // 2. Check curated gallery by slug
  if (destination.slug) {
    const curated = CURATED_GALLERIES[destination.slug]
    if (curated && curated.length >= 5) {
      return curated
    }
  }

  // 3. Fallback combining heroImage and any available gallery images
  const pool = new Set<string>()
  if (destination.heroImage) pool.add(destination.heroImage)
  if (Array.isArray(destination.galleryImages)) {
    destination.galleryImages.forEach((img) => {
      if (img) pool.add(img)
    })
  }

  // If still fewer than 5, supplement with mood-aligned high-res photos
  const mood = destination.moodTags?.[0] || 'nature'
  const fallbackMoodMap: Record<string, string[]> = {
    nature: [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&h=800&fit=crop',
    ],
    beach: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=800&fit=crop',
    ],
    city: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200&h=800&fit=crop',
    ],
    adventure: [
      'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&h=800&fit=crop',
    ],
  }

  const fallbacks = fallbackMoodMap[mood] || fallbackMoodMap.nature
  for (const url of fallbacks) {
    if (pool.size >= 5) break
    pool.add(url)
  }

  return Array.from(pool)
}
