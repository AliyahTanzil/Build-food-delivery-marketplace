import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import type React from "react";
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { categories, meals, orders as initialOrders, products, restaurants, seedUsers } from "./src/data";
import type { AuthStatus, AuthUser, CartItem, DemoOrder, ItemType, OrderStatus, Product, Role } from "./src/types";
import { formatMoney, roleHome, slugify } from "./src/utils";

type Screen =
  | "home"
  | "login"
  | "signup"
  | "restaurants"
  | "products"
  | "detail"
  | "cart"
  | "checkout"
  | "orders"
  | "customer"
  | "seller"
  | "driver"
  | "admin";

type DetailTarget = { type: ItemType; id: string };

const roleScreens: Record<Role, Screen> = {
  customer: "customer",
  seller: "seller",
  driver: "driver",
  admin: "admin",
  "super-admin": "admin"
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [detailTarget, setDetailTarget] = useState<DetailTarget>({ type: "product", id: "granola" });
  const [users, setUsers] = useState<AuthUser[]>(seedUsers);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [productCatalog, setProductCatalog] = useState<Product[]>(products);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<DemoOrder[]>(initialOrders);
  const currentUser = useMemo(() => users.find((user) => user.id === currentUserId) ?? null, [currentUserId, users]);

  const openDetail = (target: DetailTarget) => {
    setDetailTarget(target);
    setScreen("detail");
  };

  const login = (email: string, password: string) => {
    const user = users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || user.password !== password) return "Email or password is incorrect.";
    if (user.status !== "active") return "This account is not active yet.";
    setCurrentUserId(user.id);
    setScreen(roleScreens[user.role]);
    return "";
  };

  const signup = (user: Omit<AuthUser, "id" | "status" | "address">) => {
    const email = user.email.trim().toLowerCase();
    if (users.some((item) => item.email.toLowerCase() === email)) return "An account with this email already exists.";
    const createdUser: AuthUser = {
      ...user,
      id: `${user.role}-${Date.now()}`,
      email,
      full_name: user.full_name.trim(),
      status: "active",
      address: "New delivery address"
    };
    setUsers((current) => [createdUser, ...current]);
    setCurrentUserId(createdUser.id);
    setScreen(roleScreens[createdUser.role]);
    return "";
  };

  const logout = () => {
    setCurrentUserId(null);
    setScreen("login");
  };

  const addToCart = (item: CartItem) => {
    setCart((current) => {
      const existing = current.find((line) => line.id === item.id && line.type === item.type);
      if (existing) {
        return current.map((line) => (line === existing ? { ...line, quantity: line.quantity + item.quantity } : line));
      }
      return [...current, item];
    });
    Alert.alert("Added to cart", "The item is ready for checkout.");
  };

  const updateCart = (item: CartItem) => {
    setCart((current) => current.map((line) => (line.id === item.id && line.type === item.type ? item : line)).filter((line) => line.quantity > 0));
  };

  const addProduct = (product: Product) => {
    setProductCatalog((current) => [product, ...current]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProductCatalog((current) => current.map((product) => (product.id === id ? { ...product, ...updates } : product)));
  };

  const deleteProduct = (id: string) => {
    setProductCatalog((current) => current.filter((product) => product.id !== id));
    setCart((current) => current.filter((item) => item.type !== "product" || item.id !== id));
  };

  const addUser = (user: Omit<AuthUser, "id">) => {
    const email = user.email.trim().toLowerCase();
    if (users.some((item) => item.email.toLowerCase() === email)) return "An account with this email already exists.";
    setUsers((current) => [{ ...user, id: `${user.role}-${Date.now()}`, email, full_name: user.full_name.trim() }, ...current]);
    return "";
  };

  const updateUser = (id: string, updates: Partial<AuthUser>) => {
    setUsers((current) => current.map((user) => {
      if (user.id !== id) return user;
      const next = { ...user, ...updates };
      if (id === currentUserId) {
        next.role = user.role;
        next.status = user.status;
      }
      next.email = next.email.trim().toLowerCase();
      next.full_name = next.full_name.trim();
      return next;
    }));
  };

  const deleteUser = (id: string) => {
    if (id === currentUserId) return;
    setUsers((current) => current.filter((user) => user.id !== id));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <Header currentUser={currentUser} setScreen={setScreen} logout={logout} />
      {screen === "home" ? <HomeScreen setScreen={setScreen} openDetail={openDetail} productCatalog={productCatalog} /> : null}
      {screen === "login" ? <AuthScreen mode="login" users={users} login={login} signup={signup} setScreen={setScreen} /> : null}
      {screen === "signup" ? <AuthScreen mode="signup" users={users} login={login} signup={signup} setScreen={setScreen} /> : null}
      {screen === "restaurants" ? <RestaurantsScreen openDetail={openDetail} /> : null}
      {screen === "products" ? <ProductsScreen productCatalog={productCatalog} openDetail={openDetail} /> : null}
      {screen === "detail" ? <DetailScreen target={detailTarget} productCatalog={productCatalog} addToCart={addToCart} /> : null}
      {screen === "cart" ? <CartScreen cart={cart} productCatalog={productCatalog} updateCart={updateCart} setScreen={setScreen} /> : null}
      {screen === "checkout" ? <CheckoutScreen cart={cart} productCatalog={productCatalog} user={currentUser} setOrders={setOrders} setCart={setCart} setScreen={setScreen} /> : null}
      {screen === "orders" ? <OrdersScreen orders={orders} /> : null}
      {screen === "customer" ? <Protected role="customer" currentUser={currentUser} setScreen={setScreen}><CustomerDashboard user={currentUser} orders={orders} setScreen={setScreen} /></Protected> : null}
      {screen === "seller" ? <Protected role="seller" currentUser={currentUser} setScreen={setScreen}><SellerDashboard user={currentUser} productCatalog={productCatalog} addProduct={addProduct} updateProduct={updateProduct} deleteProduct={deleteProduct} /></Protected> : null}
      {screen === "driver" ? <Protected role="driver" currentUser={currentUser} setScreen={setScreen}><DriverDashboard user={currentUser} orders={orders} setOrders={setOrders} /></Protected> : null}
      {screen === "admin" ? <Protected role="admin" currentUser={currentUser} setScreen={setScreen}><AdminDashboard user={currentUser} users={users} addUser={addUser} updateUser={updateUser} deleteUser={deleteUser} /></Protected> : null}
    </SafeAreaView>
  );
}

