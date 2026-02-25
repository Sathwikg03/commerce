import { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AdminContext, ADMIN_API } from "../../context/AdminContext";

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
    className="text-gold">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

export default function AdminLogin() {
  const [username, setUsername]     = useState("");
  const [password, setPassword]     = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

  const { adminLogin } = useContext(AdminContext);
  const navigate       = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await ADMIN_API.post("admin/login/", { username, password });
      adminLogin(res.data.user, res.data.access, res.data.refresh);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass w-full max-w-md p-10 rounded-2xl shadow-luxury"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <ShieldIcon />
          <h1 className="text-3xl font-luxury text-gold">Admin Portal</h1>
          <p className="text-gray-500 text-sm">LUXE Management Console</p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/40 text-red-400 text-sm px-4 py-3 rounded-lg mb-5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Admin Username"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(""); }}
            className="w-full bg-transparent border border-gray-600 p-3 rounded-lg focus:outline-none focus:border-gold transition text-white"
          />
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              className="w-full bg-transparent border border-gray-600 p-3 pr-12 rounded-lg focus:outline-none focus:border-gold transition text-white"
            />
            <button type="button" onClick={() => setShowPw(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition">
              {showPw ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <button type="submit" disabled={loading}
            className="btn-luxury w-full disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Authenticating..." : "Enter Admin Panel"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}