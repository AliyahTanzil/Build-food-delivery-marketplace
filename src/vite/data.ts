import type { ItemType, OrderStatus, Role } from "@/lib/types";

export type DemoCategory = {
  id: string;
  name: string;
  slug: string;
  kind: ItemType | null;
};

export type DemoRestaurant = {
  id: string;
  name: string;
  cuisine: string;
  description: string;
  image_url: string;
  rating: number;
  delivery_minutes: string;
};

export type DemoMeal = {
  id: string;
  restaurant_id: string;
  category_slug: string;
  name: string;
  description: string;
  image_url: string;
  price_cents: number;
  prep_minutes: number;
};

export type DemoProduct = {
  id: string;
  category_slug: string;
  name: string;
  description: string;
  image_url: string;
  price_cents: number;
  stock: number;
};

export type DemoOrder = {
  id: string;
  status: OrderStatus;
  total_cents: number;
  placed_at: string;
  items: string[];
};

export type DemoUser = {
  full_name: string;
  role: Role;
  address: string;
};

export const demoUser: DemoUser = {
  full_name: "Aminata Kamara",
  role: "customer",
  address: "18 Lumley Beach Road, Freetown"
};

export const categories: DemoCategory[] = [
  { id: "breakfast", name: "African Breakfast", slug: "breakfast", kind: "meal" },
  { id: "lunch", name: "Rice & Stews", slug: "lunch-bowls", kind: "meal" },
  { id: "bakery", name: "African Bakery", slug: "bakery", kind: null },
  { id: "pantry", name: "African Pantry", slug: "pantry", kind: "product" },
  { id: "snacks", name: "African Snacks & Drinks", slug: "snacks-drinks", kind: "product" }
];

export const restaurants: DemoRestaurant[] = [
  {
    id: "harbor-harvest",
    name: "Freetown Jollof House",
    cuisine: "Sierra Leonean",
    description: "Jollof rice, cassava leaf stew, pepper soup, and coastal West African plates.",
    image_url: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=1200&q=80",
    rating: 4.8,
    delivery_minutes: "25-35 min"
  },
  {
    id: "sunrise-dosa",
    name: "Lagos Suya Spot",
    cuisine: "Nigerian",
    description: "Smoky suya, egusi soup, pounded yam, moi moi, and party rice favorites.",
    image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
    rating: 4.7,
    delivery_minutes: "20-30 min"
  },
  {
    id: "baker-stone",
    name: "Accra Bowl Kitchen",
    cuisine: "Ghanaian",
    description: "Waakye, red red, kelewele, banku, tilapia, and fresh shito bowls.",
    image_url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
    rating: 4.9,
    delivery_minutes: "15-25 min"
  },
  {
    id: "mission-verde",
    name: "Addis Injera Table",
    cuisine: "Ethiopian",
    description: "Injera platters with doro wat, misir wat, tibs, greens, and berbere spice.",
    image_url: "https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=1200&q=80",
    rating: 4.6,
    delivery_minutes: "20-35 min"
  },
  {
    id: "olive-fig",
    name: "Dakar Yassa Grill",
    cuisine: "Senegalese",
    description: "Chicken yassa, thieboudienne, mafe, attieke plates, and hibiscus bissap.",
    image_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    rating: 4.8,
    delivery_minutes: "25-40 min"
  }
];

export const meals: DemoMeal[] = [
  {
    id: "salmon-bowl",
    restaurant_id: "harbor-harvest",
    category_slug: "lunch-bowls",
    name: "Cassava Leaf Stew with Rice",
    description: "Slow-cooked cassava leaves with palm oil, smoked fish, tender beef, and steamed rice.",
    image_url: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=1200&q=80",
    price_cents: 1895,
    prep_minutes: 25
  },
  {
    id: "dosa",
    restaurant_id: "sunrise-dosa",
    category_slug: "breakfast",
    name: "Egusi Soup with Pounded Yam",
    description: "Rich melon seed soup with greens, assorted meat, crayfish, and soft pounded yam.",
    image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
    price_cents: 1295,
    prep_minutes: 18
  },
  {
    id: "croissant",
    restaurant_id: "baker-stone",
    category_slug: "bakery",
    name: "Waakye Breakfast Bowl",
    description: "Rice and beans with shito, gari, egg, spaghetti, plantain, and spicy stew.",
    image_url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
    price_cents: 895,
    prep_minutes: 10
  },
  {
    id: "taco-plate",
    restaurant_id: "mission-verde",
    category_slug: "lunch-bowls",
    name: "Doro Wat Injera Platter",
    description: "Berbere chicken stew with egg, lentils, greens, and soft injera.",
    image_url: "https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=1200&q=80",
    price_cents: 1595,
    prep_minutes: 18
  },
  {
    id: "falafel-bowl",
    restaurant_id: "olive-fig",
    category_slug: "lunch-bowls",
    name: "Chicken Yassa with Jollof Rice",
    description: "Lemon-onion marinated chicken with fragrant jollof rice and grilled vegetables.",
    image_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    price_cents: 1395,
    prep_minutes: 15
  }
];

export const products: DemoProduct[] = [
  {
    id: "granola",
    category_slug: "pantry",
    name: "Premium Garri Pack",
    description: "Crisp cassava granules for eba, soaking, or quick pantry meals.",
    image_url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80",
    price_cents: 899,
    stock: 80
  },
  {
    id: "sourdough",
    category_slug: "bakery",
    name: "Sweet Agege Bread Loaf",
    description: "Soft West African bakery loaf for tea, stew, akara, or breakfast sandwiches.",
    image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
    price_cents: 950,
    stock: 35
  },
  {
    id: "chips",
    category_slug: "snacks-drinks",
    name: "Kelewele Spice Plantain Chips",
    description: "Crunchy plantain chips seasoned with ginger, chili, and warm Ghanaian spices.",
    image_url: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=1200&q=80",
    price_cents: 649,
    stock: 100
  },
  {
    id: "hummus",
    category_slug: "pantry",
    name: "Groundnut Stew Base",
    description: "Ready-to-cook peanut stew base with tomato, onion, chili, and African spices.",
    image_url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80",
    price_cents: 699,
    stock: 50
  },
  {
    id: "sparkler",
    category_slug: "snacks-drinks",
    name: "Hibiscus Bissap Bottle",
    description: "Chilled hibiscus drink with ginger, pineapple, mint, and a light sweetness.",
    image_url: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=1200&q=80",
    price_cents: 425,
    stock: 80
  }
];

export const orders: DemoOrder[] = [
  {
    id: "FL-1048",
    status: "on_the_way",
    total_cents: 3290,
    placed_at: "Today, 12:42 PM",
    items: ["Cassava Leaf Stew with Rice", "Hibiscus Bissap Bottle"]
  },
  {
    id: "FL-1039",
    status: "delivered",
    total_cents: 2244,
    placed_at: "Yesterday, 7:18 PM",
    items: ["Chicken Yassa with Jollof Rice", "Groundnut Stew Base"]
  }
];
