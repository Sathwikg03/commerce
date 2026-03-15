import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

// ── Icons ─────────────────────────────────────────────────────────────────────
const S = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" };
const Ico = ({ d, size = 16, sw = "2", cls = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth={sw} className={cls} {...S}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const ShieldIco = () => <Ico size={15} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
const OrdersIco = () => <Ico size={15} d={["M9 11l3 3L22 4", "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"]} />;
const LogoutIco = () => <Ico size={15} d={["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"]} />;
const PlusIco = () => <Ico size={14} d={["M12 5v14", "M5 12h14"]} />;
const EditIco = () => <Ico size={13} d={["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"]} />;
const TrashIco = () => <Ico size={13} d={["M3 6h18", "M19 6l-1 14H6L5 6", "M10 11v6", "M14 11v6", "M9 6V4h6v2"]} />;
const MapIco = () => <Ico size={15} d={["M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z", "M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"]} />;
const StarIco = () => <Ico size={11} d="M12 2l2.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.91-1.01L12 2z" />;
const VerifiedIco = () => <Ico size={13} d={["M9 12l2 2 4-4", "M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z"]} />;
const CameraIco = () => <Ico size={16} d={["M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z", "M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"]} />;
const CheckIco = () => <Ico size={13} sw="2.5" d="M20 6 9 17l-5-5" />;
const XCircleIco = () => <Ico size={13} d={["M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2", "M15 9l-6 6", "M9 9l6 6"]} />;

// ── Address label colours ─────────────────────────────────────────────────────
const LABEL_CLR = {
  Home: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Work: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Other: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};
const BLANK_ADDR = { label: "Home", full_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", is_default: false };

// ── OTP input ─────────────────────────────────────────────────────────────────
function OtpInput({ value, onChange, disabled }) {
  const refs = Array.from({ length: 6 }, () => useRef(null));
  const digits = value.padEnd(6, " ").split("").slice(0, 6);
  const handleChange = (e, i) => {
    const v = e.target.value.replace(/\D/g, "").slice(-1);
    const next = digits.map((d, idx) => idx === i ? v : d).join("").replace(/\s/g, "");
    onChange(next);
    if (v && i < 5) refs[i + 1].current?.focus();
  };
  const handleKey = (e, i) => {
    if (e.key === "Backspace") {
      const next = digits.map((d, idx) => idx === i ? " " : d).join("").replace(/\s/g, "");
      onChange(next);
      if (i > 0 && !digits[i].trim()) refs[i - 1].current?.focus();
    }
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(p);
    refs[Math.min(p.length, 5)].current?.focus();
  };
  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={1}
          value={d.trim()} disabled={disabled}
          onChange={e => handleChange(e, i)} onKeyDown={e => handleKey(e, i)} onPaste={handlePaste}
          className={`w-10 h-12 text-center text-base font-semibold bg-transparent border rounded-xl focus:outline-none transition ${d.trim() ? "border-gold text-gold" : "border-gray-600 text-white focus:border-gold/60"}`}
        />
      ))}
    </div>
  );
}

