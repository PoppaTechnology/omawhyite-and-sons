/** Oma & Sons integration: authenticated wishlist inside the existing storefront page language, with no guest wishlist behavior. */
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { DesktopHeader, Footer, MobileHeader, WhatsAppWidget } from "../components/layout/SiteChrome";
import { ProductCard } from "../components/catalogue/ProductCard";
import { useStorefront } from "../state/StorefrontContext";
import { api, resolveAssetUrl } from "../lib/api";

export default function WishlistPage() {
  const [, setLocation] = useLocation(); const { auth } = useStorefront(); const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { if (!auth?.token) { setLocation("/login"); return; } let active = true; api.wishlist().then((payload) => { const raw = Array.isArray(payload) ? payload : payload?.items || payload?.wishlist || []; const mapped = raw.map((item) => ({ id: item.product ?? item.product_id, slug: item.product_slug, name: item.product_name, category: item.product_category, price: Number(item.product_price || 0), image: resolveAssetUrl(item.product_image) })); if (active) setItems(mapped); }).catch((e) => active && setError(e.message)).finally(() => active && setLoading(false)); return () => { active = false; }; }, [auth?.token, setLocation]);
  return <div><DesktopHeader /><MobileHeader compact /><main className="shop-page page-wrap"><div className="breadcrumb desktop-only"><Link href="/">Home</Link><span>›</span><span>My Wishlist</span></div><div className="shop-title-row"><div><h1>My Wishlist</h1><p>Saved pieces you can return to whenever you are ready.</p></div></div><div className="shop-rule" />{loading ? <p className="inline-state">Loading your wishlist…</p> : error ? <p className="inline-state error-state">{error}</p> : !items.length ? <section className="empty-cart"><h2>Your wishlist is empty</h2><p>Save products with the heart icon to find them here.</p><Link href="/shop" className="primary-button">Browse Products</Link></section> : <section className="shop-grid">{items.map((item) => <ProductCard key={item.id} product={item} variant="shop" showCart />)}</section>}</main><Footer /><WhatsAppWidget /></div>;
}
