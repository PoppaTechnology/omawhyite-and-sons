/** Oma & Sons integration: server-backed cart/auth/wishlist state while preserving the existing storefront UI contract. */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, clearToken, getToken, setToken } from "../lib/api";

const StorefrontContext = createContext(null);
const defaultCheckout = { deliveryMethod: "standard", fulfillment: "ship", discountApplied: false, discountCode: "", email: "", phone: "" };

function normalizeCart(payload) {
  const items = payload?.items || payload?.cart_items || payload?.lines || [];
  return items.map((item) => ({
    id: item.id,
    productId: item.product_slug || item.product_id || item.product,
    variantId: item.variant || item.variant_id,
    name: item.product_name || item.name || "Product",
    category: item.product_category || item.category || "",
    image: item.image || item.product_image || "",
    variant: item.variant_name || item.variant || "",
    quantity: Number(item.quantity || 1),
    price: Number(item.unit_price ?? item.price ?? 0),
    subtotal: Number(item.subtotal ?? (item.unit_price || item.price || 0) * (item.quantity || 1)),
  }));
}

export function StorefrontProvider({ children }) {
  const [cartLines, setCartLines] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState("");
  const [checkout, setCheckout] = useState(defaultCheckout);
  const [order, setOrder] = useState(null);
  const [savedIds, setSavedIds] = useState([]);
  const [auth, setAuth] = useState({ token: getToken(), user: null, loading: Boolean(getToken()) });
  const [notice, setNotice] = useState(null);

  const showNotice = (message, tone = "success") => { setNotice({ message, tone }); window.setTimeout(() => setNotice(null), 2600); };
  const refreshCart = async () => { setCartLoading(true); try { const payload = await api.cart(); setCartLines(normalizeCart(payload)); setCartError(""); } catch (error) { setCartError(error.message); } finally { setCartLoading(false); } };
  const refreshWishlist = async () => { if (!getToken()) { setSavedIds([]); return; } try { const payload = await api.wishlist(); const ids = (Array.isArray(payload) ? payload : payload?.items || payload?.wishlist || []).map((item) => item.product ?? item.product_id ?? item.id); setSavedIds(ids); } catch { setSavedIds([]); } };

  useEffect(() => {
    refreshCart();
    const restore = async () => { if (!getToken()) { setAuth({ token: null, user: null, loading: false }); return; } try { const user = await api.profile(); setAuth({ token: getToken(), user, loading: false }); await refreshWishlist(); } catch { clearToken(); setAuth({ token: null, user: null, loading: false }); } };
    restore();
    const expired = () => { clearToken(); setAuth({ token: null, user: null, loading: false }); setSavedIds([]); showNotice("Your session has expired.", "error"); };
    window.addEventListener("oma-auth-expired", expired);
    const noticeEvent = (event) => { if (event.detail?.message) showNotice(event.detail.message, event.detail.tone || "error"); };
    window.addEventListener("oma-notice", noticeEvent);
    return () => { window.removeEventListener("oma-auth-expired", expired); window.removeEventListener("oma-notice", noticeEvent); };
  }, []);

  const signIn = async (credentials, remember = true) => { const payload = await api.login(credentials); const token = payload?.token || payload?.key || payload?.access; if (!token) throw new Error("The backend did not return an authentication token."); setToken(token, remember); const user = payload?.user || await api.profile(); setAuth({ token, user, loading: false }); await refreshWishlist(); await refreshCart(); return payload; };
  const register = async (body) => { const payload = await api.register(body); const token = payload?.token || payload?.key || payload?.access; if (token) { setToken(token); const user = payload?.user || await api.profile(); setAuth({ token, user, loading: false }); await refreshWishlist(); await refreshCart(); } return payload; };
  const signOut = async () => { try { if (getToken()) await api.logout(); } catch {} clearToken(); setAuth({ token: null, user: null, loading: false }); setSavedIds([]); await refreshCart(); };

  const addToCart = async (variantId, quantity = 1) => { const payload = await api.addCart(variantId, quantity); setCartLines(normalizeCart(payload)); showNotice("Added to Cart."); return payload; };
  const changeQuantity = async (line, direction) => { const payload = await api.updateCart(line.id, { delta: direction }); setCartLines(normalizeCart(payload)); };
  const removeLine = async (line) => { const payload = await api.removeCart(line.id); setCartLines(normalizeCart(payload)); };
  const resetCart = async () => { const payload = await api.clearCart(); setCartLines(normalizeCart(payload)); setCheckout(defaultCheckout); };
  const toggleSaved = async (productId) => { if (!getToken()) return false; const payload = await api.toggleWishlist({ product_id: productId }); await refreshWishlist(); if (payload?.saved === true) showNotice("Added to Wishlist."); else if (payload?.saved === false) showNotice("Removed from Wishlist."); return payload; };
  const applyCode = async (code, subtotal = 0) => { const payload = await api.validatePromo({ code, subtotal }); setCheckout((current) => ({ ...current, discountCode: code, discountApplied: Boolean(payload?.valid), discountAmount: Number(payload?.discount_amount || 0) })); return payload; };
  const createOrder = async (body) => { const payload = await api.checkout(body); setOrder(payload?.order || payload); return payload; };
  const confirmOrder = (payload) => { setOrder(payload?.order || payload); return payload; };

  const value = useMemo(() => ({ cartLines, cartLoading, cartError, refreshCart, checkout, order, savedIds, auth, notice, setCheckout, changeQuantity, removeLine, resetCart, toggleSaved, applyCode, createOrder, confirmOrder, addToCart, signIn, register, signOut, refreshWishlist }), [cartLines, cartLoading, cartError, checkout, order, savedIds, auth, notice]);
  return <StorefrontContext.Provider value={value}>{children}{notice && <div className={`app-toast app-toast--${notice.tone}`} role="status">{notice.message}</div>}</StorefrontContext.Provider>;
}

export function useStorefront() { const context = useContext(StorefrontContext); if (!context) throw new Error("useStorefront must be used inside StorefrontProvider"); return context; }
export { normalizeCart };
