import { createContext, useContext, useState, useEffect, useCallback } from "react";

const WishlistContext = createContext(null);
const STORAGE_KEY = "musclemax_wishlist";

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to save wishlist", e);
    }
  }, [wishlist]);

  const isWishlisted = useCallback(
    (productId) => wishlist.some((item) => String(item.id) === String(productId)),
    [wishlist]
  );

  const toggleWishlist = useCallback((product) => {
    if (!product || !product.id) return false;

    setWishlist((prev) => {
      const exists = prev.some((item) => String(item.id) === String(product.id));
      if (exists) {
        return prev.filter((item) => String(item.id) !== String(product.id));
      } else {
        const addedItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category?.name || product.category || "Supplement",
          image: product.image,
          slug: product.slug,
        };

        // Dispatch proactive hint to the AI chatbot
        const detail = {
          type: "wishlist",
          product: addedItem,
          label: "Wishlist Advisor",
          hint: `Saved ${product.name} to wishlist! Try this product for better improvements and ask AI for stacking advice.`,
          prompt: `I just wishlisted ${product.name}. Can you explain its key benefits, recommended dosage, and what products stack best with it?`,
        };
        window.dispatchEvent(new CustomEvent("musclemax:chat-context", { detail }));

        return [...prev, addedItem];
      }
    });
  }, []);

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount,
        isWishlisted,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
