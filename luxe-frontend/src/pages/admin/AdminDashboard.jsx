import { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AdminContext, ADMIN_API } from "../../context/AdminContext";

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const UsersIcon  = () => <Icon d={["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75","M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"]} />;
const BoxIcon    = () => <Icon d={["M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"]} />;
const OrdersIcon = () => <Icon d={["M9 11l3 3L22 4","M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"]} />;
const DashIcon   = () => <Icon d={["M3 3h7v7H3z","M14 3h7v7h-7z","M14 14h7v7h-7z","M3 14h7v7H3z"]} />;
const LogoutIcon = () => <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" />;
const PlusIcon   = () => <Icon d="M12 5v14M5 12h14" />;
const TrashIcon  = () => <Icon d={["M3 6h18","M19 6l-1 14H6L5 6","M10 11v6M14 11v6","M9 6V4h6v2"]} />;
const EditIcon   = () => <Icon d={["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7","M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"]} />;
const SearchIcon = () => <Icon d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0" />;
const ShieldIcon = () => <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
const ImgIcon    = () => <Icon d={["M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z","M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z","M21 15l-5-5L5 21"]} />;

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
  <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="glass rounded-2xl p-6">
    <p className="text-gray-400 text-sm mb-1">{label}</p>
    <p className="text-3xl font-luxury text-gold">{value}</p>
    {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
  </motion.div>
);

const Modal = ({ title, onClose, children, maxW = "max-w-lg" }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
    <motion.div initial={{ scale:0.92, opacity:0 }} animate={{ scale:1, opacity:1 }}
      className={`relative glass rounded-2xl p-8 w-full ${maxW} shadow-luxury z-10 max-h-[90vh] overflow-y-auto`}>
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
  const add    = ()       => onChange([...urls, ""]);
  const remove = (i)      => onChange(urls.filter((_, idx) => idx !== i));
  const update = (i, v)   => onChange(urls.map((u, idx) => idx === i ? v : u));
  const move   = (i, dir) => { const n = [...urls]; [n[i], n[i+dir]] = [n[i+dir], n[i]]; onChange(n); };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-300 font-medium">Product Images</p>
        <button type="button" onClick={add}
          className="flex items-center gap-1 text-xs text-gold hover:text-yellow-300 transition border border-gold/30 px-2 py-1 rounded-lg hover:bg-gold/10">
          <PlusIcon /> Add Image URL
        </button>
      </div>
      {urls.length === 0 && (
        <div className="border border-dashed border-gray-700 rounded-lg p-4 text-center">
          <div className="flex justify-center mb-2 text-gray-600"><ImgIcon /></div>
          <p className="text-gray-600 text-xs">No images yet. Click "Add Image URL" to add product images.</p>
        </div>
      )}
      {urls.map((url, i) => (
        <div key={i} className="flex gap-2 items-center">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 border border-gray-700">
            {url
              ? <img src={url} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display="none"; }} />
              : <div className="w-full h-full flex items-center justify-center text-gray-600"><ImgIcon /></div>
            }
          </div>
          <input type="url" value={url} onChange={e => update(i, e.target.value)} placeholder={`Image URL ${i+1}`}
            className="flex-1 bg-transparent border border-gray-600 p-2.5 rounded-lg focus:outline-none focus:border-gold transition text-white text-sm" />
          <div className="flex flex-col gap-0.5">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-gray-500 hover:text-gold transition disabled:opacity-20 text-xs p-0.5">▲</button>
            <button type="button" onClick={() => move(i,  1)} disabled={i === urls.length-1} className="text-gray-500 hover:text-gold transition disabled:opacity-20 text-xs p-0.5">▼</button>
          </div>
          <button type="button" onClick={() => remove(i)} className="text-gray-500 hover:text-red-400 transition flex-shrink-0"><TrashIcon /></button>
        </div>
      ))}
      {urls.length > 0 && <p className="text-gray-600 text-xs">First image is the main thumbnail. Use ▲▼ to reorder.</p>}
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { admin, adminLogout, checking } = useContext(AdminContext);
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");

  const handleLogout = () => { adminLogout(); navigate("/admin/login"); };

  // ✅ Wait for AdminContext to finish reading localStorage before deciding to redirect
  useEffect(() => {
    if (!checking && !admin) navigate("/admin/login");
  }, [checking, admin, navigate]);

  // Show nothing while still checking localStorage
  if (checking) return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </div>
  );

  if (!admin) return null;

  const navItems = [
    { key:"overview", label:"Overview",  Ic:DashIcon   },
    { key:"users",    label:"Users",     Ic:UsersIcon  },
    { key:"products", label:"Products",  Ic:BoxIcon    },
    { key:"orders",   label:"Orders",    Ic:OrdersIcon },
  ];

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 glass border-r border-gold/10 flex flex-col">
        <div className="p-6 border-b border-gold/10">
          <p className="text-2xl font-luxury text-gold">LUXE</p>
          <p className="text-xs text-gray-500 mt-0.5">Admin Console</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ key, label, Ic }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                tab === key ? "bg-gold/10 text-gold border border-gold/20" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}>
              <Ic /> {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gold/10">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-semibold">
              {admin.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-white">{admin.username}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-red-400 transition rounded-lg hover:bg-red-400/5">
            <LogoutIcon /> Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto p-8">
        <AnimatePresence mode="wait">
          {tab === "overview" && <OverviewTab  key="overview" />}
          {tab === "users"    && <UsersTab     key="users"    />}
          {tab === "products" && <ProductsTab  key="products" />}
          {tab === "orders"   && <OrdersTab    key="orders"   />}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ═══ OVERVIEW ════════════════════════════════════════════════════════════════
function OverviewTab() {
  const [stats, setStats] = useState(null);
  useEffect(() => { ADMIN_API.get("admin/stats/").then(r => setStats(r.data)).catch(() => {}); }, []);
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
      <h2 className="text-3xl font-luxury text-gold mb-8">Dashboard Overview</h2>
      {stats ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard label="Total Users"    value={stats.total_users}    sub="registered accounts" />
          <StatCard label="Total Products" value={stats.total_products} sub="in catalogue" />
          <StatCard label="Total Orders"   value={stats.total_orders}   sub="all time" />
          <StatCard label="Total Revenue"  value={`₹${Number(stats.total_revenue).toLocaleString("en-IN")}`} sub="confirmed + delivered" />
        </div>
      ) : <p className="text-gray-400">Loading stats...</p>}
    </motion.div>
  );
}

