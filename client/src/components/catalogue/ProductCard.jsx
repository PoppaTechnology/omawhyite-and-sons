/** Oma & Sons integration: preserve full-card Product Detail navigation; only internal cart/heart controls call the backend. */
import { Heart, ShoppingBag } from "lucide-react";
import { useLocation } from "wouter";
import { useStorefront } from "../../state/StorefrontContext";
import { categoryLabels } from "../../data/products";
import { api, resolveProductImage, handleImageError } from "../../lib/api";
import { formatNaira } from "../../utils/pricing";

export function ProductCard({ product, variant = "shop", showCart = false }) {
  const [, setLocation] = useLocation();
  const { savedIds, toggleSaved, addToCart, auth } = useStorefront();
  const saved = savedIds.includes(product.id);
  const openProduct = () => setLocation(`/product/${product.slug || product.id}`);
  const handleHeart = async (event) => { event.stopPropagation(); if (!auth?.token) { setLocation(`/login?reason=save&product=${product.slug || product.id}`); return; } try { await toggleSaved(product.id); } catch {} };
  const handleCart = async (event) => {
    event.stopPropagation();
    const variants = product.variants || [];
    if (variants.length > 1) { setLocation(`/product/${product.slug || product.id}`); return; }
    try {
      const detail = variants.length === 1 ? product : await api.getProduct(product.slug || product.id);
      const selected = (detail.variants || [])[0];
      if (!selected?.id || selected.available === false) throw new Error("This product is currently unavailable.");
      await addToCart(selected.id, 1);
    } catch (error) { window.dispatchEvent(new CustomEvent("oma-notice", { detail: { message: error.message, tone: "error" } })); }
  };
  const image = resolveProductImage(product);
  const price = product.price ?? product.variants?.[0]?.price ?? 0;
  return <article className={`product-card product-card--${variant}`} onClick={openProduct} role="link" tabIndex="0" onKeyDown={(event) => event.key === "Enter" && openProduct()}>
    <div className="product-image-wrap">
      {product.badge && <span className="product-badge">{product.badge}</span>}
      {variant === "shop" && <button className={`heart-button ${saved ? "is-saved" : ""}`} aria-label={`Save ${product.name}`} onClick={handleHeart}><Heart size={16} fill={saved ? "currentColor" : "none"} /></button>}
      <img src={image} alt={product.name} onError={handleImageError} />
    </div>
    <div className="product-card-copy">
      <h3>{product.name}</h3>
      {variant !== "mobile" && <p>{product.category_name || categoryLabels[product.category] || product.category}</p>}
      <div className="product-price-row"><strong>{formatNaira(price)}</strong>{product.formerPrice && <del>{formatNaira(product.formerPrice)}</del>}{showCart && <button className="card-cart" aria-label={`Add ${product.name} to cart`} onClick={handleCart}><ShoppingBag size={16} /></button>}</div>
    </div>
  </article>;
}
