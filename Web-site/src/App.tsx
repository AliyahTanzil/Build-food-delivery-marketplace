import { useEffect, useMemo, useState } from "react";
import type React from "react";
import {
  ArrowRight,
  Bike,
  CheckCircle2,
  Clock,
  Coffee,
  CreditCard,
  LayoutDashboard,
  MapPin,
  Package,
  PackageCheck,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  ShoppingBag,
  ShoppingBasket,
  ShoppingCart,
  Soup,
  Star,
  Store,
  Trash2,
  Utensils
} from "lucide-react";
import { categories, meals as initialMeals, orders, products as initialProducts, restaurants } from "@/vite/data";
import type { DemoMeal, DemoProduct } from "@/vite/data";
import type { Role } from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils";

type CartItem = {
  id: string;
  type: "meal" | "product";
  quantity: number;
};

type AuthUser = {
  id: string;
  full_name: string;
  email: string;
  password: string;
  role: Role;
  status: AuthStatus;
  address: string;
};

type AuthStatus = "active" | "pending" | "disabled";

const authUsersKey = "freshlane-auth-users";
const activeUserKey = "freshlane-active-user";

const seedAuthUsers: AuthUser[] = [
  {
    id: "customer-aminata",
    full_name: "Aminata Kamara",
    email: "aminata.customer@example.com",
    password: "DemoPass123!",
    role: "customer",
    status: "active",
    address: "18 Lumley Beach Road, Freetown"
  },
  {
    id: "seller-kadiatu",
    full_name: "Kadiatu Conteh",
    email: "seller@example.com",
    password: "DemoPass123!",
    role: "seller",
    status: "active",
    address: "7 Aberdeen Road, Freetown"
  },
  {
    id: "driver-ibrahim",
    full_name: "Ibrahim Sesay",
    email: "driver@example.com",
    password: "DemoPass123!",
    role: "driver",
    status: "active",
    address: "12 Wilkinson Road, Freetown"
  },
  {
    id: "admin-fatmata",
    full_name: "Fatmata Bangura",
    email: "admin@example.com",
    password: "DemoPass123!",
    role: "admin",
    status: "active",
    address: "FreshLane HQ, Freetown"
  }
];

const dashboardNav = {
  customer: [
    ["/customer", "Overview"],
    ["/orders", "Orders"],
    ["/cart", "Cart"],
    ["/restaurants", "Restaurants"],
    ["/products", "Packaged foods"]
  ],
  seller: [
    ["/seller", "Overview"],
    ["/seller", "Restaurant / store"],
    ["/seller", "Meals and products"],
    ["/seller", "Orders"]
  ],
  driver: [["/driver", "Assigned deliveries"]],
  admin: [["/admin", "Overview"]]
};

function roleHome(role: Role) {
  if (role === "seller") return "/seller";
  if (role === "driver") return "/driver";
  if (role === "admin") return "/admin";
  return "/customer";
}

function protectedRoleForPath(path: string): Role | null {
  if ((path.startsWith("/meals/") || path.startsWith("/products/")) && path.endsWith("/edit")) return "admin";
  if (path === "/seller") return "seller";
  if (path === "/driver") return "driver";
  if (path === "/admin") return "admin";
  if (path === "/customer" || path.startsWith("/orders")) return "customer";
  return null;
}

function navigate(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0 });
}

function usePath() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return path;
}

function Link({
  href,
  className,
  children
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        if (href.startsWith("/")) {
          event.preventDefault();
          navigate(href);
        }
      }}
    >
      {children}
    </a>
  );
}

function Button({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-md bg-ink px-5 text-sm font-semibold text-white transition hover:bg-leaf disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      className={cn("h-11 w-full rounded-md border border-ink/15 bg-white px-3 text-sm outline-none ring-leaf/20 transition focus:border-leaf focus:ring-4", className)}
      {...rest}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, ...rest } = props;
  return (
    <select
      className={cn("h-11 w-full rounded-md border border-ink/15 bg-white px-3 text-sm outline-none ring-leaf/20 transition focus:border-leaf focus:ring-4", className)}
      {...rest}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return (
    <textarea
      className={cn("min-h-28 w-full rounded-md border border-ink/15 bg-white px-3 py-3 text-sm outline-none ring-leaf/20 transition focus:border-leaf focus:ring-4", className)}
      {...rest}
    />
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-ink/80">
      {label}
      {children}
    </label>
  );
}

function Navigation({
  currentUser,
  onLogout
}: {
  currentUser: AuthUser | null;
  onLogout: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cloud/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-black tracking-tight text-ink">
          <span className="grid size-9 place-items-center rounded-md bg-leaf text-white">
            <ShoppingBag size={18} />
          </span>
          FreshLane
        </Link>
        <div className="hidden items-center gap-5 text-sm font-medium text-ink/70 md:flex">
          <Link href="/restaurants">Restaurants</Link>
          <Link href="/products">Packaged Foods</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/customer">Customer</Link>
          <Link href="/seller">Seller</Link>
          <Link href="/driver">Driver</Link>
          <Link href="/admin">Admin</Link>
        </div>
        <div className="flex items-center gap-2">
          {currentUser ? (
            <>
              <Link className="hidden rounded-md border border-ink/15 px-4 py-2 text-sm font-semibold text-ink md:inline-flex" href={roleHome(currentUser.role)}>
                {currentUser.full_name}
              </Link>
              <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={onLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link className="hidden rounded-md border border-ink/15 px-4 py-2 text-sm font-semibold text-ink md:inline-flex" href="/login">
                Log in
              </Link>
              <Link className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" href="/signup">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
      <div className="grid grid-cols-4 border-t border-ink/10 bg-white text-[11px] font-semibold text-ink/70 md:hidden">
        <Link className="flex flex-col items-center gap-1 py-2" href="/restaurants">
          <Store size={16} /> Food
        </Link>
        <Link className="flex flex-col items-center gap-1 py-2" href="/products">
          <ShoppingBag size={16} /> Shop
        </Link>
        <Link className="flex flex-col items-center gap-1 py-2" href="/orders">
          <Bike size={16} /> Orders
        </Link>
        <Link className="flex flex-col items-center gap-1 py-2" href="/customer">
          <LayoutDashboard size={16} /> Account
        </Link>
      </div>
    </header>
  );
}

function AuthPage({
  mode,
  users,
  onLogin,
  onSignup
}: {
  mode: "login" | "signup";
  users: AuthUser[];
  onLogin: (email: string, password: string) => { ok: true; user: AuthUser } | { ok: false; message: string };
  onSignup: (user: Omit<AuthUser, "id" | "status" | "address">) => { ok: true; user: AuthUser } | { ok: false; message: string };
}) {
  const [fullName, setFullName] = useState("Aminata Kamara");
  const [email, setEmail] = useState(mode === "login" ? "aminata.customer@example.com" : "");
  const [password, setPassword] = useState("DemoPass123!");
  const [role, setRole] = useState<Role>("customer");
  const [message, setMessage] = useState("");
  const title = mode === "login" ? "Log in" : "Create account";
  const demoCredentials = users.map((user) => `${user.role}: ${user.email}`).join(" | ");

  return (
    <main className="mx-auto grid min-h-[calc(100vh-74px)] max-w-md content-center px-4 py-10">
      <form
        className="grid gap-5 rounded-md border border-ink/10 bg-white p-6 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          setMessage("");
          const result = mode === "login"
            ? onLogin(email, password)
            : onSignup({ full_name: fullName, email, password, role });

          if (!result.ok) {
            setMessage(result.message);
            return;
          }

          navigate(roleHome(result.user.role));
        }}
      >
        <div>
          <h1 className="text-3xl font-black text-ink">{title}</h1>
          <p className="mt-2 text-sm text-ink/60">
            Accounts are saved locally for this demo and can be used immediately after signup. Demo logins: {demoCredentials}
          </p>
        </div>
        {message ? <p className="rounded-md bg-tomato/10 px-3 py-2 text-sm font-semibold text-tomato">{message}</p> : null}
        {mode === "signup" ? (
          <Field label="Full name">
            <Input required value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </Field>
        ) : null}
        <Field label="Email">
          <Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </Field>
        <Field label="Password">
          <Input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} />
        </Field>
        {mode === "signup" ? (
          <Field label="Role">
            <Select value={role} onChange={(event) => setRole(event.target.value as Role)}>
              <option value="customer">Customer</option>
              <option value="seller">Seller / Restaurant</option>
              <option value="driver">Delivery driver</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>
        ) : null}
        <Button>{title}</Button>
        <p className="text-sm text-ink/60">
          {mode === "login" ? "New here?" : "Already registered?"}{" "}
          <Link href={mode === "login" ? "/signup" : "/login"} className="font-bold text-leaf">
            {mode === "login" ? "Create an account" : "Log in"}
          </Link>
        </p>
      </form>
    </main>
  );
}

function ItemCard({
  id,
  type,
  name,
  description,
  imageUrl,
  priceCents,
  meta
}: {
  id: string;
  type: "meal" | "product" | "restaurant";
  name: string;
  description: string;
  imageUrl: string;
  priceCents?: number;
  meta: string;
}) {
  const href =
    type === "restaurant" ? `/restaurants/${id}` : type === "meal" ? `/meals/${id}` : `/products/${id}`;

  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-md border border-ink/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink/5">
        <img src={imageUrl} alt={name} className="size-full object-cover transition duration-300 group-hover:scale-105" />
      </div>
      <div className="grid gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="line-clamp-1 font-semibold text-ink">{name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-ink/60">{description}</p>
          </div>
          {priceCents != null ? (
            <span className="rounded-md bg-saffron/20 px-2 py-1 text-sm font-bold text-ink">
              {formatMoney(priceCents)}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-3 text-xs font-medium text-ink/55">
          <span className="inline-flex items-center gap-1">
            <Star size={14} className="fill-saffron text-saffron" /> 4.8
          </span>
          <span className="inline-flex items-center gap-1">
            {type === "product" ? <PackageCheck size={14} /> : <Clock size={14} />}
            {meta}
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ title, body, cta, href }: { title: string; body: string; cta: string; href: string }) {
  return (
    <div className="rounded-md border border-dashed border-ink/20 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-ink/60">{body}</p>
      <Link className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-ink px-5 text-sm font-semibold text-white" href={href}>
        {cta}
      </Link>
    </div>
  );
}

function AuthRequired({ role }: { role: Role }) {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-74px)] max-w-xl content-center px-4 py-10">
      <div className="rounded-md border border-ink/10 bg-white p-8 text-center shadow-sm">
        <ShieldCheck className="mx-auto text-leaf" size={38} />
        <h1 className="mt-4 text-3xl font-black text-ink">Log in required</h1>
        <p className="mt-2 text-sm text-ink/60">
          This is a protected {role} area. Log in with an active {role} account or create one first.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link className="inline-flex h-11 items-center justify-center rounded-md bg-ink px-5 text-sm font-semibold text-white" href="/login">
            Log in
          </Link>
          <Link className="inline-flex h-11 items-center justify-center rounded-md border border-ink/15 px-5 text-sm font-semibold text-ink" href="/signup">
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}

