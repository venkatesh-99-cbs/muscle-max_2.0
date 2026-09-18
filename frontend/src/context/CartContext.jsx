import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCart, addToCart, updateCartItem, removeCartItem } from "../services/cartApi";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: "0.00" });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [], total: "0.00" });
      return;
    }
    try {
      setLoading(true);
      const res = await getCart();
      setCart(res.data);
    } catch (err) {
      console.error("Failed to fetch cart", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (productId, quantity = 1) => {
    const res = await addToCart(productId, quantity);
    await fetchCart();
    return res.data;
  };

  const updateItem = async (itemId, quantity) => {
    const res = await updateCartItem(itemId, quantity);
    await fetchCart();
    return res.data;
  };

  const removeItem = async (itemId) => {
    await removeCartItem(itemId);
    await fetchCart();
  };

  const itemCount = (cart?.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        loading,
        fetchCart,
        addItem,
        updateItem,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
