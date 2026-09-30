export const getProductImages = (product) =>
  Array.isArray(product?.product_images) ? product.product_images : [];

export const getMainProductImage = (product) => {
  const images = getProductImages(product);
  return images.find((image) => image.is_main)?.image_url || images[0]?.image_url || null;
};
