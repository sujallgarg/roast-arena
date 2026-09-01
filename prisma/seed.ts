import { PrismaClient, BattleStatus } from "@prisma/client";
import crypto from "crypto";

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting enterprise seed for Roast Arena...");

  // 1. Seed Real Brands
  const brandsData = [
    {
      name: "NIKE",
      slug: "nike",
      handle: "@nike",
      logoUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80",
      verifiedBadge: true,
      brandColor: "#ef4444",
      description: "Just Do It. Athletic footwear, apparel, and competitive roast firepower.",
      website: "https://nike.com",
    },
    {
      name: "ADIDAS",
      slug: "adidas",
      handle: "@adidas",
      logoUrl: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=150&auto=format&fit=crop&q=80",
      verifiedBadge: true,
      brandColor: "#3b82f6",
      description: "Impossible Is Nothing. Three stripes, iconic streetwear, and legendary heritage.",
      website: "https://adidas.com",
    },
    {
      name: "McDonald's",
      slug: "mcdonalds",
      handle: "@mcdonalds",
      logoUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=150&auto=format&fit=crop&q=80",
      verifiedBadge: true,
      brandColor: "#eab308",
      description: "I'm Lovin' It. Golden arches and unmatched fry supremacy.",
      website: "https://mcdonalds.com",
    },
    {
      name: "Burger King",
      slug: "burgerking",
      handle: "@burgerking",
      logoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&auto=format&fit=crop&q=80",
      verifiedBadge: true,
      brandColor: "#f97316",
      description: "Have It Your Way. Flame-grilled since 1954 and never afraid of smoke.",
      website: "https://bk.com",
    },
    {
      name: "Tesla",
      slug: "tesla",
      handle: "@tesla",
      logoUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=150&auto=format&fit=crop&q=80",
      verifiedBadge: true,
      brandColor: "#dc2626",
      description: "Accelerating the world's transition to sustainable energy with blistering torque.",
      website: "https://tesla.com",
    },
    {
      name: "BYD",
      slug: "byd",
      handle: "@byd",
      logoUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=150&auto=format&fit=crop&q=80",
      verifiedBadge: true,
      brandColor: "#0284c7",
      description: "Build Your Dreams. Dominating the global EV race with volume and blade batteries.",
      website: "https://byd.com",
    },
    {
      name: "Apple",
      slug: "apple",
      handle: "@apple",
      logoUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=150&auto=format&fit=crop&q=80",
      verifiedBadge: true,
      brandColor: "#64748b",
      description: "Think Different. Silicon power, seamless walled gardens, and premium design.",
      website: "https://apple.com",
    },
    {
      name: "Samsung",
      slug: "samsung",
      handle: "@samsung",
      logoUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=150&auto=format&fit=crop&q=80",
      verifiedBadge: true,
      brandColor: "#2563eb",
      description: "Do What You Can't. AMOLED displays, 100x zoom, and folding flagships.",
      website: "https://samsung.com",
    },
    {
      name: "Starbucks",
      slug: "starbucks",
      handle: "@starbucks",
      logoUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150&auto=format&fit=crop&q=80",
      verifiedBadge: true,
      brandColor: "#059669",
      description: "To inspire and nurture the human spirit – one cup and one neighborhood at a time.",
      website: "https://starbucks.com",
    },
    {
      name: "Dunkin'",
      slug: "dunkin",
      handle: "@dunkin",
      logoUrl: "https://images.unsplash.com/photo-1527515862127-a4fc05baf7a5?w=150&auto=format&fit=crop&q=80",
      verifiedBadge: true,
      brandColor: "#db2777",
      description: "America Runs on Dunkin'. Fast, bold coffee and irresistible glazed donuts.",
      website: "https://dunkindonuts.com",
    },
    {
      name: "Coca-Cola",
      slug: "cocacola",
      handle: "@cocacola",
      logoUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150&auto=format&fit=crop&q=80",
      verifiedBadge: true,
      brandColor: "#e11d48",
      description: "Taste the Feeling. Over a century of secret formulas and global soda dominance.",
      website: "https://coca-cola.com",
    },
    {
      name: "Pepsi",
      slug: "pepsi",
      handle: "@pepsi",
      logoUrl: "https://images.unsplash.com/photo-1553456558-aff63285bdd1?w=150&auto=format&fit=crop&q=80",
      verifiedBadge: true,
      brandColor: "#1d4ed8",
      description: "For the Love of It. The bold cola choice that sparked the original soda wars.",
      website: "https://pepsi.com",
    },
  ];

  const brandMap = new Map<string, string>();
  for (const b of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { ...b },
      create: { ...b },
    });
    brandMap.set(b.slug, brand.id);
  }
  console.log(`✓ Seeded ${brandsData.length} authentic brands`);

  // 2. Seed Real Battles
  const battlesData = [
    {
      slug: "nike-vs-adidas-clash",
      title: "NIKE vs ADIDAS: Sneakerhead Supremacy",
      description: "The global sportswear duel. Who rules the streets and dominates the arena?",
      status: BattleStatus.LIVE,
      roundCount: 5,
      brandAId: brandMap.get("nike")!,
      brandBId: brandMap.get("adidas")!,
      votesCountA: 11248,
      votesCountB: 7144,
      joinedCount: 18392,
      perkTitle: "25% OFF Arena Sneakerhead Drop",
      perkCode: "CLASH2026",
    },
    {
      slug: "mcdonalds-vs-burgerking-flame",
      title: "McDonald's vs Burger King: The Fry Wars",
      description: "Golden Arches versus Flame-Grilled royalty. Who makes the crispiest roast?",
      status: BattleStatus.LIVE,
      roundCount: 5,
      brandAId: brandMap.get("mcdonalds")!,
      brandBId: brandMap.get("burgerking")!,
      votesCountA: 8420,
      votesCountB: 7910,
      joinedCount: 16330,
      perkTitle: "Free Fries on Your Next Order",
      perkCode: "FLAMEKING",
    },
    {
      slug: "tesla-vs-byd-ev-showdown",
      title: "Tesla vs BYD: The Electric Empire",
      description: "Cyberpunk acceleration versus mass manufacturing prowess. The EV crown is on the line.",
      status: BattleStatus.LIVE,
      roundCount: 5,
      brandAId: brandMap.get("tesla")!,
      brandBId: brandMap.get("byd")!,
      votesCountA: 9540,
      votesCountB: 8820,
      joinedCount: 18360,
      perkTitle: "30 Days Free Supercharging Pass",
      perkCode: "VOLTAGE2026",
    },
    {
      slug: "apple-vs-samsung-flagship",
      title: "Apple vs Samsung: Ecosystem Clash",
      description: "Walled garden elegance versus folding innovation. Who builds the superior tech universe?",
      status: BattleStatus.ENDED,
      roundCount: 5,
      brandAId: brandMap.get("apple")!,
      brandBId: brandMap.get("samsung")!,
      votesCountA: 24500,
      votesCountB: 21300,
      joinedCount: 45800,
      winnerBrandId: brandMap.get("apple")!,
      perkTitle: "1 Year Apple Music Subscription Voucher",
      perkCode: "TIMCOOKROAST",
    },
    {
      slug: "starbucks-vs-dunkin-roast",
      title: "Starbucks vs Dunkin': The Caffeine Colosseum",
      description: "Artisanal espresso snobbery versus blue-collar quick-serve energy. Pick your brew.",
      status: BattleStatus.UPCOMING,
      roundCount: 5,
      brandAId: brandMap.get("starbucks")!,
      brandBId: brandMap.get("dunkin")!,
      votesCountA: 3200,
      votesCountB: 2900,
      joinedCount: 6100,
      perkTitle: "Buy 1 Get 1 Free Cold Brew",
      perkCode: "ESPRESSO50",
    },
    {
      slug: "cocacola-vs-pepsi-carbonated",
      title: "Coca-Cola vs Pepsi: The Classic Soda Showdown",
      description: "The grandfather of all brand wars. Millions of bubbles, two secret recipes, one victor.",
      status: BattleStatus.ENDED,
      roundCount: 5,
      brandAId: brandMap.get("cocacola")!,
      brandBId: brandMap.get("pepsi")!,
      votesCountA: 31200,
      votesCountB: 28400,
      joinedCount: 59600,
      winnerBrandId: brandMap.get("cocacola")!,
      perkTitle: "Free 12-Pack Soda Coupon",
      perkCode: "REALMAGIC",
    },
  ];

  for (const b of battlesData) {
    await prisma.battle.upsert({
      where: { slug: b.slug },
      update: { ...b },
      create: { ...b },
    });
  }
  console.log(`✓ Seeded ${battlesData.length} authentic battles`);

  // 3. Seed Top Authentic Roasters (for Leaderboard & Community)
  const passwordHash = hashPassword("RoastArena2026!");
  const roastersData = [
    {
      name: "Alex 'The Grill' Vance",
      username: "alexgrill",
      email: "alex@roastarena.gg",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      points: 12480,
      level: "Level 17 • Arena Icon",
      bio: "Unapologetic sneaker critic. If your kicks are mid, I will flame them in 4K.",
      location: "New York, USA",
      currentStreak: 14,
      longestStreak: 21,
    },
    {
      name: "Sarah 'Savage' Connor",
      username: "sarahsavage",
      email: "sarah@roastarena.gg",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
      points: 9840,
      level: "Level 14 • Battle Legend",
      bio: "Terminating boring corporate marketing one punchline at a time.",
      location: "London, UK",
      currentStreak: 9,
      longestStreak: 15,
    },
    {
      name: "Marcus 'Flame' Chen",
      username: "marcuschen",
      email: "marcus@roastarena.gg",
      avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
      points: 8750,
      level: "Level 13 • Arena Master",
      bio: "Tech insider with zero filter. Cupertino and Seoul fear my comments.",
      location: "San Francisco, USA",
      currentStreak: 7,
      longestStreak: 12,
    },
    {
      name: "Elena 'Zinger' Rostova",
      username: "elenazinger",
      email: "elena@roastarena.gg",
      avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
      points: 7620,
      level: "Level 11 • Roast Prodigy",
      bio: "Fast food philosopher. The fries may be salty, but my roasts are saltier.",
      location: "Toronto, Canada",
      currentStreak: 5,
      longestStreak: 8,
    },
    {
      name: "David 'Irony' Kim",
      username: "davidirony",
      email: "david@roastarena.gg",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      points: 6450,
      level: "Level 10 • Duel Champion",
      bio: "I roast EV manufacturers while waiting at 250kW superchargers.",
      location: "Seoul, South Korea",
      currentStreak: 4,
      longestStreak: 6,
    },
    {
      name: "Maya 'Burn' Patel",
      username: "mayaburn",
      email: "maya@roastarena.gg",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
      points: 5890,
      level: "Level 9 • Firestarter",
      bio: "Cold brew addict and carbonated soda historian.",
      location: "Mumbai, India",
      currentStreak: 3,
      longestStreak: 5,
    },
  ];

  for (const r of roastersData) {
    await prisma.user.upsert({
      where: { username: r.username },
      update: { ...r },
      create: {
        ...r,
        password: passwordHash,
      },
    });
  }
  console.log(`✓ Seeded ${roastersData.length} authentic roasters`);

  console.log("🚀 Enterprise database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
