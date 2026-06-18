// Mocked sample data for the Brandboard AI frontend.
// No external services are called; everything here is static sample content.

export type ColorSwatch = {
  hex: string;
  name: string;
  role: string;
};

export type TypeStyle = {
  family: string;
  role: string;
  weight: string;
  sample: string;
  source: string;
};

export type Competitor = {
  name: string;
  positioning: string;
  initial: string;
  accent: string;
};

export type Insight = {
  title: string;
  body: string;
  tag: "Opportunity" | "Strength" | "Risk" | "Recommendation";
};

export type SocialStat = {
  platform: string;
  handle: string;
  followers: string;
  engagement: string;
};

export type VisualReference = {
  id: string;
  url: string;
  label: string;
  category: "Photography" | "Packaging" | "Typography" | "Texture" | "Layout";
};

export type Brand = {
  slug: string;
  name: string;
  url: string;
  industry: string;
  logoMark: string; // single glyph / monogram used for the mocked logo
  logoColor: string;
  tagline: string;
  summary: string;
  mission: string;
  positioning: string;
  personality: string[];
  colors: ColorSwatch[];
  typography: TypeStyle[];
  photographyStyle: string;
  competitors: Competitor[];
  insights: Insight[];
  social: SocialStat[];
  references: VisualReference[];
};

