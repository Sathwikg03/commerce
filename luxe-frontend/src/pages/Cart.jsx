import { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { NotificationContext } from "../context/NotificationContext";
import API from "../services/api";

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
);

const EmptyCartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
    className="text-gray-600">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const CheckoutSuccessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className="text-green-400">
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

function getProductImage(product) {
  if (!product) return "";
  if (product.images?.length > 0) return product.images[0].url;
  if (product.image_url) return product.image_url;
  if (product.image)     return product.image;
  return "";
}

export default function Cart() {
  const { cart, cartLoading, updateQuantity, removeItem, fetchCart } = useContext(CartContext);
  const { user }             = useContext(AuthContext);
  const { addNotification }  = useContext(NotificationContext);
  const [selected,      setSelected]      = useState(new Set());
  const [checkedOut,    setCheckedOut]    = useState(false);
  const [checkingOut,   setCheckingOut]   = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 gap-6">
        <EmptyCartIcon />
        <p className="text-gray-400 text-lg">Please login to view your cart.</p>
        <Link to="/login" className="btn-luxury">Login</Link>
      </div>
    );
  }

  const items = cart.items || [];

  const toggleSelect    = (id) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleSelectAll = ()   => setSelected(selected.size === items.length ? new Set() : new Set(items.map(i => i.id)));

  const removeSelected = async () => {
    for (const id of selected) await removeItem(id);
    setSelected(new Set());
  };

  const selectedTotal = items.filter(i => selected.has(i.id)).reduce((sum, i) => sum + parseFloat(i.subtotal), 0);
  const displayTotal  = selected.size > 0 ? selectedTotal : parseFloat(cart.total || 0);

  const handleCheckout = async () => {
    setCheckoutError("");
    setCheckingOut(true);
    try {
      const body = selected.size > 0 ? { item_ids: [...selected] } : {};
      const res  = await API.post("orders/checkout/", body);
      const orderId = res.data?.id || res.data?.order_id || "—";
      addNotification({
        type:  "order",
        title: "Order Shipped",
        body:  `Your order #${orderId} is on its way.`,
      });
      await fetchCart();
      setSelected(new Set());
      setCheckedOut(true);
    } catch (err) {
      setCheckoutError(err.response?.data?.detail || "Checkout failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  // ── Order placed screen ──
  if (checkedOut) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 gap-6">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}>
          <CheckoutSuccessIcon />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="space-y-3">
          <h2 className="text-3xl sm:text-4xl font-luxury text-gold">Order Placed!</h2>
          <p className="text-gray-400 max-w-sm text-sm sm:text-base">
            Thank you for your purchase. Your luxury items will be delivered with care.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link to="/products" className="btn-luxury">Continue Shopping</Link>
            <button onClick={() => setCheckedOut(false)}
              className="text-gray-400 hover:text-gold transition text-sm underline underline-offset-4">
              View Cart
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Empty cart ──
  if (items.length === 0 && !cartLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 gap-6">
        <EmptyCartIcon />
        <h2 className="text-3xl font-luxury text-gold">Your cart is empty</h2>
        <p className="text-gray-400 text-sm sm:text-base">Explore our collection and add something beautiful.</p>
        <Link to="/products" className="btn-luxury">Explore Collection</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-16 py-8 sm:py-12 max-w-6xl mx-auto">

      <motion.h2 initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="text-4xl sm:text-5xl font-luxury text-gold mb-8 sm:mb-10 text-center">
        Your Cart
      </motion.h2>

      <div className="flex flex-col lg:flex-row gap-6 sm:gap-10">

        {/* ── Items List ── */}
        <div className="flex-1 space-y-3 sm:space-y-4">

          {/* Select All bar */}
          {items.length > 0 && (
            <div className="flex items-center justify-between glass px-4 py-3 rounded-xl">
              <label className="flex items-center gap-3 cursor-pointer select-none text-sm text-gray-300">
                <input type="checkbox" checked={selected.size === items.length && items.length > 0}
                  onChange={toggleSelectAll} className="w-4 h-4 accent-yellow-500 cursor-pointer" />
                Select All ({items.length})
              </label>
              {selected.size > 0 && (
                <motion.button initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  onClick={removeSelected}
                  className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs sm:text-sm transition-colors duration-200"
                  style={{ touchAction: "manipulation" }}>
                  <TrashIcon />
                  <span className="hidden sm:inline">Remove Selected ({selected.size})</span>
                  <span className="sm:hidden">Remove ({selected.size})</span>
                </motion.button>
              )}
            </div>
          )}

          <AnimatePresence>
            {items.map(item => {
              const imgSrc = getProductImage(item.product);
              return (
                <motion.div key={item.id} layout
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }} transition={{ duration: 0.3 }}
                  className={`glass rounded-2xl p-3 sm:p-4 transition-all duration-200 border ${
                    selected.has(item.id) ? "border-gold/50" : "border-transparent"
                  }`}>

                  {/* Top row: checkbox + image + name/desc + trash */}
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)}
                      className="w-4 h-4 accent-yellow-500 cursor-pointer flex-shrink-0 mt-1" />

                    {/* Product image */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex-shrink-0 overflow-hidden bg-gray-800 border border-gray-700">
                      {imgSrc ? (
                        <img src={imgSrc} alt={item.product.name} className="w-full h-full object-cover"
                          onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                      ) : null}
                      <div className={`w-full h-full items-center justify-center text-gray-600 text-xl ${imgSrc ? "hidden" : "flex"}`}>
                        🛍
                      </div>
                    </div>

                    {/* Name + description */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm sm:text-base leading-tight truncate pr-1">
                        {item.product.name}
                      </h3>
                      <p className="text-gray-500 text-xs mt-0.5 line-clamp-2 hidden sm:block">
                        {item.product.description}
                      </p>
                      <p className="text-gold text-xs sm:text-sm font-medium mt-1">
                        ₹ {Number(item.product.price).toLocaleString("en-IN")} each
                      </p>
                    </div>

                    {/* Trash — top right */}
                    <button onClick={() => removeItem(item.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors duration-200 flex-shrink-0 p-1 -mt-0.5"
                      style={{ touchAction: "manipulation" }}>
                      <TrashIcon />
                    </button>
                  </div>

                  {/* Bottom row: qty stepper + subtotal */}
                  <div className="flex items-center justify-between mt-3 pl-7 sm:pl-8">
                    {/* Qty stepper */}
                    <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden">
                      <button
                        onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                        className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gold hover:bg-white/5 transition-all text-lg leading-none"
                        style={{ touchAction: "manipulation" }}>
                        −
                      </button>
                      <span className="w-10 text-center text-white text-sm border-x border-gray-600 py-2">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gold hover:bg-white/5 transition-all text-lg leading-none"
                        style={{ touchAction: "manipulation" }}>
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <p className="text-gold font-semibold text-sm sm:text-base">
                      ₹ {Number(item.subtotal).toLocaleString("en-IN")}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ── Order Summary ── */}
        <div className="lg:w-80 flex-shrink-0">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-5 sm:p-6 shadow-luxury lg:sticky lg:top-28">
            <h3 className="text-xl sm:text-2xl font-luxury text-gold mb-5 sm:mb-6">Order Summary</h3>

            <div className="space-y-3 text-sm mb-5 sm:mb-6">
              <div className="flex justify-between text-gray-400">
                <span>Items</span><span>{cart.item_count}</span>
              </div>
              {selected.size > 0 && (
                <div className="flex justify-between text-gray-400">
                  <span>Selected ({selected.size})</span>
                  <span>₹ {selectedTotal.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span><span className="text-green-400">Free</span>
              </div>
              <div className="border-t border-gray-700 pt-3 flex justify-between text-white font-semibold text-base">
                <span>Total</span>
                <span className="text-gold">₹ {displayTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <AnimatePresence>
              {checkoutError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg mb-3">
                  {checkoutError}
                </motion.p>
              )}
            </AnimatePresence>

            {selected.size > 0 && (
              <p className="text-xs text-gray-500 mb-3 text-center">
                Checking out {selected.size} selected item{selected.size > 1 ? "s" : ""}
              </p>
            )}

            <button onClick={handleCheckout} disabled={checkingOut || items.length === 0}
              className="btn-luxury w-full disabled:opacity-40 disabled:cursor-not-allowed text-center"
              style={{ touchAction: "manipulation" }}>
              {checkingOut ? "Processing..." : "Proceed to Checkout"}
            </button>
            <Link to="/products"
              className="block text-center text-gray-400 hover:text-gold transition text-sm mt-4 underline underline-offset-4">
              Continue Shopping
            </Link>
          </motion.div>
        </div>

      </div>
    </div>
  );
}