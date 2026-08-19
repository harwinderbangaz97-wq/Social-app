export interface ChatWallpaper {
  id: string;
  name: string;
  category: 'minimal' | 'gradient' | 'nature' | 'dark' | 'custom';
  thumbnail: string;
  type: 'image' | 'gradient' | 'pattern' | 'solid';
  value: string; // url, gradient css, or color
  description: string;
}

export const CHAT_WALLPAPERS: ChatWallpaper[] = [
  // --- 1. MINIMAL & PATTERNS ---
  {
    id: 'clean-default',
    name: 'Clean Neumorphic',
    category: 'minimal',
    thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&auto=format&fit=crop&q=80',
    type: 'solid',
    value: 'transparent',
    description: 'Default clean tactile backdrop',
  },
  {
    id: 'dot-grid',
    name: 'Zen Dot Matrix',
    category: 'minimal',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    type: 'pattern',
    value: 'radial-gradient(rgba(91, 157, 255, 0.25) 1.5px, transparent 1.5px)',
    description: 'Subtle geometric dot array',
  },
  {
    id: 'architect-grid',
    name: 'Architect Grid',
    category: 'minimal',
    thumbnail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&auto=format&fit=crop&q=80',
    type: 'pattern',
    value: 'linear-gradient(to right, rgba(91, 157, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(91, 157, 255, 0.1) 1px, transparent 1px)',
    description: 'Clean drafting coordinates',
  },

  // --- 2. SOFT AESTHETIC GRADIENTS ---
  {
    id: 'pastel-aurora',
    name: 'Pastel Aurora',
    category: 'gradient',
    thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&auto=format&fit=crop&q=80',
    type: 'gradient',
    value: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    description: 'Soft lilac & sky blue wash',
  },
  {
    id: 'sunset-blush',
    name: 'Sunset Blush',
    category: 'gradient',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80',
    type: 'gradient',
    value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
    description: 'Warm peach & rose radiance',
  },
  {
    id: 'ocean-mist',
    name: 'Ocean Mist',
    category: 'gradient',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format&fit=crop&q=80',
    type: 'gradient',
    value: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    description: 'Gentle coastal morning surf',
  },
  {
    id: 'matcha-calm',
    name: 'Matcha Herb',
    category: 'gradient',
    thumbnail: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=200&auto=format&fit=crop&q=80',
    type: 'gradient',
    value: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
    description: 'Refreshing botanical mint & matcha',
  },
  {
    id: 'golden-champagne',
    name: 'Golden Glow',
    category: 'gradient',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&auto=format&fit=crop&q=80',
    type: 'gradient',
    value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    description: 'Warm honey dusk luminescence',
  },

  // --- 3. CALM & AESTHETIC NATURE PHOTOGRAPHY ---
  {
    id: 'alpine-fog',
    name: 'Alpine Fog',
    category: 'nature',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&auto=format&fit=crop&q=80',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80',
    description: 'Misty pine forest & mountain haze',
  },
  {
    id: 'botanical-palm',
    name: 'Monstera Shadow',
    category: 'nature',
    thumbnail: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=200&auto=format&fit=crop&q=80',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1000&auto=format&fit=crop&q=80',
    description: 'Minimalist organic shadows & flora',
  },
  {
    id: 'desert-dune',
    name: 'Silk Dune Sand',
    category: 'nature',
    thumbnail: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=200&auto=format&fit=crop&q=80',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1000&auto=format&fit=crop&q=80',
    description: 'Harmonious desert curves & ripples',
  },
  {
    id: 'tokyo-rain',
    name: 'Rain Bokeh',
    category: 'nature',
    thumbnail: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=200&auto=format&fit=crop&q=80',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1000&auto=format&fit=crop&q=80',
    description: 'Warm night rain drops on window glass',
  },
  {
    id: 'coastal-horizon',
    name: 'Pacific Azure',
    category: 'nature',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format&fit=crop&q=80',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80',
    description: 'Soothing turquoise ocean ripples',
  },

  // --- 4. DARK & ATMOSPHERIC ---
  {
    id: 'midnight-obsidian',
    name: 'Midnight Obsidian',
    category: 'dark',
    thumbnail: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=200&auto=format&fit=crop&q=80',
    type: 'gradient',
    value: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #090d16 100%)',
    description: 'Deep starlit midnight slate',
  },
  {
    id: 'cyber-neon-dark',
    name: 'Cyber Violet Night',
    category: 'dark',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=200&auto=format&fit=crop&q=80',
    type: 'gradient',
    value: 'linear-gradient(135deg, #180d2b 0%, #2e1065 50%, #0d061a 100%)',
    description: 'Electric violet twilight ambiance',
  },
  {
    id: 'cosmos-stars',
    name: 'Cosmic Starlight',
    category: 'dark',
    thumbnail: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=200&auto=format&fit=crop&q=80',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1000&auto=format&fit=crop&q=80',
    description: 'Quiet starry galaxy night sky',
  },
];