function Header({
  currentUser,
  setScreen,
  logout
}: {
  currentUser: AuthUser | null;
  setScreen: (screen: Screen) => void;
  logout: () => void;
}) {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => setScreen("home")}>
        <Text style={styles.logo}>FreshLane</Text>
      </Pressable>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nav}>
        <NavButton label="Food" onPress={() => setScreen("restaurants")} />
        <NavButton label="Market" onPress={() => setScreen("products")} />
        <NavButton label="Cart" onPress={() => setScreen("cart")} />
        <NavButton label="Orders" onPress={() => setScreen("orders")} />
        {currentUser ? (
          <>
            <NavButton label={currentUser.full_name.split(" ")[0]} onPress={() => setScreen(roleScreens[currentUser.role])} />
            <NavButton label="Logout" onPress={logout} />
          </>
        ) : (
          <>
            <NavButton label="Login" onPress={() => setScreen("login")} />
            <NavButton label="Signup" onPress={() => setScreen("signup")} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

function NavButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.navButton} onPress={onPress}>
      <Text style={styles.navText}>{label}</Text>
    </Pressable>
  );
}

function Protected({
  role,
  currentUser,
  setScreen,
  children
}: {
  role: Role;
  currentUser: AuthUser | null;
  setScreen: (screen: Screen) => void;
  children: React.ReactNode;
}) {
  if (!currentUser) {
    return (
      <ScreenWrap>
        <Empty title="Login required" body={`This is a protected ${role} area.`} action="Log in" onPress={() => setScreen("login")} />
      </ScreenWrap>
    );
  }
  if (currentUser.role !== role && currentUser.role !== "super-admin") {
    return (
      <ScreenWrap>
        <Empty title="Wrong account role" body={`${currentUser.full_name} is logged in as ${currentUser.role}.`} action="My dashboard" onPress={() => setScreen(roleHome(currentUser.role))} />
      </ScreenWrap>
    );
  }
  return <>{children}</>;
}

function ScreenWrap({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      {children}
    </ScrollView>
  );
}