// ═══ USERS ═══════════════════════════════════════════════════════════════════
function UsersTab() {
  const [users, setUsers]               = useState([]);
  const [search, setSearch]             = useState("");
  const [loading, setLoading]           = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [form, setForm]                 = useState({ username:"", email:"", full_name:"", password:"" });
  const [formError, setFormError]       = useState("");
  const [formSuccess, setFormSuccess]   = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [banTarget, setBanTarget]       = useState(null);
  const [banLoading, setBanLoading]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await ADMIN_API.get("admin/users/", { params: { search } }); setUsers(r.data.results || r.data); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { const t = setTimeout(load, 400); return () => clearTimeout(t); }, [load]);

  const toggleStaff    = async (id) => { const r = await ADMIN_API.patch(`admin/users/${id}/toggle-staff/`); setUsers(u => u.map(x => x.id === id ? r.data : x)); };
  const handleBanClick = (u) => u.is_active ? setBanTarget(u) : ADMIN_API.patch(`admin/users/${u.id}/ban/`).then(r => setUsers(us => us.map(x => x.id === u.id ? r.data : x)));
  const confirmBan     = async (reason) => { setBanLoading(true); try { const r = await ADMIN_API.patch(`admin/users/${banTarget.id}/ban/`, { reason }); setUsers(u => u.map(x => x.id === banTarget.id ? r.data : x)); setBanTarget(null); } finally { setBanLoading(false); } };
  const confirmDelete  = async () => { setDeleteLoading(true); try { await ADMIN_API.delete(`admin/users/${deleteTarget.id}/`); setUsers(u => u.filter(x => x.id !== deleteTarget.id)); setDeleteTarget(null); } finally { setDeleteLoading(false); } };
  const createAdmin    = async (e) => {
    e.preventDefault(); setFormError(""); setFormSuccess("");
    try { const r = await ADMIN_API.post("admin/create-admin/", form); setUsers(u => [r.data, ...u]); setFormSuccess(`Admin "${r.data.username}" created.`); setForm({ username:"", email:"", full_name:"", password:"" }); }
    catch (err) { const d = err.response?.data; setFormError(typeof d === "object" ? Object.values(d).flat()[0] : "Failed."); }
  };

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-luxury text-gold">Users</h2>
        <button onClick={() => setShowAddAdmin(true)} className="btn-luxury flex items-center gap-2 text-sm"><PlusIcon /> Add Admin</button>
      </div>

      <div className="relative mb-5 max-w-sm">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><SearchIcon /></span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search username or email..."
          className="w-full bg-transparent border border-gray-700 pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-gold transition text-white" />
      </div>

      <div className="glass rounded-2xl overflow-hidden">
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
                    <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center text-gold text-xs font-bold">{u.username[0].toUpperCase()}</div>
                    <div>
                      <span className="text-white font-medium">{u.username}</span>
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
  const emptyForm = { name:"", description:"", price:"", stock:"", is_available:true, image_urls:[] };
  const [products,       setProducts]      = useState([]);
  const [loading,        setLoading]       = useState(false);
  const [showModal,      setShowModal]     = useState(false);
  const [editing,        setEditing]       = useState(null);
  const [form,           setForm]          = useState(emptyForm);
  const [formError,      setFormError]     = useState("");
  const [deleteTarget,   setDeleteTarget]  = useState(null);
  const [deleteLoading,  setDeleteLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await ADMIN_API.get("admin/products/"); setProducts(r.data.results || r.data); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

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
    });
    setFormError("");
    setShowModal(true);
  };

  const saveProduct = async (e) => {
    e.preventDefault(); setFormError("");
    const payload = { ...form, image_urls: form.image_urls.filter(u => u.trim()) };
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
      const d = err.response?.data;
      setFormError(typeof d === "object" ? Object.values(d).flat()[0] : "Failed to save.");
    }
  };

  const confirmDelete   = async () => {
    setDeleteLoading(true);
    try { await ADMIN_API.delete(`admin/products/${deleteTarget.id}/`); setProducts(ps => ps.filter(p => p.id !== deleteTarget.id)); setDeleteTarget(null); }
    finally { setDeleteLoading(false); }
  };
  const toggleAvailable = async (p) => {
    const r = await ADMIN_API.patch(`admin/products/${p.id}/`, { is_available: !p.is_available });
    setProducts(ps => ps.map(x => x.id === p.id ? r.data : x));
  };
  const getThumb = (p) => p.images?.length > 0 ? p.images[0].url : p.image_url || p.image || "";

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-luxury text-gold">Products</h2>
        <button onClick={openAdd} className="btn-luxury flex items-center gap-2 text-sm"><PlusIcon /> Add Product</button>
      </div>

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {products.map(p => (
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
                <h3 className="font-semibold text-white truncate">{p.name}</h3>
                <p className="text-gray-400 text-xs mt-0.5 truncate">{p.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-gold font-semibold text-sm">₹ {Number(p.price).toLocaleString("en-IN")}</span>
                  <span className={`text-xs ${p.stock === 0 ? "text-red-400" : "text-gray-500"}`}>Stock: {p.stock}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1 text-xs border border-gray-600 text-gray-300 hover:border-gold hover:text-gold py-1.5 rounded-lg transition">
                    <EditIcon /> Edit
                  </button>
                  <button onClick={() => toggleAvailable(p)} className={`flex-1 text-xs border py-1.5 rounded-lg transition ${p.is_available ? "border-yellow-600/40 text-yellow-500 hover:bg-yellow-600/10" : "border-green-500/40 text-green-400 hover:bg-green-500/10"}`}>
                    {p.is_available ? "Hide" : "Show"}
                  </button>
                  <button onClick={() => setDeleteTarget(p)} className="p-1.5 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-400/10 transition"><TrashIcon /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
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
          <DeleteConfirmModal message={`Remove "${deleteTarget.name}"?`} subMessage="This product will be permanently deleted from the site."
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
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { const t = setTimeout(load, 400); return () => clearTimeout(t); }, [load]);

  const updateStatus = async (id, s) => {
    const r = await ADMIN_API.patch(`admin/orders/${id}/`, { status: s });
    setOrders(os => os.map(o => o.id === id ? r.data : o));
  };
  const setFilter = (key, val) => setFilters(f => ({...f, [key]:val}));

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
      <h2 className="text-3xl font-luxury text-gold mb-6">Orders</h2>

      <div className="glass rounded-2xl p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
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
              <div className="flex items-center gap-4 p-5 cursor-pointer hover:bg-white/2 transition"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div><p className="text-gray-500 text-xs">Order</p><p className="text-white font-medium">#{order.id}</p></div>
                  <div><p className="text-gray-500 text-xs">Customer</p><p className="text-white">{order.username}</p><p className="text-gray-500 text-xs">{order.email}</p></div>
                  <div><p className="text-gray-500 text-xs">Date</p><p className="text-white">{new Date(order.created_at).toLocaleDateString()}</p></div>
                  <div><p className="text-gray-500 text-xs">Total</p><p className="text-gold font-semibold">₹ {Number(order.total).toLocaleString("en-IN")}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge label={order.status} color={statusColor(order.status)} />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`text-gray-400 transition-transform ${expanded === order.id ? "rotate-180" : ""}`}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>
              <AnimatePresence>
                {expanded === order.id && (
                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }}
                    exit={{ height:0, opacity:0 }} transition={{ duration:0.25 }}
                    className="border-t border-gray-700/50 overflow-hidden">
                    <div className="p-5">
                      <h4 className="text-sm font-semibold text-gray-300 mb-3">Items</h4>
                      <div className="space-y-2 mb-5">
                        {order.items.map(item => (
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