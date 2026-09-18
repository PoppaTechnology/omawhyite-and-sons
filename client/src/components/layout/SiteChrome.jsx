/** Figma fidelity: shared paper-white retail chrome; Ink Black rules, restrained controls, supplied logo only. */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Search, ShoppingBag, UserRound, Heart, X, ChevronDown, MessageCircle, CreditCard } from "lucide-react";
import { useStorefront } from "../../state/StorefrontContext";
import { assets } from "../../data/assets";
import { categoryLabels } from "../../data/products";
import { footerDescription, navCategories, stores } from "../../data/content";

const categoryHref = (category) => `/shop?category=${category}`;

function IconBadge({ count }) { if (!count) return null; return <span className="icon-badge">{count > 99 ? "99+" : count}</span>; }

export function DesktopHeader({ activeCategory }) {
  const { auth, cartLines, savedIds } = useStorefront();
  const cartCount = cartLines.reduce((sum, line) => sum + Number(line.quantity || 0), 0);
  return <header className="site-header desktop-only">
    <Link href="/" className="header-logo" aria-label="Omawhiyte & Sons Dynamic Ventures home"><img src={assets.logo} alt="Omawhiyte & Sons Dynamic Ventures" /></Link>
    <nav className="desktop-nav" aria-label="Product categories">
      {navCategories.map((category) => <Link key={category} href={categoryHref(category)} className={activeCategory === category ? "is-active" : ""}>{categoryLabels[category]}</Link>)}
    </nav>
    <div className="header-actions" aria-label="Store utilities">
      <Link href="/shop" aria-label="Search products"><Search /></Link>
      <Link href="/cart" aria-label="My cart" className="icon-badge-wrap"><ShoppingBag /><IconBadge count={cartCount} /></Link>
      {auth?.token && <Link href="/wishlist" aria-label="My wishlist" className="icon-badge-wrap"><Heart /><IconBadge count={savedIds.length} /></Link>}<Link href="/login" aria-label="My profile"><UserRound /></Link>
    </div>
  </header>;
}

export function MobileHeader({ compact = false, cartOnly = false, title, back = false }) {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { cartLines } = useStorefront();
  const cartCount = cartLines.reduce((sum, line) => sum + Number(line.quantity || 0), 0);
  const go = (href) => { setOpen(false); setLocation(href); };
  if (compact) return <header className="mobile-compact-header mobile-only">
    {back ? <button aria-label="Go back" onClick={() => window.history.back()}>←</button> : <button aria-label="Open menu" onClick={() => setOpen(true)}><Menu /></button>}
    <Link href="/" className="mobile-compact-logo" aria-label="Omawhiyte & Sons Dynamic Ventures home"><img src={assets.logo} alt="Omawhiyte & Sons Dynamic Ventures" /></Link>
    <Link href="/cart" aria-label="Cart" className="icon-badge-wrap"><ShoppingBag /><IconBadge count={cartCount} /></Link>
    {open && <MobileMenu close={() => setOpen(false)} go={go} />}
  </header>;
  return <header className="mobile-header mobile-only">
    <Link href="/" className="mobile-header-logo" aria-label="Omawhiyte & Sons Dynamic Ventures home"><img src={assets.logo} alt="Omawhiyte & Sons Dynamic Ventures" /></Link>
    <button aria-label="Open menu" onClick={() => setOpen(true)}><Menu /></button>
    {open && <MobileMenu close={() => setOpen(false)} go={go} />}
    {title && <span className="sr-only">{title}</span>}
  </header>;
}

function MobileMenu({ close, go }) {
  const { auth, cartLines, savedIds } = useStorefront();
  const cartCount = cartLines.reduce((sum, line) => sum + Number(line.quantity || 0), 0);
  return <div className="mobile-menu-layer" onClick={close}>
    <aside className="mobile-menu" onClick={(event) => event.stopPropagation()} aria-label="Mobile navigation">
      <button className="menu-close" onClick={close} aria-label="Close menu"><X /></button>
      <Link href="/" className="menu-logo" onClick={close} aria-label="Omawhiyte & Sons Dynamic Ventures home"><img src={assets.logo} alt="Omawhiyte & Sons Dynamic Ventures" /></Link>
      <nav>
        {navCategories.map((category) => <button key={category} onClick={() => go(categoryHref(category))}>{categoryLabels[category]}</button>)}
        <button onClick={() => go("/shop")}>Products</button>
        <span className="menu-rule" />
        <button onClick={() => go("/cart")}>My Cart{cartCount > 0 && <span className="menu-count">{cartCount}</span>}</button>
        {auth?.token && <button onClick={() => go("/wishlist")}>My Wishlist{savedIds.length > 0 && <span className="menu-count">{savedIds.length}</span>}</button>}
        <button onClick={() => go("/login")}>My Profile</button>
      </nav>
    </aside>
  </div>;
}