// ── Editable info row ─────────────────────────────────────────────────────────
// For phone: simple inline input
// For email: multi-step OTP flow
function InfoRow({ label, value, onEditClick, editable, verified }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800/50 last:border-0">
      <span className="text-gray-500 text-sm w-28 flex-shrink-0">{label}</span>
      <div className="flex items-center gap-2.5 flex-1 justify-end min-w-0">
        {verified && (
          <span className="flex items-center gap-1 text-xs text-blue-400 flex-shrink-0">
            <VerifiedIco /> Verified
          </span>
        )}
        <span className={`text-sm font-medium truncate ${value ? "text-white" : "text-gray-600"}`}>
          {value || "—"}
        </span>
        {editable && (
          <button onClick={onEditClick} title={`Edit ${label}`}
            className="text-gray-600 hover:text-gold flex-shrink-0">
            <EditIco />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Address form modal ────────────────────────────────────────────────────────
function AddressModal({ initial, onSave, onClose, saving, error }) {
  const [form, setForm] = useState(initial ? { ...initial } : BLANK_ADDR);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inp = "w-full bg-transparent border border-gray-700 focus:border-gold rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none transition placeholder-gray-600";
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        className="relative z-10 glass rounded-2xl w-full max-w-md p-6 shadow-luxury max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-white">{initial ? "Edit Address" : "Add New Address"}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>
        {error && <p className="mb-3 text-red-400 text-xs bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg">{error}</p>}
        <div className="flex gap-2 mb-4">
          {["Home", "Work", "Other"].map(l => (
            <button key={l} type="button" onClick={() => set("label", l)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium border transition ${form.label === l ? LABEL_CLR[l] : "border-gray-700 text-gray-500 hover:border-gray-500"}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-xs text-gray-500 mb-1">Full Name *</p><input value={form.full_name} onChange={e => set("full_name", e.target.value)} placeholder="Your name" className={inp} /></div>
            <div><p className="text-xs text-gray-500 mb-1">Phone *</p><input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 98765 43210" className={inp} /></div>
          </div>
          <div><p className="text-xs text-gray-500 mb-1">Address Line 1 *</p><input value={form.line1} onChange={e => set("line1", e.target.value)} placeholder="Flat / House, Building, Street" className={inp} /></div>
          <div><p className="text-xs text-gray-500 mb-1">Area / Landmark</p><input value={form.line2} onChange={e => set("line2", e.target.value)} placeholder="Optional" className={inp} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><p className="text-xs text-gray-500 mb-1">City *</p><input value={form.city} onChange={e => set("city", e.target.value)} placeholder="Pune" className={inp} /></div>
            <div><p className="text-xs text-gray-500 mb-1">State *</p><input value={form.state} onChange={e => set("state", e.target.value)} placeholder="MH" className={inp} /></div>
            <div><p className="text-xs text-gray-500 mb-1">Pincode *</p><input value={form.pincode} onChange={e => set("pincode", e.target.value)} placeholder="411001" maxLength={6} className={inp} /></div>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer pt-1">
            <div onClick={() => set("is_default", !form.is_default)}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${form.is_default ? "bg-gold border-gold" : "border-gray-600 hover:border-gold/50"}`}>
              {form.is_default && <svg width="9" height="9" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>}
            </div>
            <span className="text-sm text-gray-300">Set as default delivery address</span>
          </label>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white py-2.5 rounded-xl text-sm transition">Cancel</button>
          <button onClick={() => onSave(form)} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#d4aa5a,#c8963e)" }}>
            {saving ? "Saving…" : initial ? "Update" : "Save Address"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Generic edit modal (phone or plain field) ─────────────────────────────────
function EditFieldModal({ title, label, currentValue, placeholder, onSave, onClose, saving, error }) {
  const [val, setVal] = useState(currentValue || "");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
        className="relative z-10 glass rounded-2xl w-full max-w-sm p-6 shadow-luxury">
        <h3 className="text-base font-semibold text-white mb-4">{title}</h3>
        {error && <p className="mb-3 text-red-400 text-xs bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg">{error}</p>}
        <p className="text-xs text-gray-500 mb-1.5">{label}</p>
        <input value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder}
          onKeyDown={e => { if (e.key === "Enter") onSave(val.trim()); }}
          autoFocus
          className="w-full bg-transparent border border-gray-700 focus:border-gold rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none transition mb-4" />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-700 text-gray-400 hover:border-gray-500 py-2.5 rounded-xl text-sm transition">Cancel</button>
          <button onClick={() => onSave(val.trim())} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#d4aa5a,#c8963e)" }}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Email change modal (OTP flow) ─────────────────────────────────────────────
const EMAIL_STEP = { INPUT: "input", OTP: "otp", DONE: "done" };
function EmailChangeModal({ currentEmail, onDone, onClose }) {
  const [step, setStep] = useState(EMAIL_STEP.INPUT);
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestOtp = async () => {
    if (!newEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) { setError("Enter a valid email address."); return; }
    setLoading(true); setError("");
    try {
      await API.post("profile/change-email/request/", { new_email: newEmail.trim().toLowerCase() });
      setStep(EMAIL_STEP.OTP);
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to send OTP.");
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    if (otp.length < 6) { setError("Enter the 6-digit code."); return; }
    setLoading(true); setError("");
    try {
      const r = await API.post("profile/change-email/verify/", { otp });
      setStep(EMAIL_STEP.DONE);
      setTimeout(() => onDone(r.data), 1200);
    } catch (e) {
      setError(e?.response?.data?.detail || "Invalid or expired code.");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
        className="relative z-10 glass rounded-2xl w-full max-w-sm p-6 shadow-luxury">

        <AnimatePresence mode="wait">

          {/* Step 1: new email input */}
          {step === EMAIL_STEP.INPUT && (
            <motion.div key="input" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="text-base font-semibold text-white mb-1">Change Email</h3>
              <p className="text-xs text-gray-500 mb-4">Current: {currentEmail}</p>
              {error && <p className="mb-3 text-red-400 text-xs bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg">{error}</p>}
              <p className="text-xs text-gray-500 mb-1.5">New Email Address</p>
              <input type="email" value={newEmail} onChange={e => { setNewEmail(e.target.value); setError(""); }}
                placeholder="new@email.com" autoFocus
                onKeyDown={e => { if (e.key === "Enter") requestOtp(); }}
                className="w-full bg-transparent border border-gray-700 focus:border-gold rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none transition mb-4" />
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 border border-gray-700 text-gray-400 py-2.5 rounded-xl text-sm transition hover:border-gray-500">Cancel</button>
                <button onClick={requestOtp} disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#d4aa5a,#c8963e)" }}>
                  {loading ? "Sending…" : "Send OTP"}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: OTP entry */}
          {step === EMAIL_STEP.OTP && (
            <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="text-base font-semibold text-white mb-1">Verify New Email</h3>
              <p className="text-xs text-gray-500 mb-4">
                Enter the 6-digit code sent to <span className="text-white">{newEmail}</span>
              </p>
              {error && <p className="mb-3 text-red-400 text-xs bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg">{error}</p>}
              <div className="mb-5">
                <OtpInput value={otp} onChange={v => { setOtp(v); setError(""); }} disabled={loading} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setStep(EMAIL_STEP.INPUT); setOtp(""); setError(""); }}
                  className="flex-1 border border-gray-700 text-gray-400 py-2.5 rounded-xl text-sm transition hover:border-gray-500">
                  Back
                </button>
                <button onClick={verifyOtp} disabled={loading || otp.length < 6}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#d4aa5a,#c8963e)" }}>
                  {loading ? "Verifying…" : "Verify & Save"}
                </button>
              </div>
            </motion.div>
          )}

          {/* Done */}
          {step === EMAIL_STEP.DONE && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-3 text-green-400">
                <CheckIco />
              </div>
              <p className="text-white font-semibold">Email updated!</p>
              <p className="text-gray-500 text-xs mt-1">{newEmail}</p>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ── Address card ──────────────────────────────────────────────────────────────
function AddressCard({ addr, onEdit, onDelete, onSetDefault, deleting, settingDefault }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className={`rounded-2xl p-4 border transition-all ${addr.is_default ? "border-gold/35 bg-gold/5" : "glass border-gray-800/60"}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${LABEL_CLR[addr.label] || LABEL_CLR.Other}`}>{addr.label}</span>
          {addr.is_default && (
            <span className="flex items-center gap-1 text-xs text-yellow-500 border border-yellow-600/30 bg-yellow-600/10 px-2.5 py-0.5 rounded-full">
              <StarIco /> Default
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button onClick={onEdit} className="p-1.5 rounded-lg text-gray-500 hover:text-gold hover:bg-gold/10 transition"><EditIco /></button>
          <button onClick={onDelete} disabled={deleting} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition disabled:opacity-40"><TrashIco /></button>
        </div>
      </div>
      <p className="text-sm font-medium text-white">{addr.full_name} · <span className="text-gray-400 font-normal">{addr.phone}</span></p>
      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} — {addr.pincode}
      </p>
      {!addr.is_default && (
        <button onClick={onSetDefault} disabled={settingDefault}
          className="mt-2.5 text-xs text-gray-600 hover:text-yellow-400 transition border border-gray-800 hover:border-yellow-600/40 px-3 py-1 rounded-lg disabled:opacity-40">
          {settingDefault ? "Setting…" : "Set as default"}
        </button>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [addrLoad, setAddrLoad] = useState(true);

  // Avatar
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  // Modals
  const [modal, setModal] = useState(null); // null | "phone" | "email" | "address_add" | "address_edit"
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [defaultingId, setDefaultingId] = useState(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    API.get("profile/")
      .then(r => setProfile(r.data)).catch(() => { }).finally(() => setLoading(false));
    API.get("addresses/")
      .then(r => setAddresses(r.data.results || r.data)).catch(() => { }).finally(() => setAddrLoad(false));
  }, [user, navigate]);

  const handleLogout = () => { logout(); navigate("/"); };

  // ── Avatar ────────────────────────────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true); setAvatarError("");
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const r = await API.post("profile/avatar/", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setProfile(r.data);
    } catch (err) {
      setAvatarError(err?.response?.data?.detail || "Upload failed.");
    } finally { setAvatarUploading(false); e.target.value = ""; }
  };

  // ── Phone save ────────────────────────────────────────────────────────────
  const savePhone = async (val) => {
    setSaving(true); setSaveError("");
    try {
      const r = await API.patch("profile/", { phone: val });
      setProfile(r.data); setModal(null);
    } catch (e) {
      setSaveError(e?.response?.data?.detail || "Failed to save.");
    } finally { setSaving(false); }
  };

  // ── Address CRUD ──────────────────────────────────────────────────────────
  const openAddrAdd = () => { setEditTarget(null); setSaveError(""); setModal("address"); };
  const openAddrEdit = (a) => { setEditTarget(a); setSaveError(""); setModal("address"); };

  const handleAddrSave = async (form) => {
    const req = ["full_name", "phone", "line1", "city", "state", "pincode"];
    if (req.some(k => !form[k]?.trim())) { setSaveError("Please fill in all required fields."); return; }
    setSaving(true); setSaveError("");
    try {
      if (editTarget) {
        const r = await API.patch(`addresses/${editTarget.id}/`, form);
        setAddresses(a => a.map(x => x.id === editTarget.id ? r.data : x));
      } else {
        const r = await API.post("addresses/", form);
        if (form.is_default) setAddresses(a => [r.data, ...a.map(x => ({ ...x, is_default: false }))]);
        else setAddresses(a => [r.data, ...a]);
      }
      setModal(null);
    } catch (e) {
      const d = e?.response?.data;
      setSaveError(typeof d === "object" ? Object.values(d).flat()[0] : d || "Failed.");
    } finally { setSaving(false); }
  };

  const handleAddrDelete = async (id) => {
    setDeletingId(id);
    try { await API.delete(`addresses/${id}/`); setAddresses(a => a.filter(x => x.id !== id)); }
    catch { } finally { setDeletingId(null); }
  };

  const handleSetDefault = async (id) => {
    setDefaultingId(id);
    try {
      await API.patch(`addresses/${id}/set-default/`);
      setAddresses(a => a.map(x => ({ ...x, is_default: x.id === id })));
    } catch { } finally { setDefaultingId(null); }
  };

  // ── Avatar URL resolution ─────────────────────────────────────────────────
  const avatarSrc = profile?.avatar_url || null;
  const initials = (profile?.full_name || profile?.username || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  const joinDate = profile?.date_joined
    ? new Date(profile.date_joined).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading…</p></div>;

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="space-y-4">

          {/* ── Avatar + name card ── */}
          <div className="glass rounded-2xl p-7 text-center">

            {/* Avatar */}
            <div className="relative w-24 h-24 mx-auto mb-4">
              {avatarSrc ? (
                <img src={avatarSrc} alt={profile?.username}
                  className="w-24 h-24 rounded-full object-cover"
                  style={{ boxShadow: "0 0 0 2px #c8963e, 0 0 0 4px rgba(200,150,62,0.15)" }} />
              ) : (
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-gold"
                  style={{ background: "rgba(200,150,62,0.12)", boxShadow: "0 0 0 2px #c8963e,0 0 0 4px rgba(200,150,62,0.15)" }}>
                  {initials}
                </div>
              )}
              {/* Camera button */}
              <button onClick={() => fileRef.current?.click()}
                disabled={avatarUploading}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center transition border-2 border-gray-900 disabled:opacity-40"
                style={{ background: "rgba(200,150,62,0.9)" }}>
                {avatarUploading
                  ? <span className="w-3 h-3 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                  : <CameraIco />
                }
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {avatarError && <p className="text-red-400 text-xs mb-2">{avatarError}</p>}

            <h2 className="text-2xl font-luxury text-gold mb-0.5">{profile?.full_name || profile?.username || "—"}</h2>
            <p className="text-gray-500 text-sm mb-3">@{profile?.username}</p>

            {/* Badges */}
            <div className="flex justify-center gap-2 flex-wrap">
              {profile?.is_staff
                ? <span className="flex items-center gap-1.5 text-xs text-gold border border-gold/40 bg-gold/10 px-3 py-1 rounded-full"><ShieldIco /> Administrator</span>
                : <span className="text-xs text-gray-500 border border-gray-700 px-3 py-1 rounded-full">Member</span>
              }
              {profile?.is_email_verified && (
                <span className="flex items-center gap-1.5 text-xs text-blue-400 border border-blue-500/30 bg-blue-500/10 px-3 py-1 rounded-full">
                  <VerifiedIco /> Email Verified
                </span>
              )}
            </div>
          </div>

          {/* ── Info card — ordered: Username, Member since, Email, Phone ── */}
          <div className="glass rounded-2xl overflow-hidden">
            <InfoRow label="Username" value={profile?.username} />
            <InfoRow label="Member since" value={joinDate} />
            <InfoRow
              label="Email"
              value={profile?.email}
              editable
              verified={profile?.is_email_verified}
              onEditClick={() => { setSaveError(""); setModal("email"); }}
            />
            <InfoRow
              label="Phone"
              value={profile?.phone}
              editable
              onEditClick={() => { setSaveError(""); setModal("phone"); }}
            />
          </div>

          {/* ── Saved Addresses ── */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <p className="text-sm font-semibold text-white flex items-center gap-2"><MapIco /> Saved Addresses</p>
                <p className="text-xs text-gray-600 mt-0.5">{addresses.length} address{addresses.length !== 1 ? "es" : ""} · used at checkout</p>
              </div>
              <button onClick={openAddrAdd}
                className="flex items-center gap-1.5 text-xs font-medium text-gold border border-gold/35 px-3 py-1.5 rounded-xl hover:bg-gold/10 transition">
                <PlusIco /> Add
              </button>
            </div>

            {addrLoad ? (
              <div className="glass rounded-2xl p-8 text-center"><p className="text-gray-500 text-sm">Loading…</p></div>
            ) : addresses.length === 0 ? (
              <button onClick={openAddrAdd}
                className="w-full glass rounded-2xl p-6 text-center border border-dashed border-gray-700 hover:border-gold/30 transition group">
                <div className="flex justify-center mb-1.5 text-gray-700 group-hover:text-gray-500 transition"><MapIco /></div>
                <p className="text-gray-500 text-sm">No addresses saved</p>
                <p className="text-xs text-gold mt-1">+ Add your first address</p>
              </button>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {addresses.map(addr => (
                    <AddressCard key={addr.id} addr={addr}
                      onEdit={() => openAddrEdit(addr)}
                      onDelete={() => handleAddrDelete(addr.id)}
                      onSetDefault={() => handleSetDefault(addr.id)}
                      deleting={deletingId === addr.id}
                      settingDefault={defaultingId === addr.id}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="space-y-3 pt-1">
            <Link to="/orders" className="flex items-center justify-center gap-2 w-full text-sm font-medium text-gray-300 border border-gray-700 px-4 py-3 rounded-xl hover:border-gold/50 hover:text-gold transition-all">
              <OrdersIco /> My Orders
            </Link>
            {profile?.is_staff && (
              <Link to="/admin/dashboard" className="flex items-center justify-center gap-2 w-full text-sm font-medium text-gold border border-gold/40 px-4 py-3 rounded-xl hover:bg-gold hover:text-black transition-all">
                <ShieldIco /> Go to Admin Panel
              </Link>
            )}
            <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full text-sm font-medium text-gray-400 border border-gray-700 px-4 py-3 rounded-xl hover:border-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all">
              <LogoutIco /> Logout
            </button>
          </div>

        </motion.div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {modal === "phone" && (
          <EditFieldModal
            title="Edit Phone Number"
            label="Phone Number"
            currentValue={profile?.phone}
            placeholder="+91 98765 43210"
            onSave={savePhone}
            onClose={() => setModal(null)}
            saving={saving}
            error={saveError}
          />
        )}
        {modal === "email" && (
          <EmailChangeModal
            currentEmail={profile?.email}
            onDone={(updatedProfile) => { setProfile(updatedProfile); setModal(null); }}
            onClose={() => setModal(null)}
          />
        )}
        {modal === "address" && (
          <AddressModal
            initial={editTarget}
            onSave={handleAddrSave}
            onClose={() => setModal(null)}
            saving={saving}
            error={saveError}
          />
        )}
      </AnimatePresence>
    </div>
  );
}