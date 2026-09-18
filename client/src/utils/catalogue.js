/** Figma fidelity: local-only Shop filtering, sorting, pagination, and recommendations. */
export function filterProducts(products, { category, minPrice, maxPrice, sort }) {
  const min = Number(minPrice) || 0;
  const max = Number(maxPrice) || Infinity;
  const filtered = products.filter((product) => (!category || product.category === category) && product.price >= min && product.price <= max);
  if (sort === "low") return [...filtered].sort((a, b) => a.price - b.price);
  if (sort === "high") return [...filtered].sort((a, b) => b.price - a.price);
  return filtered;
}

export function recommendationsFor(products, product) {
  return products.filter((candidate) => candidate.category === product.category && candidate.id !== product.id);
}
