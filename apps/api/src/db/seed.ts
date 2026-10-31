import { db } from '../db'
import { destinations, destinationImages } from '../db/schema'
import { eq, gte, and } from 'drizzle-orm'

/**
 * Consistent crop parameters for every seeded gallery image so the Explore
 * grid and the detail gallery render uniformly. Stable Unsplash photo IDs are
 * the approved image source (see DESIGN.md, "Curated photography").
 */
const IMAGE_PARAMS = '?w=1200&h=800&fit=crop'

const unsplash = (photoId: string) => `https://images.unsplash.com/${photoId}${IMAGE_PARAMS}`

/**
 * Five distinct, destination-correct photographs per destination. Every URL in
 * this map is verified by `scripts/validate-images.ts` (HEAD + image
 * content-type). Re-run that script after editing anything here.
 */
const DESTINATION_GALLERIES: Record<string, string[]> = {
  'banff-national-park': [
    'photo-1519681393784-d120267933ba',
    'photo-1506744038136-46273834b3fb',
    'photo-1464822759023-fed622ff2c3b',
    'photo-1470071459604-3b5ec3a7fe05',
    'photo-1501785888041-af3ef285b470',
  ],
  'plittvice-lakes': [
    'photo-1445821185708-62c36d070323',
    'photo-1432405972618-c60b0225b8f9',
    'photo-1448375240586-882707db888b',
    'photo-1473448912268-2022ce9509d8',
    'photo-1568990966085-e53951e67fd9',
  ],
  'fiji-islands': [
    'photo-1487252333087-c353573e2b7c',
    'photo-1530736822234-c8562cb0a710',
    'photo-1541292426587-b6ca8230532b',
    'photo-1579264670959-286d7b06f1ae',
    'photo-1655719647300-5142977bfa79',
  ],
  'kyoto-japan': [
    'photo-1493976040374-85c8e12f0c0e',
    'photo-1503899036084-c55cdd92da26',
    'photo-1492571350019-22de08371fd3',
    'photo-1545569341-9eb8b30979d9',
    'photo-1526481280693-3bfa7568e0f3',
  ],
  'marrakech-morocco': [
    'photo-1549140600-78c9b8275e9d',
    'photo-1561642769-1bca263542e0',
    'photo-1569440703456-29b9c31765ca',
    'photo-1580746738099-1cb74f972feb',
    'photo-1597212618440-806262de4f6b',
  ],
  'patagonia-chile': [
    'photo-1527004013197-933c4bb611b3',
    'photo-1478827387698-1527781a4887',
    'photo-1519966776149-927c0270b1d4',
    'photo-1544198365-f5d60b6d8190',
    'photo-1558517286-6b7b81953cb5',
  ],
  'amalfi-coast-italy': [
    'photo-1516483638261-f4dbaf036963',
    'photo-1533656338503-b22f63e96cd8',
    'photo-1561956021-947f09ae0101',
    'photo-1583844056361-4418a8f2a985',
    'photo-1610574138412-7bf28ade0222',
  ],
  'iceland-ring-road': [
    'photo-1504893524553-b855bce32c67',
    'photo-1498008122250-bcb854c8462d',
    'photo-1501908734255-16579c18c25f',
    'photo-1503104538136-7491acef4d5d',
    'photo-1519092437326-bfd121eb53ae',
  ],
  'santorini-greece': [
    'photo-1570077188670-e3a8d69ac5ff',
    'photo-1533105079780-92b9be482077',
    'photo-1533104816931-20fa691ff6ca',
    'photo-1563789031959-4c02bcb41319',
    'photo-1596933144889-c15043a9ddde',
  ],
  'queenstown-new-zealand': [
    'photo-1589802829985-817e51171b92',
    'photo-1507699622108-4be3abd695ad',
    'photo-1512017615494-fdf6146235ff',
    'photo-1547314283-befb6cc5cf29',
    'photo-1600466403153-50193d187dde',
  ],
  'azores-portugal': [
    'photo-1536308304182-5a2e0e04bb08',
    'photo-1556808117-95e556e06420',
    'photo-1581925865198-19f524ee8f30',
    'photo-1597765190505-62860662dce3',
    'photo-1621582968567-b10725dc1fa3',
  ],
  'bali-indonesia': [
    'photo-1537996194471-e657df975ab4',
    'photo-1544644181-1484b3fdfc62',
    'photo-1537953773345-d172ccf13cf1',
    'photo-1555400038-63f5ba517a47',
    'photo-1573790387438-4da905039392',
  ],
  'norwegian-fjords': [
    'photo-1531366936337-7c912a4589a7',
    'photo-1504519733529-35b35d10eee2',
    'photo-1544009520-e2ea9189f15e',
    'photo-1611916813771-972015148368',
    'photo-1505731324189-3d0afbeafcbf',
  ],
  'petra-jordan': [
    'photo-1548786811-dd6e453ccca7',
    'photo-1554357345-187a92a9eeab',
    'photo-1579606032821-4e6161c81bd3',
    'photo-1580834341580-8c17a3a630ca',
    'photo-1606210122158-eeb10e0823bf',
  ],
  'great-barrier-reef': [
    'photo-1544551763-46a013bb70d5',
    'photo-1442386967425-6205da77c3ed',
    'photo-1514907283155-ea5f4094c70c',
    'photo-1546026423-cc4642628d2b',
    'photo-1580019542155-247062e19ce4',
  ],
  'cappadocia-turkey': [
    'photo-1559783510-c448bd7d686b',
    'photo-1565694286329-16c31ae20a20',
    'photo-1604156789095-3348604c0f43',
    'photo-1631724533937-687e6e60aafe',
    'photo-1641128324972-af3212f0f6bd',
  ],
  'maui-hawaii': [
    'photo-1542259009477-d625272157b7',
    'photo-1518548419970-58e3b4079ab2',
    'photo-1547537069-537b37a02069',
    'photo-1556206079-747a7a424d3d',
    'photo-1568576599263-ad9f374633d4',
  ],
  'dolomites-italy': [
    'photo-1531275090635-95f0974c3073',
    'photo-1534106474077-f9e9c6f5a47c',
    'photo-1551291420-91160f3d4961',
    'photo-1564574662330-73fb2940ff5d',
    'photo-1604766664165-668315c14b76',
  ],
  maldives: [
    'photo-1514282401047-d79a71a590e8',
    'photo-1547528114-f4daa226e256',
    'photo-1551918120-9739cb430c6d',
    'photo-1574226780565-388f10f8121e',
    'photo-1578922746465-3a80a228f223',
  ],
  'salar-de-uyuni': [
    'photo-1526029655228-b7ee496c7819',
    'photo-1528161498624-89b0174b714d',
    'photo-1529801877115-8a69a227fcc0',
    'photo-1533013404834-c196f079ca57',
    'photo-1583901370237-2befec865f88',
  ],
  'reykjavik-iceland': [
    'photo-1462993340984-49bd9e0f32dd',
    'photo-1474690870753-1b92efa1f2d8',
    'photo-1606130503037-6a8ef67c9d2d',
    'photo-1615130767419-e9ff3afa5a15',
    'photo-1630316710923-60d1c6935503',
  ],
}

