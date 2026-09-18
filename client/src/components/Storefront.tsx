/**
 * Design reminder: Figma-reference fidelity — clean editorial ecommerce, hairline rules, compact labels,
 * paper-white background, navy transactional controls, and restrained #B54708 accents.
 */
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Heart,
  LockKeyhole,
  Mail,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

type CategoryKey = "kitchen" | "clothes" | "shoes" | "bags";

type Product = {
  id: string;
  name: string;
  category: CategoryKey;
  price: number;
  formerPrice?: number;
  image: string;
  description: string;
  condition: string;
  color: string;
  featured?: boolean;
};

type CartLine = Product & { quantity: number };

const ASSETS = {
  logo: "/assets/oma-mark_f099d3f1.png",
  mixer: "/assets/oma-appliance-mixer_c1945170.jpg",
  knit: "/assets/oma-clothes-knit_f0d25c92.jpg",
  sneakers: "/assets/oma-shoes-sneakers_618d2c38.jpg",
  bag: "/assets/oma-bags-leather_7228d40b.jpg",
  cookware: "/assets/oma-cookware_307c7e4b.jpg",
  fashion: "/assets/oma-fashion-still_b5096d58.png",
  heritageBag: "/assets/oma-heritage-bag_02492c42.jpg",
  tee: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=900&q=82",
  trainers: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=82",
};

const PRODUCTS: Product[] = [
  {
    id: "professional-stand-mixer",
    name: "Professional Stand Mixer",
    category: "kitchen",
    price: 185000,
    formerPrice: 215000,
    image: ASSETS.mixer,
    description:
      "A durable countertop mixer with a stainless steel bowl and six practical speed settings. Checked, cleaned, and ready for everyday baking.",
    condition: "Excellent condition",
    color: "Warm white",
    featured: true,
  },
  {
    id: "cast-iron-kitchen-set",
    name: "Cast Iron Kitchen Set",
    category: "kitchen",
    price: 68000,
    image: ASSETS.cookware,
    description:
      "A reliable trio of everyday pans and a low-sided casserole dish. Evenly seasoned with a naturally lived-in finish.",
    condition: "Gently used",
    color: "Graphite",
  },
  {
    id: "oatmeal-knit",
    name: "Oatmeal Cable Knit",
    category: "clothes",
    price: 32000,
    image: ASSETS.knit,
    description:
      "A soft, textured layer in a versatile oatmeal tone. Relaxed shape with a comfortable hand feel and carefully checked seams.",
    condition: "Excellent condition",
    color: "Oatmeal",
  },
  {
    id: "everyday-cotton-shirt",
    name: "Everyday Cotton Shirt",
    category: "clothes",
    price: 22000,
    image: ASSETS.tee,
    description:
      "An easy cotton essential selected for its crisp feel and uncomplicated cut. Designed to pair with everything you already own.",
    condition: "Very good condition",
    color: "Soft blue",
  },
  {
    id: "retro-running-sneakers",
    name: "Retro Running Sneakers",
    category: "shoes",
    price: 45000,
    formerPrice: 52000,
    image: ASSETS.sneakers,
    description:
      "Clean, light retro runners with comfortable cushioning and a versatile neutral profile. A considered choice for daily wear.",
    condition: "Excellent condition",
    color: "Cloud grey",
  },
  {
    id: "daylight-canvas-trainers",
    name: "Daylight Canvas Trainers",
    category: "shoes",
    price: 38000,
    image: ASSETS.trainers,
    description:
      "A simple low-top pair with a flexible canvas upper and light sole. Inspected for wear and ready to take out immediately.",
    condition: "Very good condition",
    color: "Chalk white",
  },
  {
    id: "caramel-shoulder-bag",
    name: "Caramel Shoulder Bag",
    category: "bags",
    price: 48000,
    image: ASSETS.bag,
    description:
      "A structured leather shoulder bag with a softly rounded silhouette and a compact everyday interior. Carefully conditioned.",
    condition: "Excellent condition",
    color: "Caramel",
  },
  {
    id: "heritage-leather-satchel",
    name: "Heritage Leather Satchel",
    category: "bags",
    price: 63000,
    image: ASSETS.heritageBag,
    description:
      "A warm leather satchel with a secure front closure and graceful proportions. Chosen for longevity rather than trend.",
    condition: "Gently used",
    color: "Burgundy",
  },
];

