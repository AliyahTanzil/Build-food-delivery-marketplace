export type Role = "customer" | "seller" | "driver" | "admin";
export type ItemType = "meal" | "product";
export type OrderStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "preparing"
  | "ready"
  | "picked_up"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export type Address = {
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
  deliveryInstructions?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  kind: ItemType | null;
};

export type Product = {
  id: string;
  seller_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  price_cents: number;
  stock: number;
  is_available: boolean;
};

export type Meal = {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  price_cents: number;
  prep_minutes: number;
  is_available: boolean;
};

export type Restaurant = {
  id: string;
  seller_id: string;
  name: string;
  description: string | null;
  cuisine: string | null;
  image_url: string | null;
  address: Address;
  is_open: boolean;
};

export type CartLine = {
  id: string;
  item_type: ItemType;
  product_id: string | null;
  meal_id: string | null;
  quantity: number;
  products?: Product | null;
  meals?: Meal | null;
};
