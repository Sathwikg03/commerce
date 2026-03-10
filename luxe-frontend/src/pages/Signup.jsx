import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

// ── Icons ─────────────────────────────────────────────────────────────────────

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
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className="text-green-400 flex-shrink-0">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className="text-gold flex-shrink-0">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

// ── OTP Input ─────────────────────────────────────────────────────────────────

function OtpInput({ value, onChange, disabled }) {
  const inputRefs = Array.from({ length: 6 }, () => useRef(null));
  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const next = digits.map((d, i) => (i === idx ? val : d)).join("").replace(/\s/g, "");
    onChange(next);
    if (val && idx < 5) inputRefs[idx + 1].current?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      const next = digits.map((d, i) => (i === idx ? " " : d)).join("").replace(/\s/g, "");
      onChange(next);
      if (idx > 0 && !digits[idx].trim()) inputRefs[idx - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs[focusIdx].current?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={inputRefs[idx]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit.trim()}
          disabled={disabled}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          className={`w-11 text-center text-lg font-semibold bg-transparent border rounded-lg 
            focus:outline-none transition-all duration-200 disabled:opacity-40
            ${digit.trim()
              ? "border-gold text-gold"
              : "border-gray-600 text-white focus:border-gold/60"
            }`}
          style={{ height: "3.25rem" }}
        />
      ))}
    </div>
  );
}

// ── Countdown Timer ───────────────────────────────────────────────────────────

