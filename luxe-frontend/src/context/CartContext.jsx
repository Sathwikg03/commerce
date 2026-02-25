import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../services/api";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState({ items: [], total: "0.00", item_count: 0 });
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState("");

  // Fetch cart from backend whenever user logs in
  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [], total: "0.00", item_count: 0 });
      return;
    }
    try {
      setCartLoading(true);
      const res = await API.get("cart/");
      setCart(res.data);
    } catch {
      // silently fail — cart will just show empty
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!user) return { error: "Please login to add items to cart." };
    try {
      setCartLoading(true);
      setCartError("");
      const res = await API.post("cart/add/", { product_id: productId, quantity });
      setCart(res.data);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to add item.";
      setCartError(msg);
      return { error: msg };
    } finally {
      setCartLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await API.patch(`cart/items/${itemId}/`, { quantity });
      setCart(res.data);
    } catch (err) {
      setCartError(err.response?.data?.detail || "Failed to update quantity.");
    }
  };

  // Remove single item
  const removeItem = async (itemId) => {
    try {
      const res = await API.delete(`cart/items/${itemId}/`);
      setCart(res.data);
    } catch {
      setCartError("Failed to remove item.");
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      const res = await API.delete("cart/clear/");
      setCart(res.data);
    } catch {
      setCartError("Failed to clear cart.");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartLoading,
        cartError,
        setCartError,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};