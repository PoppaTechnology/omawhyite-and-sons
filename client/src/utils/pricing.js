/** Figma fidelity: all session-only Cart and Checkout arithmetic is centralised. */
export const DELIVERY_OPTIONS = { standard: 2500, express: 5000, pickup: 0 };
export const TAX_RATE = 0.05;

export const formatNaira = (value) => `₦${Number(value || 0).toLocaleString("en-NG")}`;

export function merchandiseSubtotal(lines, productById) {
  return lines.reduce((total, line) => total + (productById(line.productId)?.price || 0) * line.quantity, 0);
}

export function priceBreakdown(lines, productById, checkout) {
  const subtotal = merchandiseSubtotal(lines, productById);
  const discount = checkout?.discountApplied ? Math.round(subtotal * 0.1) : 0;
  const delivery = DELIVERY_OPTIONS[checkout?.deliveryMethod || "standard"];
  const taxes = Math.round(subtotal * TAX_RATE);
  return { subtotal, discount, delivery, taxes, total: subtotal - discount + delivery + taxes };
}