function HomeScreen({
  setScreen,
  openDetail,
  productCatalog
}: {
  setScreen: (screen: Screen) => void;
  openDetail: (target: DetailTarget) => void;
  productCatalog: Product[];
}) {
  return (
    <ScreenWrap>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Food delivery and African marketplace</Text>
        <Text style={styles.heroTitle}>Prepared meals, pantry favorites, and local sellers in one checkout.</Text>
        <Text style={styles.heroBody}>Order restaurant meals and packaged foods while sellers, drivers, and admins manage fulfillment from role dashboards.</Text>
        <View style={styles.row}>
          <PrimaryButton label="Order food" onPress={() => setScreen("restaurants")} />
          <SecondaryButton label="Shop products" onPress={() => setScreen("products")} />
        </View>
      </View>
      <SectionTitle title="Food categories" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => (
          <Pressable key={category.id} style={styles.categoryPill} onPress={() => setScreen(category.kind === "meal" ? "restaurants" : "products")}>
            <Text style={styles.categoryText}>{category.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <SectionTitle title="Popular restaurants" />
      {restaurants.slice(0, 3).map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}
      <SectionTitle title="Featured meals" />
      {meals.slice(0, 3).map((meal) => <ItemCard key={meal.id} title={meal.name} body={meal.description} image={meal.image_url} meta={`${meal.prep_minutes} min`} price={meal.price_cents} onPress={() => openDetail({ type: "meal", id: meal.id })} />)}
      <SectionTitle title="Featured packaged products" />
      {productCatalog.filter((product) => product.is_available !== false).slice(0, 3).map((product) => <ItemCard key={product.id} title={product.name} body={product.description} image={product.image_url} meta={`${product.stock} in stock`} price={product.price_cents} onPress={() => openDetail({ type: "product", id: product.id })} />)}
      <View style={styles.cta}>
        <Text style={styles.ctaTitle}>Sell on FreshLane</Text>
        <Text style={styles.muted}>Create a store profile, add meals or products, and manage orders from mobile.</Text>
        <PrimaryButton label="Seller dashboard" onPress={() => setScreen("seller")} />
      </View>
    </ScreenWrap>
  );
}

function AuthScreen({
  mode,
  users,
  login,
  signup,
  setScreen
}: {
  mode: "login" | "signup";
  users: AuthUser[];
  login: (email: string, password: string) => string;
  signup: (user: Omit<AuthUser, "id" | "status" | "address">) => string;
  setScreen: (screen: Screen) => void;
}) {
  const [fullName, setFullName] = useState("Aminata Kamara");
  const [email, setEmail] = useState(mode === "login" ? "aminata.customer@example.com" : "");
  const [password, setPassword] = useState("DemoPass123!");
  const [role, setRole] = useState<Role>("customer");
  const [message, setMessage] = useState("");
  const demoLogins = users.map((user) => `${user.role}: ${user.email}`).join("\n");

  return (
    <ScreenWrap>
      <View style={styles.panel}>
        <Text style={styles.title}>{mode === "login" ? "Log in" : "Create account"}</Text>
        <Text style={styles.muted}>Demo accounts are active immediately. Demo logins:</Text>
        <Text style={styles.small}>{demoLogins}</Text>
        {message ? <Text style={styles.error}>{message}</Text> : null}
        {mode === "signup" ? <Input label="Full name" value={fullName} onChangeText={setFullName} /> : null}
        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        {mode === "signup" ? <RoleSelector value={role} onChange={setRole} /> : null}
        <PrimaryButton
          label={mode === "login" ? "Log in" : "Create account"}
          onPress={() => {
            const result = mode === "login" ? login(email, password) : signup({ full_name: fullName, email, password, role });
            setMessage(result);
          }}
        />
        <SecondaryButton label={mode === "login" ? "Create an account" : "Already registered? Log in"} onPress={() => setScreen(mode === "login" ? "signup" : "login")} />
      </View>
    </ScreenWrap>
  );
}

function RestaurantsScreen({ openDetail }: { openDetail: (target: DetailTarget) => void }) {
  const [query, setQuery] = useState("");
  const filteredRestaurants = restaurants.filter((restaurant) => restaurant.name.toLowerCase().includes(query.toLowerCase()) || restaurant.cuisine.toLowerCase().includes(query.toLowerCase()));

  return (
    <ScreenWrap>
      <Text style={styles.title}>Restaurants</Text>
      <Input label="Search restaurants" value={query} onChangeText={setQuery} />
      {filteredRestaurants.map((restaurant) => (
        <View key={restaurant.id} style={styles.panel}>
          <RestaurantCard restaurant={restaurant} />
          <Text style={styles.sectionTitle}>Meals</Text>
          {meals.filter((meal) => meal.restaurant_id === restaurant.id).map((meal) => (
            <CompactRow key={meal.id} title={meal.name} subtitle={formatMoney(meal.price_cents)} action="View" onPress={() => openDetail({ type: "meal", id: meal.id })} />
          ))}
        </View>
      ))}
    </ScreenWrap>
  );
}

function ProductsScreen({ productCatalog, openDetail }: { productCatalog: Product[]; openDetail: (target: DetailTarget) => void }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const filtered = productCatalog.filter((product) => {
    const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !category || product.category_slug === category;
    return matchesQuery && matchesCategory && product.is_available !== false;
  });

  return (
    <ScreenWrap>
      <Text style={styles.title}>Product marketplace</Text>
      <Input label="Search products" value={query} onChangeText={setQuery} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <FilterPill label="All" active={!category} onPress={() => setCategory("")} />
        {categories.map((item) => <FilterPill key={item.id} label={item.name} active={category === item.slug} onPress={() => setCategory(item.slug)} />)}
      </ScrollView>
      {filtered.map((product) => (
        <ItemCard key={product.id} title={product.name} body={product.description} image={product.image_url} meta={`${product.stock} in stock`} price={product.price_cents} onPress={() => openDetail({ type: "product", id: product.id })} />
      ))}
    </ScreenWrap>
  );
}

function DetailScreen({ target, productCatalog, addToCart }: { target: DetailTarget; productCatalog: Product[]; addToCart: (item: CartItem) => void }) {
  const record = target.type === "meal" ? meals.find((meal) => meal.id === target.id) : productCatalog.find((product) => product.id === target.id);

  if (!record) {
    return <ScreenWrap><Empty title="Item not found" body="This listing is not available." /></ScreenWrap>;
  }

  const meta = target.type === "meal" ? `${"prep_minutes" in record ? record.prep_minutes : 0} min prep` : `${"stock" in record ? record.stock : 0} in stock`;

  return (
    <ScreenWrap>
      <Image source={{ uri: record.image_url }} style={styles.detailImage} />
      <Text style={styles.title}>{record.name}</Text>
      <Text style={styles.price}>{formatMoney(record.price_cents)}</Text>
      <Text style={styles.muted}>{meta}</Text>
      <Text style={styles.bodyText}>{record.description}</Text>
      <PrimaryButton label="Add to cart" onPress={() => addToCart({ id: record.id, type: target.type, quantity: 1 })} />
    </ScreenWrap>
  );
}

function CartScreen({
  cart,
  productCatalog,
  updateCart,
  setScreen
}: {
  cart: CartItem[];
  productCatalog: Product[];
  updateCart: (item: CartItem) => void;
  setScreen: (screen: Screen) => void;
}) {
  const lines = cart.map((line) => {
    const record = line.type === "meal" ? meals.find((meal) => meal.id === line.id) : productCatalog.find((product) => product.id === line.id);
    return record ? { ...line, record } : null;
  }).filter(Boolean) as Array<CartItem & { record: { name: string; price_cents: number } }>;
  const total = lines.reduce((sum, line) => sum + line.record.price_cents * line.quantity, 0);

  return (
    <ScreenWrap>
      <Text style={styles.title}>Cart</Text>
      {lines.length === 0 ? <Empty title="Your cart is empty" body="Add meals or packaged foods to start checkout." action="Shop products" onPress={() => setScreen("products")} /> : null}
      {lines.map((line) => (
        <View key={`${line.type}-${line.id}`} style={styles.panel}>
          <Text style={styles.cardTitle}>{line.record.name}</Text>
          <Text style={styles.muted}>{formatMoney(line.record.price_cents)} each</Text>
          <View style={styles.row}>
            <SecondaryButton label="-" onPress={() => updateCart({ ...line, quantity: line.quantity - 1 })} />
            <Text style={styles.quantity}>{line.quantity}</Text>
            <SecondaryButton label="+" onPress={() => updateCart({ ...line, quantity: line.quantity + 1 })} />
          </View>
        </View>
      ))}
      {lines.length > 0 ? (
        <View style={styles.panel}>
          <Text style={styles.total}>Total {formatMoney(total)}</Text>
          <PrimaryButton label="Checkout" onPress={() => setScreen("checkout")} />
        </View>
      ) : null}
    </ScreenWrap>
  );
}

function CheckoutScreen({
  cart,
  productCatalog,
  user,
  setOrders,
  setCart,
  setScreen
}: {
  cart: CartItem[];
  productCatalog: Product[];
  user: AuthUser | null;
  setOrders: React.Dispatch<React.SetStateAction<DemoOrder[]>>;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setScreen: (screen: Screen) => void;
}) {
  const [address, setAddress] = useState(user?.address ?? "18 Lumley Beach Road, Freetown");
  const [note, setNote] = useState("");
  const total = cart.reduce((sum, line) => {
    const record = line.type === "meal" ? meals.find((meal) => meal.id === line.id) : productCatalog.find((product) => product.id === line.id);
    return sum + (record?.price_cents ?? 0) * line.quantity;
  }, 0);

  return (
    <ScreenWrap>
      <Text style={styles.title}>Checkout</Text>
      <View style={styles.panel}>
        <Input label="Delivery address" value={address} onChangeText={setAddress} />
        <Input label="Delivery note" value={note} onChangeText={setNote} multiline />
        <Text style={styles.total}>Payment summary {formatMoney(total)}</Text>
        <Text style={styles.muted}>Stripe mobile payment sheet can connect here with the same order payload.</Text>
        <PrimaryButton
          label="Pay and place order"
          onPress={() => {
            if (cart.length === 0) return;
            const itemNames = cart.map((line) => {
              const record = line.type === "meal" ? meals.find((meal) => meal.id === line.id) : productCatalog.find((product) => product.id === line.id);
              return `${record?.name ?? "Item"} x${line.quantity}`;
            });
            setOrders((current) => [{ id: `FL-${Date.now().toString().slice(-4)}`, status: "pending", total_cents: total, placed_at: "Just now", items: itemNames }, ...current]);
            setCart([]);
            setScreen("orders");
          }}
        />
      </View>
    </ScreenWrap>
  );
}

function OrdersScreen({ orders }: { orders: DemoOrder[] }) {
  return (
    <ScreenWrap>
      <Text style={styles.title}>Orders and tracking</Text>
      {orders.map((order) => (
        <View key={order.id} style={styles.panel}>
          <Text style={styles.cardTitle}>Order {order.id}</Text>
          <Text style={styles.muted}>{order.placed_at}</Text>
          <Text style={styles.status}>{order.status.replaceAll("_", " ")}</Text>
          {order.items.map((item) => <Text key={item} style={styles.small}>{item}</Text>)}
          <Text style={styles.price}>{formatMoney(order.total_cents)}</Text>
          {order.status !== "delivered" ? (
            <PrimaryButton label="Track Live Location" onPress={() => Alert.alert("Live Tracking", `Opening tracking for ${order.id}`)} />
          ) : null}
        </View>
      ))}
    </ScreenWrap>
  );
}

function CustomerDashboard({ user, orders, setScreen }: { user: AuthUser | null; orders: DemoOrder[]; setScreen: (screen: Screen) => void }) {
  if (!user) return null;
  return (
    <ScreenWrap>
      <Text style={styles.title}>Customer dashboard</Text>
      <StatGrid stats={[["Welcome", user.full_name], ["Active orders", String(orders.filter((order) => order.status !== "delivered").length)], ["Address", user.address]]} />
      <PrimaryButton label="Browse restaurants" onPress={() => setScreen("restaurants")} />
      <SecondaryButton label="Shop packaged food" onPress={() => setScreen("products")} />
      <SectionTitle title="Recent orders" />
      {orders.map((order) => <CompactRow key={order.id} title={`Order ${order.id}`} subtitle={order.status.replaceAll("_", " ")} right={formatMoney(order.total_cents)} />)}
    </ScreenWrap>
  );
}

function SellerDashboard({
  user,
  productCatalog,
  addProduct,
  updateProduct,
  deleteProduct
}: {
  user: AuthUser | null;
  productCatalog: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}) {
  const [draft, setDraft] = useState<Product>({
    id: "new-product",
    category_slug: "pantry",
    name: "Cassava Leaf Stew Bowl",
    description: "Fresh African pantry or ready meal listing.",
    image_url: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=1200&q=80",
    price_cents: 1450,
    stock: 20,
    is_available: true
  });

  if (!user) return null;

  return (
    <ScreenWrap>
      <Text style={styles.title}>Seller dashboard</Text>
      <StatGrid stats={[["Seller", user.full_name], ["Listings", String(productCatalog.length)], ["Orders", "8"]]} />
      <View style={styles.panel}>
        <Text style={styles.cardTitle}>Create product listing</Text>
        <ProductForm product={draft} onChange={(next) => setDraft(next as Product)} />
        <PrimaryButton
          label="Add listing"
          onPress={() => {
            addProduct({ ...draft, id: slugify(draft.name) });
            setDraft({ ...draft, id: "new-product", name: "", description: "", price_cents: 1000, stock: 10, is_available: true });
          }}
        />
      </View>
      <SectionTitle title="Marketplace product CRUD" />
      {productCatalog.map((product) => (
        <View key={product.id} style={styles.panel}>
          <ProductForm product={product} onChange={(updates) => updateProduct(product.id, updates)} partial />
          <SecondaryButton label={product.is_available === false ? "Publish" : "Hide"} onPress={() => updateProduct(product.id, { is_available: product.is_available === false })} />
          <DangerButton label="Delete product" onPress={() => deleteProduct(product.id)} />
        </View>
      ))}
    </ScreenWrap>
  );
}

function DriverDashboard({ user, orders, setOrders }: { user: AuthUser | null; orders: DemoOrder[]; setOrders: React.Dispatch<React.SetStateAction<DemoOrder[]>> }) {
  if (!user) return null;
  const [isOnline, setIsOnline] = useState(false);
  const statuses: OrderStatus[] = ["accepted", "picked_up", "on_the_way", "delivered"];
  
  return (
    <ScreenWrap>
      <Text style={styles.title}>Driver dashboard</Text>
      <View style={[styles.panel, isOnline ? { backgroundColor: colors.leaf } : null]}>
        <Text style={[styles.cardTitle, isOnline ? { color: colors.white } : null]}>
          {isOnline ? "Online & Tracking Active" : "Currently Offline"}
        </Text>
        <PrimaryButton 
          label={isOnline ? "Go Offline" : "Go Online"} 
          onPress={() => setIsOnline(!isOnline)} 
          style={isOnline ? { backgroundColor: colors.ink } : null}
        />
      </View>
      <StatGrid stats={[["Driver", user.full_name], ["Assigned", String(orders.length)], ["Status", isOnline ? "Active" : "Idle"]]} />
      {orders.map((order) => (
        <View key={order.id} style={styles.panel}>
          <Text style={styles.cardTitle}>Delivery {order.id}</Text>
          <Text style={styles.status}>{order.status.replaceAll("_", " ")}</Text>
          <Segmented options={statuses} value={order.status as OrderStatus} onChange={(status) => setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status } : item))} />
        </View>
      ))}
    </ScreenWrap>
  );
}