const CATEGORIES: Array<{
  key: CategoryKey;
  title: string;
  image: string;
  description: string;
}> = [
  { key: "kitchen", title: "Kitchen Appliances", image: ASSETS.cookware, description: "Useful, lasting pieces" },
  { key: "clothes", title: "Clothes", image: ASSETS.fashion, description: "Easy layers & essentials" },
  { key: "shoes", title: "Shoes", image: ASSETS.trainers, description: "Well-made daily pairs" },
  { key: "bags", title: "Bags", image: ASSETS.heritageBag, description: "Considered carryalls" },
];

function formatPrice(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

function Brand({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className={`brand-lockup ${inverted ? "brand-lockup--inverted" : ""}`} aria-label="Oma and Sons">
      <img src={ASSETS.logo} alt="" className="brand-mark" />
      <span className="brand-name">Oma &amp; Sons</span>
    </div>
  );
}

function Header({ cartCount }: { cartCount: number }) {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const jumpTo = (key: CategoryKey) => {
    setMenuOpen(false);
    if (location.pathname !== "/") setLocation("/");
    window.setTimeout(() => document.getElementById(key)?.scrollIntoView({ behavior: "smooth", block: "start" }), 20);
  };

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <Button variant="ghost" size="icon-sm" className="header-icon mobile-only" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu />
          </Button>
          <button type="button" className="brand-button" onClick={() => setLocation("/")} aria-label="Return to home">
            <Brand />
          </button>
          <nav className="desktop-nav" aria-label="Main navigation">
            {CATEGORIES.map((category) => (
              <button key={category.key} type="button" onClick={() => jumpTo(category.key)}>
                {category.title}
              </button>
            ))}
          </nav>
          <div className="header-actions">
            <Button variant="ghost" size="icon-sm" className="header-icon desktop-search" aria-label="Search products">
              <Search />
            </Button>
            <Button variant="ghost" size="icon-sm" className="header-icon desktop-search" onClick={() => setLocation("/sign-in")} aria-label="Your account">
              <UserRound />
            </Button>
            <Button variant="ghost" size="icon-sm" className="cart-icon" onClick={() => setLocation("/cart")} aria-label={`Cart with ${cartCount} items`}>
              <ShoppingBag />
              {cartCount > 0 && <span>{cartCount}</span>}
            </Button>
          </div>
        </div>
      </header>
      {menuOpen && (
        <div className="menu-sheet" role="dialog" aria-modal="true" aria-label="Store menu">
          <div className="menu-sheet__panel">
            <div className="menu-sheet__header">
              <Brand />
              <Button variant="ghost" size="icon-sm" className="header-icon" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X />
              </Button>
            </div>
            <div className="menu-sheet__links">
              {CATEGORIES.map((category) => (
                <button type="button" key={category.key} onClick={() => jumpTo(category.key)}>
                  {category.title} <ChevronRight />
                </button>
              ))}
            </div>
            <button type="button" className="menu-account" onClick={() => { setMenuOpen(false); setLocation("/sign-in"); }}>
              <UserRound /> Your account
            </button>
          </div>
          <button type="button" className="menu-sheet__backdrop" onClick={() => setMenuOpen(false)} aria-label="Close menu" />
        </div>
      )}
    </>
  );
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (product: Product) => void }) {
  const [, setLocation] = useLocation();
  return (
    <article className="product-card">
      <button type="button" className="product-card__image" onClick={() => setLocation(`/product/${product.id}`)} aria-label={`View ${product.name}`}>
        <img src={product.image} alt={product.name} />
        {product.formerPrice && <span className="sale-tab">value pick</span>}
      </button>
      <div className="product-card__meta">
        <p>{product.category === "kitchen" ? "HOME FIND" : "PRELOVED"}</p>
        <button type="button" onClick={() => setLocation(`/product/${product.id}`)}>{product.name}</button>
        <div className="product-card__price-row">
          <strong>{formatPrice(product.price)}</strong>
          {product.formerPrice && <del>{formatPrice(product.formerPrice)}</del>}
        </div>
      </div>
      <button type="button" className="product-card__quick-add" onClick={() => onAdd(product)} aria-label={`Add ${product.name} to cart`}>
        <Plus />
      </button>
    </article>
  );
}

