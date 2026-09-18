/** Figma fidelity: compact square − / quantity / + commerce control. */
export function QuantityControl({ quantity, onChange, compact = false }) {
  return <div className={`quantity-control ${compact ? "is-compact" : ""}`} aria-label="Quantity selector">
    <button onClick={() => onChange(-1)} aria-label="Decrease quantity">−</button><span>{quantity}</span><button onClick={() => onChange(1)} aria-label="Increase quantity">+</button>
  </div>;
}
