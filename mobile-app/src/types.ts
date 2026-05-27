export type Role = "customer" | "seller" | "driver" | "admin" | "super-admin";
export type AuthStatus = "active" | "pending" | "disabled";
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

export type AuthUser = {
  id: string;
  full_name: string;
  email: string;
  password: string;
  role: Role;
  status: AuthStatus;
  address: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  kind: ItemType | null;
};

export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  description: string;
  image_url: string;
  rating: number;
  delivery_minutes: string;
};

export type Meal = {
  id: string;
  restaurant_id: string;
  category_slug: string;
  name: string;
  description: string;
  image_url: string;
  price_cents: number;
  prep_minutes: number;
};

export type Product = {
  id: string;
  category_slug: string;
  name: string;
  description: string;
  image_url: string;
  price_cents: number;
  stock: number;
  is_available?: boolean;
};

export type CartItem = {
  id: string;
  type: ItemType;
  quantity: number;
};

export type DemoOrder = {
  id: string;
  status: OrderStatus;
  total_cents: number;
  placed_at: string;
  items: string[];
};
