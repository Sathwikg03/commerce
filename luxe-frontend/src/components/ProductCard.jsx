// ProductCard.jsx

import { motion, AnimatePresence } from "framer-motion";
import { useContext, useState, useEffect, useRef } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { WishlistContext } from "../context/WishlistContext";
import { useNavigate, Link } from "react-router-dom";

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ChevronIcon = ({ dir }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points={dir === "left" ? "15 18 9 12 15 6" : "9 6 15 12 9 18"} />
  </svg>
);

const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

// ── NEW: Heart icon for wishlist ──────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill={filled ? "#e05a7a" : "none"} stroke="#e05a7a" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

export default function ProductCard({ product }) {
  const { addToCart, cartLoading }         = useContext(CartContext);
  const { user }                           = useContext(AuthContext);
  const { isWishlisted, toggleWishlist }   = useContext(WishlistContext); // ← NEW
  const navigate                           = useNavigate();

  const imageList = (() => {
    if (product.images && product.images.length > 0)
      return product.images.map(img => img.url);
    if (product.image_url) return [product.image_url];
    if (product.image)     return [product.image];
    return [];
  })();

  const [imgIndex,    setImgIndex]    = useState(0);
  const [quantity,    setQuantity]    = useState(1);
  const [feedback,    setFeedback]    = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [paused,      setPaused]      = useState(false);
  const [heartAnim,   setHeartAnim]   = useState(false); // ← NEW
  const pauseTimer                    = useRef(null);

  useEffect(() => {
    if (imageList.length <= 1 || paused) return;
    const id = setInterval(() => {
      setImgIndex(i => (i + 1) % imageList.length);
    }, 4000);
    return () => clearInterval(id);
  }, [imageList.length, paused]);

  const pauseAutoScroll = () => {
    setPaused(true);
    clearTimeout(pauseTimer.current);
    pauseTimer.current = setTimeout(() => setPaused(false), 5000);
  };

  const maxQty     = product.stock ?? 0;
  const outOfStock = maxQty === 0 || !product.is_available;
  const wishlisted = isWishlisted(product.id); // ← NEW

  const prevImg = (e) => {
    e.stopPropagation(); e.preventDefault();
    setImgIndex(i => (i - 1 + imageList.length) % imageList.length);
    pauseAutoScroll();
  };
  const nextImg = (e) => {
    e.stopPropagation(); e.preventDefault();
    setImgIndex(i => (i + 1) % imageList.length);
    pauseAutoScroll();
  };

  const decrement = (e) => { e.preventDefault(); setQuantity(q => Math.max(1, q - 1)); };
  const increment = (e) => { e.preventDefault(); setQuantity(q => Math.min(maxQty, q + 1)); };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    const result = await addToCart(product.id, quantity);
    if (result?.success) {
      setFeedback("success");
      setFeedbackMsg(`${quantity} item${quantity > 1 ? "s" : ""} added!`);
    } else {
      setFeedback("error");
      setFeedbackMsg(result?.error || "Something went wrong.");
    }
    setTimeout(() => { setFeedback(null); setFeedbackMsg(""); }, 2800);
  };

  // ── NEW: wishlist toggle handler ──────────────────────────────────────────
  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    setHeartAnim(true);
    await toggleWishlist(product.id);
    setTimeout(() => setHeartAnim(false), 400);
  };

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.25 }}
      className="glass rounded-2xl overflow-hidden shadow-luxury flex flex-col"
      style={{ height: "560px" }}>

      {/* ── Image area ── */}
      <Link to={`/products/${product.id}`} className="relative flex-shrink-0 bg-gray-900 block group"
        style={{ height: "260px" }}>
        {imageList.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.img key={imgIndex} src={imageList[imgIndex]} alt={product.name}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>

            {/* View detail hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5 text-xs text-white border border-white/40 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <EyeIcon /> View Details
              </span>
            </div>

            {imageList.length > 1 && (
              <>
                <button onClick={prevImg}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/55 text-white flex items-center justify-center opacity-0 hover:!opacity-100 transition-opacity duration-200 hover:bg-black/75 z-10">
                  <ChevronIcon dir="left" />
                </button>
                <button onClick={nextImg}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/55 text-white flex items-center justify-center opacity-0 hover:!opacity-100 transition-opacity duration-200 hover:bg-black/75 z-10">
                  <ChevronIcon dir="right" />
                </button>
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {imageList.map((_, i) => (
                    <button key={i} onClick={e => { e.preventDefault(); setImgIndex(i); pauseAutoScroll(); }}
                      className={`rounded-full transition-all duration-300 ${i === imgIndex ? "w-4 h-1.5 bg-gold" : "w-1.5 h-1.5 bg-white/50"}`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">No image</div>
        )}

        {outOfStock && (
          <div className="absolute inset-0 bg-black/65 flex items-center justify-center z-20">
            <span className="border border-red-400/60 text-red-400 text-sm px-4 py-1.5 rounded-full bg-black/40 tracking-wide">
              Out of Stock
            </span>
          </div>
        )}

        {/* Category badge — top left */}
        <div className="absolute top-2.5 left-2.5 z-10">
          {product.category?.name ? (
            <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm text-gold text-xs px-2.5 py-1 rounded-full border border-gold/30">
              <TagIcon /> {product.category.name}
            </span>
          ) : <span className="h-6 block" />}
        </div>

        {/* ── NEW: Wishlist heart — top right (replaces the "Only N left" badge position) ── */}
        <motion.button
          onClick={handleWishlist}
          whileTap={{ scale: 0.8 }}
          animate={heartAnim ? { scale: [1, 1.4, 1] } : {}}
          transition={{ duration: 0.3 }}
          className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
          style={{
            background: wishlisted ? "rgba(224,90,122,0.18)" : "rgba(0,0,0,0.55)",
            backdropFilter: "blur(8px)",
            border: wishlisted ? "1px solid rgba(224,90,122,0.5)" : "1px solid rgba(255,255,255,0.15)",
            touchAction: "manipulation",
          }}>
          <HeartIcon filled={wishlisted} />
        </motion.button>

        {/* "Only N left" badge — moved below heart */}
        {!outOfStock && maxQty <= 5 && (
          <div className="absolute top-12 right-2.5 z-10">
            <span className="bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs px-2 py-0.5 rounded-full">
              Only {maxQty} left
            </span>
          </div>
        )}
      </Link>

      {/* ── Content area ── */}
      <div className="flex flex-col flex-1 p-5 overflow-hidden">
        <Link to={`/products/${product.id}`} className="hover:text-gold transition-colors">
        <h3 className="text-base font-semibold text-white truncate flex-shrink-0 uppercase tracking-wide">{product.name}</h3>
        </Link>

        <p className="text-gray-400 text-sm mt-1 flex-shrink-0 leading-snug"
          style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "2.5rem" }}>
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-4 flex-shrink-0">
          <span className="text-gold text-xl font-semibold">
            ₹ {Number(product.price).toLocaleString("en-IN")}
          </span>
          <span className={`text-xs ${outOfStock ? "text-red-400" : "text-gray-500"}`}>
            {outOfStock ? "Out of stock" : `${maxQty} in stock`}
          </span>
        </div>

        <div className="flex-1" />

        <div className="flex-shrink-0" style={{ height: "40px" }}>
          {!outOfStock && (
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">Qty:</span>
              <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden">
                <button onClick={decrement} className="px-3 py-1.5 text-gray-400 hover:text-gold hover:bg-white/5 transition text-lg leading-none">−</button>
                <span className="px-3 py-1.5 text-white text-sm min-w-[2rem] text-center border-x border-gray-600">{quantity}</span>
                <button onClick={increment} disabled={quantity >= maxQty}
                  className="px-3 py-1.5 text-gray-400 hover:text-gold hover:bg-white/5 transition text-lg leading-none disabled:opacity-30 disabled:cursor-not-allowed">+</button>
              </div>
              {quantity >= maxQty && <span className="text-yellow-500 text-xs">Max</span>}
            </div>
          )}
        </div>

        <button onClick={handleAdd} disabled={cartLoading || outOfStock}
          className="btn-luxury w-full text-sm mt-3 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ height: "44px" }}>
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </button>

        <div className="flex-shrink-0 mt-2" style={{ height: "32px" }}>
          <AnimatePresence>
            {feedback && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg h-full ${
                  feedback === "success"
                    ? "bg-green-500/10 border border-green-500/30 text-green-400"
                    : "bg-red-500/10 border border-red-500/30 text-red-400"
                }`}>
                {feedback === "success" && <CheckIcon />}
                <span className="truncate">{feedbackMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}