// ============================================================
// components/WishlistHeartButton.jsx
// Drop this onto any product card — pass the productId prop
// ============================================================
import { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { WishlistContext } from "../context/WishlistContext";
import { AuthContext } from "../context/AuthContext";

export default function WishlistHeartButton({ productId, size = 16, className = "", style = {} }) {
  const { user }                        = useContext(AuthContext);
  const { isWishlisted, toggleWishlist } = useContext(WishlistContext);
  const navigate                        = useNavigate();
  const [animating, setAnimating]       = useState(false);

  const wishlisted = isWishlisted(productId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    setAnimating(true);
    await toggleWishlist(productId);
    setTimeout(() => setAnimating(false), 400);
  };

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.85 }}
      className={`flex items-center justify-center rounded-full transition-all duration-200 ${className}`}
      style={{ touchAction: "manipulation", ...style }}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}>
      <AnimatePresence mode="wait">
        <motion.svg
          key={wishlisted ? "filled" : "empty"}
          width={size} height={size} viewBox="0 0 24 24"
          fill={wishlisted ? "#C6A14A" : "none"}
          stroke="#C6A14A" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round"
          initial={{ scale: animating ? 1.4 : 1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.2 }}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </motion.svg>
      </AnimatePresence>
    </motion.button>
  );
}


// ============================================================
// HOW TO ADD THE HEART TO YOUR NAVBAR
// In your Navbar component, import and use WishlistNavIcon:
// ============================================================

// import { useContext } from "react";
// import { Link } from "react-router-dom";
// import { WishlistContext } from "../context/WishlistContext";
//
// function WishlistNavIcon() {
//   const { wishlistCount } = useContext(WishlistContext);
//   return (
//     <Link to="/wishlist" className="relative flex items-center justify-center w-9 h-9 text-gray-400 hover:text-gold transition-colors">
//       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
//         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
//       </svg>
//       {wishlistCount > 0 && (
//         <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-black"
//           style={{ background: "#C6A14A" }}>
//           {wishlistCount > 9 ? "9+" : wishlistCount}
//         </span>
//       )}
//     </Link>
//   );
// }


// ============================================================
// HOW TO ADD HEART TO PRODUCT CARDS
// Inside your product card JSX, overlay the heart button:
// ============================================================

// import WishlistHeartButton from "../components/WishlistHeartButton";
//
// {/* Inside the card image container */}
// <WishlistHeartButton
//   productId={product.id}
//   size={16}
//   className="absolute top-3 right-3 w-8 h-8"
//   style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}
// />


// ============================================================
// App.jsx / main.jsx — wrap with WishlistProvider
// ============================================================
// import { WishlistProvider } from "./context/WishlistContext";
//
// <WishlistProvider>
//   <CartProvider>
//     ...your app...
//   </CartProvider>
// </WishlistProvider>


// ============================================================
// React Router — add the wishlist route
// ============================================================
// import Wishlist from "./pages/Wishlist";
//
// <Route path="/wishlist" element={<Wishlist />} />