function CategorySection({ category, products, onAdd }: { category: (typeof CATEGORIES)[number]; products: Product[]; onAdd: (product: Product) => void }) {
  return (
    <section className="category-section" id={category.key}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">OMA &amp; SONS / {category.title.toUpperCase()}</p>
          <h2>{category.title}</h2>
        </div>
        <a href={`#${category.key}`} className="view-all-link">View all <ChevronRight /></a>
      </div>
      <div className="product-grid">
        {products.map((product) => <ProductCard product={product} onAdd={onAdd} key={product.id} />)}
      </div>
    </section>
  );
}

function ShopHome({ onAdd, cartCount }: { onAdd: (product: Product) => void; cartCount: number }) {
  const [, setLocation] = useLocation();
  return (
    <div className="store-shell">
      <Header cartCount={cartCount} />
      <main>
        <section className="home-hero" aria-label="Oma and Sons market introduction">
          <img src={ASSETS.mixer} alt="Professional stand mixer on a calm countertop" />
          <div className="home-hero__wash" />
          <div className="home-hero__copy">
            <span>Oma &amp; Sons Goes Digital</span>
            <h1>Good things, found again.</h1>
            <p>A neighbourhood marketplace for considered essentials, from our home to yours.</p>
            <Button className="orange-action" onClick={() => document.getElementById("kitchen")?.scrollIntoView({ behavior: "smooth" })}>Shop the store <ChevronRight /></Button>
          </div>
        </section>

        <section className="service-strip" aria-label="Store benefits">
          <span><Check /> Quality-checked finds</span>
          <span><PackageCheck /> Carefully packed</span>
          <span><CircleHelp /> Friendly local help</span>
        </section>

        <div className="catalogue-layout">
          <aside className="catalogue-sidebar">
            <p className="eyebrow">BROWSE THE STORE</p>
            {CATEGORIES.map((category) => (
              <a href={`#${category.key}`} key={category.key}>{category.title}<ChevronRight /></a>
            ))}
            <div className="sidebar-note">
              <img src={ASSETS.logo} alt="" />
              <p>Thoughtful goods with more life left in them.</p>
            </div>
          </aside>

          <div className="catalogue-content">
            <section className="category-browser" aria-label="Shop by category">
              <div className="section-heading section-heading--compact">
                <div><p className="eyebrow">FIND YOUR WAY</p><h2>Shop by Category</h2></div>
                <SlidersHorizontal className="mobile-filter-icon" />
              </div>
              <div className="category-tiles">
                {CATEGORIES.map((category) => (
                  <a className="category-tile" href={`#${category.key}`} key={category.key}>
                    <img src={category.image} alt={category.title} />
                    <span>{category.title}</span>
                    <small>{category.description}</small>
                  </a>
                ))}
              </div>
            </section>

            <section className="spotlight-row">
              <div className="spotlight-row__image"><img src={ASSETS.mixer} alt="Stand mixer" /></div>
              <div className="spotlight-row__copy">
                <p className="eyebrow">JUST IN / KITCHEN</p>
                <h2>Professional Stand Mixer</h2>
                <p>Workhorse mixing power in a warm, kitchen-ready finish.</p>
                <strong>{formatPrice(185000)}</strong>
                <Button className="navy-action" onClick={() => setLocation("/product/professional-stand-mixer")}>View details</Button>
              </div>
            </section>

            {CATEGORIES.map((category) => (
              <CategorySection
                category={category}
                key={category.key}
                onAdd={onAdd}
                products={PRODUCTS.filter((product) => product.category === category.key)}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <button type="button" className="floating-help" aria-label="Contact support"><CircleHelp /></button>
    </div>
  );
}

function ProductDetail({ product, onAdd, cartCount }: { product: Product; onAdd: (product: Product) => void; cartCount: number }) {
  const [, setLocation] = useLocation();
  const related = PRODUCTS.filter((item) => item.category === product.category && item.id !== product.id);
  return (
    <div className="store-shell">
      <Header cartCount={cartCount} />
      <main className="detail-page">
        <button type="button" className="back-link" onClick={() => setLocation("/")}><ArrowLeft /> Back to store</button>
        <div className="detail-layout">
          <div className="detail-gallery">
            <div className="detail-image"><img src={product.image} alt={product.name} /></div>
            <div className="detail-thumbs"><img src={product.image} alt="" /><img src={product.category === "kitchen" ? ASSETS.mixer : product.image} alt="" /></div>
          </div>
          <section className="detail-info">
            <p className="eyebrow">{product.category.toUpperCase()} / VERIFIED FIND</p>
            <div className="detail-title-line"><h1>{product.name}</h1><Button variant="ghost" size="icon-sm" className="header-icon" aria-label="Save item"><Heart /></Button></div>
            <div className="detail-price"><strong>{formatPrice(product.price)}</strong>{product.formerPrice && <del>{formatPrice(product.formerPrice)}</del>}</div>
            <p className="detail-description">{product.description}</p>
            <dl className="detail-facts"><div><dt>Condition</dt><dd>{product.condition}</dd></div><div><dt>Colour</dt><dd>{product.color}</dd></div><div><dt>Availability</dt><dd>Ready to ship</dd></div></dl>
            <Button className="navy-action detail-add" onClick={() => { onAdd(product); setLocation("/cart"); }}>Add to cart <ShoppingBag /></Button>
            <div className="accordion-list">
              <button type="button">Delivery &amp; returns <ChevronDown /></button>
              <button type="button">Care &amp; condition <ChevronDown /></button>
            </div>
          </section>
        </div>
        {related.length > 0 && <section className="related-section"><div className="section-heading"><div><p className="eyebrow">KEEP LOOKING</p><h2>More in {product.category}</h2></div></div><div className="product-grid">{related.map((item) => <ProductCard product={item} onAdd={onAdd} key={item.id} />)}</div></section>}
      </main>
      <Footer />
    </div>
  );
}

function OrderSummary({ cart, compact = false }: { cart: CartLine[]; compact?: boolean }) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal ? 2500 : 0;
  return (
    <aside className={`order-summary ${compact ? "order-summary--compact" : ""}`}>
      <p className="eyebrow">ORDER SUMMARY</p>
      {cart.map((item) => <div className="summary-product" key={item.id}><img src={item.image} alt="" /><div><span>{item.name}</span><small>Qty {item.quantity}</small></div><b>{formatPrice(item.price * item.quantity)}</b></div>)}
      <div className="summary-rule" />
      <div className="summary-line"><span>Subtotal</span><b>{formatPrice(subtotal)}</b></div>
      <div className="summary-line"><span>Delivery</span><b>{shipping ? formatPrice(shipping) : "—"}</b></div>
      <div className="summary-total"><span>Total</span><b>{formatPrice(subtotal + shipping)}</b></div>
    </aside>
  );
}

function CartPage({ cart, onChange, cartCount }: { cart: CartLine[]; onChange: (cart: CartLine[]) => void; cartCount: number }) {
  const [, setLocation] = useLocation();
  const updateQty = (id: string, delta: number) => {
    const next = cart.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item);
    onChange(next);
  };
  return (
    <div className="store-shell">
      <Header cartCount={cartCount} />
      <main className="cart-page">
        <div className="page-heading"><p className="eyebrow">YOUR SELECTION</p><h1>Your Cart</h1><p>{cart.length ? "A few good choices, held for you." : "Your cart is waiting for a good find."}</p></div>
        {cart.length ? (
          <div className="cart-layout">
            <section className="cart-lines">
              {cart.map((item) => <article className="cart-line" key={item.id}><img src={item.image} alt={item.name} /><div className="cart-line__copy"><p className="eyebrow">{item.category.toUpperCase()}</p><h2>{item.name}</h2><span>{item.condition}</span><div className="qty-control"><button type="button" onClick={() => updateQty(item.id, -1)} aria-label="Decrease quantity"><Minus /></button><span>{item.quantity}</span><button type="button" onClick={() => updateQty(item.id, 1)} aria-label="Increase quantity"><Plus /></button></div></div><div className="cart-line__price"><strong>{formatPrice(item.price * item.quantity)}</strong><button type="button" onClick={() => onChange(cart.filter((line) => line.id !== item.id))}><Trash2 /> Remove</button></div></article>)}
            </section>
            <div className="cart-checkout"><OrderSummary cart={cart} /><Button className="navy-action checkout-button" onClick={() => setLocation("/checkout")}>Continue to checkout <ChevronRight /></Button></div>
          </div>
        ) : <section className="empty-cart"><ShoppingBag /><h2>Nothing in your cart yet</h2><p>Take a look through the fresh finds waiting in the store.</p><Button className="navy-action" onClick={() => setLocation("/")}>Browse the store</Button></section>}
      </main>
      <Footer />
    </div>
  );
}

function Field({ label, placeholder, half = false }: { label: string; placeholder: string; half?: boolean }) {
  return <label className={`form-field ${half ? "form-field--half" : ""}`}><span>{label}</span><input placeholder={placeholder} /></label>;
}

function CheckoutPage({ cart, onComplete, cartCount }: { cart: CartLine[]; onComplete: () => void; cartCount: number }) {
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (!cart.length) setLocation("/cart");
  }, [cart.length, setLocation]);
  if (!cart.length) return null;
  return (
    <div className="store-shell">
      <Header cartCount={cartCount} />
      <main className="checkout-page">
        <button type="button" className="back-link" onClick={() => setLocation("/cart")}><ArrowLeft /> Back to cart</button>
        <div className="checkout-layout">
          <section className="checkout-form">
            <div className="checkout-progress"><span className="is-current">1</span><i /><span>2</span><i /><span>3</span><small>Details</small><small>Delivery</small><small>Complete</small></div>
            <div className="form-title"><p className="eyebrow">SECURE CHECKOUT</p><h1>Checkout</h1></div>
            <form onSubmit={(event) => { event.preventDefault(); onComplete(); }}>
              <div className="form-section"><h2>Contact Information</h2><Field label="Email address" placeholder="you@example.com" /><label className="checkbox-line"><input type="checkbox" /> Keep me updated about new finds</label></div>
              <div className="form-section"><h2>Shipping Address</h2><div className="field-pair"><Field label="First name" placeholder="Ada" half /><Field label="Last name" placeholder="Okafor" half /></div><Field label="Address" placeholder="House number and street" /><Field label="Apartment, suite, etc. (optional)" placeholder="" /><div className="field-pair"><Field label="City" placeholder="Lagos" half /><Field label="Postal code" placeholder="100001" half /></div></div>
              <div className="form-section"><h2>Delivery Method</h2><label className="delivery-choice"><input type="radio" name="delivery" defaultChecked /><span><b>Standard delivery</b><small>Arrives in 2–4 working days</small></span><strong>₦2,500</strong></label><label className="delivery-choice"><input type="radio" name="delivery" /><span><b>Collect from Oma &amp; Sons</b><small>We will let you know when it is ready</small></span><strong>Free</strong></label></div>
              <Button className="navy-action place-order" type="submit"><LockKeyhole /> Place order</Button>
            </form>
          </section>
          <OrderSummary cart={cart} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ConfirmedPage({ cart, cartCount }: { cart: CartLine[]; cartCount: number }) {
  const [, setLocation] = useLocation();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 2500);
  return (
    <div className="store-shell">
      <Header cartCount={cartCount} />
      <main className="confirmed-page">
        <section className="confirmed-card"><div className="confirmed-icon"><PackageCheck /></div><p className="eyebrow">ORDER RECEIVED</p><h1>Order Confirmed</h1><p className="confirmed-intro">Thank you. We’re getting your considered finds ready to go.</p><div className="confirmation-meta"><span>ORDER NUMBER <b>#OMA-2408</b></span><span>ORDER DATE <b>Today</b></span></div><div className="confirmation-items">{cart.map((item) => <div key={item.id}><img src={item.image} alt="" /><span>{item.name}<small>Qty {item.quantity}</small></span><b>{formatPrice(item.price * item.quantity)}</b></div>)}</div><div className="confirmation-total"><span>Total</span><b>{formatPrice(total)}</b></div><Button className="navy-action confirmation-button" onClick={() => setLocation("/")}>Continue Shopping</Button><button type="button" className="tracking-link">View order details <ChevronRight /></button></section>
      </main>
      <Footer />
    </div>
  );
}