function AccessDenied({ currentUser, requiredRole }: { currentUser: AuthUser; requiredRole: Role }) {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-74px)] max-w-xl content-center px-4 py-10">
      <div className="rounded-md border border-ink/10 bg-white p-8 text-center shadow-sm">
        <ShieldCheck className="mx-auto text-tomato" size={38} />
        <h1 className="mt-4 text-3xl font-black text-ink">Wrong account role</h1>
        <p className="mt-2 text-sm text-ink/60">
          {currentUser.full_name} is logged in as {currentUser.role}. This page requires an active {requiredRole} account.
        </p>
        <Link className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-ink px-5 text-sm font-semibold text-white" href={roleHome(currentUser.role)}>
          Go to my dashboard
        </Link>
      </div>
    </main>
  );
}

function AddToCartButton({
  item,
  onAdd
}: {
  item: CartItem;
  onAdd: (item: CartItem) => void;
}) {
  const [done, setDone] = useState(false);
  return (
    <div className="grid gap-2">
      <Button
        className="gap-2"
        onClick={() => {
          onAdd(item);
          setDone(true);
        }}
      >
        <ShoppingCart size={18} /> Add to cart
      </Button>
      {done ? <p className="text-sm font-medium text-leaf">Added to cart.</p> : null}
    </div>
  );
}

function HomePage({ mealCatalog, productCatalog }: { mealCatalog: DemoMeal[]; productCatalog: DemoProduct[] }) {
  const categoryIcons = [Coffee, Soup, Package, ShoppingBasket, Utensils];

  return (
    <main>
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/20" />
        <div className="relative mx-auto grid min-h-[620px] max-w-7xl content-center gap-8 px-4 py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-saffron">Food delivery and grocery marketplace</p>
            <h1 className="mt-4 text-4xl font-black leading-tight tracking-normal md:text-6xl">
              Prepared meals, pantry favorites, and local sellers in one checkout.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-white/80">
              Order restaurant meals and packaged food products while sellers, drivers, and admins manage fulfillment from role-specific dashboards.
            </p>
          </div>
          <form
            className="flex max-w-2xl flex-col gap-3 rounded-md bg-white p-2 shadow-soft md:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              navigate("/products");
            }}
          >
            <div className="flex flex-1 items-center gap-2 px-3 text-ink">
              <Search size={20} />
              <input className="h-12 flex-1 outline-none" placeholder="Search meals, stores, snacks, drinks..." />
            </div>
            <button className="rounded-md bg-leaf px-6 py-3 text-sm font-bold text-white">Search</button>
          </form>
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-white/85">
            <Link href="/restaurants" className="rounded-md border border-white/25 px-4 py-2 backdrop-blur">Order dinner</Link>
            <Link href="/products" className="rounded-md border border-white/25 px-4 py-2 backdrop-blur">Restock pantry</Link>
            <Link href="/customer" className="rounded-md border border-white/25 px-4 py-2 backdrop-blur">Track orders</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-3">
        {[
          { title: "Restaurants", body: "Browse prepared meals from approved local restaurants.", Icon: Store, href: "/restaurants" },
          { title: "Packaged Foods", body: "Shop pantry, bakery, snacks, drinks, and seller products.", Icon: Package, href: "/products" },
          { title: "Live Delivery", body: "Track driver pickup, transit, and delivery states.", Icon: Bike, href: "/orders" }
        ].map(({ title, body, Icon, href }) => (
          <Link key={title} href={href} className="rounded-md border border-ink/10 bg-white p-5 shadow-sm transition hover:shadow-soft">
            <Icon className="text-leaf" />
            <h2 className="mt-4 text-xl font-black text-ink">{title}</h2>
            <p className="mt-2 text-sm text-ink/60">{body}</p>
          </Link>
        ))}
      </section>

      <SectionHeader eyebrow="Browse by appetite" title="Food categories" href="/products" cta="Explore marketplace" />
      <section className="mx-auto grid max-w-7xl gap-3 px-4 pb-8 sm:grid-cols-2 lg:grid-cols-5">
        {categories.map((category, index) => {
          const Icon = categoryIcons[index % categoryIcons.length];
          return (
            <Link key={category.id} href={category.kind === "meal" ? "/restaurants" : `/products?category=${category.slug}`} className="rounded-md border border-ink/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
              <span className="grid size-11 place-items-center rounded-md bg-leaf/10 text-leaf"><Icon size={20} /></span>
              <h3 className="mt-4 font-black text-ink">{category.name}</h3>
              <p className="mt-1 text-sm text-ink/55">{category.kind === "meal" ? "Prepared meals" : category.kind === "product" ? "Packaged goods" : "Meals and products"}</p>
            </Link>
          );
        })}
      </section>

      <SectionHeader eyebrow="Open now" title="Popular restaurants" href="/restaurants" cta="View all" />
      <CardGrid>
        {restaurants.map((restaurant) => (
          <ItemCard key={restaurant.id} id={restaurant.id} type="restaurant" name={restaurant.name} description={restaurant.description} imageUrl={restaurant.image_url} meta={`${restaurant.rating} · ${restaurant.delivery_minutes}`} />
        ))}
      </CardGrid>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-2">
        <div>
          <SectionHeader compact eyebrow="Ready soon" title="Featured meals" href="/restaurants" cta="Browse food" />
          <div className="grid gap-5 sm:grid-cols-2">
            {mealCatalog.filter((meal) => meal.is_available !== false).slice(0, 4).map((meal) => (
              <ItemCard key={meal.id} id={meal.id} type="meal" name={meal.name} description={meal.description} imageUrl={meal.image_url} priceCents={meal.price_cents} meta={`${meal.prep_minutes} min`} />
            ))}
          </div>
        </div>
        <div>
          <SectionHeader compact eyebrow="Pantry picks" title="Featured packaged products" href="/products" cta="Shop products" />
          <div className="grid gap-5 sm:grid-cols-2">
            {productCatalog.slice(0, 4).map((product) => (
              <ItemCard key={product.id} id={product.id} type="product" name={product.name} description={product.description} imageUrl={product.image_url} priceCents={product.price_cents} meta={`${product.stock} in stock`} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-md bg-ink p-8 text-white md:flex md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-saffron">For sellers and restaurants</p>
            <h2 className="mt-2 text-3xl font-black">Join FreshLane and sell across meals and packaged products.</h2>
            <p className="mt-2 max-w-2xl text-white/80">Create a restaurant or store profile, list meals and packaged products, and manage fulfillment from your dashboard.</p>
          </div>
          <Link className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-saffron px-5 text-sm font-semibold text-ink hover:bg-white md:mt-0" href="/seller">
            Start selling
          </Link>
        </div>
      </section>
    </main>
  );
}

function SectionHeader({
  eyebrow,
  title,
  href,
  cta,
  compact
}: {
  eyebrow: string;
  title: string;
  href: string;
  cta: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("mx-auto flex max-w-7xl items-end justify-between gap-4 px-4", compact ? "mb-5 px-0" : "mb-5 py-8 pb-0")}>
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-leaf">{eyebrow}</p>
        <h2 className={cn("font-black text-ink", compact ? "text-2xl" : "text-3xl")}>{title}</h2>
      </div>
      <Link className="inline-flex items-center gap-2 text-sm font-bold text-leaf" href={href}>
        {cta} <ArrowRight size={16} />
      </Link>
    </div>
  );
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-8 sm:grid-cols-2 lg:grid-cols-5">{children}</section>;
}

