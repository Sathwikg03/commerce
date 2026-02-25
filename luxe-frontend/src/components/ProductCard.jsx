import { motion, AnimatePresence } from "framer-motion";
import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ChevronIcon = ({ dir }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points={dir === "left" ? "15 18 9 12 15 6" : "9 6 15 12 9 18"} />
  </svg>
);

export default function ProductCard({ product }) {
  const { addToCart, cartLoading } = useContext(CartContext);
  const { user }    = useContext(AuthContext);
  const navigate    = useNavigate();

  // ── Images: prefer images array, fall back to image_url ──
  const imageList = (() => {
    if (product.images && product.images.length > 0)
      return product.images.map(img => img.url);
    if (product.image_url) return [product.image_url];
    if (product.image)     return [product.image];
    return [];
  })();

  const [imgIndex, setImgIndex]   = useState(0);
  const [quantity, setQuantity]   = useState(1);
  const [feedback, setFeedback]   = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const maxQty    = product.stock ?? 0;
  const outOfStock = maxQty === 0 || !product.is_available;

  const prevImg = (e) => { e.stopPropagation(); setImgIndex(i => (i - 1 + imageList.length) % imageList.length); };
  const nextImg = (e) => { e.stopPropagation(); setImgIndex(i => (i + 1) % imageList.length); };

  const decrement = () => setQuantity(q => Math.max(1, q - 1));
  const increment = () => setQuantity(q => Math.min(maxQty, q + 1));

  const handleAdd = async () => {
    if (!user) { navigate("/login"); return; }
    const result = await addToCart(product.id, quantity);
    if (result?.success) {
      setFeedback("success");
      setFeedbackMsg(`${quantity} item${quantity > 1 ? "s" : ""} added to cart!`);
    } else {
      setFeedback("error");
      setFeedbackMsg(result?.error || "Something went wrong.");
    }
    setTimeout(() => { setFeedback(null); setFeedbackMsg(""); }, 2800);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="glass rounded-2xl overflow-hidden shadow-luxury group flex flex-col"
    >
      {/* ── Image Carousel ── */}
      <div className="relative overflow-hidden h-80 bg-gray-900">
        {imageList.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.img
                key={imgIndex}
                src={imageList[imgIndex]}
                alt={`${product.name} ${imgIndex + 1}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35 }}
                className="h-full w-full object-cover"
              />
            </AnimatePresence>

            {/* Prev / Next arrows — only if multiple images */}
            {imageList.length > 1 && (
              <>
                <button onClick={prevImg}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70 z-10">
                  <ChevronIcon dir="left" />
                </button>
                <button onClick={nextImg}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70 z-10">
                  <ChevronIcon dir="right" />
                </button>

                {/* Dot indicators */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {imageList.map((_, i) => (
                    <button key={i} onClick={(e) => { e.stopPropagation(); setImgIndex(i); }}
                      className={`rounded-full transition-all duration-300 ${
                        i === imgIndex ? "w-4 h-1.5 bg-gold" : "w-1.5 h-1.5 bg-white/50"
                      }`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-600 text-sm">No image</div>
        )}

        {/* Out of Stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
            <span className="border border-red-400/60 text-red-400 text-sm px-4 py-1.5 rounded-full bg-black/40 tracking-wide">
              Out of Stock
            </span>
          </div>
        )}

        {/* Stock warning badge */}
        {!outOfStock && maxQty <= 5 && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs px-2 py-0.5 rounded-full">
              Only {maxQty} left
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-semibold mb-1">{product.name}</h3>
        <p className="text-gray-400 text-sm mb-4 flex-1">{product.description}</p>

        {/* Price */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-gold text-lg font-semibold">
            ₹ {Number(product.price).toLocaleString("en-IN")}
          </span>
          {!outOfStock && (
            <span className="text-gray-500 text-xs">{maxQty} in stock</span>
          )}
        </div>

        {/* Quantity selector — hidden when out of stock */}
        {!outOfStock && (
          <div className="flex items-center gap-3 mb-4">
            <span className="text-gray-400 text-sm">Qty:</span>
            <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden">
              <button onClick={decrement}
                className="px-3 py-1 text-gray-400 hover:text-gold hover:bg-white/5 transition-all duration-200 text-lg leading-none">
                −
              </button>
              <span className="px-4 py-1 text-white text-sm min-w-[2rem] text-center border-x border-gray-600">
                {quantity}
              </span>
              <button onClick={increment}
                disabled={quantity >= maxQty}
                className="px-3 py-1 text-gray-400 hover:text-gold hover:bg-white/5 transition-all duration-200 text-lg leading-none disabled:opacity-30 disabled:cursor-not-allowed">
                +
              </button>
            </div>
            {quantity >= maxQty && (
              <span className="text-yellow-500 text-xs">Max stock</span>
            )}
          </div>
        )}

        {/* Add to Cart */}
        <button
          onClick={handleAdd}
          disabled={cartLoading || outOfStock}
          className="btn-luxury w-full text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </button>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.25 }}
              className={`flex items-center gap-2 text-sm mt-3 px-3 py-2 rounded-lg ${
                feedback === "success"
                  ? "bg-green-500/10 border border-green-500/30 text-green-400"
                  : "bg-red-500/10 border border-red-500/30 text-red-400"
              }`}
            >
              {feedback === "success" && <CheckIcon />}
              <span>{feedbackMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}