function AuthPage({ mode }: { mode: "sign-in" | "create-account" }) {
  const [, setLocation] = useLocation();
  const create = mode === "create-account";
  return (
    <div className="auth-page">
      <header className="auth-header"><button type="button" className="back-link" onClick={() => setLocation("/")}><ArrowLeft /> Back to store</button><Brand /></header>
      <main className="auth-card"><Brand /><p className="eyebrow">YOUR OMA &amp; SONS</p><h1>{create ? "Create Account" : "Welcome Back"}</h1><p>{create ? "A simple way to save your finds and check out faster." : "Sign in to see your saved finds and recent orders."}</p><form onSubmit={(event) => { event.preventDefault(); setLocation("/"); }}><Field label="Email address" placeholder="you@example.com" />{create && <Field label="Create a password" placeholder="Minimum 8 characters" />} {!create && <Field label="Password" placeholder="Your password" />}<Button className="navy-action auth-submit" type="submit">{create ? "Create account" : "Sign in"}</Button></form><div className="auth-divider"><span>or</span></div><Button variant="outline" className="google-button"><span className="google-dot">G</span> Continue with Google</Button><p className="auth-switch">{create ? "Already have an account?" : "New to Oma & Sons?"} <button type="button" onClick={() => setLocation(create ? "/sign-in" : "/create-account")}>{create ? "Sign in" : "Create one"}</button></p></main>
    </div>
  );
}

