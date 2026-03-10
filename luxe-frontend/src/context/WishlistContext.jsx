// context/WishlistContext.jsx
import { createContext, useState, useEffect, useContext, useCallback } from "react";
import API from "../services/api";
import { AuthContext } from "./AuthContext";

export const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [wishlist,        setWishlist]        = useState([]);
  const [wishlistCount,   setWishlistCount]   = useState(0);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) { setWishlist([]); setWishlistCount(0); return; }
    try {
      const res = await API.get("wishlist/");
      setWishlist(res.data.items);
      setWishlistCount(res.data.count);
    } catch {}
  }, [user]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const isWishlisted = (productId) => wishlist.some(i => i.product_id === productId);

  const toggleWishlist = async (productId) => {
    if (!user) return { success: false, requiresAuth: true };
    setWishlistLoading(true);
    try {
      const res = await API.post("wishlist/toggle/", { product_id: productId });
      await fetchWishlist();
      return { success: true, wishlisted: res.data.wishlisted };
    } catch {
      return { success: false };
    } finally {
      setWishlistLoading(false);
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      await API.delete(`wishlist/${itemId}/`);
      await fetchWishlist();
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  const moveAllToCart = async () => {
    setWishlistLoading(true);
    try {
      const res = await API.post("wishlist/move-to-cart/");
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.detail || "Failed to move items." };
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <WishlistContext.Provider value={{
      wishlist, wishlistCount, wishlistLoading,
      fetchWishlist, isWishlisted, toggleWishlist,
      removeFromWishlist, moveAllToCart,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}