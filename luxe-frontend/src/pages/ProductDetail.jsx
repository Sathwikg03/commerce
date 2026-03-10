import { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

// ── Icons ─────────────────────────────────────────────────────────────────────
const ChevronIcon = ({ dir }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points={dir === "left" ? "15 18 9 12 15 6" : "9 6 15 12 9 18"} />
  </svg>
);
const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
);
const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const CartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const BuyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const StarPoly = ({ filled, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
    fill={filled ? "#C6A14A" : "none"} stroke="#C6A14A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
function getImages(product) {
  if (product.images?.length > 0) return product.images.map(i => i.url);
  if (product.image_url) return [product.image_url];
  if (product.image) return [product.image];
  return [];
}

function Stars({ value, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => <StarPoly key={i} filled={i <= Math.round(value)} size={size} />)}
    </div>
  );
}

function InteractiveStars({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-2">
      {[1,2,3,4,5].map(star => (
        <button key={star} type="button"
          onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="transition-all duration-100 hover:scale-110 active:scale-95"
          style={{ touchAction: "manipulation" }}>
          <StarPoly filled={(hovered || value) >= star} size={32} />
        </button>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProductDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useContext(AuthContext);
  const { addToCart, cartLoading } = useContext(CartContext);

  const [product,      setProduct]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [imgIndex,     setImgIndex]     = useState(0);
  const [quantity,     setQuantity]     = useState(1);
  const [cartFeedback, setCartFeedback] = useState(null);

  const [reviews,     setReviews]     = useState([]);
  const [reviewMeta,  setReviewMeta]  = useState({ count: 0, average: 0, distribution: {} });
  const [userReview,  setUserReview]  = useState(null);
  const [reviewsLoad, setReviewsLoad] = useState(true);

  const [formRating,  setFormRating]  = useState(0);
  const [formTitle,   setFormTitle]   = useState("");
  const [formBody,    setFormBody]    = useState("");
  const [formError,   setFormError]   = useState("");
  const [formSuccess, setFormSuccess] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  const pauseRef = useRef(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setLoading(true);
    API.get(`products/${id}/`)
      .then(res => setProduct(res.data))
      .catch(() => navigate("/products"))
      .finally(() => setLoading(false));
  }, [id]);

  const fetchReviews = () => {
    setReviewsLoad(true);
    API.get(`products/${id}/reviews/`)
      .then(res => {
        setReviews(res.data.reviews);
        setReviewMeta({ count: res.data.count, average: res.data.average, distribution: res.data.distribution });
        setUserReview(res.data.user_review);
      })
      .catch(() => {})
      .finally(() => setReviewsLoad(false));
  };
  useEffect(() => { fetchReviews(); }, [id, user]);

  const images = product ? getImages(product) : [];
  useEffect(() => {
    if (images.length <= 1 || paused) return;
    const t = setInterval(() => setImgIndex(i => (i + 1) % images.length), 4500);
    return () => clearInterval(t);
  }, [images.length, paused]);

  const pauseScroll = () => {
    setPaused(true);
    clearTimeout(pauseRef.current);
    pauseRef.current = setTimeout(() => setPaused(false), 6000);
  };

  const goImg = (dir) => {
    setImgIndex(i => dir === "prev" ? (i - 1 + images.length) % images.length : (i + 1) % images.length);
    pauseScroll();
  };

  const handleAddToCart = async () => {
    if (!user) { navigate("/login"); return; }
    const res = await addToCart(product.id, quantity);
    setCartFeedback(res?.success ? "success" : "error");
    setTimeout(() => setCartFeedback(null), 2500);
  };

  const handleBuyNow = async () => {
    if (!user) { navigate("/login"); return; }
    const res = await addToCart(product.id, quantity);
    if (res?.success) navigate("/cart");
    else { setCartFeedback("error"); setTimeout(() => setCartFeedback(null), 2500); }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!formRating) { setFormError("Please select a star rating."); return; }
    if (formBody.trim().length < 10) { setFormError("Review must be at least 10 characters."); return; }
    setSubmitting(true);
    try {
      await API.post(`products/${id}/reviews/`, { rating: formRating, title: formTitle, body: formBody });
      setFormSuccess(true);
      setFormRating(0); setFormTitle(""); setFormBody("");
      fetchReviews();
      setTimeout(() => setFormSuccess(false), 3000);
    } catch (err) {
      setFormError(err.response?.data?.detail || Object.values(err.response?.data || {})[0]?.[0] || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await API.delete(`reviews/${deleteTarget}/`);
      fetchReviews();
      setDeleteTarget(null);
    } catch { setDeleteTarget(null); }
    finally { setDeleting(false); }
  };

  if (loading) return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 md:px-16 py-10 sm:py-16 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        <div className="rounded-3xl bg-white/5" style={{ aspectRatio: "4/3" }} />
        <div className="space-y-5 pt-4">
          {[60, 90, 40, 70, 50].map((w, i) => (
            <div key={i} className="h-5 rounded-full bg-white/5" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const outOfStock = product.stock === 0 || !product.is_available;
  const maxQty     = product.stock ?? 0;
  const lowStock   = !outOfStock && maxQty <= 5;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0a0a0e 0%, #080808 100%)" }}>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-16 pt-6 sm:pt-10 pb-4 sm:pb-8">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-gray-600 flex-wrap">
          <button onClick={() => navigate("/products")}
            className="flex items-center gap-1.5 hover:text-gold transition-colors duration-200 group shrink-0">
            <span className="group-hover:-translate-x-0.5 transition-transform duration-200"><BackIcon /></span>
            Collection
          </button>
          <span className="text-gray-800">/</span>
          {product.category?.name && (
            <><span className="text-gray-600 hidden sm:inline">{product.category.name}</span><span className="text-gray-800 hidden sm:inline">/</span></>
          )}
          <span className="text-gray-400 truncate max-w-[160px] sm:max-w-[200px]">{product.name}</span>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-16 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-8 xl:gap-20 items-start">

          {/* Gallery */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl group"
              style={{ aspectRatio: "4/3", background: "linear-gradient(135deg,#111114,#0d0d10)", boxShadow: "0 32px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.04)" }}>

              <AnimatePresence mode="wait">
                {images.length > 0 ? (
                  <motion.img key={imgIndex} src={images[imgIndex]} alt={product.name}
                    initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.45 }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-700 text-7xl">🛍</div>
                )}
              </AnimatePresence>

              {/* Bottom fade */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(to top,rgba(8,8,8,0.4) 0%,transparent 40%)" }} />

              {/* Arrows — always visible on mobile, hover-only on desktop */}
              {images.length > 1 && (
                <>
                  <button onClick={() => goImg("prev")}
                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100 opacity-80"
                    style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", touchAction: "manipulation" }}>
                    <ChevronIcon dir="left" />
                  </button>
                  <button onClick={() => goImg("next")}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100 opacity-80"
                    style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", touchAction: "manipulation" }}>
                    <ChevronIcon dir="right" />
                  </button>
                  {/* Progress dots */}
                  <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => { setImgIndex(i); pauseScroll(); }}
                        className="rounded-full transition-all duration-300"
                        style={{ width: i === imgIndex ? "20px" : "6px", height: "6px", background: i === imgIndex ? "#C6A14A" : "rgba(255,255,255,0.3)", touchAction: "manipulation" }} />
                    ))}
                  </div>
                </>
              )}

              {outOfStock && (
                <div className="absolute inset-0 z-20 flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(2px)" }}>
                  <span className="text-red-400 text-xs sm:text-sm tracking-widest uppercase px-4 sm:px-6 py-2 sm:py-2.5 rounded-full"
                    style={{ border: "1px solid rgba(239,68,68,0.4)", background: "rgba(0,0,0,0.5)" }}>
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails — horizontally scrollable on mobile */}
            {images.length > 1 && (
              <div className="flex justify-center gap-2 sm:gap-3 mt-3 sm:mt-4 overflow-x-auto pb-1 scrollbar-none"
                style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
                {images.map((src, i) => (
                  <motion.button key={i} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
                    onClick={() => { setImgIndex(i); pauseScroll(); }}
                    className="flex-shrink-0 overflow-hidden rounded-xl transition-all duration-300"
                    style={{ width: "60px", height: "45px", border: i === imgIndex ? "2px solid #C6A14A" : "2px solid rgba(255,255,255,0.06)", opacity: i === imgIndex ? 1 : 0.45, boxShadow: i === imgIndex ? "0 0 16px rgba(198,161,74,0.25)" : "none", touchAction: "manipulation" }}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info panel */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="lg:sticky lg:top-28 space-y-5 sm:space-y-6">

            {/* Category */}
            {product.category?.name && (
              <span className="inline-flex items-center text-[10px] sm:text-[11px] font-semibold tracking-[0.15em] uppercase px-3 py-1 rounded-full"
                style={{ color: "#C6A14A", background: "rgba(198,161,74,0.08)", border: "1px solid rgba(198,161,74,0.2)" }}>
                {product.category.name}
              </span>
            )}

            {/* Name + stars */}
            <div>
              <h1 className="font-luxury leading-[1.1] text-white mb-2 sm:mb-3"
                style={{ fontSize: "clamp(1.6rem,5vw,3rem)" }}>
                {product.name}
              </h1>
              {reviewMeta.count > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Stars value={reviewMeta.average} size={14} />
                  <span className="text-sm font-semibold text-gold">{reviewMeta.average}</span>
                  <span className="text-gray-700">·</span>
                  <a href="#reviews" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                    {reviewMeta.count} review{reviewMeta.count !== 1 ? "s" : ""}
                  </a>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 py-4 sm:py-5"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span className="font-luxury text-gold" style={{ fontSize: "clamp(1.8rem,5vw,2.5rem)", lineHeight: 1 }}>
                ₹ {Number(product.price).toLocaleString("en-IN")}
              </span>
              {product.original_price && Number(product.original_price) > Number(product.price) && (
                <span className="text-gray-600 line-through text-base sm:text-lg">₹ {Number(product.original_price).toLocaleString("en-IN")}</span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-400 leading-relaxed text-sm sm:text-[0.925rem]">
              {product.description}
            </p>

            {/* Stock indicator */}
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: outOfStock ? "#f87171" : lowStock ? "#facc15" : "#4ade80", boxShadow: `0 0 8px ${outOfStock ? "rgba(248,113,113,0.5)" : lowStock ? "rgba(250,204,21,0.5)" : "rgba(74,222,128,0.5)"}` }} />
              <span className="text-xs sm:text-sm" style={{ color: outOfStock ? "#f87171" : lowStock ? "#facc15" : "#6b7280" }}>
                {outOfStock ? "Currently out of stock" : lowStock ? `Only ${maxQty} remaining` : `${maxQty} units in stock`}
              </span>
            </div>

            {/* Actions */}
            {!outOfStock && (
              <div className="space-y-4 pt-1">
                {/* Qty selector */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-xs tracking-widest uppercase text-gray-600 font-medium w-8">Qty</span>
                  <div className="flex items-center rounded-2xl overflow-hidden"
                    style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-11 sm:w-12 h-11 flex items-center justify-center text-gray-400 hover:text-white text-2xl transition-colors hover:bg-white/5 active:bg-white/10"
                      style={{ touchAction: "manipulation" }}>
                      −
                    </button>
                    <span className="w-12 sm:w-14 text-center text-white text-sm font-medium"
                      style={{ borderLeft: "1px solid rgba(255,255,255,0.06)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                      {quantity}
                    </span>
                    <button onClick={() => setQuantity(q => Math.min(maxQty, q + 1))} disabled={quantity >= maxQty}
                      className="w-11 sm:w-12 h-11 flex items-center justify-center text-gray-400 hover:text-white text-2xl transition-colors hover:bg-white/5 active:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed"
                      style={{ touchAction: "manipulation" }}>
                      +
                    </button>
                  </div>
                  {quantity >= maxQty && <span className="text-yellow-500/70 text-xs">Max</span>}
                </div>

                {/* CTA buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleAddToCart} disabled={cartLoading}
                    className="flex items-center justify-center gap-2 rounded-2xl text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5 active:scale-[0.98] active:bg-white/5"
                    style={{ height: "52px", border: "1px solid rgba(198,161,74,0.45)", color: "#C6A14A", background: "rgba(198,161,74,0.04)", touchAction: "manipulation" }}>
                    <CartIcon />
                    <span className="hidden xs:inline sm:inline">{cartLoading ? "Adding…" : "Add to Cart"}</span>
                    <span className="xs:hidden sm:hidden">{cartLoading ? "…" : "Cart"}</span>
                  </button>
                  <button onClick={handleBuyNow} disabled={cartLoading}
                    className="flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-black transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                    style={{ height: "52px", background: "linear-gradient(135deg,#d4aa5a 0%,#C6A14A 50%,#a8863a 100%)", boxShadow: "0 8px 24px rgba(198,161,74,0.3)", touchAction: "manipulation" }}>
                    <BuyIcon />
                    Buy Now
                  </button>
                </div>
              </div>
            )}

            {/* Cart feedback */}
            <AnimatePresence>
              {cartFeedback && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-xs px-4 py-3 rounded-xl"
                  style={{ background: cartFeedback === "success" ? "rgba(74,222,128,0.07)" : "rgba(248,113,113,0.07)", border: `1px solid ${cartFeedback === "success" ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}`, color: cartFeedback === "success" ? "#4ade80" : "#f87171" }}>
                  {cartFeedback === "success" && <CheckIcon />}
                  {cartFeedback === "success" ? `${quantity} item${quantity > 1 ? "s" : ""} added to cart` : "Failed to add. Please try again."}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Reviews section */}
      <div id="reviews" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-16 py-12 sm:py-20">

          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-10 sm:mb-14">
            <p className="text-xs tracking-[0.2em] uppercase mb-2 font-medium" style={{ color: "rgba(198,161,74,0.6)" }}>What people say</p>
            <h2 className="font-luxury text-white" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)" }}>
              Customer Reviews
              {reviewMeta.count > 0 && <span className="text-gray-700 font-sans text-sm sm:text-base font-normal ml-3 sm:ml-4">({reviewMeta.count})</span>}
            </h2>
          </motion.div>

          {/* On mobile: sidebar stacks on top, list below. On desktop: side-by-side. */}
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 xl:gap-16">

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Rating overview */}
              {reviewMeta.count > 0 && (
                <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="rounded-2xl p-5 sm:p-6"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex items-end gap-3 mb-4 sm:mb-5">
                    <span className="font-luxury text-gold leading-none" style={{ fontSize: "clamp(2.5rem,8vw,4rem)" }}>{reviewMeta.average}</span>
                    <div className="pb-1.5">
                      <Stars value={reviewMeta.average} size={16} />
                      <p className="text-gray-600 text-xs mt-1">{reviewMeta.count} verified reviews</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {[5,4,3,2,1].map(star => {
                      const count = reviewMeta.distribution[star] || 0;
                      const pct   = reviewMeta.count > 0 ? (count / reviewMeta.count) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2.5">
                          <span className="text-xs text-gray-600 w-3">{star}</span>
                          <StarPoly filled size={10} />
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                            <motion.div className="h-full rounded-full"
                              style={{ background: "linear-gradient(90deg,#C6A14A,#d4aa5a)" }}
                              initial={{ width: 0 }} whileInView={{ width: `${pct}%` }}
                              viewport={{ once: true }} transition={{ duration: 0.9, delay: (5 - star) * 0.07 }} />
                          </div>
                          <span className="text-xs text-gray-700 w-4 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Review form */}
              {user ? (
                userReview ? (
                  <div className="rounded-2xl p-4 sm:p-5"
                    style={{ background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.15)" }}>
                    <p className="text-green-400 text-sm font-medium flex items-center gap-2 mb-1"><CheckIcon /> You've reviewed this product</p>
                    <p className="text-gray-600 text-xs">Scroll down to see your review.</p>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="rounded-2xl p-5 sm:p-6"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <h3 className="text-sm font-semibold text-white mb-4 sm:mb-5 tracking-wide">Write a Review</h3>
                    <AnimatePresence>
                      {formSuccess && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="text-xs px-3 py-2.5 rounded-xl mb-4 flex items-center gap-2"
                          style={{ background: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.2)", color: "#4ade80" }}>
                          <CheckIcon /> Review submitted!
                        </motion.div>
                      )}
                      {formError && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="text-xs px-3 py-2.5 rounded-xl mb-4"
                          style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171" }}>
                          {formError}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-2.5 tracking-wide uppercase font-medium">Your Rating</p>
                        <InteractiveStars value={formRating} onChange={setFormRating} />
                      </div>
                      <input type="text" placeholder="Review title (optional)"
                        value={formTitle} onChange={e => setFormTitle(e.target.value)}
                        className="w-full text-sm text-white placeholder-gray-700 rounded-xl px-4 py-3 outline-none transition-all duration-200"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                        onFocus={e => e.target.style.borderColor = "rgba(198,161,74,0.5)"}
                        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.07)"}
                      />
                      <textarea placeholder="Share your experience…"
                        value={formBody} onChange={e => setFormBody(e.target.value)}
                        rows={4} className="w-full text-sm text-white placeholder-gray-700 rounded-xl px-4 py-3 outline-none transition-all duration-200 resize-none"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                        onFocus={e => e.target.style.borderColor = "rgba(198,161,74,0.5)"}
                        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.07)"}
                      />
                      <button onClick={handleSubmitReview} disabled={submitting}
                        className="w-full h-11 sm:h-12 rounded-xl text-sm font-semibold text-black transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                        style={{ background: "linear-gradient(135deg,#d4aa5a 0%,#C6A14A 100%)", boxShadow: "0 6px 20px rgba(198,161,74,0.25)", touchAction: "manipulation" }}>
                        {submitting ? "Submitting…" : "Submit Review"}
                      </button>
                    </div>
                  </motion.div>
                )
              ) : (
                <div className="rounded-2xl p-5 sm:p-6 text-center"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-gray-500 text-sm mb-4">Sign in to leave a review</p>
                  <Link to="/login"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-black transition-all duration-200 hover:opacity-90 active:scale-95"
                    style={{ background: "linear-gradient(135deg,#d4aa5a 0%,#C6A14A 100%)" }}>
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            {/* Review list */}
            <div>
              {reviewsLoad ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-2xl p-5 sm:p-6 animate-pulse"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <div className="flex gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 bg-white/5 rounded-full w-1/3" />
                          <div className="h-2.5 bg-white/5 rounded-full w-1/4" />
                        </div>
                      </div>
                      <div className="h-3 bg-white/5 rounded-full w-full mb-2" />
                      <div className="h-3 bg-white/5 rounded-full w-4/5" />
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 sm:py-24 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <span className="text-4xl sm:text-5xl mb-4">✍️</span>
                  <p className="text-gray-500 text-sm">No reviews yet.</p>
                  <p className="text-gray-700 text-xs mt-1">Be the first to share your experience.</p>
                </motion.div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {reviews.map((review, i) => (
                    <motion.div key={review.id}
                      initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.04 }}
                      className="rounded-2xl p-4 sm:p-6 relative group transition-colors duration-300"
                      style={{ background: review.is_owner ? "rgba(198,161,74,0.03)" : "rgba(255,255,255,0.02)", border: review.is_owner ? "1px solid rgba(198,161,74,0.12)" : "1px solid rgba(255,255,255,0.04)" }}>

                      <div className="flex items-start gap-3 sm:gap-3.5 mb-3 sm:mb-4">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                          style={{ background: "rgba(198,161,74,0.1)", border: "1px solid rgba(198,161,74,0.25)", color: "#C6A14A" }}>
                          {(review.full_name || review.username)?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          {/* Name + badge + delete */}
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-white text-sm font-medium truncate">{review.full_name || review.username}</p>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {review.is_owner && (
                                <span className="text-[10px] font-medium tracking-wide px-2 py-0.5 rounded-full"
                                  style={{ color: "#C6A14A", background: "rgba(198,161,74,0.1)", border: "1px solid rgba(198,161,74,0.2)" }}>
                                  Your Review
                                </span>
                              )}
                              {(review.is_owner || user?.is_staff) && (
                                <button onClick={() => setDeleteTarget(review.id)}
                                  className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  style={{ touchAction: "manipulation" }}>
                                  <TrashIcon />
                                </button>
                              )}
                            </div>
                          </div>
                          {/* Stars + date */}
                          <div className="flex items-center gap-2 mt-1">
                            <Stars value={review.rating} size={12} />
                            <span className="text-gray-700 text-xs">·</span>
                            <p className="text-gray-700 text-xs">
                              {new Date(review.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                      </div>

                      {review.title && <p className="text-white text-sm font-semibold mb-1.5">{review.title}</p>}
                      <p className="text-gray-400 text-sm leading-relaxed">{review.body}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 sm:px-6 pb-safe"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm rounded-3xl p-6 sm:p-8 text-center mb-4 sm:mb-0"
              style={{ background: "#0f0f12", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5"
                style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>
                <TrashIcon />
              </div>
              <h3 className="font-luxury text-white text-xl sm:text-2xl mb-2">Delete Review?</h3>
              <p className="text-gray-600 text-sm mb-6 sm:mb-7">This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)}
                  className="flex-1 h-11 rounded-xl text-sm text-gray-400 hover:text-white transition-colors active:scale-[0.98]"
                  style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", touchAction: "manipulation" }}>
                  Cancel
                </button>
                <button onClick={handleDeleteReview} disabled={deleting}
                  className="flex-1 h-11 rounded-xl text-sm font-medium text-red-400 transition-all hover:bg-red-500/10 disabled:opacity-40 active:scale-[0.98]"
                  style={{ border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.05)", touchAction: "manipulation" }}>
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}