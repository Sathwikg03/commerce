import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

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

const BanIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className="text-red-400 flex-shrink-0">
    <circle cx="12" cy="12" r="10"/>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>
);

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg]         = useState("");
  const [isBanned, setIsBanned]         = useState(false);
  const [loading, setLoading]           = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useContext(AuthContext);
  const navigate  = useNavigate();

  const onSubmit = async (data) => {
    setErrorMsg("");
    setIsBanned(false);
    setLoading(true);
    try {
      const response = await API.post("login/", {
        username: data.username,
        password: data.password,
      });
      const { access, refresh } = response.data;
      localStorage.setItem("access",  access);
      localStorage.setItem("refresh", refresh);
      login({ name: data.username, is_staff: response.data.user?.is_staff });
      navigate("/");
    } catch (error) {
      const data    = error.response?.data;
      const banned  = data?.banned === true;
      const message = data?.detail || "Invalid username or password. Please try again.";
      setIsBanned(banned);
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass w-full max-w-md p-10 rounded-2xl shadow-luxury"
      >
        <h2 className="text-4xl font-luxury text-gold mb-8 text-center">
          Welcome Back
        </h2>

        {/* ── Ban Notice ── */}
        <AnimatePresence>
          {isBanned && errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex gap-3 bg-red-500/10 border border-red-500/40 px-4 py-4 rounded-xl mb-6"
            >
              <BanIcon />
              <div>
                <p className="text-red-400 font-semibold text-sm mb-1">Account Suspended</p>
                <p className="text-red-300 text-sm leading-relaxed">{errorMsg}</p>
                <p className="text-gray-500 text-xs mt-2">
                  If you believe this is a mistake, please contact support.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Regular Error ── */}
        <AnimatePresence>
          {!isBanned && errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 bg-red-500/10 border border-red-500/40 text-red-400 text-sm px-4 py-3 rounded-lg mb-6"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Username */}
          <div>
            <input
              type="text"
              placeholder="Username"
              {...register("username", { required: true })}
              onChange={() => { setErrorMsg(""); setIsBanned(false); }}
              className="w-full bg-transparent border border-gray-600 p-3 rounded-lg focus:outline-none focus:border-gold transition"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">Username is required</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password", { required: true })}
                onChange={() => { setErrorMsg(""); setIsBanned(false); }}
                className="w-full bg-transparent border border-gray-600 p-3 pr-12 rounded-lg focus:outline-none focus:border-gold transition"
              />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors duration-300">
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">Password is required</p>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="btn-luxury w-full disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-gold">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
}
