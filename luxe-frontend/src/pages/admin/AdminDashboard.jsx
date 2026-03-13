import React, { useContext, useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AdminContext, ADMIN_API } from "../../context/AdminContext";

// ── Helper: safely extract error string from any API response ─────────────────
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

// ── Icons ─────────────────────────────────────────────────────────────────────
const S = { fill:"none", stroke:"currentColor", strokeWidth:"1.8", strokeLinecap:"round", strokeLinejoin:"round" };

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const UsersIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" {...S}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const BoxIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" {...S}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const OrdersIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" {...S}>
    <polyline points="9 11 12 14 22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

const DashIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" {...S}>
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" {...S}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const PlusIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" {...S}>
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const TrashIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" {...S}>
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);

const EditIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" {...S}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const SearchIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" {...S}>
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" {...S}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const ImgIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" {...S}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const TagIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" {...S}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

const CheckIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" {...S}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const XIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" {...S}>
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const MenuIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" {...S}>
    <line x1="3" y1="6"  x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const CloseIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" {...S}>
    <line x1="18" y1="6"  x2="6"  y2="18"/>
    <line x1="6"  y1="6"  x2="18" y2="18"/>
  </svg>
);

const FilterIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" {...S}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

// ── Shared UI ─────────────────────────────────────────────────────────────────
const Badge = ({ label, color }) => {
  const map = {
    green:  "bg-green-500/15 text-green-400 border-green-500/30",
    red:    "bg-red-500/15 text-red-400 border-red-500/30",
    yellow: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    blue:   "bg-blue-500/15 text-blue-400 border-blue-500/30",
    gray:   "bg-gray-500/15 text-gray-400 border-gray-500/30",
    gold:   "bg-yellow-600/15 text-yellow-500 border-yellow-600/30",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${map[color] || map.gray}`}>{label}</span>;
};

const statusColor = s => ({ pending:"yellow", confirmed:"blue", shipped:"gold", delivered:"green", cancelled:"red" }[s] || "gray");

const StatCard = ({ label, value, sub }) => (
  <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="glass rounded-2xl p-4 sm:p-6">
    <p className="text-gray-400 text-sm mb-1">{label}</p>
    <p className="text-2xl sm:text-3xl font-luxury text-gold">{value}</p>
    {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
  </motion.div>
);

const Modal = ({ title, onClose, children, maxW = "max-w-lg" }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
    <motion.div initial={{ scale:0.92, opacity:0 }} animate={{ scale:1, opacity:1 }}
      className={`relative glass rounded-2xl p-5 sm:p-8 w-full ${maxW} shadow-luxury z-10 max-h-[90vh] overflow-y-auto`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-luxury text-gold">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition text-2xl leading-none">×</button>
      </div>
      {children}
    </motion.div>
  </div>
);

const DeleteConfirmModal = ({ message, subMessage, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
    <motion.div initial={{ scale:0.92, opacity:0 }} animate={{ scale:1, opacity:1 }}
      className="relative glass rounded-2xl p-8 w-full max-w-sm shadow-luxury z-10 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
          <TrashIcon />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{message}</h3>
      {subMessage && <p className="text-gray-400 text-sm mb-6">{subMessage}</p>}
      <div className="flex gap-3 mt-6">
        <button onClick={onCancel} className="flex-1 border border-gray-600 text-gray-300 hover:border-gray-400 py-2.5 rounded-xl transition text-sm">Cancel</button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 py-2.5 rounded-xl transition text-sm disabled:opacity-50">
          {loading ? "Deleting..." : "Yes, Delete"}
        </button>
      </div>
    </motion.div>
  </div>
);

const BanModal = ({ user, onConfirm, onCancel, loading }) => {
  const [reason, setReason] = useState("");
  const [err, setErr]       = useState("");
  const submit = () => { if (!reason.trim()) { setErr("Please enter a reason."); return; } onConfirm(reason.trim()); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <motion.div initial={{ scale:0.92, opacity:0 }} animate={{ scale:1, opacity:1 }}
        className="relative glass rounded-2xl p-8 w-full max-w-md shadow-luxury z-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0">
            <Icon d={["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z","M12 9v4","M12 17h.01"]} />
          </div>
          <div><h3 className="text-lg font-semibold text-white">Ban User</h3><p className="text-gray-400 text-sm">@{user?.username}</p></div>
        </div>
        <p className="text-gray-400 text-sm mb-4">This user will be locked out and shown your reason when they try to log in.</p>
        <textarea value={reason} onChange={e => { setReason(e.target.value); setErr(""); }} rows={3}
          placeholder="Enter ban reason (e.g. Violation of terms, Suspicious activity...)"
          className="w-full bg-transparent border border-gray-600 focus:border-red-400 p-3 rounded-lg text-white text-sm resize-none focus:outline-none transition" />
        {err && <p className="text-red-400 text-xs mt-1">{err}</p>}
        <div className="flex gap-3 mt-5">
          <button onClick={onCancel} className="flex-1 border border-gray-600 text-gray-300 hover:border-gray-400 py-2.5 rounded-xl transition text-sm">Cancel</button>
          <button onClick={submit} disabled={loading} className="flex-1 bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 py-2.5 rounded-xl transition text-sm disabled:opacity-50">
            {loading ? "Banning..." : "Ban User"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ImageUrlsInput = ({ urls, onChange }) => {
  const [commonUrl, setCommonUrl] = useState(urls[urls.length - 1] || "https://i.postimg.cc/V6y1Hcym/Gemini-Generated-Image-t1abwdt1abwdt1ab.png");

  const productUrls = urls.slice(0, -1);

  const syncCommon = (newCommon) => {
    setCommonUrl(newCommon);
    onChange([...productUrls, newCommon]);
  };

  const add    = ()       => onChange([...productUrls, "", commonUrl]);
  const remove = (i)      => onChange([...urls.filter((_, idx) => idx !== i && idx !== urls.length - 1), commonUrl]);
  const update = (i, v)   => onChange(urls.map((u, idx) => idx === i ? v : u));
  const move   = (i, dir) => {
    const editable = [...productUrls];
    [editable[i], editable[i + dir]] = [editable[i + dir], editable[i]];
    onChange([...editable, commonUrl]);
  };

  const displayUrls = productUrls;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-300 font-medium">Product Images</p>
        <button type="button" onClick={add}
          className="flex items-center gap-1 text-xs text-gold hover:text-yellow-300 transition border border-gold/30 px-2 py-1 rounded-lg hover:bg-gold/10">
          <PlusIcon /> Add Image URL
        </button>
      </div>

      <div className="border border-gold/20 bg-gold/5 rounded-xl p-3 space-y-1.5">
        <p className="text-xs text-gold font-medium">Common Image URL <span className="text-gray-500 font-normal">(shared across all products)</span></p>
        <div className="flex gap-2 items-center">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 border border-gray-700">
            {commonUrl
              ? <img src={commonUrl} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = "none"; }} />
              : <div className="w-full h-full flex items-center justify-center text-gray-600"><ImgIcon /></div>}
          </div>
          <input type="url" value={commonUrl} onChange={e => syncCommon(e.target.value)}
            placeholder="Shared image URL (always last)"
            className="flex-1 bg-transparent border border-gold/30 focus:border-gold p-2.5 rounded-lg focus:outline-none transition text-white text-sm" />
        </div>
      </div>

      {displayUrls.length === 0 && (
        <div className="border border-dashed border-gray-700 rounded-lg p-4 text-center">
          <div className="flex justify-center mb-2 text-gray-600"><ImgIcon /></div>
          <p className="text-gray-600 text-xs">No additional images yet. Click "Add Image URL" to add more.</p>
        </div>
      )}

      {displayUrls.map((url, i) => (
        <div key={i} className="flex gap-2 items-center">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 border border-gray-700">
            {url
              ? <img src={url} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = "none"; }} />
              : <div className="w-full h-full flex items-center justify-center text-gray-600"><ImgIcon /></div>}
          </div>
          <input type="url" value={url} onChange={e => update(i, e.target.value)} placeholder={`Image URL ${i + 1}`}
            className="flex-1 min-w-0 bg-transparent border border-gray-600 p-2.5 rounded-lg focus:outline-none focus:border-gold transition text-white text-sm" />
          <div className="flex flex-col gap-0.5">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-gray-500 hover:text-gold transition disabled:opacity-20 text-xs p-0.5">▲</button>
            <button type="button" onClick={() => move(i,  1)} disabled={i === displayUrls.length - 1} className="text-gray-500 hover:text-gold transition disabled:opacity-20 text-xs p-0.5">▼</button>
          </div>
          <button type="button" onClick={() => remove(i)} className="text-gray-500 hover:text-red-400 transition flex-shrink-0"><TrashIcon /></button>
        </div>
      ))}

      {displayUrls.length > 0 && (
        <p className="text-gray-600 text-xs">First image is the main thumbnail. Common URL is always appended last.</p>
      )}
    </div>
  );
};

const CategorySelector = ({ value, onChange, categoryOptions, setCategoryOptions }) => {
  const [showInlineAdd, setShowInlineAdd] = useState(false);
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [newName, setNewName]             = useState("");
  const [newSlug, setNewSlug]             = useState("");
  const [adding, setAdding]               = useState(false);
  const [err, setErr]                     = useState("");
  const dropdownRef                       = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel = value
    ? categoryOptions.find(c => String(c.id) === String(value))?.name || "Select category"
    : "No Category";

  const handleAdd = async () => {
    if (!newName.trim()) { setErr("Name is required."); return; }
    setAdding(true); setErr("");
    try {
      const r = await ADMIN_API.post("admin/categories/", { name: newName.trim(), slug: newSlug.trim() });
      setCategoryOptions(prev => [...prev, r.data]);
      onChange(String(r.data.id));
      setNewName(""); setNewSlug(""); setShowInlineAdd(false);
    } catch (e) {
      setErr(parseError(e));
    } finally { setAdding(false); }
  };

  const allOptions = [{ id: "", name: "No Category" }, ...categoryOptions];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div ref={dropdownRef} className="flex-1 relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(v => !v)}
            className={`w-full flex items-center justify-between bg-transparent border p-3 rounded-lg text-sm transition focus:outline-none ${
              dropdownOpen ? "border-gold text-white" : "border-gray-600 text-white hover:border-gray-500"
            }`}
          >
            <span className={value ? "text-white" : "text-gray-400"}>{selectedLabel}</span>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.ul
                initial={{ opacity: 0, y: -6, scaleY: 0.95 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -6, scaleY: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{ transformOrigin: "top" }}
                className="absolute z-50 w-full mt-1.5 rounded-xl border border-gray-700 bg-gray-900 shadow-2xl overflow-hidden"
              >
                {allOptions.map(c => {
                  const isSelected = String(c.id) === String(value) || (c.id === "" && !value);
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => { onChange(String(c.id)); setDropdownOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                          isSelected
                            ? "bg-gold/15 text-gold"
                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span>{c.name}</span>
                        {isSelected && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <button type="button" onClick={() => { setShowInlineAdd(v => !v); setErr(""); setNewName(""); setNewSlug(""); }}
          title="Add new category"
          className={`flex-shrink-0 p-3 rounded-lg border transition text-sm ${
            showInlineAdd ? "border-gold/40 bg-gold/10 text-gold" : "border-gray-600 text-gray-400 hover:border-gold/40 hover:text-gold hover:bg-gold/5"
          }`}>
          <PlusIcon />
        </button>
      </div>
      <AnimatePresence>
        {showInlineAdd && (
          <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
            className="border border-gold/20 bg-gold/5 rounded-xl p-3 space-y-2">
            <p className="text-xs text-gold font-medium mb-1">New Category</p>
            {err && <p className="text-red-400 text-xs">{err}</p>}
            <input type="text" placeholder="Category name" value={newName}
              onChange={e => {
                setNewName(e.target.value);
                setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                setErr("");
              }}
              className="w-full bg-transparent border border-gray-600 focus:border-gold p-2 rounded-lg text-white text-sm focus:outline-none transition" />
            <input type="text" placeholder="Slug (auto-filled)" value={newSlug}
              onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}
              className="w-full bg-transparent border border-gray-600 focus:border-gold p-2 rounded-lg text-white text-sm focus:outline-none transition font-mono" />
            <div className="flex gap-2">
              <button type="button" onClick={handleAdd} disabled={adding}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/15 border border-gold/30 text-gold rounded-lg text-xs hover:bg-gold/25 transition disabled:opacity-50">
                <CheckIcon /> {adding ? "Creating..." : "Create & Select"}
              </button>
              <button type="button" onClick={() => { setShowInlineAdd(false); setErr(""); }}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-600 text-gray-400 rounded-lg text-xs hover:border-gray-400 transition">
                <XIcon /> Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { admin, adminLogout, checking } = useContext(AdminContext);
  const navigate = useNavigate();
  const [tab, setTab]               = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { adminLogout(); navigate("/admin/login"); };

  useEffect(() => {
    if (!checking && !admin) navigate("/admin/login");
  }, [checking, admin, navigate]);

  const handleTabChange = (key) => {
    setTab(key);
    setSidebarOpen(false);
  };

  if (checking) return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  );
  if (!admin) return null;

  const navItems = [
    { key:"overview",   label:"Overview",   Ic:DashIcon   },
    { key:"users",      label:"Users",      Ic:UsersIcon  },
    { key:"products",   label:"Products",   Ic:BoxIcon    },
    { key:"categories", label:"Categories", Ic:TagIcon    },
    { key:"orders",     label:"Orders",     Ic:OrdersIcon },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gold/10 flex items-center justify-between">
        <div>
          <a href="/" className="text-2xl font-luxury text-gold">LUXE</a>
          <p className="text-xs text-gray-500 mt-0.5">Admin Console</p>
        </div>
        <button
          className="lg:hidden text-gray-400 hover:text-white transition"
          onClick={() => setSidebarOpen(false)}
        >
          <CloseIcon />
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ key, label, Ic }) => (
          <button key={key} onClick={() => handleTabChange(key)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
              tab === key ? "bg-gold/10 text-gold border border-gold/20" : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}>
            <Ic /> {label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gold/10">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-semibold flex-shrink-0">
            {(admin.full_name || admin.username || "A")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-white truncate">{admin.full_name || admin.username}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-red-400 transition rounded-lg hover:bg-red-400/5">
          <LogoutIcon /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-dark flex">
      {/* ── Desktop Sidebar ─────────────────────────────── */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 glass border-r border-gold/10 flex-col">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ──────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-72 glass border-r border-gold/10 flex flex-col lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 glass border-b border-gold/10 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-gold hover:bg-gold/10 transition"
          >
            <MenuIcon />
          </button>
          <a href="/" className="text-lg font-luxury text-gold">LUXE Admin</a>
          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-semibold">
            {(admin.full_name || admin.username || "A")[0].toUpperCase()}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {tab === "overview"   && <OverviewTab   key="overview"   />}
            {tab === "users"      && <UsersTab      key="users"      />}
            {tab === "products"   && <ProductsTab   key="products"   />}
            {tab === "categories" && <CategoriesTab key="categories" />}
            {tab === "orders"     && <OrdersTab     key="orders"     />}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ═══ OVERVIEW ════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
//  OverviewTab — drop-in replacement for the existing OverviewTab in
//  AdminDashboard.jsx.
//
//  Dependencies (already available in most Vite/CRA setups):
//    npm install recharts
//
//  API endpoints consumed:
//    GET admin/stats/           → { total_users, total_products, total_orders, total_revenue }
//    GET admin/orders/          → [ { id, status, total, created_at, ... } ]
//    GET admin/products/        → [ { id, category: { name } | null, ... } ]
//    GET admin/users/           → [ { id, date_joined, ... } ]
//
//  All chart data is derived client-side from those four endpoints so no
//  backend changes are needed.
// ═══════════════════════════════════════════════════════════════════════════

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { ADMIN_API } from "../../context/AdminContext";

// ── palette ──────────────────────────────────────────────────────────────────
const GOLD    = "#c8963e";
const TEAL    = "#2aaa80";
const BLUE    = "#5a8fc8";
const PURPLE  = "#7f77dd";
const CORAL   = "#d96038";
const AMBER   = "#e0941a";
const GRAY    = "#888780";

const STATUS_COLORS = {
  pending:   AMBER,
  confirmed: BLUE,
  shipped:   PURPLE,
  delivered: TEAL,
  cancelled: CORAL,
};

// ── helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
  "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const parseDate = (s) => new Date(s);

const startOf = {
  week: () => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    d.setHours(0, 0, 0, 0);
    return d;
  },
  month: () => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    d.setHours(0, 0, 0, 0);
    return d;
  },
  year: () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 11);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  },
};

// group orders into buckets depending on filter
const bucketOrders = (orders, filter) => {
  const cutoff = startOf[filter]();
  const inRange = orders.filter((o) => parseDate(o.created_at) >= cutoff);

  if (filter === "week") {
    // last 7 days, label = Mon / Tue …
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        label: d.toLocaleDateString("en-IN", { weekday: "short" }),
        date: d.toDateString(),
        revenue: 0,
        orders: 0,
      });
    }
    inRange.forEach((o) => {
      const key = parseDate(o.created_at).toDateString();
      const slot = days.find((d) => d.date === key);
      if (slot) { slot.revenue += Number(o.total); slot.orders += 1; }
    });
    return days.map(({ label, revenue, orders }) => ({ label, revenue: Math.round(revenue), orders }));
  }

  if (filter === "month") {
    // last 30 days split into ~5-day buckets for readability (6 buckets)
    const buckets = Array.from({ length: 6 }, (_, i) => {
      const end = new Date();
      end.setDate(end.getDate() - i * 5);
      const start = new Date(end);
      start.setDate(start.getDate() - 4);
      return {
        label: start.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        start,
        end: new Date(end.setHours(23, 59, 59, 999)),
        revenue: 0,
        orders: 0,
      };
    }).reverse();
    inRange.forEach((o) => {
      const d = parseDate(o.created_at);
      const slot = buckets.find((b) => d >= b.start && d <= b.end);
      if (slot) { slot.revenue += Number(o.total); slot.orders += 1; }
    });
    return buckets.map(({ label, revenue, orders }) => ({ label, revenue: Math.round(revenue), orders }));
  }

  // year → last 12 months
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    months.push({
      label: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      month: d.getMonth(),
      year: d.getFullYear(),
      revenue: 0,
      orders: 0,
    });
  }
  inRange.forEach((o) => {
    const d = parseDate(o.created_at);
    const slot = months.find(
      (m) => m.month === d.getMonth() && m.year === d.getFullYear()
    );
    if (slot) { slot.revenue += Number(o.total); slot.orders += 1; }
  });
  return months.map(({ label, revenue, orders }) => ({ label, revenue: Math.round(revenue), orders }));
};

// orders by status counts
const ordersByStatus = (orders) => {
  const counts = {};
  orders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

// products by category
const productsByCategory = (products) => {
  const counts = {};
  products.forEach((p) => {
    const cat =
      (typeof p.category === "object" ? p.category?.name : null) || "Uncategorised";
    counts[cat] = (counts[cat] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
};

// user growth — cumulative per month for last 12 months
const userGrowthData = (users) => {
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    months.push({
      label: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      month: d.getMonth(),
      year: d.getFullYear(),
      new: 0,
    });
  }
  users.forEach((u) => {
    const d = parseDate(u.date_joined);
    const slot = months.find(
      (m) => m.month === d.getMonth() && m.year === d.getFullYear()
    );
    if (slot) slot.new += 1;
  });
  let cum = 0;
  // also count users older than 12 months
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 11);
  cutoff.setDate(1);
  cutoff.setHours(0, 0, 0, 0);
  cum = users.filter((u) => parseDate(u.date_joined) < cutoff).length;
  return months.map((m) => { cum += m.new; return { label: m.label, users: cum, new: m.new }; });
};

// ── sub-components ────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass rounded-2xl p-4 sm:p-6"
  >
    <p className="text-gray-400 text-sm mb-1">{label}</p>
    <p className={`text-2xl sm:text-3xl font-luxury ${color || "text-gold"}`}>{value}</p>
    {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
  </motion.div>
);

const ChartCard = ({ title, children, controls }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass rounded-2xl p-4 sm:p-6"
  >
    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {controls}
    </div>
    {children}
  </motion.div>
);

const FilterPills = ({ value, onChange, options }) => (
  <div className="flex gap-1">
    {options.map((o) => (
      <button
        key={o.value}
        onClick={() => onChange(o.value)}
        className={`text-xs px-3 py-1 rounded-full border transition-all ${
          value === o.value
            ? "bg-gold/15 border-gold/40 text-gold"
            : "border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

// custom recharts tooltip skin
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 shadow-lg text-xs border border-gold/20">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {formatter ? formatter(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

const RCOLORS = [GOLD, TEAL, BLUE, PURPLE, CORAL, AMBER, GRAY];

// custom donut label
const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.05) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={500}>
      {Math.round(percent * 100)}%
    </text>
  );
};

