// AdminUserProfile.jsx
// Drop into: luxe-frontend/src/pages/admin/AdminUserProfile.jsx
//
// Props:
//   userId   — the numeric user id to load
//   onBack   — callback to return to the users list
//   onDelete — callback after successful delete (optional)
//   onBanToggle — callback after ban/unban so parent list can refresh (optional)

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ADMIN_API } from "../../context/AdminContext";

// ── Error parser (mirrors AdminDashboard) ─────────────────────────────────────
const parseError = (err) => {
    const d = err?.response?.data;
    if (!d) return "Something went wrong.";
    if (typeof d === "string") return d;
    if (typeof d === "object") {
        const extract = (val) => {
            if (typeof val === "string") return val;
            if (Array.isArray(val)) return val.map(extract).find(v => v) || "";
            if (typeof val === "object" && val !== null) return Object.values(val).map(extract).find(v => v) || "";
            return String(val);
        };
        return extract(d) || "Failed.";
    }
    return "Failed.";
};

// ── Tiny icon set ─────────────────────────────────────────────────────────────
const S = { fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" };
const Ico = ({ d, size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
        {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
);

const ICONS = {
    user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
    mail: ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", "M22 6l-10 7L2 6"],
    phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.95-1.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
    map: ["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z", "M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
    cal: ["M8 2v4", "M16 2v4", "M3 8h18", "M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"],
    clock: ["M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2", "M12 6v6l4 2"],
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    check: "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
    ban: "M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636",
    trash: ["M3 6h18", "M19 6l-1 14H6L5 6", "M10 11v6", "M14 11v6", "M9 6V4h6v2"],
    note: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M16 13H8", "M16 17H8", "M10 9H8"],
    download: ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"],
    arrow: "M19 12H5M12 5l-7 7 7 7",
    orders: ["M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z", "M3 6h18", "M16 10a4 4 0 0 1-8 0"],
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    activity: "M22 12h-4l-3 9L9 3l-3 9H2",
    risk: ["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"],
    verified: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z",
};

// ── Badge ─────────────────────────────────────────────────────────────────────
const Badge = ({ label, color }) => {
    const map = {
        green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        red: "bg-red-500/15 text-red-400 border-red-500/30",
        yellow: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
        blue: "bg-blue-500/15 text-blue-400 border-blue-500/30",
        gray: "bg-gray-500/15 text-gray-400 border-gray-500/30",
        gold: "bg-yellow-600/15 text-yellow-500 border-yellow-600/30",
        purple: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    };
    return <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${map[color] || map.gray}`}>{label}</span>;
};

const statusColor = s => ({ pending: "yellow", confirmed: "blue", shipped: "gold", delivered: "green", cancelled: "red" })[s] || "gray";

// ── Stars ─────────────────────────────────────────────────────────────────────
const Stars = ({ n }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
            <svg key={i} width="12" height="12" viewBox="0 0 24 24"
                fill={i <= n ? "#c8963e" : "none"} stroke="#c8963e" strokeWidth="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        ))}
    </div>
);

// ── Info row ──────────────────────────────────────────────────────────────────
const InfoRow = ({ iconKey, label, value }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-800/50 last:border-0">
        <span className="text-gray-600 mt-0.5 flex-shrink-0">
            <Ico d={ICONS[iconKey]} size={15} />
        </span>
        <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className="text-sm text-gray-200 break-words">{value || <span className="text-gray-600 italic">Not set</span>}</p>
        </div>
    </div>
);

// ── Confirm modal ─────────────────────────────────────────────────────────────
const ConfirmModal = ({ title, message, confirmLabel, confirmClass, onConfirm, onCancel, loading, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onCancel} />
        <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 glass rounded-2xl p-7 w-full max-w-sm shadow-luxury">
            <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-400 mb-4">{message}</p>
            {children}
            <div className="flex gap-3 mt-5">
                <button onClick={onCancel} className="flex-1 border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white py-2.5 rounded-xl text-sm transition">
                    Cancel
                </button>
                <button onClick={onConfirm} disabled={loading} className={`flex-1 py-2.5 rounded-xl text-sm transition disabled:opacity-50 ${confirmClass}`}>
                    {loading ? "Processing…" : confirmLabel}
                </button>
            </div>
        </motion.div>
    </div>
);

// ── CSV export helper ─────────────────────────────────────────────────────────
const exportCSV = (rows, cols, filename) => {
    const header = cols.map(c => c.label).join(",");
    const body = rows.map(r => cols.map(c => `"${(r[c.key] ?? "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([header + "\n" + body], { type: "text/csv" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: filename });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
};

// ── Format helpers ────────────────────────────────────────────────────────────
const fmtDate = (s) => s ? new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtDT = (s) => s ? new Date(s).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never";
const fmtMoney = (n) => "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

// ══════════════════════════════════════════════════════════════════════════════
export default function AdminUserProfile({ userId, onBack, onDelete, onBanToggle }) {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("profile");

    // Editing inline fields
    const [editField, setEditField] = useState(null); // "phone" | "address"
    const [editVal, setEditVal] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");

    // Admin notes (client-side only — extend to backend if needed)
    const [notes, setNotes] = useState([]);
    const [noteInput, setNoteInput] = useState("");

    // Modals
    const [showBan, setShowBan] = useState(false);
    const [banReason, setBanReason] = useState("");
    const [banErr, setBanErr] = useState("");
    const [banLoading, setBanLoading] = useState(false);
    const [showDel, setShowDel] = useState(false);
    const [delLoading, setDelLoading] = useState(false);

    // Expanded order rows
    const [expandedOrder, setExpandedOrder] = useState(null);

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [uRes, oRes, rRes] = await Promise.all([
                ADMIN_API.get(`admin/users/${userId}/`),
                ADMIN_API.get(`admin/users/${userId}/orders/`),
                ADMIN_API.get(`admin/users/${userId}/reviews/`),
            ]);
            setUser(uRes.data);
            setOrders(oRes.data.results || oRes.data);
            setReviews(rRes.data.results || rRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // ── Derived stats ──────────────────────────────────────────────────────────
    const totalSpend = orders.reduce((s, o) => s + Number(o.total), 0);
    const avgOrder = orders.length ? totalSpend / orders.length : 0;
    const initials = (user?.full_name || user?.username || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

    // ── Inline field edit (phone / address) ───────────────────────────────────
    const startEdit = (field) => {
        setEditField(field);
        setEditVal(user?.[field] || "");
        setEditError("");
    };
    const saveEdit = async () => {
        setEditLoading(true); setEditError("");
        try {
            const r = await ADMIN_API.patch(`admin/users/${userId}/`, { [editField]: editVal });
            setUser(r.data);
            setEditField(null);
        } catch (e) {
            setEditError(parseError(e));
        } finally {
            setEditLoading(false);
        }
    };

    // ── Ban / Unban ────────────────────────────────────────────────────────────
    const handleBanConfirm = async () => {
        if (user.is_active && !banReason.trim()) { setBanErr("Please enter a reason."); return; }
        setBanLoading(true);
        try {
            const body = user.is_active ? { reason: banReason.trim() } : {};
            const r = await ADMIN_API.patch(`admin/users/${userId}/ban/`, body);
            setUser(r.data);
            setShowBan(false); setBanReason(""); setBanErr("");
            onBanToggle?.();
        } catch (e) {
            setBanErr(parseError(e));
        } finally {
            setBanLoading(false);
        }
    };

    // ── Delete ─────────────────────────────────────────────────────────────────
    const handleDeleteConfirm = async () => {
        setDelLoading(true);
        try {
            await ADMIN_API.delete(`admin/users/${userId}/`);
            setShowDel(false);
            onDelete?.();
            onBack?.();
        } catch (e) {
            console.error(e);
        } finally {
            setDelLoading(false);
        }
    };

    // ── Notes ──────────────────────────────────────────────────────────────────
    const addNote = () => {
        if (!noteInput.trim()) return;
        setNotes(prev => [{ id: Date.now(), text: noteInput.trim(), date: new Date().toISOString().slice(0, 10), author: "admin" }, ...prev]);
        setNoteInput("");
    };

    // ── Tab config ─────────────────────────────────────────────────────────────
    const tabs = [
        { key: "profile", label: "Profile", icon: ICONS.user },
        { key: "orders", label: "Orders", icon: ICONS.orders },
        { key: "reviews", label: "Reviews", icon: ICONS.star },
        { key: "activity", label: "Activity", icon: ICONS.activity },
        { key: "risk", label: "Risk", icon: ICONS.shield },
    ];

    // ── Loading / error states ─────────────────────────────────────────────────
    if (loading) return (
        <div className="flex items-center justify-center py-32">
            <p className="text-gray-400">Loading profile…</p>
        </div>
    );
    if (!user) return (
        <div className="flex items-center justify-center py-32">
            <p className="text-red-400">User not found.</p>
        </div>
    );

    return (
        <>
            <div className="max-w-5xl mx-auto">

                {/* Back */}
                {onBack && (
                    <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-yellow-400 transition mb-6">
                        <Ico d={ICONS.arrow} size={14} /> Back to Users
                    </button>
                )}

                {/* ── Header card ── */}
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 sm:p-8 mb-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.username}
                                    className="w-20 h-20 rounded-2xl object-cover"
                                    style={{ boxShadow: "0 0 0 2px #c8963e,0 0 0 4px rgba(200,150,62,0.15)" }} />
                            ) : (
                                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold"
                                    style={{ background: "rgba(200,150,62,0.15)", color: "#e5b86a", boxShadow: "0 0 0 2px #c8963e,0 0 0 4px rgba(200,150,62,0.15)" }}>
                                    {initials}
                                </div>
                            )}
                            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${user.is_active ? "bg-emerald-500" : "bg-red-500"}`} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h1 className="text-xl font-bold text-white">{user.full_name || user.username}</h1>
                                <Badge label={user.is_active ? "Active" : "Banned"} color={user.is_active ? "green" : "red"} />
                                {user.is_staff && <Badge label="Admin" color="gold" />}
                                {user.is_email_verified && <Badge label="Verified" color="blue" />}
                            </div>
                            <p className="text-sm text-gray-500 mb-2">@{user.username} · ID #{user.id}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                                <span className="text-xs text-gray-500">{user.email}</span>
                                {user.phone && <span className="text-xs text-gray-500">{user.phone}</span>}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 flex-shrink-0">
                            <button onClick={() => setShowBan(true)}
                                className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition font-medium ${user.is_active ? "border-red-500/40 text-red-400 hover:bg-red-500/10" : "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"}`}>
                                <Ico d={user.is_active ? ICONS.ban : ICONS.check} size={14} />
                                {user.is_active ? "Ban" : "Unban"}
                            </button>
                            <button onClick={() => setShowDel(true)} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition font-medium">
                                <Ico d={ICONS.trash} size={14} /> Delete
                            </button>
                        </div>
                    </div>

                    {/* Stats bar */}
                    <div className="grid grid-cols-3 gap-0 mt-6 pt-5 border-t border-gray-800/60">
                        {[
                            { label: "Total Orders", value: orders.length, color: "text-yellow-400" },
                            { label: "Total Spend", value: fmtMoney(totalSpend), color: "text-emerald-400" },
                            { label: "Avg Order", value: fmtMoney(avgOrder), color: "text-blue-400" },
                        ].map(s => (
                            <div key={s.label} className="text-center">
                                <p className="text-[11px] text-gray-600 uppercase tracking-widest mb-1">{s.label}</p>
                                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ── Tab bar ── */}
                <div className="glass rounded-2xl mb-5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                    <div className="flex min-w-max">
                        {tabs.map(t => (
                            <button key={t.key} onClick={() => setTab(t.key)}
                                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition whitespace-nowrap border-b-2 ${tab === t.key ? "border-gold text-yellow-400 bg-yellow-600/8" : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/3"}`}>
                                <Ico d={t.icon} size={15} />{t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Tab content ── */}
                <AnimatePresence mode="wait">
                    <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>

                        {/* ╔══ PROFILE ══╗ */}
                        {tab === "profile" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                {/* User info */}
                                <div className="glass rounded-2xl p-6">
                                    <p className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                                        <Ico d={ICONS.user} size={15} /> User Information
                                    </p>

                                    <InfoRow iconKey="user" label="Full Name" value={user.full_name} />
                                    <InfoRow iconKey="user" label="Username" value={`@${user.username}`} />
                                    <InfoRow iconKey="mail" label="Email" value={user.email} />

                                    {/* Phone — inline editable */}
                                    {editField === "phone" ? (
                                        <div className="py-3 border-b border-gray-800/50">
                                            <p className="text-xs text-gray-500 mb-1.5">Phone</p>
                                            <div className="flex gap-2">
                                                <input value={editVal} onChange={e => setEditVal(e.target.value)}
                                                    placeholder="+91 98765 43210"
                                                    className="flex-1 bg-transparent border border-gray-600 focus:border-gold rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none transition" />
                                                <button onClick={saveEdit} disabled={editLoading} className="text-xs text-yellow-400 border border-gold/40 px-3 py-1.5 rounded-lg hover:bg-gold/10 transition disabled:opacity-50">
                                                    {editLoading ? "…" : "Save"}
                                                </button>
                                                <button onClick={() => setEditField(null)} className="text-xs text-gray-500 hover:text-white transition px-2">✕</button>
                                            </div>
                                            {editError && <p className="text-red-400 text-xs mt-1">{editError}</p>}
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-3 py-3 border-b border-gray-800/50">
                                            <span className="text-gray-600 mt-0.5 flex-shrink-0"><Ico d={ICONS.phone} size={15} /></span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm text-gray-200">{user.phone || <span className="text-gray-600 italic">Not set</span>}</p>
                                                    <button onClick={() => startEdit("phone")} className="text-xs text-gray-600 hover:text-yellow-400 transition">edit</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Address — inline editable */}
                                    {editField === "address" ? (
                                        <div className="py-3 border-b border-gray-800/50">
                                            <p className="text-xs text-gray-500 mb-1.5">Address</p>
                                            <textarea value={editVal} onChange={e => setEditVal(e.target.value)} rows={2}
                                                placeholder="Street, City, State, Pincode"
                                                className="w-full bg-transparent border border-gray-600 focus:border-gold rounded-lg px-3 py-1.5 text-sm text-white resize-none focus:outline-none transition mb-2" />
                                            <div className="flex gap-2">
                                                <button onClick={saveEdit} disabled={editLoading} className="text-xs text-yellow-400 border border-gold/40 px-3 py-1.5 rounded-lg hover:bg-gold/10 transition disabled:opacity-50">
                                                    {editLoading ? "…" : "Save"}
                                                </button>
                                                <button onClick={() => setEditField(null)} className="text-xs text-gray-500 hover:text-white transition">Cancel</button>
                                            </div>
                                            {editError && <p className="text-red-400 text-xs mt-1">{editError}</p>}
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-3 py-3 border-b border-gray-800/50">
                                            <span className="text-gray-600 mt-0.5 flex-shrink-0"><Ico d={ICONS.map} size={15} /></span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-gray-500 mb-0.5">Address</p>
                                                <div className="flex items-start gap-2">
                                                    <p className="text-sm text-gray-200 flex-1">{user.address || <span className="text-gray-600 italic">Not set</span>}</p>
                                                    <button onClick={() => startEdit("address")} className="text-xs text-gray-600 hover:text-yellow-400 transition flex-shrink-0">edit</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <InfoRow iconKey="cal" label="Joined" value={fmtDate(user.date_joined)} />
                                    <InfoRow iconKey="clock" label="Last Login" value={fmtDT(user.last_login)} />
                                    <div className="flex items-start gap-3 pt-3">
                                        <span className="text-gray-600 mt-0.5 flex-shrink-0"><Ico d={ICONS.shield} size={15} /></span>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1.5">Status</p>
                                            <div className="flex gap-2 flex-wrap">
                                                <Badge label={user.is_active ? "Active" : "Banned"} color={user.is_active ? "green" : "red"} />
                                                {user.is_staff && <Badge label="Staff / Admin" color="gold" />}
                                                {user.is_email_verified && <Badge label="Email Verified" color="blue" />}
                                            </div>
                                            {!user.is_active && user.ban_reason && (
                                                <p className="text-xs text-red-400 mt-2">Reason: {user.ban_reason}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Admin Notes */}
                                <div className="glass rounded-2xl p-6 flex flex-col">
                                    <p className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                                        <Ico d={ICONS.note} size={15} /> Admin Notes
                                        <span className="text-gray-700 text-xs font-normal">(internal only)</span>
                                    </p>
                                    <div className="flex gap-2 mb-4">
                                        <textarea value={noteInput} onChange={e => setNoteInput(e.target.value)}
                                            rows={2} placeholder="Add internal note about this user…"
                                            className="flex-1 bg-transparent border border-gray-700 focus:border-yellow-600/50 rounded-xl px-3 py-2 text-sm text-white resize-none focus:outline-none transition" />
                                        <button onClick={addNote} disabled={!noteInput.trim()}
                                            className="self-end px-3 py-2 rounded-xl text-xs font-semibold text-black disabled:opacity-40 transition"
                                            style={{ background: "linear-gradient(135deg,#d4aa5a,#c8963e)" }}>
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex-1 space-y-3 overflow-y-auto max-h-72" style={{ scrollbarWidth: "thin" }}>
                                        {notes.length === 0 && (
                                            <p className="text-gray-600 text-sm text-center py-8">No notes yet.</p>
                                        )}
                                        {notes.map(n => (
                                            <div key={n.id} className="bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-3">
                                                <p className="text-sm text-gray-300 leading-relaxed">{n.text}</p>
                                                <p className="text-xs text-gray-600 mt-2">{n.date} · by {n.author}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ╔══ ORDERS ══╗ */}
                        {tab === "orders" && (
                            <div className="glass rounded-2xl overflow-hidden">
                                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/60">
                                    <p className="text-sm font-semibold text-gray-300">
                                        {orders.length} order{orders.length !== 1 ? "s" : ""} placed
                                    </p>
                                    {orders.length > 0 && (
                                        <button onClick={() => exportCSV(
                                            orders.map(o => ({ order_id: `#${o.id}`, date: new Date(o.created_at).toLocaleDateString("en-IN"), amount: o.total, status: o.status })),
                                            [{ label: "Order ID", key: "order_id" }, { label: "Date", key: "date" }, { label: "Amount", key: "amount" }, { label: "Status", key: "status" }],
                                            `orders_${user.username}.csv`
                                        )} className="flex items-center gap-1.5 text-xs text-yellow-500 border border-yellow-600/30 px-3 py-1.5 rounded-lg hover:bg-yellow-600/10 transition">
                                            <Ico d={ICONS.download} size={13} /> Export CSV
                                        </button>
                                    )}
                                </div>

                                {orders.length === 0 ? (
                                    <p className="text-center text-gray-600 py-16">No orders yet.</p>
                                ) : (
                                    <div className="divide-y divide-gray-800/40">
                                        {orders.map(order => (
                                            <div key={order.id}>
                                                <div className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-white/[0.02] transition"
                                                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                                                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                                        <div>
                                                            <p className="text-xs text-gray-600">Order</p>
                                                            <p className="font-mono text-yellow-500 text-xs">#{order.id}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-600">Date</p>
                                                            <p className="text-gray-300">{fmtDate(order.created_at)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-600">Total</p>
                                                            <p className="text-yellow-400 font-semibold">{fmtMoney(order.total)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-600">Status</p>
                                                            <Badge label={order.status} color={statusColor(order.status)} />
                                                        </div>
                                                    </div>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                                        className={`text-gray-600 flex-shrink-0 transition-transform ${expandedOrder === order.id ? "rotate-180" : ""}`}>
                                                        <polyline points="6 9 12 15 18 9" />
                                                    </svg>
                                                </div>

                                                <AnimatePresence>
                                                    {expandedOrder === order.id && (
                                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }} className="overflow-hidden border-t border-gray-800/40">
                                                            <div className="px-6 py-4 bg-gray-900/30">
                                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Items</p>
                                                                <div className="space-y-2">
                                                                    {(order.items || []).map(item => (
                                                                        <div key={item.id} className="flex justify-between text-sm">
                                                                            <span className="text-gray-400">{item.name} × {item.quantity}</span>
                                                                            <span className="text-yellow-400">{fmtMoney(item.subtotal)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {orders.length > 0 && (
                                    <div className="px-6 py-4 border-t border-gray-800/60 flex justify-between">
                                        <span className="text-xs text-gray-600">All orders</span>
                                        <span className="text-sm font-bold text-yellow-400">{fmtMoney(totalSpend)}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ╔══ REVIEWS ══╗ */}
                        {tab === "reviews" && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500">{reviews.length} review{reviews.length !== 1 ? "s" : ""} written</p>
                                    {reviews.length > 0 && (
                                        <button onClick={() => exportCSV(
                                            reviews.map(r => ({ product: r.product_name, rating: r.rating, review: r.body, date: new Date(r.created_at).toLocaleDateString("en-IN") })),
                                            [{ label: "Product", key: "product" }, { label: "Rating", key: "rating" }, { label: "Review", key: "review" }, { label: "Date", key: "date" }],
                                            `reviews_${user.username}.csv`
                                        )} className="flex items-center gap-1.5 text-xs text-yellow-500 border border-yellow-600/30 px-3 py-1.5 rounded-lg hover:bg-yellow-600/10 transition">
                                            <Ico d={ICONS.download} size={13} /> Export CSV
                                        </button>
                                    )}
                                </div>

                                {reviews.length === 0 ? (
                                    <div className="glass rounded-2xl p-16 text-center">
                                        <p className="text-gray-600">No reviews written yet.</p>
                                    </div>
                                ) : reviews.map(r => (
                                    <div key={r.id} className="glass rounded-2xl p-5 flex gap-4 items-start">
                                        {/* Product thumbnail */}
                                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-800 border border-gray-700">
                                            {r.product_image
                                                ? <img src={r.product_image} alt={r.product_name} className="w-full h-full object-cover" onError={e => e.target.style.display = "none"} />
                                                : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xl">🛍</div>
                                            }
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                                                <p className="text-sm font-semibold text-gray-200">{r.product_name}</p>
                                                <p className="text-xs text-gray-600">{fmtDate(r.created_at)}</p>
                                            </div>
                                            <Stars n={r.rating} />
                                            {r.title && <p className="text-sm font-medium text-gray-300 mt-1.5">{r.title}</p>}
                                            <p className="text-sm text-gray-400 mt-1 leading-relaxed">{r.body}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ╔══ ACTIVITY ══╗ */}
                        {tab === "activity" && (
                            <div className="space-y-5">
                                {/* Summary cards */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {[
                                        { label: "Account Created", value: fmtDate(user.date_joined), color: "text-yellow-400" },
                                        { label: "Last Login", value: fmtDT(user.last_login), color: "text-blue-400" },
                                        { label: "Orders Placed", value: orders.length, color: "text-emerald-400" },
                                        { label: "Reviews Written", value: reviews.length, color: "text-purple-400" },
                                    ].map(s => (
                                        <div key={s.label} className="glass rounded-2xl p-4">
                                            <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">{s.label}</p>
                                            <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Order timeline */}
                                <div className="glass rounded-2xl p-6">
                                    <p className="text-sm font-semibold text-gray-300 mb-5 flex items-center gap-2">
                                        <Ico d={ICONS.activity} size={15} /> Order Timeline
                                    </p>
                                    {orders.length === 0 ? (
                                        <p className="text-gray-600 text-sm text-center py-8">No orders to show.</p>
                                    ) : (
                                        <div className="relative">
                                            <div className="absolute left-3.5 top-2 bottom-2 w-px bg-gray-800" />
                                            <div className="space-y-1">
                                                {orders.map(o => {
                                                    const dotColor = { delivered: "bg-emerald-500", cancelled: "bg-red-500", shipped: "bg-purple-500", confirmed: "bg-blue-500", pending: "bg-yellow-500" }[o.status] || "bg-gray-500";
                                                    return (
                                                        <div key={o.id} className="flex gap-4 pb-4 items-start">
                                                            <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${dotColor} bg-opacity-20 border border-current`}
                                                                style={{ color: dotColor.replace("bg-", "").replace("-500", "") === "emerald" ? "#34d399" : dotColor.replace("bg-", "").replace("-500", "") === "red" ? "#f87171" : "#e5b86a" }}>
                                                                <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                                                            </div>
                                                            <div className="flex-1 pt-0.5">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <p className="text-sm text-gray-200">Order <span className="font-mono text-yellow-500 text-xs">#{o.id}</span> · {fmtMoney(o.total)}</p>
                                                                    <span className="text-xs text-gray-600 flex-shrink-0">{fmtDate(o.created_at)}</span>
                                                                </div>
                                                                <p className="text-xs text-gray-500 mt-0.5 capitalize">{o.status} · {o.items?.length || 0} item{o.items?.length !== 1 ? "s" : ""}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ╔══ RISK ══╗ */}
                        {tab === "risk" && (
                            <div className="space-y-5">

                                {/* Account status card */}
                                <div className="glass rounded-2xl p-6">
                                    <p className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                                        <Ico d={ICONS.shield} size={15} /> Account Status
                                    </p>

                                    <div className="space-y-3">
                                        {[
                                            { label: "Account Active", value: user.is_active, ok: user.is_active, yes: "Active", no: "Banned / Deactivated" },
                                            { label: "Email Verified", value: user.is_email_verified, ok: user.is_email_verified, yes: "Verified", no: "Not verified" },
                                            { label: "Staff Privileges", value: user.is_staff, ok: !user.is_staff, yes: "No", no: "Yes — has admin access" },
                                        ].map(r => (
                                            <div key={r.label} className="flex items-center justify-between py-2.5 border-b border-gray-800/50 last:border-0">
                                                <span className="text-sm text-gray-300">{r.label}</span>
                                                <span className={`text-xs font-semibold ${r.ok ? "text-emerald-400" : "text-red-400"}`}>
                                                    {r.value ? (r.ok ? `✓ ${r.yes}` : `⚠ ${r.no}`) : (r.ok ? `✓ ${r.yes}` : `✕ ${r.no}`)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Ban reason */}
                                    {!user.is_active && user.ban_reason && (
                                        <div className="mt-4 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Ban Reason</p>
                                            <p className="text-sm text-red-300">{user.ban_reason}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Order status breakdown */}
                                <div className="glass rounded-2xl p-6">
                                    <p className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                                        <Ico d={ICONS.orders} size={15} /> Order Status Breakdown
                                    </p>
                                    {orders.length === 0 ? (
                                        <p className="text-gray-600 text-sm text-center py-6">No orders to analyse.</p>
                                    ) : (
                                        <div className="space-y-2.5">
                                            {["delivered", "confirmed", "shipped", "pending", "cancelled"].map(status => {
                                                const count = orders.filter(o => o.status === status).length;
                                                const pct = orders.length ? Math.round((count / orders.length) * 100) : 0;
                                                if (count === 0) return null;
                                                const barColor = { delivered: "#34d399", confirmed: "#60a5fa", shipped: "#a78bfa", pending: "#fbbf24", cancelled: "#f87171" }[status] || "#9ca3af";
                                                return (
                                                    <div key={status} className="flex items-center gap-3">
                                                        <span className="text-xs text-gray-500 capitalize w-20">{status}</span>
                                                        <div className="flex-1 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                                                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor }} />
                                                        </div>
                                                        <span className="text-xs font-semibold w-6 text-right" style={{ color: barColor }}>{count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Cancelled orders detail */}
                                {orders.filter(o => o.status === "cancelled").length > 0 && (
                                    <div className="glass rounded-2xl overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-800/60">
                                            <p className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                                <Ico d={ICONS.risk} size={15} /> Cancelled Orders
                                            </p>
                                        </div>
                                        <div className="divide-y divide-gray-800/40">
                                            {orders.filter(o => o.status === "cancelled").map(o => (
                                                <div key={o.id} className="flex items-center justify-between px-6 py-4">
                                                    <div>
                                                        <p className="font-mono text-yellow-500 text-xs">#{o.id}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{fmtDate(o.created_at)}</p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-red-400">{fmtMoney(o.total)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── Ban / Unban modal ── */}
            <AnimatePresence>
                {showBan && (
                    <ConfirmModal
                        title={user.is_active ? `Ban @${user.username}?` : `Unban @${user.username}?`}
                        message={user.is_active ? "The user will be locked out immediately." : "This will restore the user's access."}
                        confirmLabel={user.is_active ? "Yes, Ban" : "Yes, Unban"}
                        confirmClass={user.is_active ? "bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30" : "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30"}
                        onConfirm={handleBanConfirm}
                        onCancel={() => { setShowBan(false); setBanReason(""); setBanErr(""); }}
                        loading={banLoading}
                    >
                        {user.is_active && (
                            <>
                                <textarea value={banReason} onChange={e => { setBanReason(e.target.value); setBanErr(""); }} rows={3}
                                    placeholder="Enter ban reason…"
                                    className="w-full bg-transparent border border-gray-700 focus:border-red-500/50 rounded-xl p-3 text-sm text-white resize-none focus:outline-none transition mb-1" />
                                {banErr && <p className="text-red-400 text-xs mb-2">{banErr}</p>}
                            </>
                        )}
                    </ConfirmModal>
                )}

                {/* ── Delete modal ── */}
                {showDel && (
                    <ConfirmModal
                        title={`Delete @${user.username}?`}
                        message="This is permanent and cannot be undone. All user data, orders and reviews will be removed."
                        confirmLabel="Yes, Delete"
                        confirmClass="bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30"
                        onConfirm={handleDeleteConfirm}
                        onCancel={() => setShowDel(false)}
                        loading={delLoading}
                    />
                )}
            </AnimatePresence>
        </>
    );
}