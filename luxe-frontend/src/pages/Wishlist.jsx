// pages/Wishlist.jsx
import { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

// ── Icons ─────────────────────────────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#C6A14A" : "none"}
    stroke="#C6A14A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const CartIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
);
const MoveAllIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const EmptyHeartIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

export default function Wishlist() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { wishlist, wishlistLoading, removeFromWishlist, moveAllToCart, fetchWishlist } = useContext(WishlistContext);
  const { addToCart, cartLoading } = useContext(CartContext);

  const [addingToCart,  setAddingToCart]  = useState(null);  // product_id being added
  const [cartFeedback,  setCartFeedback]  = useState({});    // { [product_id]: "success"|"error" }
  const [moveStatus,    setMoveStatus]    = useState(null);  // success message
  const [moving,        setMoving]        = useState(false);

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-6">
      <EmptyHeartIcon />
      <p className="text-gray-400">Please sign in to view your wishlist.</p>
      <Link to="/login" className="btn-luxury">Sign In</Link>
    </div>
  );

  const handleAddToCart = async (item) => {
    setAddingToCart(item.product_id);
    const res = await addToCart(item.product_id, 1);
    setCartFeedback(prev => ({ ...prev, [item.product_id]: res?.success ? "success" : "error" }));
    setTimeout(() => setCartFeedback(prev => { const n = { ...prev }; delete n[item.product_id]; return n; }), 2500);
    setAddingToCart(null);
  };

  const handleMoveAll = async () => {
    setMoving(true);
    const res = await moveAllToCart();
    setMoveStatus(res);
    setTimeout(() => setMoveStatus(null), 3500);
    setMoving(false);
    fetchWishlist();
  };

  // ── Empty state ──
  if (wishlist.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 text-center px-6"
      style={{ background: "linear-gradient(180deg,#0a0a0e 0%,#080808 100%)" }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}>
        <EmptyHeartIcon />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="font-luxury text-gold text-3xl sm:text-4xl mb-2">Your Wishlist</h2>
        <p className="text-gray-500 text-sm mb-6">Save items you love and revisit them anytime.</p>
        <Link to="/products" className="btn-luxury">Explore Collection</Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-16 py-8 sm:py-12 max-w-7xl mx-auto"
      style={{ background: "linear-gradient(180deg,#0a0a0e 0%,#080808 100%)" }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase font-medium mb-1"
            style={{ color: "rgba(198,161,74,0.6)" }}>Saved items</p>
          <h1 className="font-luxury text-gold" style={{ fontSize: "clamp(2rem,5vw,3rem)" }}>
            My Wishlist
            <span className="text-gray-700 font-sans text-base font-normal ml-3">({wishlist.length})</span>
          </h1>
        </div>

        {/* Move all to cart */}
        {wishlist.length > 0 && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleMoveAll}
            disabled={moving || wishlistLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed self-start sm:self-auto"
            style={{ background: "linear-gradient(135deg,#d4aa5a 0%,#C6A14A 100%)", boxShadow: "0 6px 20px rgba(198,161,74,0.25)", touchAction: "manipulation" }}>
            <MoveAllIcon />
            {moving ? "Moving…" : "Move All to Cart"}
          </motion.button>
        )}
      </motion.div>

      {/* Move all feedback */}
      <AnimatePresence>
        {moveStatus && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-6 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
            style={{
              background: moveStatus.success ? "rgba(74,222,128,0.07)" : "rgba(248,113,113,0.07)",
              border: `1px solid ${moveStatus.success ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}`,
              color: moveStatus.success ? "#4ade80" : "#f87171"
            }}>
            {moveStatus.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
        initial="hidden" animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}>

        <AnimatePresence>
          {wishlist.map(item => {
            const outOfStock = !item.product_is_available || item.product_stock === 0;
            const feedback   = cartFeedback[item.product_id];

            return (
              <motion.div key={item.id}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className="rounded-2xl overflow-hidden flex flex-col group"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>

                {/* Image */}
                <div className="relative overflow-hidden"
                  style={{ aspectRatio: "4/3", background: "#0d0d10" }}>
                  {item.product_image ? (
                    <img src={item.product_image} alt={item.product_name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onClick={() => navigate(`/products/${item.product_id}`)}
                      style={{ cursor: "pointer" }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 text-4xl">🛍</div>
                  )}

                  {outOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}>
                      <span className="text-red-400 text-xs tracking-widest uppercase px-4 py-1.5 rounded-full"
                        style={{ border: "1px solid rgba(239,68,68,0.4)", background: "rgba(0,0,0,0.5)" }}>
                        Out of Stock
                      </span>
                    </div>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                    style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", touchAction: "manipulation" }}>
                    <HeartIcon filled />
                  </button>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1 gap-3">
                  <div className="flex-1">
                    <h3
                      className="text-white text-sm font-semibold leading-tight mb-1 cursor-pointer hover:text-gold transition-colors line-clamp-2"
                      onClick={() => navigate(`/products/${item.product_id}`)}>
                      {item.product_name}
                    </h3>
                    <p className="font-luxury text-gold text-lg leading-none">
                      ₹ {Number(item.product_price).toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* Add to cart */}
                  <div>
                    <AnimatePresence mode="wait">
                      {feedback ? (
                        <motion.div key="feedback"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="w-full h-10 rounded-xl flex items-center justify-center text-xs font-medium"
                          style={{
                            background: feedback === "success" ? "rgba(74,222,128,0.07)" : "rgba(248,113,113,0.07)",
                            border: `1px solid ${feedback === "success" ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`,
                            color: feedback === "success" ? "#4ade80" : "#f87171"
                          }}>
                          {feedback === "success" ? "Added to cart!" : "Failed — try again"}
                        </motion.div>
                      ) : (
                        <motion.button key="btn"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          onClick={() => handleAddToCart(item)}
                          disabled={outOfStock || addingToCart === item.product_id || cartLoading}
                          className="w-full h-10 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                          style={{ background: "linear-gradient(135deg,#d4aa5a 0%,#C6A14A 100%)", color: "#000", boxShadow: "0 4px 14px rgba(198,161,74,0.2)", touchAction: "manipulation" }}>
                          <CartIcon />
                          {addingToCart === item.product_id ? "Adding…" : outOfStock ? "Out of Stock" : "Add to Cart"}
                        </motion.button>
                      )}
                    </AnimatePresence>

                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="w-full mt-2 h-9 rounded-xl flex items-center justify-center gap-1.5 text-xs text-gray-600 hover:text-red-400 transition-colors hover:bg-red-500/5"
                      style={{ border: "1px solid rgba(255,255,255,0.05)", touchAction: "manipulation" }}>
                      <TrashIcon />
                      Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}