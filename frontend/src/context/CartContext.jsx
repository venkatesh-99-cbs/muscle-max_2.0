import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCart, addToCart, updateCartItem, removeCartItem } from "../services/cartApi";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("mm_guest_cart");
      return saved ? JSON.parse(saved) : { items: [], total: "0.00" };
    } catch {
      return { items: [], total: "0.00" };
    }
  });
  const [loading, setLoading] = useState(false);

  const calculateTotal = (itemsList) => {
    const total = itemsList.reduce((sum, item) => {
      const price = parseFloat(item.product?.price || item.price || 0);
      const qty = item.quantity || 1;
      return sum + price * qty;
    }, 0);
    return total.toFixed(2);
  };

  const fetchCart = useCallback(async () => {
    if (!user) {
      // Use local storage guest cart
      try {
        const saved = localStorage.getItem("mm_guest_cart");
        if (saved) {
          const parsed = JSON.parse(saved);
          setCart(parsed);
        } else {
          setCart({ items: [], total: "0.00" });
        }
      } catch {
        setCart({ items: [], total: "0.00" });
      }
      return;
    }

    try {
      setLoading(true);
      const res = await getCart();
      setCart(res.data);
    } catch (err) {
      console.error("Failed to fetch cart from server", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Persist guest cart to local storage when not logged in
  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem("mm_guest_cart", JSON.stringify(cart));
      } catch (err) {
        console.error("Failed to save guest cart", err);
      }
    }
  }, [cart, user]);

  const addItem = async (productIdOrProduct, quantity = 1, productDetails = null) => {
    let productId = productIdOrProduct;
    let details = productDetails;

    if (typeof productIdOrProduct === "object" && productIdOrProduct !== null) {
      productId = productIdOrProduct.id;
      details = details || productIdOrProduct;
    }

    if (user) {
      const res = await addToCart(productId, quantity);
      await fetchCart();
      return res.data;
    }

    // Guest cart handler
    setCart((prev) => {
      const items = [...(prev?.items || [])];
      const existingIdx = items.findIndex(
        (i) => (i.product?.id || i.product_id || i.id) === productId
      );

      if (existingIdx > -1) {
        items[existingIdx] = {
          ...items[existingIdx],
          quantity: (items[existingIdx].quantity || 1) + quantity,
        };
      } else {
        items.push({
          id: `guest_${Date.now()}_${productId}`,
          product_id: productId,
          quantity,
          product: details || { id: productId, name: "Product", price: 0 },
        });
      }

      const total = calculateTotal(items);
      return { items, total };
    });
  };

  const updateItem = async (itemId, quantity) => {
    if (user) {
      const res = await updateCartItem(itemId, quantity);
      await fetchCart();
      return res.data;
    }

    setCart((prev) => {
      let items = [...(prev?.items || [])];
      if (quantity <= 0) {
        items = items.filter((i) => i.id !== itemId);
      } else {
        items = items.map((i) => (i.id === itemId ? { ...i, quantity } : i));
      }
      const total = calculateTotal(items);
      return { items, total };
    });
  };

  const removeItem = async (itemId) => {
    if (user) {
      await removeCartItem(itemId);
      await fetchCart();
      return;
    }

    setCart((prev) => {
      const items = (prev?.items || []).filter((i) => i.id !== itemId);
      const total = calculateTotal(items);
      return { items, total };
    });
  };

  const clearCart = () => {
    setCart({ items: [], total: "0.00" });
    localStorage.removeItem("mm_guest_cart");
  };

  const items = cart?.items || [];
  const totalPrice = parseFloat(cart?.total || 0);
  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        totalPrice,
        itemCount,
        loading,
        fetchCart,
        addItem,
        updateItem,
        updateQuantity: updateItem, // alias for backwards compatibility
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
