import api from "./api";

export const createOrder = (payload) => api.post("/orders/", payload);

export const listOrders = () => api.get("/orders/");

export const getOrder = (id) => api.get(`/orders/${id}/`);

export const updateOrderStatus = (id, status) =>
  api.patch(`/orders/${id}/`, { status });