const unsplash = (id: string, w = 600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const BRANDS: Brand[] = [
  {
    slug: "airbnb",
    name: "Airbnb",
    url: "airbnb.com",
    industry: "Travel & Hospitality",
    logoMark: "A",
    logoColor: "#FF5A5F",
    tagline: "Belong anywhere",
    summary:
      "Airbnb is a global travel marketplace that connects hosts and guests through unique stays and experiences. The brand centers on belonging, human warmth, and the idea that anyone can feel at home anywhere in the world.",
    mission:
      "Create a world where anyone can belong anywhere, making travel more local, authentic, and human.",
    positioning:
      "A community-driven alternative to traditional hospitality, trading sterile uniformity for character, locality, and connection.",
    personality: ["Warm", "Welcoming", "Adventurous", "Human", "Inclusive"],
    colors: [
      { hex: "#FF5A5F", name: "Rausch", role: "Primary" },
      { hex: "#FF385C", name: "Bēri", role: "Accent" },
      { hex: "#484848", name: "Hof", role: "Text" },
      { hex: "#767676", name: "Foggy", role: "Muted" },
      { hex: "#FFFFFF", name: "White", role: "Surface" },
    ],
    typography: [
      {
        family: "Cereal",
        role: "Display",
        weight: "Bold",
        sample: "Belong anywhere",
        source: "Custom typeface",
      },
      {
        family: "Cereal",
        role: "Body",
        weight: "Book",
        sample: "Find homes and experiences hosted by locals.",
        source: "Custom typeface",
      },
    ],
    photographyStyle:
      "Authentic, lifestyle-led imagery featuring real people in real spaces. Warm natural light, candid moments, and a strong sense of place over staged perfection.",
    competitors: [
      {
        name: "Booking.com",
        positioning: "Breadth and price-led convenience",
        initial: "B",
        accent: "#003580",
      },
      {
        name: "Vrbo",
        positioning: "Whole-home family vacations",
        initial: "V",
        accent: "#3D5AFE",
      },
      {
        name: "Marriott",
        positioning: "Trusted premium hospitality",
        initial: "M",
        accent: "#A50034",
      },
    ],
    insights: [
      {
        title: "Lean into experiences",
        body: "Experiences differentiate Airbnb from pure-play booking sites. Elevating them in the visual hierarchy reinforces the 'belong' narrative.",
        tag: "Opportunity",
      },
      {
        title: "Iconic, ownable color",
        body: "The Rausch coral is instantly recognizable. Maintaining its dominance across touchpoints protects strong brand equity.",
        tag: "Strength",
      },
      {
        title: "Trust signaling",
        body: "As listings scale, consistent trust cues (reviews, verification, host quality) should remain visually prominent.",
        tag: "Recommendation",
      },
    ],
    social: [
      { platform: "Instagram", handle: "@airbnb", followers: "5.1M", engagement: "1.8%" },
      { platform: "TikTok", handle: "@airbnb", followers: "780K", engagement: "4.2%" },
      { platform: "X", handle: "@airbnb", followers: "820K", engagement: "0.6%" },
    ],
    references: [
      { id: "r1", url: unsplash("1501785888041-af3ef285b470"), label: "Mountain retreat", category: "Photography" },
      { id: "r2", url: unsplash("1522708323590-d24dbb6b0267"), label: "Cozy interior", category: "Photography" },
      { id: "r3", url: unsplash("1560448204-e02f11c3d0e2"), label: "Modern living", category: "Layout" },
      { id: "r4", url: unsplash("1505691938895-1758d7feb511"), label: "Warm textures", category: "Texture" },
    ],
  },
  {
    slug: "sweetgreen",
    name: "Sweetgreen",
    url: "sweetgreen.com",
    industry: "Food & Beverage",
    logoMark: "S",
    logoColor: "#0B7A4B",
    tagline: "Building healthier communities",
    summary:
      "Sweetgreen is a fast-casual restaurant brand built on seasonal, locally sourced food. Its identity blends wellness, sustainability, and modern minimalism to make healthy eating feel effortless and aspirational.",
    mission:
      "Build healthier communities by connecting people to real food, sourced from farmers we trust.",
    positioning:
      "The premium-yet-accessible leader in healthy fast-casual dining, where transparency and sourcing are part of the product.",
    personality: ["Fresh", "Optimistic", "Honest", "Modern", "Grounded"],
    colors: [
      { hex: "#0B7A4B", name: "Sweet Green", role: "Primary" },
      { hex: "#C7E8A6", name: "Sprout", role: "Accent" },
      { hex: "#1A1A1A", name: "Charcoal", role: "Text" },
      { hex: "#F4F1E9", name: "Cream", role: "Surface" },
      { hex: "#E8B23A", name: "Harvest", role: "Highlight" },
    ],
    typography: [
      {
        family: "Sohne",
        role: "Display",
        weight: "Kräftig",
        sample: "Real food, real fast",
        source: "Klim Type Foundry",
      },
      {
        family: "Sohne",
        role: "Body",
        weight: "Buch",
        sample: "Seasonal menus sourced from local farms.",
        source: "Klim Type Foundry",
      },
    ],
    photographyStyle:
      "Top-down food photography with vibrant, fresh ingredients on natural surfaces. Bright, clean daylight and a celebration of texture and color.",
    competitors: [
      { name: "Chipotle", positioning: "Scale and customization", initial: "C", accent: "#A81612" },
      { name: "Cava", positioning: "Mediterranean bowls", initial: "C", accent: "#5A2A82" },
      { name: "Just Salad", positioning: "Value-led healthy", initial: "J", accent: "#3DAE2B" },
    ],
    insights: [
      {
        title: "Own seasonality",
        body: "Rotating, season-driven visuals keep the brand feeling fresh and reinforce the sourcing story competitors can't easily copy.",
        tag: "Opportunity",
      },
      {
        title: "Calm, confident palette",
        body: "The restrained green-and-cream system reads premium and trustworthy in a loud category.",
        tag: "Strength",
      },
      {
        title: "Digital-first menus",
        body: "Lean further into app-native moments; the brand's clean type system translates well to small screens.",
        tag: "Recommendation",
      },
    ],
    social: [
      { platform: "Instagram", handle: "@sweetgreen", followers: "620K", engagement: "2.4%" },
      { platform: "TikTok", handle: "@sweetgreen", followers: "210K", engagement: "5.1%" },
      { platform: "X", handle: "@sweetgreen", followers: "94K", engagement: "0.9%" },
    ],
    references: [
      { id: "r1", url: unsplash("1512621776951-a57141f2eefd"), label: "Fresh bowl", category: "Photography" },
      { id: "r2", url: unsplash("1490645935967-10de6ba17061"), label: "Ingredients", category: "Photography" },
      { id: "r3", url: unsplash("1467453678174-768ec283a940"), label: "Greens", category: "Texture" },
      { id: "r4", url: unsplash("1540420773420-3366772f4999"), label: "Plated", category: "Layout" },
    ],
  },
];

export const DEFAULT_BRAND = BRANDS[0];

export function getBrand(slug: string): Brand {
  return BRANDS.find((b) => b.slug === slug) ?? DEFAULT_BRAND;
}

// ---------------------------------------------------------------------------
// Projects (dashboard)
// ---------------------------------------------------------------------------

export type Project = {
  id: string;
  title: string;
  description: string;
  type: "Audit" | "Moodboard";
  status: "Ready" | "Generating" | "Draft";
  coverColor: string;
  updatedAt: string;
  boards: number;
  thumb: string;
};

export const PROJECTS: Project[] = [
  {
    id: "airbnb",
    title: "Airbnb",
    description: "Full brand audit — travel & hospitality",
    type: "Audit",
    status: "Ready",
    coverColor: "#FF5A5F",
    updatedAt: "2h ago",
    boards: 2,
    thumb: unsplash("1501785888041-af3ef285b470", 400),
  },
  {
    id: "sweetgreen",
    title: "Sweetgreen",
    description: "Brand audit — healthy fast-casual",
    type: "Audit",
    status: "Ready",
    coverColor: "#0B7A4B",
    updatedAt: "Yesterday",
    boards: 1,
    thumb: unsplash("1512621776951-a57141f2eefd", 400),
  },
  {
    id: "skincare",
    title: "Japanese Luxury Skincare",
    description: "Moodboard — minimalist wellness concept",
    type: "Moodboard",
    status: "Ready",
    coverColor: "#A89A82",
    updatedAt: "2 days ago",
    boards: 3,
    thumb: unsplash("1556228578-8c89e6adf883", 400),
  },
  {
    id: "coffee",
    title: "Sustainable Coffee Co.",
    description: "Moodboard — earthy, artisanal direction",
    type: "Moodboard",
    status: "Generating",
    coverColor: "#6F4E37",
    updatedAt: "Just now",
    boards: 0,
    thumb: unsplash("1447933601403-0c6688de566e", 400),
  },
  {
    id: "wellness",
    title: "Wellness Studio",
    description: "Moodboard — calm, organic, modern",
    type: "Moodboard",
    status: "Draft",
    coverColor: "#7C9082",
    updatedAt: "5 days ago",
    boards: 1,
    thumb: unsplash("1545205597-3d9d02c29597", 400),
  },
  {
    id: "fintech",
    title: "Fintech Startup",
    description: "Brand audit — bold, trustworthy direction",
    type: "Audit",
    status: "Ready",
    coverColor: "#3D5AFE",
    updatedAt: "1 week ago",
    boards: 2,
    thumb: unsplash("1551288049-bebda4e38f71", 400),
  },
];

export const TEMPLATES = [
  { id: "t1", name: "Brand Audit", description: "Logo, palette, type, competitors", icon: "search", accent: "#FF5A5F" },
  { id: "t2", name: "Moodboard", description: "Visual references & themes", icon: "layout", accent: "#7C5CFF" },
  { id: "t3", name: "Color System", description: "Palette exploration", icon: "palette", accent: "#0B7A4B" },
  { id: "t4", name: "Competitor Map", description: "Landscape analysis", icon: "target", accent: "#E8B23A" },
];

export const EXAMPLE_PROMPTS = [
  "Audit Airbnb",
  "Audit Sweetgreen",
  "Luxury skincare startup",
  "Japanese-inspired wellness brand",
  "Sustainable coffee company",
  "Bold fintech for Gen Z",
];

// ---------------------------------------------------------------------------
// Canvas (moodboard) cards
// ---------------------------------------------------------------------------

export type CanvasCard =
  | {
      id: string;
      kind: "image";
      x: number;
      y: number;
      w: number;
      h: number;
      rotation: number;
      url: string;
      label: string;
    }
  | {
      id: string;
      kind: "color";
      x: number;
      y: number;
      w: number;
      h: number;
      rotation: number;
      hex: string;
      name: string;
    }
  | {
      id: string;
      kind: "type";
      x: number;
      y: number;
      w: number;
      h: number;
      rotation: number;
      family: string;
      sample: string;
    }
  | {
      id: string;
      kind: "note";
      x: number;
      y: number;
      w: number;
      h: number;
      rotation: number;
      text: string;
    }
  | {
      id: string;
      kind: "section";
      x: number;
      y: number;
      w: number;
      h: number;
      rotation: number;
      title: string;
    };

export const CANVAS_CARDS: CanvasCard[] = [
  { id: "sec1", kind: "section", x: 60, y: 40, w: 520, h: 420, rotation: 0, title: "Photography Direction" },
  { id: "img1", kind: "image", x: 90, y: 100, w: 220, h: 150, rotation: -2, url: unsplash("1556228578-8c89e6adf883", 500), label: "Minimal ritual" },
  { id: "img2", kind: "image", x: 330, y: 90, w: 220, h: 280, rotation: 2, url: unsplash("1620916566398-39f1143ab7be", 500), label: "Soft light" },
  { id: "img3", kind: "image", x: 90, y: 270, w: 220, h: 180, rotation: 1, url: unsplash("1571781926291-c477ebfd024b", 500), label: "Texture study" },

  { id: "sec2", kind: "section", x: 640, y: 40, w: 360, h: 220, rotation: 0, title: "Color System" },
  { id: "col1", kind: "color", x: 670, y: 100, w: 90, h: 120, rotation: 0, hex: "#A89A82", name: "Clay" },
  { id: "col2", kind: "color", x: 770, y: 100, w: 90, h: 120, rotation: 0, hex: "#E8E2D5", name: "Sand" },
  { id: "col3", kind: "color", x: 870, y: 100, w: 90, h: 120, rotation: 0, hex: "#2B2B26", name: "Ink" },

  { id: "type1", kind: "type", x: 640, y: 300, w: 360, h: 150, rotation: 0, family: "Canela Deck", sample: "Quiet luxury" },

  { id: "note1", kind: "note", x: 1040, y: 80, w: 230, h: 160, rotation: -1, text: "Lean into negative space and tactile materials — paper, ceramic, linen. Restraint signals premium." },
  { id: "img4", kind: "image", x: 1040, y: 270, w: 230, h: 190, rotation: 2, url: unsplash("1612817288484-6f916006741a", 500), label: "Packaging mock" },
];

export const CANVAS_PROJECT = {
  name: "Japanese Luxury Skincare",
  boardName: "Moodboard v1",
  summary:
    "A minimalist wellness brand rooted in Japanese ritual and quiet luxury. The visual world favors restraint, natural materials, and soft, diffused light.",
  recommendations: [
    "Anchor the palette in warm neutrals with a single deep accent.",
    "Use a high-contrast serif for headlines to signal craft and heritage.",
    "Favor tactile, material-led photography over lifestyle clichés.",
    "Embrace generous whitespace as a core brand asset.",
  ],
};

export const SIDEBAR_ASSETS = {
  colors: ["#A89A82", "#E8E2D5", "#2B2B26", "#C9B79C", "#6B6256"],
  typography: ["Canela Deck", "Sohne", "GT America", "Reckless"],
  images: [
    unsplash("1556228578-8c89e6adf883", 200),
    unsplash("1620916566398-39f1143ab7be", 200),
    unsplash("1571781926291-c477ebfd024b", 200),
    unsplash("1612817288484-6f916006741a", 200),
  ],
};

// ---------------------------------------------------------------------------
// Generation pipeline steps (New Audit mocked progress)
// ---------------------------------------------------------------------------

export const PIPELINE_STEPS = [
  "Fetching brand assets",
  "Analyzing brand positioning",
  "Identifying target audience",
  "Mapping competitive landscape",
  "Generating strategic insights",
  "Saving audit report",
];
