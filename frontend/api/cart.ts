import { apiClient } from "./apiClient";

export const getCart = async () => {
  const response = await apiClient.get("/cart/get-cart");
  return response.data;
};

export const updateCart = async (items: Array<Record<string, unknown>>) => {
  const response = await apiClient.patch("/cart/update-cart", { items });
  return response.data;
};

export const clearCart = async () => {
  const response = await apiClient.patch("/cart/clear-cart");
  return response.data;
};
