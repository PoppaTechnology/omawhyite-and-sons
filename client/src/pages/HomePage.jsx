/** Figma fidelity: six exact Home sections in order; warm editorial retail, full-bleed hero, restrained cards. */
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, BadgeCheck, LockKeyhole, MapPin, Store } from "lucide-react";
import { DesktopHeader, Footer, MobileHeader, WhatsAppWidget } from "../components/layout/SiteChrome";
import { ProductCard } from "../components/catalogue/ProductCard";
import { assets } from "../data/assets";
import { categoryLabels } from "../data/products";
import { api } from "../lib/api";
import { heroSlides, navCategories } from "../data/content";

function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const pointerStart = useRef(null);
  useEffect(() => { const interval = window.setInterval(() => setActive((index) => (index + 1) % heroSlides.length), 6500); return () => window.clearInterval(interval); }, []);
  const move = (direction) => setActive((index) => (index + direction + heroSlides.length) % heroSlides.length);
  return <section className="hero" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onPointerDown={(event) => { pointerStart.current = event.clientX; }} onPointerUp={(event) => { if (pointerStart.current === null) return; const delta = event.clientX - pointerStart.current; if (Math.abs(delta) > 40) move(delta > 0 ? -1 : 1); pointerStart.current = null; }}>
    {heroSlides.map((slide, index) => <div key={slide.image} className={`hero-slide ${index === active ? "is-active" : ""}`} style={{ backgroundImage: `url(${slide.image})` }} aria-hidden={index !== active}><div className="hero-overlay" /><div className="hero-content"><h1>{slide.title.map((line) => <span key={line}>{line}</span>)}</h1><p>{slide.copy}</p><Link href="/shop" className="hero-cta">Shop Now</Link></div></div>)}
    <button className={`hero-arrow hero-arrow--prev ${hovered ? "is-visible" : ""}`} onClick={() => move(-1)} aria-label="Previous slide"><ArrowLeft /></button><button className={`hero-arrow hero-arrow--next ${hovered ? "is-visible" : ""}`} onClick={() => move(1)} aria-label="Next slide"><ArrowRight /></button>
    <div className="hero-dots">{heroSlides.map((slide, index) => <button key={slide.image} className={index === active ? "is-active" : ""} onClick={() => setActive(index)} aria-label={`Go to slide ${index + 1}`} />)}</div>
  </section>;
}

function ReassuranceStrip() {
  const items = [{ icon: Store, title: "Physical Locations", mobile: "2 Physical Stores in Lagos", copy: "Ago Palace Way & Ijesha" }, { icon: BadgeCheck, title: "Grade-A Quality Assurance", mobile: "Grade-A Quality Assured", copy: "Hand checked premium thrift" }, { icon: LockKeyhole, title: "Verified Secure Checkout", mobile: "100% Secure Checkout", copy: "Powered by Paystack/Flutterwave" }];
  return <section className="reassurance"><div className="reassurance-inner">{items.map(({ icon: Icon, title, mobile, copy }) => <div className="reassurance-item" key={title}><Icon /><div><h3><span className="desktop-only">{title}</span><span className="mobile-only">{mobile}</span></h3><p className="desktop-only">{copy}</p></div></div>)}</div></section>;
}

function CategoryGrid() {
  return <section className="category-section"><div className="page-wrap"><h2>Shop by Category</h2><div className="category-grid">{navCategories.map((category) => <Link key={category} href={`/shop?category=${category}`} className={`category-tile category-tile--${category}`}><img src={assets.categories[category]} alt={categoryLabels[category]} /><span className="category-cover" /><strong>{categoryLabels[category]}</strong></Link>)}</div></div></section>;
}

function HotDeals() {
  const [deals, setDeals] = useState([]);
  useEffect(() => { let active = true; api.getDeals().then((payload) => { const items = Array.isArray(payload) ? payload : payload?.results || []; if (active) setDeals(items.slice(0, 4)); }).catch(() => { if (active) setDeals([]); }); return () => { active = false; }; }, []);
  if (!deals.length) return null;
  return <section className="hot-deals"><div className="page-wrap"><div className="section-heading"><h2>Hot Deals</h2><Link href="/shop">View All <span className="desktop-only">→</span></Link></div><div className="hot-deal-grid">{deals.map((product) => <ProductCard key={product.id} product={product} variant="deal" showCart />)}</div></div></section>;
}

export default function HomePage() {
  return <div><DesktopHeader /><MobileHeader /><main><HeroCarousel /><ReassuranceStrip /><CategoryGrid /><HotDeals /></main><Footer /><WhatsAppWidget /></div>;
}
