export const formatProductPrice = (price) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(Number(price || 0));

export const isProductAvailable = (product) =>
  Boolean(product?.status && Number(product?.stock) > 0);