function Footer() {
  return <footer className="site-footer"><div><Brand /><p>Everyday goods with a past — and a future.</p></div><div><p className="eyebrow">HELPFUL THINGS</p><a href="#kitchen">Delivery &amp; returns</a><a href="#kitchen">Care guide</a><a href="#kitchen">Contact us</a></div><div><p className="eyebrow">STAY IN THE LOOP</p><p>New finds, only when they are worth sharing.</p><label className="footer-email"><Mail /><input placeholder="Your email" /><button type="button">Join</button></label></div></footer>;
}

export function Storefront() {
  const [location, setLocation] = useLocation();
  const [cart, setCart] = useState<CartLine[]>(() => [
    { ...PRODUCTS[0], quantity: 1 },
    { ...PRODUCTS[6], quantity: 1 },
  ]);
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const addToCart = (product: Product) => {
    setCart((current) => {
      const found = current.find((line) => line.id === product.id);
      return found ? current.map((line) => line.id === product.id ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { ...product, quantity: 1 }];
    });
  };
  const selectedProduct = useMemo(() => PRODUCTS.find((product) => location === `/product/${product.id}`), [location]);
  if (selectedProduct) return <ProductDetail product={selectedProduct} onAdd={addToCart} cartCount={cartCount} />;
  if (location === "/cart") return <CartPage cart={cart} onChange={setCart} cartCount={cartCount} />;
  if (location === "/checkout") return <CheckoutPage cart={cart} cartCount={cartCount} onComplete={() => { setCart([]); setLocation("/order-confirmed"); }} />;
  if (location === "/order-confirmed") return <ConfirmedPage cart={cart.length ? cart : [{ ...PRODUCTS[0], quantity: 1 }]} cartCount={0} />;
  if (location === "/sign-in") return <AuthPage mode="sign-in" />;
  if (location === "/create-account") return <AuthPage mode="create-account" />;
  return <ShopHome onAdd={addToCart} cartCount={cartCount} />;
}