function RestaurantsPage() {
  const [query, setQuery] = useState("");
  const [cuisine, setCuisine] = useState("");
  const filtered = restaurants.filter((restaurant) => {
    const matchesQuery = restaurant.name.toLowerCase().includes(query.toLowerCase());
    const matchesCuisine = !cuisine || restaurant.cuisine === cuisine;
    return matchesQuery && matchesCuisine;
  });

  return (
    <ListingShell eyebrow="Prepared food" title="Restaurants" body="Find open restaurants and order meals for delivery.">
      <div className="grid gap-3 rounded-md border border-ink/10 bg-white p-3 md:grid-cols-[1fr_180px]">
        <Input placeholder="Search restaurants" value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select value={cuisine} onChange={(event) => setCuisine(event.target.value)}>
          <option value="">All cuisines</option>
          {Array.from(new Set(restaurants.map((restaurant) => restaurant.cuisine))).map((value) => <option key={value}>{value}</option>)}
        </Select>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((restaurant) => (
          <ItemCard key={restaurant.id} id={restaurant.id} type="restaurant" name={restaurant.name} description={restaurant.description} imageUrl={restaurant.image_url} meta={`${restaurant.rating} · ${restaurant.delivery_minutes}`} />
        ))}
      </div>
    </ListingShell>
  );
}