const seedDestinations = [
  // Nature destinations
  {
    slug: 'banff-national-park',
    name: 'Banff National Park',
    country: 'Canada',
    region: 'Alberta',
    shortDescription: 'Turquoise lakes and towering peaks in the Canadian Rockies.',
    description:
      "Banff National Park is Canada's oldest national park, established in 1885. Located in the heart of the Canadian Rockies, it features stunning turquoise lakes like Lake Louise and Moraine Lake, massive glaciers, and abundant wildlife. Perfect for hiking, photography, and scenic drives.",
    moodTags: ['nature'],
    categoryTags: ['mountains', 'lakes', 'hiking', 'wildlife', 'photography'],
    estimatedCostMinor: 85000, // $850
    costCurrency: 'USD',
    suggestedDaysMin: 3,
    suggestedDaysMax: 5,
    highlights: ['Lake Louise', 'Moraine Lake', 'Icefields Parkway', 'Banff Gondola', 'Johnston Canyon'],
    imageCredit: 'Photo by Samuel Ferrara on Unsplash',
    isPublished: true,
    popularity: 95,
  },
  {
    slug: 'plittvice-lakes',
    name: 'Plitvice Lakes National Park',
    country: 'Croatia',
    region: 'Lika-Senj County',
    shortDescription: 'Cascading lakes and waterfalls in a UNESCO World Heritage site.',
    description:
      'Plitvice Lakes National Park is a UNESCO World Heritage site famous for its 16 terraced lakes connected by waterfalls, set in deep woodland. The lakes change color from azure to green, grey or blue depending on the minerals and organisms in the water.',
    moodTags: ['nature'],
    categoryTags: ['lakes', 'waterfalls', 'hiking', 'unesco', 'photography'],
    estimatedCostMinor: 45000, // $450
    costCurrency: 'USD',
    suggestedDaysMin: 2,
    suggestedDaysMax: 3,
    highlights: ['Upper Lakes', 'Lower Lakes', 'Veliki Slap waterfall', 'Kozjak Lake boat ride', 'Walking trails'],
    imageCredit: 'Photo by Andrii Starunets on Unsplash',
    isPublished: true,
    popularity: 88,
  },
  {
    slug: 'fiji-islands',
    name: 'Fiji Islands',
    country: 'Fiji',
    region: 'South Pacific',
    shortDescription: 'Pristine beaches and vibrant coral reefs in the South Pacific.',
    description:
      'Fiji is an archipelago of more than 300 islands in the South Pacific, known for its palm-lined beaches, crystal-clear lagoons, and extensive coral reefs. Perfect for snorkeling, diving, and pure relaxation.',
    moodTags: ['beach', 'nature'],
    categoryTags: ['beach', 'snorkeling', 'diving', 'islands', 'relaxation'],
    estimatedCostMinor: 180000, // $1800
    costCurrency: 'USD',
    suggestedDaysMin: 5,
    suggestedDaysMax: 7,
    highlights: ['Mamanuca Islands', 'Coral Coast', 'Sawa-i-Lau Caves', 'Kula Wild Adventure Park', 'Traditional village visit'],
    imageCredit: 'Photo by Nicolas Petit on Unsplash',
    isPublished: true,
    popularity: 82,
  },
  {
    slug: 'kyoto-japan',
    name: 'Kyoto',
    country: 'Japan',
    region: 'Kansai',
    shortDescription: 'Ancient temples, traditional gardens, and geisha culture.',
    description:
      "Kyoto served as Japan's capital for over 1,000 years and remains the cultural heart of the country. With over 1,600 Buddhist temples, 400 Shinto shrines, and 17 UNESCO World Heritage sites, it offers an immersive journey into traditional Japanese culture.",
    moodTags: ['city'],
    categoryTags: ['temples', 'gardens', 'culture', 'history', 'unesco'],
    estimatedCostMinor: 120000, // $1200
    costCurrency: 'USD',
    suggestedDaysMin: 3,
    suggestedDaysMax: 5,
    highlights: ['Fushimi Inari Shrine', 'Kinkaku-ji (Golden Pavilion)', 'Arashiyama Bamboo Grove', 'Gion District', 'Kiyomizu-dera Temple'],
    imageCredit: 'Photo by Jezael Melgoza on Unsplash',
    isPublished: true,
    popularity: 92,
  },
  {
    slug: 'marrakech-morocco',
    name: 'Marrakech',
    country: 'Morocco',
    region: 'Marrakech-Safi',
    shortDescription: 'Vibrant souks, stunning palaces, and desert gateways.',
    description:
      'Marrakech, the "Red City," is a sensory overload of colors, sounds, and scents. Its medina is a UNESCO World Heritage site filled with bustling souks, historic palaces, and hidden riads. A gateway to the Sahara Desert and Atlas Mountains.',
    moodTags: ['city', 'adventure'],
    categoryTags: ['markets', 'architecture', 'culture', 'desert', 'history'],
    estimatedCostMinor: 65000, // $650
    costCurrency: 'USD',
    suggestedDaysMin: 3,
    suggestedDaysMax: 4,
    highlights: ['Jemaa el-Fnaa Square', 'Bahia Palace', 'Majorelle Garden', 'Saadian Tombs', 'Atlas Mountains day trip'],
    imageCredit: 'Photo by Jaanus Jagomägi on Unsplash',
    isPublished: true,
    popularity: 85,
  },
  {
    slug: 'patagonia-chile',
    name: 'Torres del Paine',
    country: 'Chile',
    region: 'Magallanes Region',
    shortDescription: 'Dramatic peaks, glaciers, and pristine wilderness in Patagonia.',
    description:
      "Torres del Paine National Park in Chilean Patagonia features the iconic three granite towers, massive glaciers, turquoise lakes, and vast steppe. It's a hiker's paradise with world-class trekking routes like the W Trek and O Circuit.",
    moodTags: ['adventure', 'nature'],
    categoryTags: ['trekking', 'mountains', 'glaciers', 'wildlife', 'photography'],
    estimatedCostMinor: 150000, // $1500
    costCurrency: 'USD',
    suggestedDaysMin: 5,
    suggestedDaysMax: 8,
    highlights: ['W Trek', 'Grey Glacier', 'Torres Base', 'Lake Pehoé', 'French Valley'],
    imageCredit: 'Photo by Luca Bravo on Unsplash',
    isPublished: true,
    popularity: 80,
  },
  {
    slug: 'amalfi-coast-italy',
    name: 'Amalfi Coast',
    country: 'Italy',
    region: 'Campania',
    shortDescription: 'Cliffside villages, lemon groves, and Mediterranean vistas.',
    description:
      'The Amalfi Coast is a 50-kilometer stretch of coastline along the Sorrentine Peninsula, famous for its sheer cliffs, pastel-colored villages, and lemon groves. A UNESCO World Heritage site that combines natural beauty with Italian dolce vita.',
    moodTags: ['beach', 'city'],
    categoryTags: ['coastline', 'villages', 'food', 'history', 'unesco'],
    estimatedCostMinor: 140000, // $1400
    costCurrency: 'USD',
    suggestedDaysMin: 4,
    suggestedDaysMax: 6,
    highlights: ['Positano', 'Amalfi Town', 'Ravello', 'Path of the Gods hike', 'Capri day trip'],
    imageCredit: 'Photo by Andrea Pozzi on Unsplash',
    isPublished: true,
    popularity: 90,
  },
  {
    slug: 'iceland-ring-road',
    name: 'Iceland Ring Road',
    country: 'Iceland',
    region: 'Entire Country',
    shortDescription: 'Waterfalls, volcanoes, glaciers, and northern lights.',
    description:
      "Iceland's Ring Road (Route 1) circles the entire island, passing through some of the world's most dramatic landscapes. Waterfalls, black sand beaches, glacier lagoons, geothermal areas, and the chance to see the northern lights make this an epic road trip.",
    moodTags: ['nature', 'adventure'],
    categoryTags: ['road-trip', 'waterfalls', 'glaciers', 'volcanoes', 'northern-lights'],
    estimatedCostMinor: 200000, // $2000
    costCurrency: 'USD',
    suggestedDaysMin: 7,
    suggestedDaysMax: 10,
    highlights: ['Seljalandsfoss', 'Jökulsárlón Glacier Lagoon', 'Black Sand Beach', 'Mývatn', 'Golden Circle'],
    imageCredit: 'Photo by Marcos Paulo Prado on Unsplash',
    isPublished: true,
    popularity: 87,
  },
  {
    slug: 'santorini-greece',
    name: 'Santorini',
    country: 'Greece',
    region: 'South Aegean',
    shortDescription: 'White-washed villages, caldera views, and legendary sunsets.',
    description:
      'Santorini is a volcanic island in the Cyclades, famous for its white-washed buildings with blue domes perched on caldera cliffs. The island offers stunning sunsets, unique beaches, ancient ruins, and world-class wineries.',
    moodTags: ['beach', 'city'],
    categoryTags: ['islands', 'sunsets', 'architecture', 'wine', 'history'],
    estimatedCostMinor: 110000, // $1100
    costCurrency: 'USD',
    suggestedDaysMin: 3,
    suggestedDaysMax: 5,
    highlights: ['Oia Sunset', 'Fira Town', 'Red Beach', 'Akrotiri Archaeological Site', 'Wine tasting'],
    imageCredit: 'Photo by Christian Buehner on Unsplash',
    isPublished: true,
    popularity: 93,
  },
  {
    slug: 'queenstown-new-zealand',
    name: 'Queenstown',
    country: 'New Zealand',
    region: 'Otago',
    shortDescription: 'Adventure capital with mountains, lakes, and adrenaline sports.',
    description:
      'Queenstown sits on the shores of Lake Wakatipu, surrounded by the Southern Alps. Known as the adventure capital of the world, it offers bungee jumping, skydiving, jet boating, and world-class skiing, plus access to Milford Sound.',
    moodTags: ['adventure', 'nature'],
    categoryTags: ['adventure-sports', 'mountains', 'lakes', 'skiing', 'fjords'],
    estimatedCostMinor: 160000, // $1600
    costCurrency: 'USD',
    suggestedDaysMin: 4,
    suggestedDaysMax: 6,
    highlights: ['Milford Sound', 'Bungee jumping', 'Skyline Gondola', 'Lake Wakatipu cruise', 'Glenorchy'],
    imageCredit: 'Photo by Christian Buehner on Unsplash',
    isPublished: true,
    popularity: 84,
  },
  {
    slug: 'azores-portugal',
    name: 'Azores',
    country: 'Portugal',
    region: 'Azores Archipelago',
    shortDescription: 'Volcanic islands, crater lakes, and whale watching in the Atlantic.',
    description:
      'The Azores are nine volcanic islands in the mid-Atlantic, known for their dramatic landscapes: crater lakes, hot springs, tea plantations, and whale watching. A hidden gem for nature lovers and adventure seekers.',
    moodTags: ['nature', 'adventure', 'beach'],
    categoryTags: ['volcanoes', 'whale-watching', 'hiking', 'hot-springs', 'islands'],
    estimatedCostMinor: 95000, // $950
    costCurrency: 'USD',
    suggestedDaysMin: 5,
    suggestedDaysMax: 7,
    highlights: ['Sete Cidades', 'Furnas Valley', 'Whale watching', 'Pico Mountain', 'Terra Nostra Park'],
    imageCredit: 'Photo by Shawn Appel on Unsplash',
    isPublished: true,
    popularity: 78,
  },
  {
    slug: 'bali-indonesia',
    name: 'Bali',
    country: 'Indonesia',
    region: 'Bali Province',
    shortDescription: 'Rice terraces, temples, beaches, and spiritual culture.',
    description:
      'Bali, the "Island of the Gods," combines stunning rice terraces, ancient temples, world-class beaches, and a deeply spiritual Hindu culture. From the cultural heart of Ubud to the surf beaches of Canggu and the cliffs of Uluwatu.',
    moodTags: ['beach', 'nature', 'adventure'],
    categoryTags: ['temples', 'rice-terraces', 'beaches', 'surfing', 'spiritual'],
    estimatedCostMinor: 75000, // $750
    costCurrency: 'USD',
    suggestedDaysMin: 5,
    suggestedDaysMax: 10,
    highlights: ['Ubud Monkey Forest', 'Tegallalang Rice Terraces', 'Tanah Lot Temple', 'Uluwatu Temple', 'Nusa Penida day trip'],
    imageCredit: 'Photo by Brooke Lark on Unsplash',
    isPublished: true,
    popularity: 91,
  },
  {
    slug: 'norwegian-fjords',
    name: 'Norwegian Fjords',
    country: 'Norway',
    region: 'Western Norway',
    shortDescription: 'Deep fjords, towering waterfalls, and midnight sun.',
    description:
      "Norway's fjords are among the most dramatic landscapes on Earth. Deep glacial valleys filled with seawater, surrounded by sheer cliffs and cascading waterfalls. The Geirangerfjord and Nærøyfjord are UNESCO World Heritage sites.",
    moodTags: ['nature', 'adventure'],
    categoryTags: ['fjords', 'waterfalls', 'hiking', 'cruises', 'midnight-sun'],
    estimatedCostMinor: 180000, // $1800
    costCurrency: 'USD',
    suggestedDaysMin: 5,
    suggestedDaysMax: 7,
    highlights: ['Geirangerfjord', 'Nærøyfjord', 'Trolltunga', 'Preikestolen', 'Flåm Railway'],
    imageCredit: 'Photo by Vidar Nordli-Mathisen on Unsplash',
    isPublished: true,
    popularity: 86,
  },
  {
    slug: 'petra-jordan',
    name: 'Petra',
    country: 'Jordan',
    region: "Ma'an Governorate",
    shortDescription: 'Ancient rose-red city carved into desert cliffs.',
    description:
      'Petra, the "Rose City," is an archaeological wonder carved into pink sandstone cliffs by the Nabataeans over 2,000 years ago. A UNESCO World Heritage site and one of the New Seven Wonders of the World, accessed through the dramatic Siq canyon.',
    moodTags: ['city', 'adventure'],
    categoryTags: ['archaeology', 'history', 'unesco', 'desert', 'hiking'],
    estimatedCostMinor: 55000, // $550
    costCurrency: 'USD',
    suggestedDaysMin: 2,
    suggestedDaysMax: 3,
    highlights: ['The Treasury', 'The Monastery', 'Siq Canyon', 'High Place of Sacrifice', 'Little Petra'],
    imageCredit: 'Photo by Paul Mackenzie on Unsplash',
    isPublished: true,
    popularity: 83,
  },
  {
    slug: 'great-barrier-reef',
    name: 'Great Barrier Reef',
    country: 'Australia',
    region: 'Queensland',
    shortDescription: "World's largest coral reef system, marine life paradise.",
    description:
      'The Great Barrier Reef is the world\'s largest coral reef system, stretching over 2,300 kilometers. A UNESCO World Heritage site visible from space, it offers unparalleled snorkeling and diving among vibrant coral gardens and diverse marine life.',
    moodTags: ['beach', 'nature', 'adventure'],
    categoryTags: ['snorkeling', 'diving', 'marine-life', 'unesco', 'islands'],
    estimatedCostMinor: 130000, // $1300
    costCurrency: 'USD',
    suggestedDaysMin: 4,
    suggestedDaysMax: 6,
    highlights: ['Snorkeling/diving', 'Whitehaven Beach', 'Heart Reef', 'Green Island', 'Reef sleep experience'],
    imageCredit: 'Photo by Manny Moreno on Unsplash',
    isPublished: true,
    popularity: 89,
  },
  {
    slug: 'cappadocia-turkey',
    name: 'Cappadocia',
    country: 'Turkey',
    region: 'Central Anatolia',
    shortDescription: 'Fairy chimneys, cave hotels, and sunrise hot air balloons.',
    description:
      'Cappadocia\'s otherworldly landscape of "fairy chimneys" - tall, cone-shaped rock formations - was formed by volcanic eruptions and erosion. Ancient cave dwellings, underground cities, and sunrise hot air balloon flights make this a magical destination.',
    moodTags: ['adventure', 'nature'],
    categoryTags: ['hot-air-balloon', 'cave-hotels', 'history', 'hiking', 'photography'],
    estimatedCostMinor: 70000, // $700
    costCurrency: 'USD',
    suggestedDaysMin: 3,
    suggestedDaysMax: 4,
    highlights: ['Hot air balloon sunrise', 'Göreme Open Air Museum', 'Underground cities', 'Love Valley', 'Cave hotel stay'],
    imageCredit: 'Photo by Hamdi Şimşek on Unsplash',
    isPublished: true,
    popularity: 88,
  },
  {
    slug: 'maui-hawaii',
    name: 'Maui',
    country: 'USA',
    region: 'Hawaii',
    shortDescription: 'Volcanic landscapes, golden beaches, and the Road to Hana.',
    description:
      'Maui, the "Valley Isle," offers diverse landscapes from the volcanic Haleakalā crater to the lush Road to Hana with its waterfalls and black sand beaches. World-class snorkeling, whale watching (seasonal), and stunning sunsets.',
    moodTags: ['beach', 'nature', 'adventure'],
    categoryTags: ['beaches', 'volcanoes', 'road-trip', 'snorkeling', 'whale-watching'],
    estimatedCostMinor: 170000, // $1700
    costCurrency: 'USD',
    suggestedDaysMin: 5,
    suggestedDaysMax: 7,
    highlights: ['Haleakalā sunrise', 'Road to Hana', 'Molokini Crater snorkeling', 'Kaanapali Beach', 'Upcountry Maui'],
    imageCredit: 'Photo by David Davis on Unsplash',
    isPublished: true,
    popularity: 90,
  },
  {
    slug: 'dolomites-italy',
    name: 'Dolomites',
    country: 'Italy',
    region: 'South Tyrol',
    shortDescription: 'Dramatic peaks, alpine meadows, and via ferrata routes.',
    description:
      'The Dolomites are a UNESCO World Heritage mountain range in northeastern Italy, known for their distinctive pale peaks, alpine meadows, and world-class hiking and climbing. The region blends Italian and Austrian culture with stunning scenery.',
    moodTags: ['nature', 'adventure'],
    categoryTags: ['mountains', 'hiking', 'climbing', 'unesco', 'photography'],
    estimatedCostMinor: 100000, // $1000
    costCurrency: 'USD',
    suggestedDaysMin: 4,
    suggestedDaysMax: 6,
    highlights: ['Tre Cime di Lavaredo', 'Seceda', 'Alpe di Siusi', 'Lago di Braies', 'Via ferrata routes'],
    imageCredit: 'Photo by Tobias Bjørkli on Unsplash',
    isPublished: true,
    popularity: 85,
  },
  {
    slug: 'maldives',
    name: 'Maldives',
    country: 'Maldives',
    region: 'Indian Ocean',
    shortDescription: 'Overwater villas, crystal lagoons, and world-class diving.',
    description:
      'The Maldives is a tropical paradise of 26 atolls and over 1,000 coral islands in the Indian Ocean. Famous for luxury overwater villas, pristine white-sand beaches, and some of the world\'s best diving and snorkeling among vibrant coral reefs.',
    moodTags: ['beach'],
    categoryTags: ['luxury', 'overwater-villas', 'diving', 'snorkeling', 'relaxation'],
    estimatedCostMinor: 300000, // $3000
    costCurrency: 'USD',
    suggestedDaysMin: 4,
    suggestedDaysMax: 7,
    highlights: ['Overwater villa stay', 'Manta ray snorkeling', 'Bioluminescent beach', 'Sunset dolphin cruise', 'Private sandbank picnic'],
    imageCredit: 'Photo by Ishan @seefromthesky on Unsplash',
    isPublished: true,
    popularity: 94,
  },
  {
    slug: 'salar-de-uyuni',
    name: 'Salar de Uyuni',
    country: 'Bolivia',
    region: 'Potosí Department',
    shortDescription: "World's largest salt flat, mirror effect, and colored lagoons.",
    description:
      'Salar de Uyuni is the world\'s largest salt flat at over 10,000 sq km. During rainy season, a thin layer of water creates a perfect mirror reflecting the sky. The surrounding region features colored lagoons, flamingos, geysers, and unique rock formations.',
    moodTags: ['nature', 'adventure'],
    categoryTags: ['salt-flats', 'mirror-effect', 'lagoons', 'wildlife', 'photography'],
    estimatedCostMinor: 60000, // $600
    costCurrency: 'USD',
    suggestedDaysMin: 3,
    suggestedDaysMax: 4,
    highlights: ['Salt flat mirror effect', 'Incahuasi Island', 'Red Lagoon', 'Green Lagoon', 'Sol de Mañana geysers'],
    imageCredit: 'Photo by Jaanus Jagomägi on Unsplash',
    isPublished: true,
    popularity: 75,
  },
  {
    slug: 'reykjavik-iceland',
    name: 'Reykjavik & Golden Circle',
    country: 'Iceland',
    region: 'Capital Region',
    shortDescription: 'Geothermal wonders, waterfalls, and northern lights from a vibrant capital.',
    description:
      "Reykjavik, the world's northernmost capital, is the perfect base for exploring Iceland's Golden Circle: Þingvellir National Park, Geysir geothermal area, and Gullfoss waterfall. Plus easy access to the Blue Lagoon and northern lights tours.",
    moodTags: ['nature', 'city', 'adventure'],
    categoryTags: ['geothermal', 'waterfalls', 'northern-lights', 'city', 'unesco'],
    estimatedCostMinor: 110000, // $1100
    costCurrency: 'USD',
    suggestedDaysMin: 3,
    suggestedDaysMax: 5,
    highlights: ['Blue Lagoon', 'Golden Circle', 'Hallgrímskirkja', 'Harpa Concert Hall', 'Northern lights tour'],
    imageCredit: 'Photo by Marcos Paulo Prado on Unsplash',
    isPublished: true,
    popularity: 88,
  },
]