function AdminDashboard({
  user,
  users,
  addUser,
  updateUser,
  deleteUser
}: {
  user: AuthUser | null;
  users: AuthUser[];
  addUser: (user: Omit<AuthUser, "id">) => string;
  updateUser: (id: string, updates: Partial<AuthUser>) => void;
  deleteUser: (id: string) => void;
}) {
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? "");
  const selectedUser = users.find((item) => item.id === selectedUserId) ?? users[0];
  const [draft, setDraft] = useState<Omit<AuthUser, "id">>({
    full_name: "",
    email: "",
    password: "DemoPass123!",
    role: "customer",
    status: "active",
    address: "New delivery address"
  });
  const [message, setMessage] = useState("");

  if (!user) return null;

  return (
    <ScreenWrap>
      <Text style={styles.title}>Admin dashboard</Text>
      <StatGrid stats={[["Users", String(users.length)], ["Revenue", formatMoney(128940)], ["Commission", formatMoney(15472)]]} />
      <View style={styles.panel}>
        <Text style={styles.cardTitle}>Create user</Text>
        <UserForm user={draft} onChange={(next) => setDraft(next as Omit<AuthUser, "id">)} />
        {message ? <Text style={styles.error}>{message}</Text> : null}
        <PrimaryButton
          label="Create user"
          onPress={() => {
            const result = addUser(draft);
            setMessage(result);
            if (!result) setDraft({ full_name: "", email: "", password: "DemoPass123!", role: "customer", status: "active", address: "New delivery address" });
          }}
        />
      </View>
      <SectionTitle title="Manage users" />
      {users.map((item) => (
        <CompactRow key={item.id} title={item.full_name} subtitle={`${item.email} · ${item.role} · ${item.status}`} action="Manage" onPress={() => setSelectedUserId(item.id)} />
      ))}
      {selectedUser ? (
        <View style={styles.panel}>
          <Text style={styles.cardTitle}>Editing {selectedUser.full_name}</Text>
          <UserForm user={selectedUser} onChange={(updates) => updateUser(selectedUser.id, updates)} partial lockRoleStatus={selectedUser.id === user.id} />
          <DangerButton label="Delete user" disabled={selectedUser.id === user.id} onPress={() => deleteUser(selectedUser.id)} />
        </View>
      ) : null}
    </ScreenWrap>
  );
}