// ── main component ─────────────────────────────────────────────────────────────
export default function OverviewTab() {
  const [stats,    setStats]    = useState(null);
  const [orders,   setOrders]   = useState([]);
  const [products, setProducts] = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [revFilter, setRevFilter] = useState("month");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [sRes, oRes, pRes, uRes] = await Promise.all([
          ADMIN_API.get("admin/stats/"),
          ADMIN_API.get("admin/orders/"),
          ADMIN_API.get("admin/products/"),
          ADMIN_API.get("admin/users/"),
        ]);
        setStats(sRes.data);
        setOrders(oRes.data.results || oRes.data);
        setProducts(pRes.data.results || pRes.data);
        setUsers(uRes.data.results || uRes.data);
      } catch {}
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  // derived chart data
  const revenueData  = useMemo(() => bucketOrders(orders, revFilter), [orders, revFilter]);
  const statusData   = useMemo(() => ordersByStatus(orders), [orders]);
  const categoryData = useMemo(() => productsByCategory(products), [products]);
  const growthData   = useMemo(() => userGrowthData(users), [users]);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <p className="text-gray-400">Loading dashboard…</p>
    </div>
  );

  const revFilterOpts = [
    { label: "Week",  value: "week"  },
    { label: "Month", value: "month" },
    { label: "Year",  value: "year"  },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <h2 className="text-2xl sm:text-3xl font-luxury text-gold">Dashboard Overview</h2>

      {/* ── stat cards ─────────────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          <StatCard label="Total Users"    value={stats.total_users}    sub="registered accounts" />
          <StatCard label="Total Products" value={stats.total_products} sub="in catalogue" />
          <StatCard label="Total Orders"   value={stats.total_orders}   sub="all time" />
          <StatCard
            label="Total Revenue"
            value={fmt(stats.total_revenue)}
            sub="confirmed + delivered"
            color="text-gold"
          />
        </div>
      )}

      {/* ── row 1: Revenue + Orders by status ──────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

        {/* Revenue — spans 3 of 5 cols on xl */}
        <div className="xl:col-span-3">
          <ChartCard
            title="Revenue"
            controls={
              <FilterPills
                value={revFilter}
                onChange={setRevFilter}
                options={revFilterOpts}
              />
            }
          >
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={GOLD} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={GOLD} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={BLUE} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={BLUE} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill: "#6b6b6b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="rev" tick={{ fill: "#6b6b6b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => "₹"+Intl.NumberFormat("en-IN",{notation:"compact"}).format(v)} width={56} />
                <YAxis yAxisId="ord" orientation="right" tick={{ fill: "#6b6b6b", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
                <Tooltip
                  content={<CustomTooltip formatter={(v, n) => n === "Revenue" ? fmt(v) : v} />}
                />
                <Area yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue" stroke={GOLD} strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: GOLD }} />
                <Area yAxisId="ord" type="monotone" dataKey="orders"  name="Orders"  stroke={BLUE} strokeWidth={1.5} fill="url(#ordGrad)" dot={false} activeDot={{ r: 4, fill: BLUE }} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 rounded" style={{ background: GOLD }}></span>Revenue</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 rounded border-t border-dashed" style={{ borderColor: BLUE }}></span>Orders</span>
            </div>
          </ChartCard>
        </div>

        {/* Orders by status — spans 2 of 5 cols */}
        <div className="xl:col-span-2">
          <ChartCard title="Orders by status">
            {statusData.length === 0 ? (
              <p className="text-gray-600 text-sm py-8 text-center">No orders yet.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius="45%"
                      outerRadius="70%"
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                      label={renderCustomLabel}
                    >
                      {statusData.map((entry, i) => (
                        <Cell
                          key={entry.name}
                          fill={STATUS_COLORS[entry.name] || RCOLORS[i % RCOLORS.length]}
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) =>
                        active && payload?.length ? (
                          <div className="glass rounded-xl px-3 py-2 text-xs border border-gold/20">
                            <p className="font-medium capitalize" style={{ color: STATUS_COLORS[payload[0].name] || GOLD }}>
                              {payload[0].name}
                            </p>
                            <p className="text-gray-400">{payload[0].value} order{payload[0].value !== 1 ? "s" : ""}</p>
                          </div>
                        ) : null
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* legend */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
                  {statusData.map((s, i) => (
                    <span key={s.name} className="flex items-center gap-1.5 text-xs text-gray-400">
                      <span
                        className="inline-block w-2 h-2 rounded-sm flex-shrink-0"
                        style={{ background: STATUS_COLORS[s.name] || RCOLORS[i % RCOLORS.length] }}
                      />
                      <span className="capitalize">{s.name}</span>
                      <span className="text-gray-600">({s.value})</span>
                    </span>
                  ))}
                </div>
              </>
            )}
          </ChartCard>
        </div>
      </div>

      {/* ── row 2: Products by category + User growth ──────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Products by category */}
        <ChartCard title="Products by category">
          {categoryData.length === 0 ? (
            <p className="text-gray-600 text-sm py-8 text-center">No products yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 0, right: 24, bottom: 0, left: 0 }}
                barCategoryGap="28%"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fill: "#6b6b6b", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fill: "#9a9994", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => v.length > 13 ? v.slice(0, 12) + "…" : v}
                />
                <Tooltip
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="glass rounded-xl px-3 py-2 text-xs border border-gold/20">
                        <p className="text-gray-400 mb-0.5">{label}</p>
                        <p style={{ color: GOLD }} className="font-medium">{payload[0].value} product{payload[0].value !== 1 ? "s" : ""}</p>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="count" name="Products" radius={[0, 4, 4, 0]}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={RCOLORS[i % RCOLORS.length]} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* User growth */}
        <ChartCard title="User growth">
          {growthData.every(d => d.users === 0) ? (
            <p className="text-gray-600 text-sm py-8 text-center">No users yet.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={growthData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={TEAL} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={TEAL} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="newGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={PURPLE} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={PURPLE} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="label" tick={{ fill: "#6b6b6b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b6b6b", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
                  <Tooltip
                    content={({ active, payload, label }) =>
                      active && payload?.length ? (
                        <div className="glass rounded-xl px-3 py-2 text-xs border border-gold/20">
                          <p className="text-gray-400 mb-1">{label}</p>
                          {payload.map((p, i) => (
                            <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
                          ))}
                        </div>
                      ) : null
                    }
                  />
                  <Area type="monotone" dataKey="users" name="Total users" stroke={TEAL}   strokeWidth={2}   fill="url(#userGrad)" dot={false} activeDot={{ r: 4, fill: TEAL }} />
                  <Area type="monotone" dataKey="new"   name="New this month" stroke={PURPLE} strokeWidth={1.5} fill="url(#newGrad)"  dot={false} activeDot={{ r: 4, fill: PURPLE }} strokeDasharray="4 2" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 rounded" style={{ background: TEAL }}></span>Total</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 rounded" style={{ background: PURPLE }}></span>New / month</span>
              </div>
            </>
          )}
        </ChartCard>
      </div>
    </motion.div>
  );
}

// ═══ USERS ═══════════════════════════════════════════════════════════════════
function UsersTab() {
  const [users, setUsers]                 = useState([]);
  const [search, setSearch]               = useState("");
  const [loading, setLoading]             = useState(false);
  const [showAddAdmin, setShowAddAdmin]   = useState(false);
  const [form, setForm]                   = useState({ username:"", email:"", full_name:"", password:"" });
  const [formError, setFormError]         = useState("");
  const [formSuccess, setFormSuccess]     = useState("");
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [banTarget, setBanTarget]         = useState(null);
  const [banLoading, setBanLoading]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await ADMIN_API.get("admin/users/", { params: { search } }); setUsers(r.data.results || r.data); }
    catch { }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { const t = setTimeout(load, 400); return () => clearTimeout(t); }, [load]);

  const toggleStaff    = async (id) => { try { const r = await ADMIN_API.patch(`admin/users/${id}/toggle-staff/`); setUsers(u => u.map(x => x.id === id ? r.data : x)); } catch {} };
  const handleBanClick = (u) => u.is_active ? setBanTarget(u) : ADMIN_API.patch(`admin/users/${u.id}/ban/`).then(r => setUsers(us => us.map(x => x.id === u.id ? r.data : x))).catch(() => {});
  const confirmBan     = async (reason) => { setBanLoading(true); try { const r = await ADMIN_API.patch(`admin/users/${banTarget.id}/ban/`, { reason }); setUsers(u => u.map(x => x.id === banTarget.id ? r.data : x)); setBanTarget(null); } catch {} finally { setBanLoading(false); } };
  const confirmDelete  = async () => { setDeleteLoading(true); try { await ADMIN_API.delete(`admin/users/${deleteTarget.id}/`); setUsers(u => u.filter(x => x.id !== deleteTarget.id)); setDeleteTarget(null); } catch {} finally { setDeleteLoading(false); } };
  const createAdmin    = async (e) => {
    e.preventDefault(); setFormError(""); setFormSuccess("");
    try {
      const r = await ADMIN_API.post("admin/create-admin/", form);
      setUsers(u => [r.data, ...u]);
      setFormSuccess(`Admin "${r.data.username}" created.`);
      setForm({ username:"", email:"", full_name:"", password:"" });
    } catch (err) { setFormError(parseError(err)); }
  };

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-luxury text-gold">Users</h2>
        <button onClick={() => setShowAddAdmin(true)} className="btn-luxury flex items-center gap-2 text-sm"><PlusIcon /> <span className="hidden sm:inline">Add Admin</span><span className="sm:hidden">Admin</span></button>
      </div>
      <div className="relative mb-5 max-w-sm">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><SearchIcon /></span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search username or email..."
          className="w-full bg-transparent border border-gray-700 pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-gold transition text-white" />
      </div>

      {/* Desktop table */}
      <div className="glass rounded-2xl overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700/50 text-gray-400 text-xs uppercase tracking-wide">
                <th className="text-left px-5 py-3">User</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">Role</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Joined</th>
                <th className="text-left px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading...</td></tr>}
              {!loading && users.map(u => (
                <tr key={u.id} className="border-b border-gray-800/50 hover:bg-white/2 transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">
                        {(u.full_name || u.username || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="text-white font-medium">{u.full_name || u.username}</span>
                        <p className="text-gray-500 text-xs">@{u.username}</p>
                        {!u.is_active && u.ban_reason && (
                          <p className="text-red-400 text-xs mt-0.5 truncate max-w-[140px]" title={u.ban_reason}>Reason: {u.ban_reason}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-400">{u.email || "—"}</td>
                  <td className="px-5 py-3"><Badge label={u.is_staff ? "Admin" : "User"} color={u.is_staff ? "gold" : "gray"} /></td>
                  <td className="px-5 py-3"><Badge label={u.is_active ? "Active" : "Banned"} color={u.is_active ? "green" : "red"} /></td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{new Date(u.date_joined).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleStaff(u.id)} title={u.is_staff ? "Revoke admin" : "Make admin"}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gold hover:bg-gold/10 transition"><ShieldIcon /></button>
                      <button onClick={() => handleBanClick(u)} title={u.is_active ? "Ban" : "Unban"}
                        className={`p-1.5 rounded-lg transition ${u.is_active ? "text-gray-400 hover:text-red-400 hover:bg-red-400/10" : "text-green-400 hover:bg-green-400/10"}`}>
                        <Icon d={u.is_active
                          ? ["M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"]
                          : "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"} />
                      </button>
                      <button onClick={() => setDeleteTarget(u)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition"><TrashIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && <tr><td colSpan="6" className="text-center py-8 text-gray-500">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {loading && <p className="text-center py-8 text-gray-500">Loading...</p>}
        {!loading && users.length === 0 && <p className="text-center py-8 text-gray-500">No users found.</p>}
        {!loading && users.map(u => (
          <div key={u.id} className="glass rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center text-gold text-sm font-bold flex-shrink-0">
                  {(u.full_name || u.username || "?")[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{u.full_name || u.username}</p>
                  <p className="text-gray-500 text-xs">@{u.username}</p>
                  <p className="text-gray-400 text-xs truncate">{u.email || "—"}</p>
                  {!u.is_active && u.ban_reason && (
                    <p className="text-red-400 text-xs mt-0.5 truncate" title={u.ban_reason}>Reason: {u.ban_reason}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1 items-end flex-shrink-0">
                <Badge label={u.is_staff ? "Admin" : "User"} color={u.is_staff ? "gold" : "gray"} />
                <Badge label={u.is_active ? "Active" : "Banned"} color={u.is_active ? "green" : "red"} />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-gray-800 pt-3">
              <p className="text-gray-600 text-xs">Joined {new Date(u.date_joined).toLocaleDateString()}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleStaff(u.id)} title={u.is_staff ? "Revoke admin" : "Make admin"}
                  className="p-2 rounded-lg text-gray-400 hover:text-gold hover:bg-gold/10 transition"><ShieldIcon /></button>
                <button onClick={() => handleBanClick(u)} title={u.is_active ? "Ban" : "Unban"}
                  className={`p-2 rounded-lg transition ${u.is_active ? "text-gray-400 hover:text-red-400 hover:bg-red-400/10" : "text-green-400 hover:bg-green-400/10"}`}>
                  <Icon d={u.is_active
                    ? ["M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"]
                    : "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"} />
                </button>
                <button onClick={() => setDeleteTarget(u)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition"><TrashIcon /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showAddAdmin && (
          <Modal title="Create New Admin" onClose={() => { setShowAddAdmin(false); setFormError(""); setFormSuccess(""); }}>
            <form onSubmit={createAdmin} className="space-y-4">
              {formError   && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg">{formError}</p>}
              {formSuccess && <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/30 px-3 py-2 rounded-lg">{formSuccess}</p>}
              {[{key:"username",ph:"Username",type:"text"},{key:"email",ph:"Email",type:"email"},{key:"full_name",ph:"Full Name",type:"text"},{key:"password",ph:"Password",type:"password"}].map(({key,ph,type})=>(
                <input key={key} type={type} placeholder={ph} value={form[key]}
                  onChange={e => setForm(f => ({...f,[key]:e.target.value}))}
                  className="w-full bg-transparent border border-gray-600 p-3 rounded-lg focus:outline-none focus:border-gold transition text-white text-sm"/>
              ))}
              <button type="submit" className="btn-luxury w-full">Create Admin</button>
            </form>
          </Modal>
        )}
        {deleteTarget && <DeleteConfirmModal message={`Delete @${deleteTarget.username}?`} subMessage="This is permanent and cannot be undone." onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
        {banTarget    && <BanModal user={banTarget} onConfirm={confirmBan} onCancel={() => setBanTarget(null)} loading={banLoading} />}
      </AnimatePresence>
    </motion.div>
  );
}

// ═══ PRODUCTS ════════════════════════════════════════════════════════════════
function ProductsTab() {
  const emptyForm = { name:"", description:"", price:"", stock:"", is_available:true, image_urls:[], category:"" };
  const [products,        setProducts]        = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [showModal,       setShowModal]       = useState(false);
  const [editing,         setEditing]         = useState(null);
  const [form,            setForm]            = useState(emptyForm);
  const [formError,       setFormError]       = useState("");
  const [deleteTarget,    setDeleteTarget]    = useState(null);
  const [deleteLoading,   setDeleteLoading]   = useState(false);

  // ── NEW: search & category filter state ──────────────────────────────────
  const [search,          setSearch]          = useState("");
  const [filterCategory,  setFilterCategory]  = useState("");
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const catDropdownRef                        = useRef(null);

  // Close category filter dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target)) {
        setCatDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          ADMIN_API.get("admin/products/"),
          ADMIN_API.get("admin/categories/"),
        ]);
        setProducts(prodRes.data.results || prodRes.data);
        setCategoryOptions(catRes.data.results || catRes.data);
      } catch {}
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  // ── Client-side filtering ────────────────────────────────────────────────
  const filteredProducts = products.filter(p => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q ||
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q);

    const matchesCategory = !filterCategory ||
      String(p.category?.id ?? p.category ?? "") === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const activeFilterCount = (search.trim() ? 1 : 0) + (filterCategory ? 1 : 0);

  const clearFilters = () => { setSearch(""); setFilterCategory(""); };

  const selectedCatLabel = filterCategory
    ? categoryOptions.find(c => String(c.id) === filterCategory)?.name || "Category"
    : "All Categories";

  // ────────────────────────────────────────────────────────────────────────

  const openAdd  = () => { setEditing(null); setForm(emptyForm); setFormError(""); setShowModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name:         p.name,
      description:  p.description,
      price:        p.price,
      stock:        p.stock,
      is_available: p.is_available,
      image_urls:   p.images?.map(img => img.url) || (p.image_url ? [p.image_url] : []),
      category:     String(p.category?.id ?? p.category ?? ""),
    });
    setFormError("");
    setShowModal(true);
  };

  const saveProduct = async (e) => {
    e.preventDefault(); setFormError("");
    const payload = {
      name:         form.name,
      description:  form.description,
      price:        form.price,
      stock:        form.stock,
      is_available: form.is_available,
      image_urls:   form.image_urls.filter(u => u.trim()),
      category_id:  form.category ? Number(form.category) : null,
    };
    try {
      if (editing) {
        const r = await ADMIN_API.patch(`admin/products/${editing.id}/`, payload);
        setProducts(ps => ps.map(p => p.id === editing.id ? r.data : p));
      } else {
        const r = await ADMIN_API.post("admin/products/", payload);
        setProducts(ps => [r.data, ...ps]);
      }
      setShowModal(false);
    } catch (err) {
      setFormError(parseError(err));
    }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try { await ADMIN_API.delete(`admin/products/${deleteTarget.id}/`); setProducts(ps => ps.filter(p => p.id !== deleteTarget.id)); setDeleteTarget(null); }
    catch {} finally { setDeleteLoading(false); }
  };

  const toggleAvailable = async (p) => {
    try {
      const r = await ADMIN_API.patch(`admin/products/${p.id}/`, { is_available: !p.is_available });
      setProducts(ps => ps.map(x => x.id === p.id ? r.data : x));
    } catch {}
  };

  const getThumb   = (p) => p.images?.length > 0 ? p.images[0].url : p.image_url || p.image || "";
  const getCatName = (p) => {
    if (!p.category) return null;
    if (typeof p.category === "object") return p.category.name;
    return categoryOptions.find(c => c.id === p.category)?.name || null;
  };

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-luxury text-gold">Products</h2>
        <button onClick={openAdd} className="btn-luxury flex items-center gap-2 text-sm">
          <PlusIcon /> <span className="hidden sm:inline">Add Product</span><span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* ── Search + Category Filter Bar ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search input */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or description..."
            className="w-full bg-transparent border border-gray-700 pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-gold transition text-white"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
            >
              <XIcon />
            </button>
          )}
        </div>

        {/* Category filter dropdown */}
        <div ref={catDropdownRef} className="relative sm:w-52 flex-shrink-0">
          <button
            type="button"
            onClick={() => setCatDropdownOpen(v => !v)}
            className={`w-full flex items-center justify-between gap-2 border px-3 py-2.5 rounded-lg text-sm transition focus:outline-none ${
              filterCategory
                ? "border-gold/50 bg-gold/8 text-gold"
                : catDropdownOpen
                  ? "border-gold text-white bg-transparent"
                  : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white bg-transparent"
            }`}
          >
            <span className="flex items-center gap-2 min-w-0">
              <FilterIcon />
              <span className="truncate">{selectedCatLabel}</span>
            </span>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              className={`flex-shrink-0 transition-transform duration-200 ${catDropdownOpen ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <AnimatePresence>
            {catDropdownOpen && (
              <motion.ul
                initial={{ opacity: 0, y: -6, scaleY: 0.95 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -6, scaleY: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{ transformOrigin: "top" }}
                className="absolute z-50 w-full mt-1.5 rounded-xl border border-gray-700 bg-gray-900 shadow-2xl overflow-hidden"
              >
                {/* "All" option */}
                <li>
                  <button
                    type="button"
                    onClick={() => { setFilterCategory(""); setCatDropdownOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                      !filterCategory
                        ? "bg-gold/15 text-gold"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>All Categories</span>
                    {!filterCategory && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                </li>
                {categoryOptions.map(c => {
                  const isSelected = String(c.id) === filterCategory;
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => { setFilterCategory(String(c.id)); setCatDropdownOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                          isSelected
                            ? "bg-gold/15 text-gold"
                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span>{c.name}</span>
                        {isSelected && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Active filter chips + result count */}
      {(activeFilterCount > 0 || !loading) && (
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <p className="text-gray-500 text-xs">
            {loading ? "Loading…" : `${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""}${activeFilterCount > 0 ? " found" : ""}`}
          </p>
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {search.trim() && (
                <span className="flex items-center gap-1 text-xs bg-gold/10 border border-gold/25 text-yellow-400 px-2.5 py-1 rounded-full">
                  "{search.trim()}"
                  <button onClick={() => setSearch("")} className="ml-0.5 hover:text-white transition"><XIcon /></button>
                </span>
              )}
              {filterCategory && (
                <span className="flex items-center gap-1 text-xs bg-gold/10 border border-gold/25 text-yellow-400 px-2.5 py-1 rounded-full">
                  {selectedCatLabel}
                  <button onClick={() => setFilterCategory("")} className="ml-0.5 hover:text-white transition"><XIcon /></button>
                </span>
              )}
              <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-white transition underline underline-offset-2">
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
      {/* ─────────────────────────────────────────────────────────────────── */}

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <>
          {filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-12 text-center"
            >
              <div className="flex justify-center mb-3 text-gray-600">
                <SearchIcon />
              </div>
              <p className="text-gray-400 text-sm font-medium mb-1">No products found</p>
              <p className="text-gray-600 text-xs">
                {activeFilterCount > 0 ? "Try adjusting your search or filter." : "Add your first product to get started."}
              </p>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="mt-4 text-xs text-gold hover:text-yellow-300 transition underline underline-offset-2">
                  Clear filters
                </button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {filteredProducts.map(p => (
                <motion.div key={p.id} layout className="glass rounded-2xl overflow-hidden">
                  <div className="relative h-44 bg-gray-900">
                    {getThumb(p)
                      ? <img src={getThumb(p)} alt={p.name} className="h-full w-full object-cover" />
                      : <div className="h-full flex items-center justify-center text-gray-700"><ImgIcon /></div>}
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      <Badge label={p.is_available ? "Live" : "Hidden"} color={p.is_available ? "green" : "red"} />
                      {p.stock === 0 && <Badge label="Out of Stock" color="red" />}
                    </div>
                    {p.images?.length > 1 && (
                      <div className="absolute bottom-2 left-2">
                        <span className="bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">{p.images.length} photos</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <h3 className="font-semibold text-white truncate">{p.name}</h3>
                      {getCatName(p) && (
                        <span className="flex-shrink-0 text-xs bg-gold/10 border border-gold/20 text-yellow-500 px-2 py-0.5 rounded-full">
                          {getCatName(p)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5 truncate">{p.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-gold font-semibold text-sm">₹ {Number(p.price).toLocaleString("en-IN")}</span>
                      <span className={`text-xs ${p.stock === 0 ? "text-red-400" : "text-gray-500"}`}>Stock: {p.stock}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1 text-xs border border-gray-600 text-gray-300 hover:border-gold hover:text-gold py-2 rounded-lg transition">
                        <EditIcon /> Edit
                      </button>
                      <button onClick={() => toggleAvailable(p)} className={`flex-1 text-xs border py-2 rounded-lg transition ${p.is_available ? "border-yellow-600/40 text-yellow-500 hover:bg-yellow-600/10" : "border-green-500/40 text-green-400 hover:bg-green-500/10"}`}>
                        {p.is_available ? "Hide" : "Show"}
                      </button>
                      <button onClick={() => setDeleteTarget(p)} className="p-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-400/10 transition"><TrashIcon /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {showModal && (
          <Modal title={editing ? "Edit Product" : "Add New Product"} onClose={() => setShowModal(false)} maxW="max-w-xl">
            <form onSubmit={saveProduct} className="space-y-4">
              {formError && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg">{formError}</p>}
              <input type="text" placeholder="Product Name" value={form.name}
                onChange={e => setForm(f => ({...f,name:e.target.value}))}
                className="w-full bg-transparent border border-gray-600 p-3 rounded-lg focus:outline-none focus:border-gold transition text-white text-sm" />
              <textarea placeholder="Description" value={form.description} rows={3}
                onChange={e => setForm(f => ({...f,description:e.target.value}))}
                className="w-full bg-transparent border border-gray-600 p-3 rounded-lg focus:outline-none focus:border-gold transition text-white text-sm resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Price (₹)" value={form.price}
                  onChange={e => setForm(f => ({...f,price:e.target.value}))}
                  className="w-full bg-transparent border border-gray-600 p-3 rounded-lg focus:outline-none focus:border-gold transition text-white text-sm" />
                <input type="number" placeholder="Stock Quantity" value={form.stock}
                  onChange={e => setForm(f => ({...f,stock:e.target.value}))}
                  className="w-full bg-transparent border border-gray-600 p-3 rounded-lg focus:outline-none focus:border-gold transition text-white text-sm" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Category</p>
                <CategorySelector
                  value={form.category}
                  onChange={val => setForm(f => ({...f, category: val}))}
                  categoryOptions={categoryOptions}
                  setCategoryOptions={setCategoryOptions}
                />
              </div>
              <div className="border border-gray-700 rounded-xl p-4">
                <ImageUrlsInput urls={form.image_urls} onChange={urls => setForm(f => ({...f,image_urls:urls}))} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input type="checkbox" checked={form.is_available} onChange={e => setForm(f => ({...f,is_available:e.target.checked}))} className="w-4 h-4 accent-yellow-500" />
                Visible on site
              </label>
              <button type="submit" className="btn-luxury w-full">{editing ? "Save Changes" : "Add Product"}</button>
            </form>
          </Modal>
        )}
        {deleteTarget && (
          <DeleteConfirmModal message={`Remove "${deleteTarget.name}"?`} subMessage="This product will be permanently deleted."
            onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ═══ CATEGORIES ══════════════════════════════════════════════════════════════
function CategoriesTab() {
  const [categories,    setCategories]    = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [showModal,     setShowModal]     = useState(false);
  const [editingCat,    setEditingCat]    = useState(null);
  const [catName,       setCatName]       = useState("");
  const [catSlug,       setCatSlug]       = useState("");
  const [catError,      setCatError]      = useState("");
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await ADMIN_API.get("admin/categories/"); setCategories(r.data.results || r.data); }
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setEditingCat(null); setCatName(""); setCatSlug(""); setCatError(""); setShowModal(true); };
  const openEdit = (c) => { setEditingCat(c); setCatName(c.name); setCatSlug(c.slug); setCatError(""); setShowModal(true); };

  const saveCategory = async (e) => {
    e.preventDefault(); setCatError("");
    try {
      if (editingCat) {
        const r = await ADMIN_API.patch(`admin/categories/${editingCat.id}/`, { name: catName, slug: catSlug });
        setCategories(cs => cs.map(c => c.id === editingCat.id ? r.data : c));
      } else {
        const r = await ADMIN_API.post("admin/categories/", { name: catName, slug: catSlug });
        setCategories(cs => [...cs, r.data]);
      }
      setShowModal(false);
    } catch (err) { setCatError(parseError(err)); }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try { await ADMIN_API.delete(`admin/categories/${deleteTarget.id}/`); setCategories(cs => cs.filter(c => c.id !== deleteTarget.id)); setDeleteTarget(null); }
    catch {} finally { setDeleteLoading(false); }
  };

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-luxury text-gold">Categories</h2>
        <button onClick={openAdd} className="btn-luxury flex items-center gap-2 text-sm"><PlusIcon /> <span className="hidden sm:inline">Add Category</span><span className="sm:hidden">Add</span></button>
      </div>
      {loading ? <p className="text-gray-400">Loading...</p> : (
        <>
          {/* Desktop table */}
          <div className="glass rounded-2xl overflow-hidden hidden sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700/50 text-gray-400 text-xs uppercase tracking-wide">
                    <th className="text-left px-5 py-3">Name</th>
                    <th className="text-left px-5 py-3">Slug</th>
                    <th className="text-left px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 && <tr><td colSpan="3" className="text-center py-12 text-gray-500">No categories yet.</td></tr>}
                  {categories.map(c => (
                    <tr key={c.id} className="border-b border-gray-800/50 hover:bg-white/2 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold flex-shrink-0"><TagIcon /></div>
                          <span className="text-white font-medium">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4"><span className="font-mono text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-md">{c.slug}</span></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-gray-400 hover:text-gold hover:bg-gold/10 transition"><EditIcon /></button>
                          <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition"><TrashIcon /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile card list */}
          <div className="sm:hidden space-y-3">
            {categories.length === 0 && <p className="text-center py-12 text-gray-500">No categories yet.</p>}
            {categories.map(c => (
              <div key={c.id} className="glass rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold flex-shrink-0"><TagIcon /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium">{c.name}</p>
                  <p className="font-mono text-xs text-gray-400 mt-0.5">{c.slug}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(c)} className="p-2 rounded-lg text-gray-400 hover:text-gold hover:bg-gold/10 transition"><EditIcon /></button>
                  <button onClick={() => setDeleteTarget(c)} className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition"><TrashIcon /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <AnimatePresence>
        {showModal && (
          <Modal title={editingCat ? "Edit Category" : "Add Category"} onClose={() => setShowModal(false)}>
            <form onSubmit={saveCategory} className="space-y-4">
              {catError && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg">{catError}</p>}
              <input type="text" placeholder="Category Name" value={catName}
                onChange={e => { setCatName(e.target.value); if (!editingCat) setCatSlug(e.target.value.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"")); }}
                className="w-full bg-transparent border border-gray-600 p-3 rounded-lg focus:outline-none focus:border-gold transition text-white text-sm" />
              <div>
                <input type="text" placeholder="Slug (e.g. mens-wear)" value={catSlug}
                  onChange={e => setCatSlug(e.target.value.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,""))}
                  className="w-full bg-transparent border border-gray-600 p-3 rounded-lg focus:outline-none focus:border-gold transition text-white text-sm" />
                <p className="text-gray-600 text-xs mt-1">Auto-generated from name, can be customised.</p>
              </div>
              <button type="submit" className="btn-luxury w-full">{editingCat ? "Save Changes" : "Create Category"}</button>
            </form>
          </Modal>
        )}
        {deleteTarget && (
          <DeleteConfirmModal message={`Delete "${deleteTarget.name}"?`} subMessage="Products in this category will lose their category assignment."
            onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ═══ ORDERS ══════════════════════════════════════════════════════════════════
function OrdersTab() {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [filters,  setFilters]  = useState({ status:"", search:"", from:"", to:"" });
  const STATUS_OPTIONS = ["","pending","confirmed","shipped","delivered","cancelled"];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      if (filters.from)   params.from   = filters.from;
      if (filters.to)     params.to     = filters.to;
      const r = await ADMIN_API.get("admin/orders/", { params });
      setOrders(r.data.results || r.data);
    } catch {} finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { const t = setTimeout(load, 400); return () => clearTimeout(t); }, [load]);

  const updateStatus = async (id, s) => {
    try { const r = await ADMIN_API.patch(`admin/orders/${id}/`, { status: s }); setOrders(os => os.map(o => o.id === id ? r.data : o)); } catch {}
  };
  const setFilter = (key, val) => setFilters(f => ({...f, [key]:val}));

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
      <h2 className="text-2xl sm:text-3xl font-luxury text-gold mb-6">Orders</h2>

      <div className="glass rounded-2xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><SearchIcon /></span>
          <input value={filters.search} onChange={e => setFilter("search",e.target.value)} placeholder="Search user..."
            className="w-full bg-transparent border border-gray-700 pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:border-gold transition text-white" />
        </div>
        <select value={filters.status} onChange={e => setFilter("status",e.target.value)}
          className="bg-dark border border-gray-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-gold transition text-white">
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase()+s.slice(1) : "All Statuses"}</option>)}
        </select>
        <input type="date" value={filters.from} onChange={e => setFilter("from",e.target.value)}
          className="bg-dark border border-gray-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-gold transition text-white" />
        <input type="date" value={filters.to} onChange={e => setFilter("to",e.target.value)}
          className="bg-dark border border-gray-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-gold transition text-white" />
      </div>

      {loading ? <p className="text-gray-400">Loading orders...</p> : (
        <div className="space-y-3">
          {orders.length === 0 && <p className="text-gray-500 text-center py-12">No orders found.</p>}
          {orders.map(order => (
            <motion.div key={order.id} layout className="glass rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 cursor-pointer hover:bg-white/2 transition"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                <div className="flex-1 min-w-0">
                  <div className="sm:hidden space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium text-sm">#{order.id} — {order.username}</p>
                      <Badge label={order.status} color={statusColor(order.status)} />
                    </div>
                    <p className="text-gray-500 text-xs">{order.email}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-500 text-xs">{new Date(order.created_at).toLocaleDateString()}</p>
                      <p className="text-gold font-semibold text-sm">₹ {Number(order.total).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                  <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div><p className="text-gray-500 text-xs">Order</p><p className="text-white font-medium">#{order.id}</p></div>
                    <div><p className="text-gray-500 text-xs">Customer</p><p className="text-white">{order.username}</p><p className="text-gray-500 text-xs">{order.email}</p></div>
                    <div><p className="text-gray-500 text-xs">Date</p><p className="text-white">{new Date(order.created_at).toLocaleDateString()}</p></div>
                    <div><p className="text-gray-500 text-xs">Total</p><p className="text-gold font-semibold">₹ {Number(order.total).toLocaleString("en-IN")}</p></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <span className="hidden sm:block"><Badge label={order.status} color={statusColor(order.status)} /></span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`text-gray-400 transition-transform flex-shrink-0 ${expanded === order.id ? "rotate-180" : ""}`}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>
              <AnimatePresence>
                {expanded === order.id && (
                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }}
                    exit={{ height:0, opacity:0 }} transition={{ duration:0.25 }}
                    className="border-t border-gray-700/50 overflow-hidden">
                    <div className="p-4 sm:p-5">
                      <h4 className="text-sm font-semibold text-gray-300 mb-3">Items</h4>
                      <div className="space-y-2 mb-5">
                        {(order.items || []).map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-300">{item.name} × {item.quantity}</span>
                            <span className="text-gold">₹ {Number(item.subtotal).toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">Update Status</h4>
                      <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.filter(Boolean).map(s => (
                          <button key={s} onClick={() => updateStatus(order.id, s)}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                              order.status === s ? "border-gold bg-gold/15 text-gold" : "border-gray-700 text-gray-400 hover:border-gold/50 hover:text-gold"
                            }`}>
                            {s.charAt(0).toUpperCase()+s.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