/** Sanity check: every seeded destination must have a verified 5-image gallery. */
function resolveGallery(slug: string, name: string): string[] {
  const gallery = DESTINATION_GALLERIES[slug]
  if (!gallery || gallery.length < 5) {
    throw new Error(
      `Destination "${name}" (${slug}) needs at least 5 verified gallery images. ` +
        'Add them to DESTINATION_GALLERIES and run scripts/validate-images.ts.'
    )
  }
  const distinct = new Set(gallery)
  if (distinct.size !== gallery.length) {
    throw new Error(`Destination "${name}" (${slug}) has duplicate gallery images.`)
  }
  return gallery.map(unsplash)
}

async function seed() {
  console.log('Seeding destinations (idempotent upsert by slug)...')

  for (const dest of seedDestinations) {
    const gallery = resolveGallery(dest.slug, dest.name)

    // Upsert the destination row; existing IDs (and trip references) are kept.
    const [row] = await db
      .insert(destinations)
      .values({ ...dest, heroImage: gallery[0] })
      .onConflictDoUpdate({
        target: destinations.slug,
        set: {
          name: dest.name,
          country: dest.country,
          region: dest.region,
          shortDescription: dest.shortDescription,
          description: dest.description,
          moodTags: dest.moodTags,
          categoryTags: dest.categoryTags,
          estimatedCostMinor: dest.estimatedCostMinor,
          costCurrency: dest.costCurrency,
          suggestedDaysMin: dest.suggestedDaysMin,
          suggestedDaysMax: dest.suggestedDaysMax,
          highlights: dest.highlights,
          heroImage: gallery[0],
          imageCredit: dest.imageCredit,
          isPublished: dest.isPublished,
          popularity: dest.popularity,
          updatedAt: new Date(),
        },
      })
      .returning()

    if (!row) throw new Error(`Failed to upsert destination ${dest.slug}`)

    // Upsert the ordered image collection at stable positions (0..n-1) and
    // remove any stale images beyond the curated gallery length.
    for (let position = 0; position < gallery.length; position++) {
      await db
        .insert(destinationImages)
        .values({
          destinationId: row.id,
          url: gallery[position],
          alt: `${dest.name} — photo ${position + 1}`,
          position,
        })
        .onConflictDoUpdate({
          target: [destinationImages.destinationId, destinationImages.position],
          set: { url: gallery[position], alt: `${dest.name} — photo ${position + 1}` },
        })
    }

    await db
      .delete(destinationImages)
      .where(and(eq(destinationImages.destinationId, row.id), gte(destinationImages.position, gallery.length)))

    console.log(`Seeded: ${dest.name} (${gallery.length} images)`)
  }

  console.log('Seeding complete!')
  process.exit(0)
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