function ProductForm({ product, onChange, partial }: { product: Product; onChange: (updates: Product | Partial<Product>) => void; partial?: boolean }) {
  const merge = (updates: Partial<Product>) => onChange(partial ? updates : { ...product, ...updates });
  return (
    <View style={styles.form}>
      <Input label="Name" value={product.name} onChangeText={(name) => merge({ name })} />
      <Input label="Image URL" value={product.image_url} onChangeText={(image_url) => merge({ image_url })} />
      <Input label="Description" value={product.description} onChangeText={(description) => merge({ description })} multiline />
      <Input label="Price" value={(product.price_cents / 100).toFixed(2)} onChangeText={(value) => merge({ price_cents: Math.round(Number(value || 0) * 100) })} keyboardType="numeric" />
      <Input label="Stock" value={String(product.stock)} onChangeText={(value) => merge({ stock: Number(value || 0) })} keyboardType="numeric" />
      <Segmented options={categories.map((category) => category.slug)} value={product.category_slug} onChange={(category_slug) => merge({ category_slug })} />
    </View>
  );
}

function UserForm({
  user,
  onChange,
  partial,
  lockRoleStatus
}: {
  user: Omit<AuthUser, "id"> | AuthUser;
  onChange: (updates: Partial<AuthUser> | Omit<AuthUser, "id">) => void;
  partial?: boolean;
  lockRoleStatus?: boolean;
}) {
  const merge = (updates: Partial<AuthUser>) => onChange(partial ? updates : { ...user, ...updates } as Omit<AuthUser, "id">);
  return (
    <View style={styles.form}>
      <Input label="Full name" value={user.full_name} onChangeText={(full_name) => merge({ full_name })} />
      <Input label="Email" value={user.email} onChangeText={(email) => merge({ email })} keyboardType="email-address" />
      <Input label="Address" value={user.address} onChangeText={(address) => merge({ address })} />
      <Input label="Password" value={user.password} onChangeText={(password) => merge({ password })} />
      <RoleSelector value={user.role} onChange={(role) => !lockRoleStatus && merge({ role })} disabled={lockRoleStatus} />
      <Segmented options={["active", "pending", "disabled"] as AuthStatus[]} value={user.status} onChange={(status) => !lockRoleStatus && merge({ status })} disabled={lockRoleStatus} />
    </View>
  );
}