function Countdown({ seconds, timerKey, onExpire }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => { setRemaining(seconds); }, [timerKey]);

  useEffect(() => {
    if (remaining <= 0) { onExpire(); return; }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  const m = String(Math.floor(remaining / 60)).padStart(2, "0");
  const s = String(remaining % 60).padStart(2, "0");

  return (
    <span className={`font-mono text-sm ${remaining <= 30 ? "text-red-400" : "text-gold"}`}>
      {m}:{s}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

const STEP = { FORM: "form", OTP: "otp", DONE: "done" };

export default function Signup() {
  const [showPassword, setShowPassword]           = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg]                   = useState("");
  const [loading, setLoading]                     = useState(false);
  const [step, setStep]                           = useState(STEP.FORM);
  const [registeredEmail, setRegisteredEmail]     = useState("");
  const [otp, setOtp]                             = useState("");
  const [otpError, setOtpError]                   = useState("");
  const [otpExpired, setOtpExpired]               = useState(false);
  const [timerKey, setTimerKey]                   = useState(0);
  const [resendCooldown, setResendCooldown]       = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch("password");
  const { login } = useContext(AuthContext);
  const navigate  = useNavigate();

  // ── Step 1: Register ──────────────────────────────────────────────────────

  const onSubmit = async (data) => {
    setErrorMsg("");
    setLoading(true);
    try {
      await API.post("signup/", {
        username:         data.email.split("@")[0],
        email:            data.email,
        full_name:        data.name,
        password:         data.password,
        confirm_password: data.confirmPassword,
      });
      setRegisteredEmail(data.email);
      setOtpExpired(false);
      setOtp("");
      setStep(STEP.OTP);
    } catch (err) {
      const resData = err.response?.data;
      if (resData && typeof resData === "object") {
        const firstKey = Object.keys(resData)[0];
        const firstMsg = Array.isArray(resData[firstKey]) ? resData[firstKey][0] : resData[firstKey];
        setErrorMsg(firstMsg || "Signup failed. Please try again.");
      } else {
        setErrorMsg("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────

  const handleVerifyOtp = async () => {
    setOtpError("");
    if (otp.length < 6) { setOtpError("Enter the 6-digit code."); return; }
    setLoading(true);
    try {
      const res = await API.post("verify-email/", { email: registeredEmail, otp });
      localStorage.setItem("access",  res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      setStep(STEP.DONE);
      setTimeout(() => {
        login({ name: res.data.user.full_name || res.data.user.username, is_staff: res.data.user?.is_staff });
        navigate("/");
      }, 1800);
    } catch (err) {
      setOtpError(err.response?.data?.detail || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown) return;
    setLoading(true);
    setOtpError("");
    try {
      await API.post("resend-verification/", { email: registeredEmail });
      setOtpExpired(false);
      setOtp("");
      setTimerKey(k => k + 1);
      setResendCooldown(true);
      setTimeout(() => setResendCooldown(false), 60000);
    } catch (err) {
      setOtpError(err.response?.data?.detail || "Could not resend code.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <AnimatePresence mode="wait">

        {/* ────── STEP: FORM ────── */}
        {step === STEP.FORM && (
          <motion.div key="form"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="glass w-full max-w-md p-10 rounded-2xl shadow-luxury"
          >
            <h2 className="text-4xl font-luxury text-gold mb-8 text-center">Create Account</h2>

            <AnimatePresence>
              {errorMsg && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 bg-red-500/10 border border-red-500/40 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
                  <ErrorIcon /><span>{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Full Name */}
              <div>
                <input type="text" placeholder="Full Name"
                  {...register("name", { required: true })}
                  onChange={() => setErrorMsg("")}
                  className="w-full bg-transparent border border-gray-600 p-3 rounded-lg focus:outline-none focus:border-gold transition" />
                {errors.name && <p className="text-red-500 text-sm mt-1">Name is required</p>}
              </div>

              {/* Email */}
              <div>
                <input type="email" placeholder="Email Address"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" }
                  })}
                  onChange={() => setErrorMsg("")}
                  className="w-full bg-transparent border border-gray-600 p-3 rounded-lg focus:outline-none focus:border-gold transition" />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="Password"
                    {...register("password", { required: true, minLength: 8 })}
                    onChange={() => setErrorMsg("")}
                    className="w-full bg-transparent border border-gray-600 p-3 pr-12 rounded-lg focus:outline-none focus:border-gold transition" />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors duration-300">
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">Minimum 8 characters</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password"
                    {...register("confirmPassword", {
                      required: true,
                      validate: (value) => value === password || "Passwords do not match",
                    })}
                    onChange={() => setErrorMsg("")}
                    className="w-full bg-transparent border border-gray-600 p-3 pr-12 rounded-lg focus:outline-none focus:border-gold transition" />
                  <button type="button" onClick={() => setShowConfirmPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors duration-300">
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button type="submit" disabled={loading}
                className="btn-luxury w-full disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Creating account..." : "Sign Up"}
              </button>
            </form>

            <p className="text-gray-400 text-center mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-gold">Login</Link>
            </p>
          </motion.div>
        )}

        {/* ────── STEP: OTP ────── */}
        {step === STEP.OTP && (
          <motion.div key="otp"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="glass w-full max-w-md p-10 rounded-2xl shadow-luxury"
          >
            <button onClick={() => setStep(STEP.FORM)}
              className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors duration-200 mb-6 text-sm">
              <ArrowLeftIcon /> Back
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4">
                <MailIcon />
              </div>
              <h2 className="text-3xl font-luxury text-gold mb-2">Verify your email</h2>
              <p className="text-gray-400 text-sm">We sent a 6-digit code to</p>
              <p className="text-white font-medium text-sm mt-1">{registeredEmail}</p>
            </div>

            <div className="space-y-6">
              <OtpInput value={otp} onChange={(v) => { setOtp(v); setOtpError(""); }} disabled={loading || otpExpired} />

              {otpError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-red-400 text-sm text-center flex items-center justify-center gap-1.5">
                  <ErrorIcon />{otpError}
                </motion.p>
              )}

              {/* Timer */}
              {!otpExpired && (
                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Code expires in{" "}
                  <Countdown seconds={600} timerKey={timerKey} onExpire={() => setOtpExpired(true)} />
                </div>
              )}

              {otpExpired && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm px-4 py-3 rounded-lg text-center">
                  Your code has expired. Please request a new one.
                </motion.div>
              )}

              <button onClick={handleVerifyOtp} disabled={loading || otp.length < 6 || otpExpired}
                className="btn-luxury w-full disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Verifying..." : "Verify & Create Account"}
              </button>

              <div className="text-center">
                <span className="text-gray-500 text-sm">Didn't receive it? </span>
                <button onClick={handleResend} disabled={resendCooldown || loading}
                  className="text-sm text-gold hover:underline disabled:opacity-40 disabled:cursor-not-allowed">
                  {resendCooldown ? "Wait 60s to resend" : "Resend code"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ────── STEP: DONE ────── */}
        {step === STEP.DONE && (
          <motion.div key="done"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass w-full max-w-md p-10 rounded-2xl shadow-luxury text-center"
          >
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon />
            </motion.div>
            <h2 className="text-3xl font-luxury text-gold mb-3">Welcome to Luxe!</h2>
            <p className="text-gray-400 text-sm">Your account is verified. Redirecting you now...</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}