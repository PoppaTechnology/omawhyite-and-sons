/** Figma fidelity: centered quiet success state; current session order replaces reference-only sample products.
 * Adds a delivery estimate line, a fulfillment-specific status line, and an order-progress tracker,
 * all sourced from fields OrderDetailSerializer already returns (no backend changes). */
import { useState } from "react";
import { Link } from "wouter";
import { Check, X } from "lucide-react";
import { assets } from "../data/assets";
import { useStorefront } from "../state/StorefrontContext";
import { formatNaira } from "../utils/pricing";
import { resolveAssetUrl, handleImageError } from "../lib/api";
import { WhatsAppWidget } from "../components/layout/SiteChrome";

const DELIVERY_ESTIMATES = {
  standard: "Arriving in 2–4 business days",
  express: "Arriving in 1–2 business days",
  pickup: "Ready for pickup within 2 hours",
};

const PROGRESS_STEPS = [
  { key: "CONFIRMED", label: "Order Placed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
];

function progressIndex(status) {
  if (status === "CANCELLED" || status === "PENDING") return 0;
  const index = PROGRESS_STEPS.findIndex((step) => step.key === status);
  return index === -1 ? 0 : index;
}

function OrderProgress({ status }) {
  const activeIndex = progressIndex(status);
  return (
    <div className="order-progress" role="list" aria-label="Order progress">
      {PROGRESS_STEPS.map((step, index) => (
        <div
          className={`order-progress-step${index <= activeIndex ? " is-complete" : ""}`}
          role="listitem"
          key={step.key}
        >
          <span className="order-progress-dot" />
          <p>{step.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function OrderConfirmedPage() {
  const { order } = useStorefront();
  const [statusOpen, setStatusOpen] = useState(false);
  const current = order || {};
  const lines = current.items || current.lines || [];
  const breakdown = current.breakdown || { subtotal: current.subtotal || 0, discount: current.discount_amount || 0, delivery: current.delivery_fee || 0, taxes: current.tax_amount || 0, total: current.total_amount || 0 };
  const isPickup = current.fulfillment_type === "pickup";
  const deliveryEstimate = DELIVERY_ESTIMATES[current.delivery_method] || DELIVERY_ESTIMATES.standard;
  const fulfillmentLine = isPickup
    ? `Pickup at ${current.pickup_store_name || current.pickup_store || "your selected store"}`
    : [current.delivery_address, current.city, current.state].filter(Boolean).length
      ? `Shipping to ${[current.delivery_address, current.city, current.state].filter(Boolean).join(", ")}`
      : "Shipping to your delivery address";

  return <div className="order-page"><header className="order-header"><Link href="/" aria-label="Omawhiyte & Sons Dynamic Ventures home"><img src={assets.logo} alt="Omawhiyte & Sons Dynamic Ventures" /></Link></header><main className="order-main"><div className="order-success"><span><Check /></span><h1>Order Confirmed</h1><p>Thank you, your order has been placed successfully. A confirmation email has been sent to you.</p></div><section className="confirmation-card"><div className="order-meta"><p><small>ORDER NUMBER</small><strong>{current.order_number || "Pending"}</strong></p><p><small>DATE</small><strong>{current.created_at ? new Date(current.created_at).toLocaleDateString() : "Today"}</strong></p></div><div className="order-fulfillment"><p className="order-fulfillment-line">{fulfillmentLine}</p><p className="order-fulfillment-estimate">{deliveryEstimate}</p></div><OrderProgress status={current.order_status} /><div className="confirmation-lines">{lines.map((line) => <div key={line.id}><img src={resolveAssetUrl(line.image)} alt="" onError={handleImageError} /><p>{line.product_name}<small>Qty: {line.quantity}</small></p><strong>{formatNaira(Number(line.subtotal || line.unit_price * line.quantity))}</strong></div>)}</div><div className="confirmation-totals"><p><span>Subtotal</span><strong>{formatNaira(breakdown.subtotal)}</strong></p>{Number(breakdown.discount) > 0 && <p><span>Discount</span><strong>−{formatNaira(breakdown.discount)}</strong></p>}<p><span>Shipping</span><strong>{formatNaira(breakdown.delivery)}</strong></p><p className="final-total"><span>Total</span><strong>{formatNaira(breakdown.total)}</strong></p></div></section><div className="order-actions"><button className="primary-button" onClick={() => setStatusOpen(true)}>View Order Status</button><Link href="/shop" className="secondary-button">Continue Shopping</Link></div></main>{statusOpen && <div className="status-layer" onClick={() => setStatusOpen(false)}><section className="status-modal" onClick={(event) => event.stopPropagation()}><button onClick={() => setStatusOpen(false)}><X /></button><Check /><h2>{current.order_status || "Order Confirmed"}</h2><p>Payment status: {current.payment_status || "PENDING"}</p><OrderProgress status={current.order_status} /></section></div>}<footer className="order-footer"><Link href="/" aria-label="Omawhiyte & Sons Dynamic Ventures home"><img src={assets.logo} alt="Omawhiyte & Sons Dynamic Ventures" /></Link><div className="desktop-only">Ago Palace Way Store　 Ijesha Store　 Shipping Policy　 Terms of Service</div><span>© 2026 Omawhiyte & Sons Dynamic Ventures. All rights reserved.</span></footer><WhatsAppWidget /></div>;
}
