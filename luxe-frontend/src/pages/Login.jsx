import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
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
    <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>
);
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className="text-gold flex-shrink-0">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className="text-green-400 flex-shrink-0">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const ErrorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

// ── OTP Input ─────────────────────────────────────────────────────────────────
function OtpInput({ value, onChange, disabled }) {
  const r0 = useRef(null), r1 = useRef(null), r2 = useRef(null);
  const r3 = useRef(null), r4 = useRef(null), r5 = useRef(null);
  const refs = [r0, r1, r2, r3, r4, r5];
  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const next = digits.map((d, i) => (i === idx ? val : d)).join("").replace(/\s/g, "");
    onChange(next);
    if (val && idx < 5) refs[idx + 1].current?.focus();
  };
  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      const next = digits.map((d, i) => (i === idx ? " " : d)).join("").replace(/\s/g, "");
      onChange(next);
      if (idx > 0 && !digits[idx].trim()) refs[idx - 1].current?.focus();
    }
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    refs[Math.min(pasted.length, 5)].current?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((digit, idx) => (
        <input key={idx} ref={refs[idx]} type="text" inputMode="numeric"
          maxLength={1} value={digit.trim()} disabled={disabled}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          className={`w-11 text-center text-lg font-semibold bg-transparent border rounded-lg 
            focus:outline-none transition-all duration-200 disabled:opacity-40
            ${digit.trim() ? "border-gold text-gold" : "border-gray-600 text-white focus:border-gold/60"}`}
          style={{ height: "3.25rem" }}
        />
      ))}
    </div>
  );
}

// ── Countdown ─────────────────────────────────────────────────────────────────
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
  return <span className={`font-mono text-sm ${remaining <= 30 ? "text-red-400" : "text-gold"}`}>{m}:{s}</span>;
}

const STEP = { LOGIN: "login", EMAIL: "email", OTP: "otp", RESET: "reset", DONE: "done" };

