import { useEffect, useState } from "react";
export const getSellingPrice = (product, now) => {
  const active = Boolean(product?.status && product.stock > 0 && product.offer_enabled && Number(product.offer_price) > 0 && Number(product.offer_price) < Number(product.price) && Date.parse(product.offer_starts_at) <= now && now < Date.parse(product.offer_ends_at));
  return {
    active,
    price: active ? product.offer_price : product?.price
  };
};
const useProductPricing = product => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!product?.offer_enabled) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [product?.offer_enabled]);
  const pricing = getSellingPrice(product, now);
  return {
    ...pricing,
    remaining: Math.max(0, Date.parse(product?.offer_ends_at) - now)
  };
};
export default useProductPricing;
