import { useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { NotificationContext } from "../context/NotificationContext";
import API from "../services/api";

// ── Icons ─────────────────────────────────────────────────────────────────────
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
);
const EmptyCartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
const CheckoutSuccessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
    <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
  </svg>
);
const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const CardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);
const UpiIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
  </svg>
);
const NetBankIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const CodIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const ChevRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const ChevLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

function getProductImage(product) {
  if (!product) return "";
  if (product.images?.length > 0) return product.images[0].url;
  if (product.image_url) return product.image_url;
  if (product.image) return product.image;
  return "";
}

// ── Label colours ─────────────────────────────────────────────────────────────
const LABEL_COLOR = {
  Home: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Work: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Other: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

// ── Payment modes ─────────────────────────────────────────────────────────────
const PAYMENT_MODES = [
  { id: "upi", label: "UPI", sub: "GPay, PhonePe, Paytm", Icon: UpiIcon, color: "text-green-400" },
  { id: "card", label: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay", Icon: CardIcon, color: "text-blue-400" },
  { id: "netbank", label: "Net Banking", sub: "All major banks supported", Icon: NetBankIcon, color: "text-purple-400" },
  { id: "cod", label: "Cash on Delivery", sub: "Pay when you receive", Icon: CodIcon, color: "text-yellow-400" },
];

// ── Inline Add Address (mini form inside modal) ───────────────────────────────
const BLANK_ADDR = { label: "Home", full_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", is_default: false };

function InlineAddressForm({ onSave, onCancel, saving, error }) {
  const [form, setForm] = useState(BLANK_ADDR);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inp = "w-full bg-transparent border border-gray-700 focus:border-gold rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition placeholder-gray-600";
  return (
    <div className="border border-gold/20 bg-gold/5 rounded-xl p-4 mt-3 space-y-3">
      <p className="text-xs font-medium text-gold mb-1">New Delivery Address</p>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="flex gap-2">
        {["Home", "Work", "Other"].map(l => (
          <button key={l} type="button" onClick={() => set("label", l)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition ${form.label === l ? LABEL_COLOR[l] : "border-gray-700 text-gray-500"}`}>
            {l}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input value={form.full_name} onChange={e => set("full_name", e.target.value)} placeholder="Full Name *" className={inp} />
        <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="Phone *" className={inp} />
      </div>
      <input value={form.line1} onChange={e => set("line1", e.target.value)} placeholder="Address Line 1 *" className={inp} />
      <input value={form.line2} onChange={e => set("line2", e.target.value)} placeholder="Landmark / Area" className={inp} />
      <div className="grid grid-cols-3 gap-2">
        <input value={form.city} onChange={e => set("city", e.target.value)} placeholder="City *" className={inp} />
        <input value={form.state} onChange={e => set("state", e.target.value)} placeholder="State *" className={inp} />
        <input value={form.pincode} onChange={e => set("pincode", e.target.value)} placeholder="Pincode *" maxLength={6} className={inp} />
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave(form)} disabled={saving}
          className="flex-1 py-2 rounded-xl text-xs font-semibold text-black disabled:opacity-50 transition"
          style={{ background: "linear-gradient(135deg,#d4aa5a,#c8963e)" }}>
          {saving ? "Saving…" : "Save & Use This Address"}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-xl text-xs border border-gray-700 text-gray-400 hover:text-white transition">Cancel</button>
      </div>
    </div>
  );
}

// ── Checkout Modal (2 steps) ──────────────────────────────────────────────────
function CheckoutModal({ displayTotal, selectedCount, onConfirm, onClose, checkingOut, checkoutError }) {
  const [step, setStep] = useState(1);          // 1=address, 2=payment
  const [addresses, setAddresses] = useState([]);
  const [addrLoading, setAddrLoading] = useState(true);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [paymentMode, setPaymentMode] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingSaving, setAddingSaving] = useState(false);
  const [addingError, setAddingError] = useState("");

  useEffect(() => {
    API.get("addresses/")
      .then(r => {
        const list = r.data.results || r.data;
        setAddresses(list);
        const def = list.find(a => a.is_default) || list[0];
        if (def) setSelectedAddr(def.id);
      })
      .catch(() => { })
      .finally(() => setAddrLoading(false));
  }, []);

  const handleAddAddress = async (form) => {
    const req = ["full_name", "phone", "line1", "city", "state", "pincode"];
    if (req.some(k => !form[k]?.trim())) { setAddingError("Please fill in all required fields."); return; }
    setAddingSaving(true); setAddingError("");
    try {
      const r = await API.post("addresses/", { ...form, is_default: addresses.length === 0 });
      const newAddr = r.data;
      setAddresses(a => [newAddr, ...a]);
      setSelectedAddr(newAddr.id);
      setShowAddForm(false);
    } catch (e) {
      const d = e?.response?.data;
      setAddingError(typeof d === "object" ? Object.values(d).flat()[0] : d || "Failed to save.");
    } finally { setAddingSaving(false); }
  };

  const canProceedStep1 = selectedAddr != null;
  const canProceedStep2 = paymentMode !== "";
  const chosenAddr = addresses.find(a => a.id === selectedAddr);

  const handleFinalConfirm = () => {
    onConfirm({ address_id: selectedAddr, payment_mode: paymentMode });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        className="relative z-10 glass rounded-2xl w-full max-w-md shadow-luxury overflow-hidden">

        {/* ── Modal header ── */}
        <div className="px-6 py-4 border-b border-gray-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Step pills */}
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? "text-black" : "border border-gray-600 text-gray-500"}`}
                  style={step >= s ? { background: "linear-gradient(135deg,#d4aa5a,#c8963e)" } : {}}>
                  {s}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step === s ? "text-white" : "text-gray-600"}`}>
                  {s === 1 ? "Delivery Address" : "Payment"}
                </span>
                {s < 2 && <ChevRight />}
              </div>
            ))}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition text-xl leading-none">×</button>
        </div>

        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>

          {/* ════ STEP 1: Address ════ */}
          {step === 1 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-200 flex items-center gap-2"><MapPinIcon /> Choose Delivery Address</p>
                <button onClick={() => { setShowAddForm(v => !v); setAddingError(""); }}
                  className="flex items-center gap-1 text-xs text-gold border border-gold/30 px-2.5 py-1 rounded-lg hover:bg-gold/10 transition">
                  <PlusIcon /> Add New
                </button>
              </div>

              {addrLoading ? (
                <p className="text-gray-500 text-sm text-center py-6">Loading addresses…</p>
              ) : (
                <>
                  {addresses.length === 0 && !showAddForm && (
                    <div className="border border-dashed border-gray-700 rounded-xl p-6 text-center mb-3">
                      <p className="text-gray-500 text-sm mb-2">No saved addresses</p>
                      <button onClick={() => setShowAddForm(true)} className="text-xs text-gold border border-gold/30 px-3 py-1.5 rounded-lg hover:bg-gold/10 transition">
                        + Add delivery address
                      </button>
                    </div>
                  )}
                  <div className="space-y-2.5">
                    {addresses.map(addr => (
                      <button key={addr.id} type="button" onClick={() => setSelectedAddr(addr.id)}
                        className={`w-full text-left rounded-xl p-4 border transition-all ${selectedAddr === addr.id ? "border-gold/50 bg-gold/8" : "border-gray-700 hover:border-gray-600 bg-transparent"}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${LABEL_COLOR[addr.label] || LABEL_COLOR.Other}`}>{addr.label}</span>
                            {addr.is_default && <span className="text-xs text-yellow-500">Default</span>}
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selectedAddr === addr.id ? "border-gold bg-gold" : "border-gray-600"}`}>
                            {selectedAddr === addr.id && <div className="w-2 h-2 rounded-full bg-black" />}
                          </div>
                        </div>
                        <p className="text-sm font-medium text-white">{addr.full_name} · {addr.phone}</p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} — {addr.pincode}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Inline add address form */}
                  <AnimatePresence>
                    {showAddForm && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        <InlineAddressForm
                          onSave={handleAddAddress}
                          onCancel={() => { setShowAddForm(false); setAddingError(""); }}
                          saving={addingSaving}
                          error={addingError}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          )}

          {/* ════ STEP 2: Payment ════ */}
          {step === 2 && (
            <div>
              <p className="text-sm font-semibold text-gray-200 mb-4">Choose Payment Method</p>

              {/* Summary of chosen address */}
              {chosenAddr && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gold/5 border border-gold/20 mb-5">
                  <div className="text-gold mt-0.5 flex-shrink-0"><MapPinIcon /></div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 mb-0.5">Delivering to</p>
                    <p className="text-sm font-medium text-white">{chosenAddr.full_name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {chosenAddr.line1}{chosenAddr.line2 ? `, ${chosenAddr.line2}` : ""}, {chosenAddr.city} — {chosenAddr.pincode}
                    </p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-xs text-gold hover:text-yellow-300 transition flex-shrink-0">Change</button>
                </div>
              )}

              <div className="space-y-2.5">
                {PAYMENT_MODES.map(({ id, label, sub, Icon, color }) => (
                  <button key={id} type="button" onClick={() => setPaymentMode(id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${paymentMode === id ? "border-gold/50 bg-gold/8" : "border-gray-700 hover:border-gray-600"}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${paymentMode === id ? "bg-gold/15" : "bg-gray-800"} ${color}`}>
                      <Icon />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="text-xs text-gray-500 truncate">{sub}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${paymentMode === id ? "border-gold bg-gold" : "border-gray-600"}`}>
                      {paymentMode === id && <div className="w-2 h-2 rounded-full bg-black" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── Modal footer ── */}
        <div className="px-6 py-4 border-t border-gray-800/60">
          {checkoutError && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg mb-3">
              {checkoutError}
            </p>
          )}
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-xs">
              {selectedCount > 0 ? `${selectedCount} selected items` : "All cart items"}
            </span>
            <span className="text-gold font-semibold text-sm">₹ {displayTotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex gap-3">
            {step === 2 && (
              <button onClick={() => setStep(1)}
                className="flex items-center gap-1.5 border border-gray-700 text-gray-400 hover:text-white px-4 py-2.5 rounded-xl text-sm transition">
                <ChevLeft /> Back
              </button>
            )}
            {step === 1 ? (
              <button onClick={() => setStep(2)} disabled={!canProceedStep1}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-black transition disabled:opacity-40"
                style={{ background: "linear-gradient(135deg,#d4aa5a,#c8963e)" }}>
                Continue to Payment <ChevRight />
              </button>
            ) : (
              <button onClick={handleFinalConfirm} disabled={!canProceedStep2 || checkingOut}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-black transition disabled:opacity-40"
                style={{ background: "linear-gradient(135deg,#d4aa5a,#c8963e)" }}>
                {checkingOut ? "Placing Order…" : "Place Order"}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Cart ─────────────────────────────────────────────────────────────────
export default function Cart() {
  const { cart, cartLoading, updateQuantity, removeItem, fetchCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { addNotification } = useContext(NotificationContext);

  const [selected, setSelected] = useState(new Set());
  const [checkedOut, setCheckedOut] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 gap-6">
        <EmptyCartIcon />
        <p className="text-gray-400 text-lg">Please login to view your cart.</p>
        <Link to="/login" className="btn-luxury">Login</Link>
      </div>
    );
  }

  const items = cart.items || [];

  const toggleSelect = (id) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleSelectAll = () => setSelected(selected.size === items.length ? new Set() : new Set(items.map(i => i.id)));
  const removeSelected = async () => { for (const id of selected) await removeItem(id); setSelected(new Set()); };

  const selectedTotal = items.filter(i => selected.has(i.id)).reduce((s, i) => s + parseFloat(i.subtotal), 0);
  const displayTotal = selected.size > 0 ? selectedTotal : parseFloat(cart.total || 0);

  // ── Checkout flow ─────────────────────────────────────────────────────────
  const openCheckout = () => { setCheckoutError(""); setShowCheckoutModal(true); };

  const handleConfirmCheckout = async ({ address_id, payment_mode }) => {
    setCheckoutError(""); setCheckingOut(true);
    try {
      const body = {};
      if (selected.size > 0) body.item_ids = [...selected];
      // address_id and payment_mode sent for record (extend backend if needed)
      body.address_id = address_id;
      body.payment_mode = payment_mode;

      const res = await API.post("orders/checkout/", body);
      const orderId = res.data?.id || res.data?.order_id || "—";
      addNotification({
        type: "order",
        title: "Order Confirmed",
        body: `Your order #${orderId} has been placed via ${payment_mode.toUpperCase()}.`,
      });
      await fetchCart();
      setSelected(new Set());
      setShowCheckoutModal(false);
      setCheckedOut(true);
    } catch (err) {
      setCheckoutError(err.response?.data?.detail || "Checkout failed. Please try again.");
    } finally { setCheckingOut(false); }
  };

  // ── Order placed screen ───────────────────────────────────────────────────
  if (checkedOut) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 gap-6">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 18 }}>
          <CheckoutSuccessIcon />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3">
          <h2 className="text-3xl sm:text-4xl font-luxury text-gold">Order Placed!</h2>
          <p className="text-gray-400 max-w-sm text-sm sm:text-base">Thank you for your purchase. Your luxury items will be delivered with care.</p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link to="/products" className="btn-luxury">Continue Shopping</Link>
            <button onClick={() => setCheckedOut(false)} className="text-gray-400 hover:text-gold transition text-sm underline underline-offset-4">View Cart</button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Empty cart ────────────────────────────────────────────────────────────
  if (items.length === 0 && !cartLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 gap-6">
        <EmptyCartIcon />
        <h2 className="text-3xl font-luxury text-gold">Your cart is empty</h2>
        <p className="text-gray-400 text-sm sm:text-base">Explore our collection and add something beautiful.</p>
        <Link to="/products" className="btn-luxury">Explore Collection</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-16 py-8 sm:py-12 max-w-6xl mx-auto">

      <motion.h2 initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="text-4xl sm:text-5xl font-luxury text-gold mb-8 sm:mb-10 text-center">
        Your Cart
      </motion.h2>

      <div className="flex flex-col lg:flex-row gap-6 sm:gap-10">

        {/* ── Items ── */}
        <div className="flex-1 space-y-3 sm:space-y-4">

          {items.length > 0 && (
            <div className="flex items-center justify-between glass px-4 py-3 rounded-xl">
              <label className="flex items-center gap-3 cursor-pointer select-none text-sm text-gray-300">
                <input type="checkbox" checked={selected.size === items.length && items.length > 0}
                  onChange={toggleSelectAll} className="w-4 h-4 accent-yellow-500 cursor-pointer" />
                Select All ({items.length})
              </label>
              {selected.size > 0 && (
                <motion.button initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  onClick={removeSelected}
                  className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs sm:text-sm transition-colors duration-200"
                  style={{ touchAction: "manipulation" }}>
                  <TrashIcon />
                  <span className="hidden sm:inline">Remove Selected ({selected.size})</span>
                  <span className="sm:hidden">Remove ({selected.size})</span>
                </motion.button>
              )}
            </div>
          )}

          <AnimatePresence>
            {items.map(item => {
              const imgSrc = getProductImage(item.product);
              return (
                <motion.div key={item.id} layout
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }} transition={{ duration: 0.3 }}
                  className={`glass rounded-2xl p-3 sm:p-4 transition-all duration-200 border ${selected.has(item.id) ? "border-gold/50" : "border-transparent"}`}>
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)}
                      className="w-4 h-4 accent-yellow-500 cursor-pointer flex-shrink-0 mt-1" />
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex-shrink-0 overflow-hidden bg-gray-800 border border-gray-700">
                      {imgSrc ? (<img src={imgSrc} alt={item.product.name} className="w-full h-full object-cover" onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />) : null}
                      <div className={`w-full h-full items-center justify-center text-gray-600 text-xl ${imgSrc ? "hidden" : "flex"}`}>🛍</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm sm:text-base leading-tight truncate pr-1">{item.product.name}</h3>
                      <p className="text-gray-500 text-xs mt-0.5 line-clamp-2 hidden sm:block">{item.product.description}</p>
                      <p className="text-gold text-xs sm:text-sm font-medium mt-1">₹ {Number(item.product.price).toLocaleString("en-IN")} each</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-gray-600 hover:text-red-400 transition-colors duration-200 flex-shrink-0 p-1 -mt-0.5" style={{ touchAction: "manipulation" }}>
                      <TrashIcon />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3 pl-7 sm:pl-8">
                    <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden">
                      <button onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                        className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gold hover:bg-white/5 transition-all text-lg leading-none" style={{ touchAction: "manipulation" }}>−</button>
                      <span className="w-10 text-center text-white text-sm border-x border-gray-600 py-2">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gold hover:bg-white/5 transition-all text-lg leading-none" style={{ touchAction: "manipulation" }}>+</button>
                    </div>
                    <p className="text-gold font-semibold text-sm sm:text-base">₹ {Number(item.subtotal).toLocaleString("en-IN")}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ── Order Summary ── */}
        <div className="lg:w-80 flex-shrink-0">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-5 sm:p-6 shadow-luxury lg:sticky lg:top-28">
            <h3 className="text-xl sm:text-2xl font-luxury text-gold mb-5 sm:mb-6">Order Summary</h3>

            <div className="space-y-3 text-sm mb-5 sm:mb-6">
              <div className="flex justify-between text-gray-400">
                <span>Items</span><span>{cart.item_count}</span>
              </div>
              {selected.size > 0 && (
                <div className="flex justify-between text-gray-400">
                  <span>Selected ({selected.size})</span>
                  <span>₹ {selectedTotal.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span><span className="text-green-400">Free</span>
              </div>
              <div className="border-t border-gray-700 pt-3 flex justify-between text-white font-semibold text-base">
                <span>Total</span>
                <span className="text-gold">₹ {displayTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {selected.size > 0 && (
              <p className="text-xs text-gray-500 mb-3 text-center">
                Checking out {selected.size} selected item{selected.size > 1 ? "s" : ""}
              </p>
            )}

            <button onClick={openCheckout} disabled={cartLoading || items.length === 0}
              className="btn-luxury w-full disabled:opacity-40 disabled:cursor-not-allowed text-center"
              style={{ touchAction: "manipulation" }}>
              Proceed to Checkout
            </button>
            <Link to="/products" className="block text-center text-gray-400 hover:text-gold transition text-sm mt-4 underline underline-offset-4">
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── Checkout Modal ── */}
      <AnimatePresence>
        {showCheckoutModal && (
          <CheckoutModal
            displayTotal={displayTotal}
            selectedCount={selected.size}
            onConfirm={handleConfirmCheckout}
            onClose={() => { if (!checkingOut) setShowCheckoutModal(false); }}
            checkingOut={checkingOut}
            checkoutError={checkoutError}
          />
        )}
      </AnimatePresence>
    </div>
  );
}