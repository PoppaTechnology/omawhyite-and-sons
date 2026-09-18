/** Oma & Sons integration: preserve the existing Figma storefront while routing data and mutations through the read-only Django API. */

export const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || "https://oma-and-sons-backend.vercel.app").replace(/\/$/, "");
const TOKEN_KEY = "oma_auth_token";
const CART_SESSION_KEY = "oma_cart_session";

export function getToken() { return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY); }
export function setToken(token, remember = true) { if (!token) return; if (remember) { localStorage.setItem(TOKEN_KEY, token); sessionStorage.removeItem(TOKEN_KEY); } else { sessionStorage.setItem(TOKEN_KEY, token); localStorage.removeItem(TOKEN_KEY); } }
export function clearToken() { localStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(TOKEN_KEY); }
export function getCartSession() { return sessionStorage.getItem(CART_SESSION_KEY); }
export function setCartSession(value) { if (value) sessionStorage.setItem(CART_SESSION_KEY, value); }
export function clearCartSession() { sessionStorage.removeItem(CART_SESSION_KEY); }

const BACKEND_MEDIA_BY_SLUG = {
  "professional-stand-mixer-series-7": "oma-product-professional-stand-mixer.jpg",
  "pro-series-professional-blender": "oma-product-professional-blender.jpg",
  "premium-espresso-maker": "oma-product-premium-espresso-maker.jpg",
  "premium-stainless-steel-kettle": "oma-product-stainless-kettle.jpg",
  "classic-oxford-shoes": "oma-product-classic-oxford-shoes.jpg",
  "essential-white-sneakers": "oma-product-essential-white-sneakers.jpg",
  "heritage-leather-loafers": "oma-product-heritage-leather-loafers.jpg",
  "canvas-high-top-sneakers": "oma-product-canvas-high-top-sneakers.jpg",
  "vintage-tweed-blazer": "oma-product-vintage-tweed-blazer.jpg",
  "silk-champagne-blouse": "oma-product-silk-champagne-blouse.jpg",
  "classic-blue-denim-jacket": "oma-product-classic-blue-denim-jacket.jpg",
  "chunky-knit-wool-sweater": "oma-product-chunky-knit-wool-sweater.jpg",
  "premium-leather-tote": "oma-product-premium-leather-tote.jpg",
  "executive-leather-tote": "oma-product-executive-leather-tote.jpg",
  "classic-leather-tote": "oma-product-classic-leather-tote.jpg",
  "camel-crossbody-bag": "oma-product-camel-crossbody-bag.jpg",
};

export function resolveAssetUrl(value) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_ORIGIN}${value.startsWith("/") ? value : `/${value}`}`;
}

export function resolveProductImage(product) {
  if (!product) return "";
  const slug = product.slug || product.id;
  const filename = BACKEND_MEDIA_BY_SLUG[slug];
  return filename ? resolveAssetUrl(`/media/products/${filename}`) : resolveAssetUrl(product.image);
}

// Fallback shown in place of a product image that fails to load (e.g. missing/unreachable
// backend media file). Kept as a plain inline SVG data URI so it never itself performs a
// network request and can never fail to "load".
export const PRODUCT_IMAGE_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f2ef'/%3E%3Cg fill='none' stroke='%23c7c5bf' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='38' y='52' width='124' height='96' rx='6'/%3E%3Ccircle cx='74' cy='84' r='10'/%3E%3Cpath d='M38 130l34-30 26 22 30-34 34 40'/%3E%3C/g%3E%3C/svg%3E";

// Attach to an <img onError={handleImageError}>. Swaps a broken/missing image for the
// shared placeholder exactly once, so a failing image never leaves a broken-icon box and
// never loops (a failing fallback would otherwise re-trigger onError indefinitely).
export function handleImageError(event) {
  const img = event.currentTarget;
  if (img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = "true";
  img.src = PRODUCT_IMAGE_FALLBACK;
}

function errorMessage(payload, fallback) {
  if (!payload) return fallback;
  if (typeof payload === "string") return payload;
  if (payload.error) return payload.error;
  const first = Object.values(payload).flat(Infinity).find((item) => typeof item === "string");
  return first || fallback;
}

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Token ${token}`);
  const cartSession = getCartSession();
  if (cartSession) headers.set("X-Cart-Session", cartSession);
  const response = await fetch(`${API_ORIGIN}${path}`, { ...options, headers, credentials: "include" });
  const sessionHeader = response.headers.get("X-Cart-Session") || response.headers.get("x-cart-session");
  if (sessionHeader) setCartSession(sessionHeader);
  let payload = null;
  const text = await response.text();
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = text; }
  }
  if (!response.ok) {
    const error = new Error(errorMessage(payload, `Request failed with status ${response.status}`));
    error.status = response.status;
    error.payload = payload;
    if (response.status === 401) window.dispatchEvent(new CustomEvent("oma-auth-expired"));
    throw error;
  }
  return payload;
}

export const api = {
  listProducts: (params = {}) => apiFetch(`/api/products/?${new URLSearchParams(Object.entries(params).filter(([, value]) => value !== "" && value != null))}`),
  getCategories: () => apiFetch("/api/products/categories/"),
  getProduct: (slug) => apiFetch(`/api/products/${encodeURIComponent(slug)}/`),
  getDeals: () => apiFetch("/api/products/trending-deals/"),
  login: (body) => apiFetch("/api/accounts/login/", { method: "POST", body: JSON.stringify(body) }),
  register: (body) => apiFetch("/api/accounts/register/", { method: "POST", body: JSON.stringify(body) }),
  logout: () => apiFetch("/api/accounts/logout/", { method: "POST" }),
  profile: () => apiFetch("/api/accounts/profile/"),
  wishlist: () => apiFetch("/api/accounts/wishlist/"),
  toggleWishlist: (body) => apiFetch("/api/accounts/wishlist/", { method: "POST", body: JSON.stringify(body) }),
  cart: () => apiFetch("/api/cart/"),
  addCart: (variantId, quantity = 1) => apiFetch("/api/cart/items/", { method: "POST", body: JSON.stringify({ variant_id: variantId, quantity }) }),
  updateCart: (id, body) => apiFetch(`/api/cart/items/${id}/`, { method: "PATCH", body: JSON.stringify(body) }),
  removeCart: (id) => apiFetch(`/api/cart/items/${id}/`, { method: "DELETE" }),
  clearCart: () => apiFetch("/api/cart/clear/", { method: "POST" }),
  checkout: (body) => apiFetch("/api/orders/checkout/", { method: "POST", body: JSON.stringify(body) }),
  validatePromo: (body) => apiFetch("/api/orders/validate-promo/", { method: "POST", body: JSON.stringify(body) }),
  initializePayment: (body) => apiFetch("/api/payments/initialize/", { method: "POST", body: JSON.stringify(body) }),
  verifyPayment: (body) => apiFetch("/api/payments/verify/", { method: "POST", body: JSON.stringify(body) }),
};

export { TOKEN_KEY, CART_SESSION_KEY };
