import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const ErrorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const SuccessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const res = await API.post("signup/", {
        username: data.email.split("@")[0],
        email: data.email,
        full_name: data.name,
        password: data.password,
        confirm_password: data.confirmPassword,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      setSuccessMsg(`Welcome to LUXE, ${res.data.user.username}! Redirecting...`);

      // Brief delay so user sees the success message before redirect
      setTimeout(() => {
        login({ name: res.data.user.username });
        navigate("/");
      }, 1800);
    } catch (err) {
      const data = err.response?.data;
      // Django may return field-level errors as objects
      if (data && typeof data === "object") {
        const firstKey = Object.keys(data)[0];
        const firstMsg = Array.isArray(data[firstKey])
          ? data[firstKey][0]
          : data[firstKey];
        setErrorMsg(firstMsg || "Signup failed. Please try again.");
      } else {
        setErrorMsg("Signup failed. Please try again.");
      }
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
          Create Account
        </h2>

        {/* ── Success Banner ── */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 bg-green-500/10 border border-green-500/40 text-green-400 text-sm px-4 py-3 rounded-lg mb-6"
            >
              <SuccessIcon />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error Banner ── */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 bg-red-500/10 border border-red-500/40 text-red-400 text-sm px-4 py-3 rounded-lg mb-6"
            >
              <ErrorIcon />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Full Name */}
          <div>
            <input
              type="text"
              placeholder="Full Name"
              {...register("name", { required: true })}
              onChange={() => setErrorMsg("")}
              className="w-full bg-transparent border border-gray-600 p-3 rounded-lg focus:outline-none focus:border-gold transition"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">Name is required</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email Address"
              {...register("email", { required: true })}
              onChange={() => setErrorMsg("")}
              className="w-full bg-transparent border border-gray-600 p-3 rounded-lg focus:outline-none focus:border-gold transition"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">Email is required</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password", { required: true, minLength: 6 })}
                onChange={() => setErrorMsg("")}
                className="w-full bg-transparent border border-gray-600 p-3 pr-12 rounded-lg focus:outline-none focus:border-gold transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors duration-300"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">Minimum 6 characters</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                {...register("confirmPassword", {
                  required: true,
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
                onChange={() => setErrorMsg("")}
                className="w-full bg-transparent border border-gray-600 p-3 pr-12 rounded-lg focus:outline-none focus:border-gold transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors duration-300"
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !!successMsg}
            className="btn-luxury w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-gold">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}