function Input(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, style, ...rest } = props;
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, props.multiline ? styles.textarea : null, style]} placeholderTextColor="#8b887d" {...rest} />
    </View>
  );
}

function RoleSelector({ value, onChange, disabled }: { value: Role; onChange: (role: Role) => void; disabled?: boolean }) {
  return <Segmented options={["customer", "seller", "driver", "admin", "super-admin"] as Role[]} value={value} onChange={onChange} disabled={disabled} />;
}

function Segmented<T extends string>({ options, value, onChange, disabled }: { options: T[]; value: T; onChange: (value: T) => void; disabled?: boolean }) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => (
        <Pressable key={option} disabled={disabled} style={[styles.segment, value === option ? styles.segmentActive : null, disabled ? styles.disabled : null]} onPress={() => onChange(option)}>
          <Text style={[styles.segmentText, value === option ? styles.segmentTextActive : null]}>{option.replaceAll("_", " ")}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function ItemCard({ title, body, image, meta, price, onPress }: { title: string; body: string; image: string; meta: string; price: number; onPress: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.muted}>{body}</Text>
        <View style={styles.between}>
          <Text style={styles.small}>{meta}</Text>
          <Text style={styles.price}>{formatMoney(price)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function RestaurantCard({ restaurant }: { restaurant: (typeof restaurants)[number] }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: restaurant.image_url }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{restaurant.name}</Text>
        <Text style={styles.muted}>{restaurant.description}</Text>
        <Text style={styles.small}>{restaurant.cuisine} · {restaurant.rating} · {restaurant.delivery_minutes}</Text>
      </View>
    </View>
  );
}

function CompactRow({ title, subtitle, right, action, onPress }: { title: string; subtitle: string; right?: string; action?: string; onPress?: () => void }) {
  return (
    <View style={styles.compactRow}>
      <View style={styles.flex}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.muted}>{subtitle}</Text>
      </View>
      {right ? <Text style={styles.price}>{right}</Text> : null}
      {action && onPress ? <SecondaryButton label={action} onPress={onPress} /> : null}
    </View>
  );
}

function FilterPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.filterPill, active ? styles.filterPillActive : null]} onPress={onPress}>
      <Text style={[styles.filterText, active ? styles.filterTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

function StatGrid({ stats }: { stats: [string, string][] }) {
  return (
    <View style={styles.stats}>
      {stats.map(([label, value]) => (
        <View key={label} style={styles.statCard}>
          <Text style={styles.small}>{label}</Text>
          <Text style={styles.statValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function Empty({ title, body, action, onPress }: { title: string; body: string; action?: string; onPress?: () => void }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.muted}>{body}</Text>
      {action && onPress ? <PrimaryButton label={action} onPress={onPress} /> : null}
    </View>
  );
}

function PrimaryButton({ label, onPress, disabled, style }: { label: string; onPress: () => void; disabled?: boolean; style?: any }) {
  return (
    <Pressable disabled={disabled} style={[styles.primaryButton, disabled ? styles.disabled : null, style]} onPress={onPress}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable disabled={disabled} style={[styles.secondaryButton, disabled ? styles.disabled : null]} onPress={onPress}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function DangerButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable disabled={disabled} style={[styles.dangerButton, disabled ? styles.disabled : null]} onPress={onPress}>
      <Text style={styles.dangerButtonText}>{label}</Text>
    </Pressable>
  );
}

const colors = {
  ink: "#18211d",
  leaf: "#2e7d4f",
  saffron: "#f2c14e",
  cloud: "#f7f5ef",
  white: "#ffffff",
  muted: "#68645c",
  border: "#e4dfd4",
  tomato: "#c94c3b"
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cloud
  },
  header: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  logo: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 10
  },
  nav: {
    gap: 8
  },
  navButton: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  navText: {
    color: colors.ink,
    fontWeight: "800"
  },
  screen: {
    flex: 1
  },
  screenContent: {
    gap: 16,
    padding: 16,
    paddingBottom: 40
  },
  hero: {
    backgroundColor: colors.ink,
    borderRadius: 12,
    gap: 12,
    padding: 20
  },
  eyebrow: {
    color: colors.saffron,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  heroTitle: {
    color: colors.white,
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 38
  },
  heroBody: {
    color: "#e9e5d8",
    fontSize: 15,
    lineHeight: 22
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: "900"
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 8
  },
  panel: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
    padding: 14
  },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden"
  },
  cardImage: {
    height: 170,
    width: "100%"
  },
  detailImage: {
    borderRadius: 12,
    height: 260,
    width: "100%"
  },
  cardBody: {
    gap: 8,
    padding: 14
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900"
  },
  muted: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  bodyText: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 24
  },
  small: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  price: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  status: {
    color: colors.leaf,
    fontSize: 14,
    fontWeight: "900",
    textTransform: "capitalize"
  },
  total: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  between: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  flex: {
    flex: 1
  },
  cta: {
    backgroundColor: colors.ink,
    borderRadius: 12,
    gap: 12,
    padding: 18
  },
  ctaTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "900"
  },
  categoryPill: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  categoryText: {
    color: colors.ink,
    fontWeight: "900"
  },
  filterPill: {
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  filterPillActive: {
    backgroundColor: colors.ink
  },
  filterText: {
    color: colors.ink,
    fontWeight: "800"
  },
  filterTextActive: {
    color: colors.white
  },
  inputWrap: {
    gap: 6
  },
  label: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "900"
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  textarea: {
    minHeight: 86,
    textAlignVertical: "top"
  },
  form: {
    gap: 12
  },
  segmented: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  segment: {
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  segmentActive: {
    backgroundColor: colors.leaf,
    borderColor: colors.leaf
  },
  segmentText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "capitalize"
  },
  segmentTextActive: {
    color: colors.white
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.ink,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: "900"
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  secondaryButtonText: {
    color: colors.ink,
    fontWeight: "900"
  },
  dangerButton: {
    alignItems: "center",
    borderColor: colors.tomato,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  dangerButtonText: {
    color: colors.tomato,
    fontWeight: "900"
  },
  disabled: {
    opacity: 0.45
  },
  quantity: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
    paddingHorizontal: 8,
    paddingTop: 8
  },
  compactRow: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 12
  },
  stats: {
    gap: 10
  },
  statCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    padding: 14
  },
  statValue: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 4
  },
  error: {
    color: colors.tomato,
    fontWeight: "800"
  }
});
