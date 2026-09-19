import { createContext, useContext, useState, useEffect, useCallback } from "react";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem("mm_wishlist");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("mm_wishlist", JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product) => {
    setItems((prev) =>
      prev.find((p) => p.id === product.id) ? prev : [...prev, product]
    );
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const toggleItem = useCallback((product) => {
    setItems((prev) =>
      prev.find((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );
  }, []);

  const isWishlisted = useCallback(
    (productId) => items.some((p) => p.id === productId),
    [items]
  );

  const itemCount = items.length;

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, toggleItem, isWishlisted, itemCount }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