function ProductsPage({ productCatalog }: { productCatalog: DemoProduct[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const filtered = productCatalog.filter((product) => {
    const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !category || product.category_slug === category;
    const isAvailable = product.is_available ?? true;
    return matchesQuery && matchesCategory && isAvailable;
  });

  return (
    <ListingShell eyebrow="Packaged food" title="Products" body="Shop pantry, bakery, snacks, drinks, and seller inventory.">
      <div className="grid gap-3 rounded-md border border-ink/10 bg-white p-3 md:grid-cols-[1fr_180px]">
        <Input placeholder="Search products" value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">All categories</option>
          {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
        </Select>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((product) => (
          <ItemCard key={product.id} id={product.id} type="product" name={product.name} description={product.description} imageUrl={product.image_url} priceCents={product.price_cents} meta={`${product.stock} in stock`} />
        ))}
      </div>
    </ListingShell>
  );
}

function RestaurantDetailPage({ id, mealCatalog }: { id: string; mealCatalog: DemoMeal[] }) {
  const restaurant = restaurants.find((item) => item.id === id);
  const menu = mealCatalog.filter((meal) => meal.restaurant_id === id && meal.is_available !== false);

  if (!restaurant) {
    return <EmptyState title="Restaurant not found" body="That restaurant is no longer available." cta="Browse restaurants" href="/restaurants" />;
  }

  return (
    <main>
      <section className="relative min-h-[380px] overflow-hidden bg-ink text-white">
        <img src={restaurant.image_url} alt={restaurant.name} className="absolute inset-0 size-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/20" />
        <div className="relative mx-auto flex min-h-[380px] max-w-7xl flex-col justify-end px-4 py-10">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-saffron">{restaurant.cuisine}</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-black md:text-6xl">{restaurant.name}</h1>
          <p className="mt-4 max-w-2xl text-white/80">{restaurant.description}</p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-white/85">
            <span className="rounded-md border border-white/25 px-3 py-2">{restaurant.rating} rating</span>
            <span className="rounded-md border border-white/25 px-3 py-2">{restaurant.delivery_minutes}</span>
            <span className="rounded-md border border-white/25 px-3 py-2">Open now</span>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-leaf">Menu</p>
            <h2 className="text-3xl font-black text-ink">Prepared meals</h2>
          </div>
          <Link href="/cart" className="inline-flex h-11 items-center justify-center rounded-md bg-ink px-5 text-sm font-semibold text-white">
            View cart
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {menu.map((meal) => (
            <ItemCard key={meal.id} id={meal.id} type="meal" name={meal.name} description={meal.description} imageUrl={meal.image_url} priceCents={meal.price_cents} meta={`${meal.prep_minutes} min`} />
          ))}
        </div>
      </section>
    </main>
  );
}

function ListingShell({ eyebrow, title, body, children }: { eyebrow: string; title: string; body: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-leaf">{eyebrow}</p>
          <h1 className="text-4xl font-black text-ink">{title}</h1>
          <p className="mt-2 text-ink/60">{body}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </main>
  );
}

function DetailPage({
  type,
  id,
  addToCart,
  mealCatalog,
  productCatalog,
  currentUser
}: {
  type: "meal" | "product";
  id: string;
  addToCart: (item: CartItem) => void;
  mealCatalog: DemoMeal[];
  productCatalog: DemoProduct[];
  currentUser: AuthUser | null;
}) {
  const record = type === "meal" ? mealCatalog.find((item) => item.id === id) : productCatalog.find((item) => item.id === id);
  if (!record) return <EmptyState title="Item not found" body="That listing is no longer available." cta="Browse marketplace" href="/products" />;

  const meta = type === "meal" && "prep_minutes" in record ? `${record.prep_minutes} minute prep` : `${"stock" in record ? record.stock : 0} in stock`;
  const editHref = type === "meal" ? `/meals/${record.id}/edit` : `/products/${record.id}/edit`;

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_420px]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-white shadow-sm">
        <img src={record.image_url} alt={record.name} className="size-full object-cover" />
      </div>
      <section className="grid content-start gap-5 rounded-md border border-ink/10 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-leaf">{type === "meal" ? "Prepared meal" : "Packaged food"}</p>
        <h1 className="text-4xl font-black text-ink">{record.name}</h1>
        <p className="text-3xl font-black text-tomato">{formatMoney(record.price_cents)}</p>
        <p className="text-ink/65">{record.description}</p>
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-ink/60">
          {type === "meal" ? <Clock size={18} /> : <PackageCheck size={18} />} {meta}
        </p>
        <AddToCartButton item={{ id: record.id, type, quantity: 1 }} onAdd={addToCart} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/cart" className="inline-flex h-11 items-center justify-center rounded-md border border-ink/15 px-5 text-sm font-semibold text-ink">
            View cart
          </Link>
          {currentUser?.role === "admin" ? (
            <Link href={editHref} className="inline-flex h-11 items-center justify-center rounded-md bg-saffron px-5 text-sm font-semibold text-ink">
              Edit listing
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function AdminListingEditPage({
  type,
  id,
  mealCatalog,
  productCatalog,
  updateMeal,
  updateProduct
}: {
  type: "meal" | "product";
  id: string;
  mealCatalog: DemoMeal[];
  productCatalog: DemoProduct[];
  updateMeal: (id: string, updates: Partial<DemoMeal>) => void;
  updateProduct: (id: string, updates: Partial<DemoProduct>) => void;
}) {
  const meal = type === "meal" ? mealCatalog.find((item) => item.id === id) : undefined;
  const product = type === "product" ? productCatalog.find((item) => item.id === id) : undefined;
  const record = meal ?? product;

  if (!record) {
    return <EmptyState title="Listing not found" body="That meal or product is no longer available." cta="Back to admin" href="/admin" />;
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[320px_1fr]">
      <aside className="h-fit rounded-md border border-ink/10 bg-white p-5 shadow-sm">
        <img src={record.image_url} alt={record.name} className="aspect-square w-full rounded-md object-cover" />
        <h1 className="mt-5 text-2xl font-black text-ink">Edit {record.name}</h1>
        <p className="mt-2 text-sm text-ink/60">
          Admins can edit every prepared food and packaged product from this screen.
        </p>
        <div className="mt-5 grid gap-3">
          <Link href={type === "meal" ? `/meals/${record.id}` : `/products/${record.id}`} className="inline-flex h-11 items-center justify-center rounded-md bg-ink px-5 text-sm font-semibold text-white">
            Preview listing
          </Link>
          <Link href="/cart" className="inline-flex h-11 items-center justify-center rounded-md border border-ink/15 px-5 text-sm font-semibold text-ink">
            View cart
          </Link>
        </div>
      </aside>
      <section className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-ink/10 pb-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-leaf">Admin editor</p>
            <h2 className="text-3xl font-black text-ink">{type === "meal" ? "Prepared food" : "Packaged product"}</h2>
          </div>
          <span className="rounded-md bg-saffron/25 px-3 py-2 text-sm font-black text-ink">Autosaves locally</span>
        </div>
        <div className="mt-5">
          {meal ? (
            <MealEditor meal={meal} updateMeal={updateMeal} />
          ) : product ? (
            <ProductEditor product={product} updateProduct={updateProduct} />
          ) : null}
        </div>
      </section>
    </main>
  );
}

function CartPage({ cart, updateQuantity, mealCatalog, productCatalog }: { cart: CartItem[]; updateQuantity: (item: CartItem) => void; mealCatalog: DemoMeal[]; productCatalog: DemoProduct[] }) {
  const lines = cart.map((item) => {
    const record = item.type === "meal" ? mealCatalog.find((meal) => meal.id === item.id) : productCatalog.find((product) => product.id === item.id);
    return { ...item, record };
  }).filter((line) => line.record);
  const subtotal = lines.reduce((sum, line) => sum + (line.record?.price_cents ?? 0) * line.quantity, 0);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-4xl font-black text-ink">Cart</h1>
      {!lines.length ? (
        <div className="mt-8"><EmptyState title="Your cart is empty" body="Add meals or packaged products before checking out." cta="Browse products" href="/products" /></div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-3">
            {lines.map((line) => (
              <div key={`${line.type}-${line.id}`} className="flex items-center justify-between gap-4 rounded-md border border-ink/10 bg-white p-4 shadow-sm">
                <div>
                  <p className="font-semibold text-ink">{line.record?.name}</p>
                  <p className="text-sm text-ink/55">{line.type} · {formatMoney(line.record?.price_cents ?? 0)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Input className="w-20" type="number" min={1} value={line.quantity} onChange={(event) => updateQuantity({ id: line.id, type: line.type, quantity: Number(event.target.value) || 1 })} />
                  <p className="w-24 text-right font-black text-ink">{formatMoney((line.record?.price_cents ?? 0) * line.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
          <OrderSummary subtotal={subtotal} />
        </div>
      )}
    </main>
  );
}

function OrderSummary({ subtotal }: { subtotal: number }) {
  const delivery = subtotal > 0 ? 499 : 0;
  return (
    <aside className="h-fit rounded-md border border-ink/10 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between text-sm text-ink/60"><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>
      <div className="mt-3 flex items-center justify-between text-sm text-ink/60"><span>Estimated delivery</span><span>{formatMoney(delivery)}</span></div>
      <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-5 text-lg font-black"><span>Total</span><span>{formatMoney(subtotal + delivery)}</span></div>
      <Link href="/checkout" className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-md bg-ink px-5 text-sm font-semibold text-white">Checkout</Link>
      <Link href="/products" className="mt-4 block text-center text-sm font-bold text-leaf">Keep shopping</Link>
    </aside>
  );
}

function CheckoutPage({ cart, mealCatalog, productCatalog }: { cart: CartItem[]; mealCatalog: DemoMeal[]; productCatalog: DemoProduct[] }) {
  const subtotal = cart.reduce((sum, line) => {
    const record = line.type === "meal" ? mealCatalog.find((item) => item.id === line.id) : productCatalog.find((item) => item.id === line.id);
    return sum + (record?.price_cents ?? 0) * line.quantity;
  }, 0);

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_360px]">
      <section>
        <h1 className="text-4xl font-black text-ink">Checkout</h1>
        <p className="mt-2 text-ink/60">Add a delivery address and continue to payment.</p>
        <form className="mt-6 grid gap-4 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
        <Field label="Street address"><Input defaultValue="18 Lumley Beach Road" /></Field>
        <div className="grid gap-4 md:grid-cols-3">
            <Field label="City"><Input defaultValue="Freetown" /></Field>
            <Field label="Area"><Input defaultValue="Western Area" /></Field>
            <Field label="Postcode"><Input defaultValue="00232" /></Field>
          </div>
          <Field label="Delivery instructions"><Textarea placeholder="Gate code, dropoff details, allergies, or notes" /></Field>
          <Button type="button" className="gap-2" onClick={() => navigate("/orders")}>
            <CreditCard size={18} /> Place demo order
          </Button>
        </form>
      </section>
      <OrderSummary subtotal={subtotal} />
    </main>
  );
}

function OrdersPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-4xl font-black text-ink">Order history</h1>
      <div className="mt-8 grid gap-3">
        {orders.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`} className="flex flex-col justify-between gap-3 rounded-md border border-ink/10 bg-white p-4 shadow-sm md:flex-row md:items-center">
            <div><p className="font-black text-ink">Order {order.id}</p><p className="text-sm capitalize text-ink/60">{order.status.replaceAll("_", " ")} · {order.placed_at}</p></div>
            <p className="text-lg font-black text-ink">{formatMoney(order.total_cents)}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

function OrderTrackingPage({ id }: { id: string }) {
  const order = orders.find((item) => item.id === id) ?? orders[0];
  const statuses = ["pending", "accepted", "preparing", "picked_up", "on_the_way", "delivered"];
  const current = statuses.indexOf(order.status);
  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_360px]">
      <section className="rounded-md border border-ink/10 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-leaf">Tracking</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Order {order.id}</h1>
        <div className="mt-8 grid gap-4">
          {statuses.map((status, index) => (
            <div key={status} className="flex items-center gap-3">
              <CheckCircle2 className={index <= current ? "text-leaf" : "text-ink/25"} />
              <span className={index <= current ? "font-bold capitalize text-ink" : "font-semibold capitalize text-ink/40"}>{status.replaceAll("_", " ")}</span>
            </div>
          ))}
        </div>
      </section>
      <aside className="h-fit rounded-md border border-ink/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-ink">Items</h2>
        <div className="mt-4 grid gap-3 text-sm text-ink/65">{order.items.map((item) => <p key={item}>{item}</p>)}</div>
        <div className="mt-5 flex justify-between border-t border-ink/10 pt-5 text-lg font-black"><span>Total</span><span>{formatMoney(order.total_cents)}</span></div>
      </aside>
    </main>
  );
}

function DashboardShell({ title, subtitle, nav, children }: { title: string; subtitle: string; nav: string[][]; children: React.ReactNode }) {
  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[240px_1fr]">
      <aside className="h-fit rounded-md border border-ink/10 bg-white p-3 shadow-sm">
        <div className="border-b border-ink/10 p-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf">Dashboard</p>
          <h1 className="mt-2 text-xl font-black text-ink">{title}</h1>
          <p className="mt-1 text-sm text-ink/60">{subtitle}</p>
        </div>
        <nav className="mt-3 grid gap-1">
          {nav.map(([href, label]) => <Link key={`${href}-${label}`} href={href} className="rounded-md px-3 py-2 text-sm font-semibold text-ink/70 hover:bg-cloud hover:text-ink">{label}</Link>)}
        </nav>
      </aside>
      <section className="min-w-0">{children}</section>
    </main>
  );
}

function CustomerDashboard({ currentUser }: { currentUser: AuthUser }) {
  return (
    <DashboardShell title="Customer" subtitle={`Welcome back, ${currentUser.full_name}.`} nav={dashboardNav.customer}>
      <div className="grid gap-6">
        <Stats cards={[["Active orders", "1", Clock], ["Saved address", currentUser.address, MapPin], ["Recent spend", formatMoney(5534), PackageCheck]]} />
        <Panel title="Recent orders" actionHref="/orders" action="View orders">
          {orders.map((order) => <Row key={order.id} left={`Order ${order.id}`} sub={order.status.replaceAll("_", " ")} right={formatMoney(order.total_cents)} href={`/orders/${order.id}`} />)}
        </Panel>
      </div>
    </DashboardShell>
  );
}

function SellerDashboard({
  currentUser,
  mealCatalog,
  productCatalog,
  addProduct,
  updateProduct,
  deleteProduct
}: {
  currentUser: AuthUser;
  mealCatalog: DemoMeal[];
  productCatalog: DemoProduct[];
  addProduct: (product: DemoProduct) => void;
  updateProduct: (id: string, updates: Partial<DemoProduct>) => void;
  deleteProduct: (id: string) => void;
}) {
  const [orderState, setOrderState] = useState("accepted");
  const [newProduct, setNewProduct] = useState<DemoProduct>({
    id: "new-product",
    category_slug: "pantry",
    name: "Cassava leaf stew bowl",
    description: "Fresh African pantry or ready meal listing.",
    image_url: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=1200&q=80",
    price_cents: 1450,
    stock: 20,
    is_available: true
  });

  return (
    <DashboardShell title="Seller" subtitle={`${currentUser.full_name}, manage stores, listings, and fulfillment.`} nav={dashboardNav.seller}>
      <div className="grid gap-6">
        <Stats cards={[["Approval", "approved", ShieldCheck], ["Restaurants", "5", Store], ["Listings", "25", Package], ["Incoming orders", "8", Clock]]} />
        <section className="grid gap-6 lg:grid-cols-2">
          <form className="grid gap-4 rounded-md border border-ink/10 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-ink">Create restaurant/store profile</h2>
            <Field label="Business name"><Input defaultValue="Freetown Food Group" /></Field>
            <Field label="Cuisine or store category"><Input defaultValue="West African kitchen" /></Field>
            <Field label="Address"><Input defaultValue="18 Lumley Beach Road, Freetown" /></Field>
            <Button type="button">Save profile</Button>
          </form>
          <form
            className="grid gap-4 rounded-md border border-ink/10 bg-white p-5 shadow-sm"
            onSubmit={(event) => {
              event.preventDefault();
              const id = newProduct.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") || `product-${Date.now()}`;
              addProduct({ ...newProduct, id });
              setNewProduct({ ...newProduct, id: "new-product", name: "", description: "", stock: 10, price_cents: 1000, is_available: true });
            }}
          >
            <h2 className="text-xl font-black text-ink">Create product listing</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Category">
                <Select value={newProduct.category_slug} onChange={(event) => setNewProduct((product) => ({ ...product, category_slug: event.target.value }))}>
                  {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
                </Select>
              </Field>
              <Field label="Price">
                <Input type="number" min={0} step="0.01" value={(newProduct.price_cents / 100).toFixed(2)} onChange={(event) => setNewProduct((product) => ({ ...product, price_cents: Math.round(Number(event.target.value || 0) * 100) }))} />
              </Field>
            </div>
            <Field label="Name"><Input value={newProduct.name} onChange={(event) => setNewProduct((product) => ({ ...product, name: event.target.value }))} /></Field>
            <Field label="Image URL"><Input value={newProduct.image_url} onChange={(event) => setNewProduct((product) => ({ ...product, image_url: event.target.value }))} /></Field>
            <Field label="Description"><Textarea value={newProduct.description} onChange={(event) => setNewProduct((product) => ({ ...product, description: event.target.value }))} /></Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Stock"><Input type="number" min={0} value={newProduct.stock} onChange={(event) => setNewProduct((product) => ({ ...product, stock: Number(event.target.value || 0) }))} /></Field>
              <Field label="Availability">
                <Select value={newProduct.is_available === false ? "unavailable" : "available"} onChange={(event) => setNewProduct((product) => ({ ...product, is_available: event.target.value === "available" }))}>
                  <option value="available">Available in marketplace</option>
                  <option value="unavailable">Hidden from marketplace</option>
                </Select>
              </Field>
            </div>
            <Button>Add listing</Button>
          </form>
        </section>
        <Panel title="Marketplace product CRUD">
          {productCatalog.length > 0 ? (
            productCatalog.map((product) => (
              <ProductEditor key={product.id} product={product} updateProduct={updateProduct} deleteProduct={deleteProduct} />
            ))
          ) : (
            <EmptyState title="No products yet" body="Create a product listing above to publish it into the marketplace." cta="Browse marketplace" href="/products" />
          )}
        </Panel>
        <Panel title="Incoming order controls">
          {orders.map((order) => (
            <div key={order.id} className="grid gap-3 rounded-md bg-cloud p-3 md:grid-cols-[1fr_180px_auto] md:items-center">
              <span><strong className="text-ink">Order {order.id}</strong><span className="mt-1 block text-sm text-ink/60">{order.items.join(", ")}</span></span>
              <Select value={orderState} onChange={(event) => setOrderState(event.target.value)}>
                <option value="accepted">accepted</option>
                <option value="rejected">rejected</option>
                <option value="preparing">preparing</option>
                <option value="ready">ready</option>
              </Select>
              <Button type="button">Update</Button>
            </div>
          ))}
        </Panel>
        <section className="grid gap-6 lg:grid-cols-2">
          <Panel title="Meals">{mealCatalog.slice(0, 4).map((meal) => <Row key={meal.id} left={meal.name} sub={`${meal.prep_minutes} min`} right={formatMoney(meal.price_cents)} href={`/meals/${meal.id}`} />)}</Panel>
          <Panel title="Packaged products">{productCatalog.slice(0, 4).map((product) => <Row key={product.id} left={product.name} sub={`${product.stock} in stock`} right={formatMoney(product.price_cents)} href={`/products/${product.id}`} />)}</Panel>
        </section>
      </div>
    </DashboardShell>
  );
}

function ProductEditor({
  product,
  updateProduct,
  deleteProduct
}: {
  product: DemoProduct;
  updateProduct: (id: string, updates: Partial<DemoProduct>) => void;
  deleteProduct?: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 rounded-md bg-cloud p-4 lg:grid-cols-[120px_1fr]">
      <img src={product.image_url} alt={product.name} className="aspect-square w-full rounded-md object-cover" />
      <div className="grid gap-3">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Product name">
            <Input value={product.name} onChange={(event) => updateProduct(product.id, { name: event.target.value })} />
          </Field>
          <Field label="Price">
            <Input type="number" min={0} step="0.01" value={(product.price_cents / 100).toFixed(2)} onChange={(event) => updateProduct(product.id, { price_cents: Math.round(Number(event.target.value || 0) * 100) })} />
          </Field>
        </div>
        <Field label="Image URL">
          <Input value={product.image_url} onChange={(event) => updateProduct(product.id, { image_url: event.target.value })} />
        </Field>
        <Field label="Description">
          <Textarea value={product.description} onChange={(event) => updateProduct(product.id, { description: event.target.value })} />
        </Field>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Category">
            <Select value={product.category_slug} onChange={(event) => updateProduct(product.id, { category_slug: event.target.value })}>
              {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
            </Select>
          </Field>
          <Field label="Stock">
            <Input type="number" min={0} value={product.stock} onChange={(event) => updateProduct(product.id, { stock: Number(event.target.value || 0) })} />
          </Field>
        </div>
        <Field label="Availability">
          <Select value={product.is_available === false ? "unavailable" : "available"} onChange={(event) => updateProduct(product.id, { is_available: event.target.value === "available" })}>
            <option value="available">Available in marketplace</option>
            <option value="unavailable">Hidden from marketplace</option>
          </Select>
        </Field>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink/60">
          <span>Route: /products/{product.id}</span>
          <div className="flex flex-wrap gap-3">
            <Link href={`/products/${product.id}`} className="font-bold text-leaf">Preview listing</Link>
            {deleteProduct ? (
              <button
                type="button"
                className="inline-flex items-center gap-1 font-bold text-tomato"
                onClick={() => {
                  if (window.confirm(`Delete ${product.name}? This removes it from the marketplace and cart.`)) {
                    deleteProduct(product.id);
                  }
                }}
              >
                <Trash2 size={15} /> Delete
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function MealEditor({
  meal,
  updateMeal
}: {
  meal: DemoMeal;
  updateMeal: (id: string, updates: Partial<DemoMeal>) => void;
}) {
  return (
    <div className="grid gap-4 rounded-md bg-cloud p-4 lg:grid-cols-[120px_1fr]">
      <img src={meal.image_url} alt={meal.name} className="aspect-square w-full rounded-md object-cover" />
      <div className="grid gap-3">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Meal name">
            <Input value={meal.name} onChange={(event) => updateMeal(meal.id, { name: event.target.value })} />
          </Field>
          <Field label="Price">
            <Input type="number" min={0} step="0.01" value={(meal.price_cents / 100).toFixed(2)} onChange={(event) => updateMeal(meal.id, { price_cents: Math.round(Number(event.target.value || 0) * 100) })} />
          </Field>
        </div>
        <Field label="Image URL">
          <Input value={meal.image_url} onChange={(event) => updateMeal(meal.id, { image_url: event.target.value })} />
        </Field>
        <Field label="Description">
          <Textarea value={meal.description} onChange={(event) => updateMeal(meal.id, { description: event.target.value })} />
        </Field>
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Restaurant">
            <Select value={meal.restaurant_id} onChange={(event) => updateMeal(meal.id, { restaurant_id: event.target.value })}>
              {restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>)}
            </Select>
          </Field>
          <Field label="Category">
            <Select value={meal.category_slug} onChange={(event) => updateMeal(meal.id, { category_slug: event.target.value })}>
              {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
            </Select>
          </Field>
          <Field label="Prep minutes">
            <Input type="number" min={0} value={meal.prep_minutes} onChange={(event) => updateMeal(meal.id, { prep_minutes: Number(event.target.value || 0) })} />
          </Field>
        </div>
        <Field label="Availability">
          <Select value={meal.is_available === false ? "unavailable" : "available"} onChange={(event) => updateMeal(meal.id, { is_available: event.target.value === "available" })}>
            <option value="available">Available on menus</option>
            <option value="unavailable">Hidden from menus</option>
          </Select>
        </Field>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink/60">
          <span>Route: /meals/{meal.id}</span>
          <Link href={`/meals/${meal.id}`} className="font-bold text-leaf">Preview listing</Link>
        </div>
      </div>
    </div>
  );
}

function DriverDashboard({ currentUser }: { currentUser: AuthUser }) {
  const [deliveryStatus, setDeliveryStatus] = useState("accepted");

  return (
    <DashboardShell title="Driver" subtitle={`${currentUser.full_name}, accept assigned deliveries and update progress.`} nav={dashboardNav.driver}>
      <Panel title="Assigned deliveries">
        {orders.map((order) => (
          <div key={order.id} className="grid gap-3 rounded-md bg-cloud p-3 md:grid-cols-[1fr_180px_auto] md:items-center">
            <span><strong className="text-ink">Delivery {order.id}</strong><span className="mt-1 block text-sm capitalize text-ink/60">{order.status.replaceAll("_", " ")}</span></span>
            <Select value={deliveryStatus} onChange={(event) => setDeliveryStatus(event.target.value)}>
              <option value="accepted">accepted</option>
              <option value="picked_up">picked up</option>
              <option value="on_the_way">on the way</option>
              <option value="delivered">delivered</option>
            </Select>
            <Button type="button">Update</Button>
          </div>
        ))}
      </Panel>
    </DashboardShell>
  );
}

function AdminDashboard({
  currentUser,
  users,
  mealCatalog,
  productCatalog,
  addUser,
  updateUser,
  deleteUser
}: {
  currentUser: AuthUser;
  users: AuthUser[];
  mealCatalog: DemoMeal[];
  productCatalog: DemoProduct[];
  addUser: (user: Omit<AuthUser, "id">) => { ok: true; user: AuthUser } | { ok: false; message: string };
  updateUser: (id: string, updates: Partial<AuthUser>) => void;
  deleteUser: (id: string) => void;
}) {
  const [sellerStatus, setSellerStatus] = useState("approved");
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [newUser, setNewUser] = useState<Omit<AuthUser, "id">>({
    full_name: "",
    email: "",
    password: "DemoPass123!",
    role: "customer",
    status: "active",
    address: "New delivery address"
  });
  const selectedUser = users.find((user) => user.id === selectedUserId) ?? users[0];

  useEffect(() => {
    if (!selectedUserId && users[0]) {
      setSelectedUserId(users[0].id);
    }
    if (selectedUserId && !users.some((user) => user.id === selectedUserId)) {
      setSelectedUserId(users[0]?.id ?? "");
    }
  }, [selectedUserId, users]);

  return (
    <DashboardShell title="Admin" subtitle={`${currentUser.full_name}, manage users, sellers, listings, categories, revenue, and commission.`} nav={dashboardNav.admin}>
      <div className="grid gap-6">
        <Stats cards={[["Orders", "24", ShoppingCart], ["Revenue", formatMoney(128940), CreditCard], ["Commission", formatMoney(15472), ShieldCheck], ["Categories", "5", Package]]} />
        <section className="grid gap-6 lg:grid-cols-2">
          <Panel title="Seller approvals">
            {restaurants.slice(0, 4).map((restaurant) => (
              <div key={restaurant.id} className="grid gap-3 rounded-md bg-cloud p-3 md:grid-cols-[1fr_160px_auto] md:items-center">
                <span><strong className="text-ink">{restaurant.name}</strong><span className="mt-1 block text-sm text-ink/60">{restaurant.cuisine}</span></span>
                <Select value={sellerStatus} onChange={(event) => setSellerStatus(event.target.value)}>
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                  <option value="suspended">suspended</option>
                </Select>
                <Button type="button">Save</Button>
              </div>
            ))}
          </Panel>
          <Panel title="Manage users">
            <form
              className="grid gap-3 rounded-md bg-cloud p-3"
              onSubmit={(event) => {
                event.preventDefault();
                setMessage("");
                const result = addUser(newUser);
                if (!result.ok) {
                  setMessage(result.message);
                  return;
                }
                setSelectedUserId(result.user.id);
                setNewUser({
                  full_name: "",
                  email: "",
                  password: "DemoPass123!",
                  role: "customer",
                  status: "active",
                  address: "New delivery address"
                });
                setMessage(`${result.user.full_name} was created.`);
              }}
            >
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Full name">
                  <Input required value={newUser.full_name} onChange={(event) => setNewUser((user) => ({ ...user, full_name: event.target.value }))} />
                </Field>
                <Field label="Email">
                  <Input required type="email" value={newUser.email} onChange={(event) => setNewUser((user) => ({ ...user, email: event.target.value }))} />
                </Field>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="Role">
                  <Select value={newUser.role} onChange={(event) => setNewUser((user) => ({ ...user, role: event.target.value as Role }))}>
                    <option value="customer">Customer</option>
                    <option value="seller">Seller</option>
                    <option value="driver">Driver</option>
                    <option value="admin">Admin</option>
                  </Select>
                </Field>
                <Field label="Status">
                  <Select value={newUser.status} onChange={(event) => setNewUser((user) => ({ ...user, status: event.target.value as AuthStatus }))}>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="disabled">Disabled</option>
                  </Select>
                </Field>
                <Field label="Password">
                  <Input required value={newUser.password} onChange={(event) => setNewUser((user) => ({ ...user, password: event.target.value }))} />
                </Field>
              </div>
              <Button type="submit">Create user</Button>
            </form>
            {message ? <p className="rounded-md bg-leaf/10 px-3 py-2 text-sm font-semibold text-leaf">{message}</p> : null}
            <div className="grid gap-2">
              {users.map((user) => (
                <div key={user.id} className="grid gap-3 rounded-md bg-cloud p-3 md:grid-cols-[1fr_110px_auto] md:items-center">
                  <span>
                    <strong className="text-ink">{user.full_name}</strong>
                    <span className="mt-1 block text-sm text-ink/60">{user.email} · {user.role} · {user.status}</span>
                  </span>
                  <span className={cn("rounded-md px-2 py-1 text-center text-xs font-black capitalize", user.status === "active" ? "bg-leaf/15 text-leaf" : user.status === "pending" ? "bg-saffron/30 text-ink" : "bg-tomato/10 text-tomato")}>
                    {user.status}
                  </span>
                  <Button type="button" className="h-10 px-4" onClick={() => setSelectedUserId(user.id)}>Manage</Button>
                </div>
              ))}
            </div>
            {selectedUser ? (
              <div className="grid gap-3 rounded-md border border-ink/10 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-ink">Editing {selectedUser.full_name}</h3>
                    <p className="text-sm text-ink/60">Changes save immediately to the local user store.</p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-sm font-bold text-tomato disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={selectedUser.id === currentUser.id}
                    onClick={() => {
                      if (window.confirm(`Delete ${selectedUser.full_name}?`)) {
                        deleteUser(selectedUser.id);
                      }
                    }}
                  >
                    <Trash2 size={15} /> Delete user
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Full name">
                    <Input value={selectedUser.full_name} onChange={(event) => updateUser(selectedUser.id, { full_name: event.target.value })} />
                  </Field>
                  <Field label="Email">
                    <Input type="email" value={selectedUser.email} onChange={(event) => updateUser(selectedUser.id, { email: event.target.value.trim().toLowerCase() })} />
                  </Field>
                </div>
                <Field label="Address">
                  <Input value={selectedUser.address} onChange={(event) => updateUser(selectedUser.id, { address: event.target.value })} />
                </Field>
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="Role">
                    <Select value={selectedUser.role} disabled={selectedUser.id === currentUser.id} onChange={(event) => updateUser(selectedUser.id, { role: event.target.value as Role })}>
                      <option value="customer">Customer</option>
                      <option value="seller">Seller</option>
                      <option value="driver">Driver</option>
                      <option value="admin">Admin</option>
                    </Select>
                  </Field>
                  <Field label="Status">
                    <Select value={selectedUser.status} disabled={selectedUser.id === currentUser.id} onChange={(event) => updateUser(selectedUser.id, { status: event.target.value as AuthStatus })}>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="disabled">Disabled</option>
                    </Select>
                  </Field>
                  <Field label="Password">
                    <Input value={selectedUser.password} onChange={(event) => updateUser(selectedUser.id, { password: event.target.value })} />
                  </Field>
                </div>
              </div>
            ) : null}
          </Panel>
        </section>
        <Panel title="Categories">
          <form className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
            <Input placeholder="Category name" defaultValue="Prepared meals" />
            <Select defaultValue="meal"><option value="meal">Meals</option><option value="product">Products</option><option value="">Both</option></Select>
            <Button type="button" className="gap-2"><SlidersHorizontal size={16} /> Add</Button>
          </form>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => <span key={category.id} className="rounded-md bg-cloud px-3 py-2 text-sm font-semibold text-ink/70">{category.name}</span>)}
          </div>
        </Panel>
        <Panel title="Manage meals and products">
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="grid gap-3">
              <h3 className="text-lg font-black text-ink">Prepared foods</h3>
              {mealCatalog.map((meal) => (
                <Row key={meal.id} left={meal.name} sub={`${meal.prep_minutes} min · ${meal.is_available === false ? "hidden" : "available"}`} right="Edit" href={`/meals/${meal.id}/edit`} />
              ))}
            </div>
            <div className="grid gap-3">
              <h3 className="text-lg font-black text-ink">Packaged products</h3>
              {productCatalog.map((product) => (
                <Row key={product.id} left={product.name} sub={`${product.stock} in stock · ${product.is_available === false ? "hidden" : "available"}`} right="Edit" href={`/products/${product.id}/edit`} />
              ))}
            </div>
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}

function Stats({ cards }: { cards: [string, string, React.ComponentType<{ className?: string }>][] }) {
  return (
    <section className="grid gap-4 md:grid-cols-4">
      {cards.map(([label, value, Icon]) => (
        <div key={label} className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
          <Icon className="text-leaf" />
          <p className="mt-4 text-sm font-semibold text-ink/55">{label}</p>
          <p className="mt-1 text-2xl font-black capitalize text-ink">{value}</p>
        </div>
      ))}
    </section>
  );
}

function Panel({ title, actionHref, action, children }: { title: string; actionHref?: string; action?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-ink">{title}</h2>
        {actionHref && action ? <Link className="text-sm font-bold text-leaf" href={actionHref}>{action}</Link> : null}
      </div>
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  );
}

function Row({ left, sub, right, href }: { left: string; sub: string; right: string; href: string }) {
  return (
    <Link href={href} className="flex flex-col justify-between gap-2 rounded-md bg-cloud p-3 md:flex-row md:items-center">
      <span><strong className="text-ink">{left}</strong><span className="mt-1 block text-sm capitalize text-ink/60">{sub}</span></span>
      <span className="font-black text-ink">{right}</span>
    </Link>
  );
}

export default function App() {
  const path = usePath();
  const [users, setUsers] = useState<AuthUser[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(authUsersKey) ?? "[]") as AuthUser[];
      const emails = new Set(stored.map((user) => user.email.toLowerCase()));
      const missingSeeds = seedAuthUsers.filter((user) => !emails.has(user.email.toLowerCase()));
      return [...stored, ...missingSeeds];
    } catch {
      return seedAuthUsers;
    }
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => localStorage.getItem(activeUserKey));
  const currentUser = useMemo(() => users.find((user) => user.id === currentUserId) ?? null, [currentUserId, users]);
  const [mealCatalog, setMealCatalog] = useState<DemoMeal[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("freshlane-meals") ?? "null") as DemoMeal[] || initialMeals;
    } catch {
      return initialMeals;
    }
  });
  const [productCatalog, setProductCatalog] = useState<DemoProduct[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("freshlane-products") ?? "null") as DemoProduct[] || initialProducts;
    } catch {
      return initialProducts;
    }
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("freshlane-cart") ?? "[]") as CartItem[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(authUsersKey, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(activeUserKey, currentUserId);
    } else {
      localStorage.removeItem(activeUserKey);
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem("freshlane-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("freshlane-meals", JSON.stringify(mealCatalog));
  }, [mealCatalog]);

  useEffect(() => {
    localStorage.setItem("freshlane-products", JSON.stringify(productCatalog));
  }, [productCatalog]);

  const addToCart = (item: CartItem) => {
    setCart((current) => {
      const existing = current.find((line) => line.id === item.id && line.type === item.type);
      if (existing) {
        return current.map((line) => line === existing ? { ...line, quantity: line.quantity + item.quantity } : line);
      }
      return [...current, item];
    });
  };

  const updateQuantity = (item: CartItem) => {
    setCart((current) => current.map((line) => line.id === item.id && line.type === item.type ? { ...line, quantity: item.quantity } : line));
  };

  const addProduct = (product: DemoProduct) => {
    setProductCatalog((current) => {
      const exists = current.some((item) => item.id === product.id);
      return exists ? current.map((item) => item.id === product.id ? product : item) : [product, ...current];
    });
  };

  const updateProduct = (id: string, updates: Partial<DemoProduct>) => {
    setProductCatalog((current) => current.map((product) => product.id === id ? { ...product, ...updates } : product));
  };

  const updateMeal = (id: string, updates: Partial<DemoMeal>) => {
    setMealCatalog((current) => current.map((meal) => meal.id === id ? { ...meal, ...updates } : meal));
  };

  const deleteProduct = (id: string) => {
    setProductCatalog((current) => current.filter((product) => product.id !== id));
    setCart((current) => current.filter((item) => item.type !== "product" || item.id !== id));
  };

  const login = (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find((item) => item.email.toLowerCase() === normalizedEmail);

    if (!user || user.password !== password) {
      return { ok: false as const, message: "Email or password is incorrect." };
    }

    if (user.status !== "active") {
      return { ok: false as const, message: "This account is not active yet." };
    }

    setCurrentUserId(user.id);
    return { ok: true as const, user };
  };

  const signup = (user: Omit<AuthUser, "id" | "status" | "address">) => {
    const normalizedEmail = user.email.trim().toLowerCase();

    if (users.some((item) => item.email.toLowerCase() === normalizedEmail)) {
      return { ok: false as const, message: "An account with this email already exists. Log in instead." };
    }

    const createdUser: AuthUser = {
      ...user,
      id: `${user.role}-${Date.now()}`,
      email: normalizedEmail,
      full_name: user.full_name.trim(),
      status: "active",
      address: "New delivery address"
    };

    setUsers((current) => [createdUser, ...current]);
    setCurrentUserId(createdUser.id);
    return { ok: true as const, user: createdUser };
  };

  const addUser = (user: Omit<AuthUser, "id">) => {
    const normalizedEmail = user.email.trim().toLowerCase();

    if (users.some((item) => item.email.toLowerCase() === normalizedEmail)) {
      return { ok: false as const, message: "An account with this email already exists." };
    }

    const createdUser: AuthUser = {
      ...user,
      id: `${user.role}-${Date.now()}`,
      email: normalizedEmail,
      full_name: user.full_name.trim()
    };

    setUsers((current) => [createdUser, ...current]);
    return { ok: true as const, user: createdUser };
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

  const logout = () => {
    setCurrentUserId(null);
    navigate("/login");
  };

  const page = useMemo(() => {
    const requiredRole = protectedRoleForPath(path);

    if (requiredRole && !currentUser) {
      return <AuthRequired role={requiredRole} />;
    }

    if (requiredRole && currentUser && currentUser.role !== requiredRole) {
      return <AccessDenied currentUser={currentUser} requiredRole={requiredRole} />;
    }

    if (path === "/") return <HomePage mealCatalog={mealCatalog} productCatalog={productCatalog} />;
    if (path === "/login") return <AuthPage mode="login" users={users} onLogin={login} onSignup={signup} />;
    if (path === "/signup") return <AuthPage mode="signup" users={users} onLogin={login} onSignup={signup} />;
    if (path === "/restaurants") return <RestaurantsPage />;
    if (path.startsWith("/restaurants/")) return <RestaurantDetailPage id={path.split("/").pop() ?? ""} mealCatalog={mealCatalog} />;
    if (path === "/products") return <ProductsPage productCatalog={productCatalog} />;
    if (path.startsWith("/meals/") && path.endsWith("/edit")) return <AdminListingEditPage type="meal" id={path.split("/")[2] ?? ""} mealCatalog={mealCatalog} productCatalog={productCatalog} updateMeal={updateMeal} updateProduct={updateProduct} />;
    if (path.startsWith("/products/") && path.endsWith("/edit")) return <AdminListingEditPage type="product" id={path.split("/")[2] ?? ""} mealCatalog={mealCatalog} productCatalog={productCatalog} updateMeal={updateMeal} updateProduct={updateProduct} />;
    if (path.startsWith("/meals/")) return <DetailPage type="meal" id={path.split("/").pop() ?? ""} addToCart={addToCart} mealCatalog={mealCatalog} productCatalog={productCatalog} currentUser={currentUser} />;
    if (path.startsWith("/products/")) return <DetailPage type="product" id={path.split("/").pop() ?? ""} addToCart={addToCart} mealCatalog={mealCatalog} productCatalog={productCatalog} currentUser={currentUser} />;
    if (path === "/cart") return <CartPage cart={cart} updateQuantity={updateQuantity} mealCatalog={mealCatalog} productCatalog={productCatalog} />;
    if (path === "/checkout") return <CheckoutPage cart={cart} mealCatalog={mealCatalog} productCatalog={productCatalog} />;
    if (path === "/orders") return <OrdersPage />;
    if (path.startsWith("/orders/")) return <OrderTrackingPage id={path.split("/").pop() ?? ""} />;
    if (path === "/customer" && currentUser) return <CustomerDashboard currentUser={currentUser} />;
    if (path === "/seller" && currentUser) return <SellerDashboard currentUser={currentUser} mealCatalog={mealCatalog} productCatalog={productCatalog} addProduct={addProduct} updateProduct={updateProduct} deleteProduct={deleteProduct} />;
    if (path === "/driver" && currentUser) return <DriverDashboard currentUser={currentUser} />;
    if (path === "/admin" && currentUser) return <AdminDashboard currentUser={currentUser} users={users} mealCatalog={mealCatalog} productCatalog={productCatalog} addUser={addUser} updateUser={updateUser} deleteUser={deleteUser} />;
    return <EmptyState title="Page not found" body="That route is not available in the Vite app." cta="Go home" href="/" />;
  }, [cart, currentUser, mealCatalog, path, productCatalog, users]);

  return (
    <>
      <Navigation currentUser={currentUser} onLogout={logout} />
      {page}
    </>
  );
}