export default function Login() {
  const [showPassword, setShowPassword]               = useState(false);
  const [showNewPassword, setShowNewPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg]       = useState("");
  const [isBanned, setIsBanned]       = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [remember, setRemember]       = useState(false);
  const [step, setStep]               = useState(STEP.LOGIN);

  const [fpEmail, setFpEmail]                     = useState("");
  const [fpEmailError, setFpEmailError]           = useState("");
  const [fpOtp, setFpOtp]                         = useState("");
  const [fpOtpError, setFpOtpError]               = useState("");
  const [fpNewPassword, setFpNewPassword]         = useState("");
  const [fpConfirmPassword, setFpConfirmPassword] = useState("");
  const [fpPasswordError, setFpPasswordError]     = useState("");
  const [otpExpired, setOtpExpired]               = useState(false);
  const [timerKey, setTimerKey]                   = useState(0);
  const [resendCooldown, setResendCooldown]       = useState(false);

  // Ref to focus password field when Enter pressed on email
  const passwordRef = useRef(null);

  const { register, handleSubmit, formState: { errors } } = useForm();
  const { ref: passwordRHFRef, ...passwordRegisterRest } = register("password", { required: true });
  const { login } = useContext(AuthContext);
  const navigate  = useNavigate();

  const clearLogin = () => { setErrorMsg(""); setIsBanned(false); setIsUnverified(false); };

  const onSubmit = async (data) => {
    clearLogin(); setLoading(true);
    try {
      const response = await API.post("login/", { email: data.email, password: data.password });
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("access",  response.data.access);
      storage.setItem("refresh", response.data.refresh);
      login({ name: response.data.user?.full_name || response.data.user?.username, is_staff: response.data.user?.is_staff }, remember);
      navigate("/");
    } catch (error) {
      const d = error.response?.data;
      if (d?.banned)          { setIsBanned(true); setErrorMsg(d.detail); }
      else if (d?.unverified) { setIsUnverified(true); setErrorMsg(d.detail); }
      else                    { setErrorMsg(d?.detail || "Invalid email or password."); }
    } finally { setLoading(false); }
  };

  const handleSendOtp = async () => {
    setFpEmailError("");
    if (!fpEmail.trim()) { setFpEmailError("Email is required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fpEmail)) { setFpEmailError("Enter a valid email."); return; }
    setLoading(true);
    try {
      await API.post("password-reset/send-otp/", { email: fpEmail });
      setOtpExpired(false); setTimerKey(k => k + 1); setFpOtp("");
      setStep(STEP.OTP);
    } catch (err) {
      setFpEmailError(err.response?.data?.detail || "Could not send OTP.");
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    setFpOtpError("");
    if (fpOtp.length < 6) { setFpOtpError("Enter the 6-digit code."); return; }
    setLoading(true);
    try {
      await API.post("password-reset/verify-otp/", { email: fpEmail, otp: fpOtp });
      setStep(STEP.RESET);
    } catch (err) {
      setFpOtpError(err.response?.data?.detail || "Invalid or expired code.");
    } finally { setLoading(false); }
  };

  const handleResetPassword = async () => {
    setFpPasswordError("");
    if (fpNewPassword.length < 8) { setFpPasswordError("Password must be at least 8 characters."); return; }
    if (fpNewPassword !== fpConfirmPassword) { setFpPasswordError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await API.post("password-reset/reset/", { email: fpEmail, otp: fpOtp, new_password: fpNewPassword });
      setStep(STEP.DONE);
    } catch (err) {
      setFpPasswordError(err.response?.data?.detail || "Failed to reset password.");
    } finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    if (resendCooldown) return;
    setLoading(true); setFpOtpError("");
    try {
      await API.post("password-reset/send-otp/", { email: fpEmail });
      setOtpExpired(false); setFpOtp(""); setTimerKey(k => k + 1);
      setResendCooldown(true);
      setTimeout(() => setResendCooldown(false), 60000);
    } catch (err) {
      setFpOtpError(err.response?.data?.detail || "Could not resend OTP.");
    } finally { setLoading(false); }
  };

  const goBackToLogin = () => {
    setStep(STEP.LOGIN);
    setFpEmail(""); setFpEmailError(""); setFpOtp(""); setFpOtpError("");
    setFpNewPassword(""); setFpConfirmPassword(""); setFpPasswordError("");
    setOtpExpired(false); clearLogin();
  };

  const pwStrength = (pw) =>
    (pw.length >= 8 ? 1 : 0) + (/[A-Z]/.test(pw) ? 1 : 0) +
    (/[0-9]/.test(pw) ? 1 : 0) + (/[^A-Za-z0-9]/.test(pw) ? 1 : 0);
  const sColors = ["bg-red-500","bg-orange-500","bg-yellow-500","bg-green-500"];
  const sLabels = ["","Weak","Fair","Good","Strong"];

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <AnimatePresence mode="wait">

        {/* ── LOGIN ── */}
        {step === STEP.LOGIN && (
          <motion.div key="login" initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }} transition={{ duration:0.4 }}
            className="glass w-full max-w-md p-10 rounded-2xl shadow-luxury">
            <h2 className="text-4xl font-luxury text-gold mb-8 text-center">Welcome Back</h2>

            <AnimatePresence>
              {isBanned && errorMsg && (
                <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  className="flex gap-3 bg-red-500/10 border border-red-500/40 px-4 py-4 rounded-xl mb-6">
                  <BanIcon />
                  <div>
                    <p className="text-red-400 font-semibold text-sm mb-1">Account Suspended</p>
                    <p className="text-red-300 text-sm leading-relaxed">{errorMsg}</p>
                    <p className="text-gray-500 text-xs mt-2">If you believe this is a mistake, please contact support.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isUnverified && (
                <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  className="flex gap-3 bg-yellow-500/10 border border-yellow-500/40 px-4 py-4 rounded-xl mb-6">
                  <MailIcon />
                  <div>
                    <p className="text-yellow-400 font-semibold text-sm mb-1">Email not verified</p>
                    <p className="text-yellow-300/80 text-sm">Please verify your email to continue.</p>
                    <Link to="/signup" className="text-gold text-xs underline mt-1 inline-block">Go back to sign up →</Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {!isBanned && !isUnverified && errorMsg && (
                <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  className="flex items-center gap-3 bg-red-500/10 border border-red-500/40 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
                  <ErrorIcon /><span>{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ✅ form handles Enter natively via type="submit" button */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" }
                  })}
                  onInput={clearLogin}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      passwordRef.current?.focus();
                    }
                  }}
                  className="w-full bg-transparent border border-gray-600 p-3 rounded-lg focus:outline-none focus:border-gold transition"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    {...passwordRegisterRest}
                    ref={(e) => {
                      passwordRHFRef(e);
                      passwordRef.current = e;
                    }}
                    onInput={clearLogin}
                    className="w-full bg-transparent border border-gray-600 p-3 pr-12 rounded-lg focus:outline-none focus:border-gold transition"
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors duration-300">
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">Password is required</p>}
              </div>

              <div className="flex items-center justify-between -mt-1">
                {/* Remember Me */}
                <label className="flex items-center gap-2 cursor-pointer group select-none">
                  <div
                    onClick={() => setRemember(r => !r)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                      remember
                        ? "bg-gold border-gold"
                        : "border-gray-600 group-hover:border-gold/50"
                    }`}
                  >
                    {remember && (
                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                        <polyline points="2,6 5,9 10,3" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    Remember me
                  </span>
                </label>

                {/* Forgot password */}
                <button type="button" onClick={() => setStep(STEP.EMAIL)}
                  className="text-sm text-gray-400 hover:text-gold transition-colors duration-200 underline underline-offset-2">
                  Forgot password?
                </button>
              </div>

              {/* type="submit" means Enter anywhere in the form triggers this */}
              <button type="submit" disabled={loading}
                className="btn-luxury w-full disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>

            <p className="text-gray-400 text-center mt-6">
              Don't have an account?{" "}<Link to="/signup" className="text-gold">Sign Up</Link>
            </p>
          </motion.div>
        )}

        {/* ── EMAIL ── */}
        {step === STEP.EMAIL && (
          <motion.div key="email" initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }} transition={{ duration:0.4 }}
            className="glass w-full max-w-md p-10 rounded-2xl shadow-luxury">
            <button onClick={goBackToLogin} className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors mb-6 text-sm">
              <ArrowLeftIcon /> Back to Login
            </button>
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-4"><MailIcon /></div>
              <h2 className="text-3xl font-luxury text-gold text-center">Reset Password</h2>
              <p className="text-gray-400 text-sm text-center mt-2">Enter your account email and we'll send a verification code.</p>
            </div>
            <div className="space-y-4">
              <div>
                <input type="email" placeholder="Your email address" value={fpEmail}
                  onChange={(e) => { setFpEmail(e.target.value); setFpEmailError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  className="w-full bg-transparent border border-gray-600 p-3 rounded-lg focus:outline-none focus:border-gold transition" />
                {fpEmailError && <p className="text-red-400 text-sm mt-1.5 flex items-center gap-1.5"><ErrorIcon />{fpEmailError}</p>}
              </div>
              <button onClick={handleSendOtp} disabled={loading} className="btn-luxury w-full disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Sending..." : "Send Verification Code"}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── OTP ── */}
        {step === STEP.OTP && (
          <motion.div key="otp" initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }} transition={{ duration:0.4 }}
            className="glass w-full max-w-md p-10 rounded-2xl shadow-luxury">
            <button onClick={() => setStep(STEP.EMAIL)} className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors mb-6 text-sm">
              <ArrowLeftIcon /> Change email
            </button>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-luxury text-gold mb-2">Check Your Email</h2>
              <p className="text-gray-400 text-sm">We sent a 6-digit code to</p>
              <p className="text-white font-medium text-sm mt-1">{fpEmail}</p>
            </div>
            <div className="space-y-6">
              <OtpInput value={fpOtp} onChange={(v) => { setFpOtp(v); setFpOtpError(""); }} disabled={loading || otpExpired} />
              {fpOtpError && (
                <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-red-400 text-sm text-center flex items-center justify-center gap-1.5">
                  <ErrorIcon />{fpOtpError}
                </motion.p>
              )}
              {!otpExpired && (
                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Code expires in <Countdown seconds={600} timerKey={timerKey} onExpire={() => setOtpExpired(true)} />
                </div>
              )}
              {otpExpired && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                  className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm px-4 py-3 rounded-lg text-center">
                  Your code has expired. Request a new one.
                </motion.div>
              )}
              <button onClick={handleVerifyOtp} disabled={loading || fpOtp.length < 6 || otpExpired}
                className="btn-luxury w-full disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Verifying..." : "Verify Code"}
              </button>
              <div className="text-center">
                <span className="text-gray-500 text-sm">Didn't receive it? </span>
                <button onClick={handleResendOtp} disabled={resendCooldown || loading}
                  className="text-sm text-gold hover:underline disabled:opacity-40 disabled:cursor-not-allowed">
                  {resendCooldown ? "Wait 60s to resend" : "Resend code"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── RESET ── */}
        {step === STEP.RESET && (
          <motion.div key="reset" initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }} transition={{ duration:0.4 }}
            className="glass w-full max-w-md p-10 rounded-2xl shadow-luxury">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-luxury text-gold mb-2">New Password</h2>
              <p className="text-gray-400 text-sm">Choose a strong password for your account.</p>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <input type={showNewPassword ? "text" : "password"} placeholder="New password" value={fpNewPassword}
                  onChange={(e) => { setFpNewPassword(e.target.value); setFpPasswordError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                  className="w-full bg-transparent border border-gray-600 p-3 pr-12 rounded-lg focus:outline-none focus:border-gold transition" />
                <button type="button" onClick={() => setShowNewPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors">
                  {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm new password" value={fpConfirmPassword}
                  onChange={(e) => { setFpConfirmPassword(e.target.value); setFpPasswordError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                  className="w-full bg-transparent border border-gray-600 p-3 pr-12 rounded-lg focus:outline-none focus:border-gold transition" />
                <button type="button" onClick={() => setShowConfirmPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors">
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {fpNewPassword.length > 0 && (() => {
                const s = pwStrength(fpNewPassword);
                return (
                  <div className="flex items-center gap-2">
                    {[1,2,3,4].map(l => (
                      <div key={l} className={`h-1 flex-1 rounded-full transition-all duration-300 ${l <= s ? sColors[s-1] : "bg-gray-700"}`} />
                    ))}
                    <span className="text-xs text-gray-500 ml-1 whitespace-nowrap">{sLabels[s]}</span>
                  </div>
                );
              })()}
              {fpPasswordError && <p className="text-red-400 text-sm flex items-center gap-1.5"><ErrorIcon />{fpPasswordError}</p>}
              <button onClick={handleResetPassword} disabled={loading} className="btn-luxury w-full disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── DONE ── */}
        {step === STEP.DONE && (
          <motion.div key="done" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.5 }}
            className="glass w-full max-w-md p-10 rounded-2xl shadow-luxury text-center">
            <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay:0.2, type:"spring", stiffness:200 }}
              className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon />
            </motion.div>
            <h2 className="text-3xl font-luxury text-gold mb-3">Password Reset!</h2>
            <p className="text-gray-400 text-sm mb-8">Your password has been updated. You can now log in.</p>
            <button onClick={goBackToLogin} className="btn-luxury w-full">Back to Login</button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}