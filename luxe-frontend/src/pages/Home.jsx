import { motion } from "framer-motion";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const BG_DESKTOP = "https://i.postimg.cc/dt2tRFyH/Whats-App-Image-2026-02-27-at-12-41-37.jpg";
const BG_MOBILE  = "https://i.postimg.cc/NFQCWRdR/Chat-GPT-Image-Feb-27-2026-12-46-32-PM.png";

export default function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">

      {/* ── Desktop background (md and above) ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden md:block"
        style={{ backgroundImage: `url(${BG_DESKTOP})` }}
      />

      {/* ── Mobile background (below md) ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat block md:hidden"
        style={{ backgroundImage: `url(${BG_MOBILE})` }}
      />

      {/* ── Dark overlay ── */}
      <div className="absolute inset-0 bg-black/50" />

      {/* ── Vignette ── */}
      <div className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.75) 100%)"
        }} />

      {/* ── Content ── */}
      <motion.div
        className="relative z-10 px-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <motion.div
          className="w-16 h-px bg-gold mx-auto mb-6"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        />

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-luxury text-gold mb-5 leading-tight drop-shadow-lg">
          Timeless Luxury
        </h1>

        <p className="text-gray-200 text-base sm:text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed drop-shadow">
          Discover premium handcrafted collections designed with perfection,
          elegance, and modern sophistication.
        </p>

        <motion.div
          className="w-16 h-px bg-gold mx-auto mb-10"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        />

        <button
          onClick={() => navigate("/products")}
          className="btn-luxury text-sm sm:text-base px-8 sm:px-10 py-3"
        >
          Explore Collection
        </button>
      </motion.div>
    </div>
  );
}