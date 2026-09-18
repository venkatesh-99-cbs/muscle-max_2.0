import api from "./api";

export const getCart = () => api.get("/cart/");

export const addToCart = (productId, quantity = 1) =>
  api.post("/cart/items/", { product_id: productId, quantity });

export const updateCartItem = (itemId, quantity) =>
  api.patch(`/cart/items/${itemId}/`, { quantity });

export const removeCartItem = (itemId) =>
  api.delete(`/cart/items/${itemId}/`);
