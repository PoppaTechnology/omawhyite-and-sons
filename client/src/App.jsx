/** Oma & Sons integration: preserve the existing route shell and add only backend-driven wishlist/payment callback surfaces. */
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import { StorefrontProvider, useStorefront } from "./state/StorefrontContext";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmedPage from "./pages/OrderConfirmedPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import WishlistPage from "./pages/WishlistPage";
import { api } from "./lib/api";

function PaymentCallbackPage() { const [, setLocation] = useLocation(); const { confirmOrder, resetCart } = useStorefront(); useEffect(() => { const params = new URLSearchParams(window.location.search); const reference = params.get("reference") || params.get("trxref"); if (!reference) { setLocation("/checkout"); return; } api.verifyPayment({ reference, provider: "PAYSTACK" }).then(async (payload) => { if (!payload?.verified) { setLocation("/checkout"); return; } confirmOrder(payload); try { await resetCart(); } catch {} setLocation("/order-confirmed"); }).catch(() => setLocation("/checkout")); }, [setLocation]); return <main className="auth-page"><section className="auth-card"><h1>Verifying payment…</h1><p>Please wait while we confirm your transaction.</p></section></main>; }

export default function App() { return <StorefrontProvider><Switch><Route path="/" component={HomePage} /><Route path="/shop" component={ShopPage} /><Route path="/product/:slug" component={ProductDetailPage} /><Route path="/cart" component={CartPage} /><Route path="/checkout" component={CheckoutPage} /><Route path="/payment-callback" component={PaymentCallbackPage} /><Route path="/order-confirmed" component={OrderConfirmedPage} /><Route path="/login" component={LoginPage} /><Route path="/sign-up" component={SignUpPage} /><Route path="/wishlist" component={WishlistPage} /><Route><HomePage /></Route></Switch></StorefrontProvider>; }