export function Footer() {
  const [quickOpen, setQuickOpen] = useState(false);
  return <footer className="site-footer">
    <div className="footer-desktop desktop-only">
      <div className="footer-brand"><Link href="/" aria-label="Omawhiyte & Sons Dynamic Ventures home"><img src={assets.logo} alt="Omawhiyte & Sons Dynamic Ventures" /></Link><p>{footerDescription}</p></div>
      <div><h3>Physical Stores</h3>{stores.map((store) => <p key={store.name}><strong>{store.name}:</strong><br />{store.address}</p>)}</div>
      <div><h3>Quick Links</h3><a href="#shipping">Shipping Policy</a><a href="#terms">Terms of Service</a><a href="#returns">Return Policy</a><a href="#contact">Contact Us</a></div>
      <div><h3>Secure Payments</h3><div className="payment-chips"><span>CARD</span><span>TRF</span></div><p>© 2026 Omawhiyte & Sons Dynamic Ventures.<br />All rights reserved.</p></div>
    </div>
    <div className="footer-mobile mobile-only">
      <div className="footer-mobile-brand"><Link href="/" aria-label="Omawhiyte & Sons Dynamic Ventures home"><img src={assets.logo} alt="Omawhiyte & Sons Dynamic Ventures" /></Link><p>{footerDescription}</p></div>
      <section><h3>PHYSICAL STORES</h3>{stores.map((store) => <p key={store.name}><strong>{store.name}:</strong><br />{store.address}</p>)}</section>
      <section className="quick-mobile"><button onClick={() => setQuickOpen(!quickOpen)}>QUICK LINKS <ChevronDown className={quickOpen ? "flip" : ""} /></button>{quickOpen && <div><a href="#shipping">Shipping Policy</a><a href="#terms">Terms of Service</a><a href="#returns">Return Policy</a><a href="#contact">Contact Us</a></div>}</section>
      <section><h3>SECURE PAYMENTS</h3><div className="payment-chips"><span>CARD</span><span>TRF</span></div></section>
      <p className="footer-copy">© 2026 Omawhiyte & Sons Dynamic Ventures. All rights reserved.</p>
    </div>
  </footer>;
}

export function CheckoutHeader() {
  return <header className="checkout-header"><Link href="/" aria-label="Omawhiyte & Sons Dynamic Ventures home"><img src={assets.logo} alt="Omawhiyte & Sons Dynamic Ventures" /></Link><span><ShoppingBag size={12} /> SECURE CHECKOUT</span></header>;
}

export function WhatsAppWidget() {
  const [position, setPosition] = useState({ right: 22, bottom: 22 });
  const [drag, setDrag] = useState(null);
  const onPointerDown = (event) => { event.currentTarget.setPointerCapture(event.pointerId); setDrag({ x: event.clientX, y: event.clientY, right: position.right, bottom: position.bottom, moved: false }); };
  const onPointerMove = (event) => { if (!drag) return; const dx = event.clientX - drag.x; const dy = event.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 6) setDrag({ ...drag, moved: true }); setPosition({ right: Math.max(12, Math.min(window.innerWidth - 60, drag.right - dx)), bottom: Math.max(12, Math.min(window.innerHeight - 60, drag.bottom - dy)) }); };
  const onPointerUp = () => { if (drag && !drag.moved) window.open("https://wa.me/2348067303094", "_blank", "noopener,noreferrer"); setDrag(null); };
  return <button className="whatsapp-widget" style={position} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} aria-label="Chat on WhatsApp"><MessageCircle size={17} /></button>;
}

export function SmallPaymentChips() { return <div className="small-payment"><CreditCard size={14} /><span>CARD</span><span>TRF</span></div>; }
