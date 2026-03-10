import { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className="text-gold">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const OrdersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate          = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    API.get("profile/")
      .then(res => setProfile(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleLogout = () => { logout(); navigate("/"); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Loading profile...</p>
    </div>
  );

  const displayName = profile?.full_name || profile?.username || user?.name || "—";
  const joinDate    = profile?.date_joined
    ? new Date(profile.date_joined).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })
    : "—";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Avatar card */}
        <div className="glass rounded-2xl p-8 shadow-luxury text-center mb-4">

          {/* Avatar circle */}
          <div className="w-24 h-24 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-5">
            <UserIcon />
          </div>

          {/* Name */}
          <h2 className="text-2xl font-luxury text-gold mb-1">{displayName}</h2>
          <p className="text-gray-500 text-sm">@{profile?.username}</p>

          {/* Role badge */}
          <div className="flex justify-center mt-3">
            {profile?.is_staff ? (
              <span className="flex items-center gap-1.5 text-xs text-gold border border-gold/40 bg-gold/10 px-3 py-1 rounded-full">
                <ShieldIcon /> Administrator
              </span>
            ) : (
              <span className="text-xs text-gray-500 border border-gray-700 px-3 py-1 rounded-full">
                Member
              </span>
            )}
          </div>
        </div>

        {/* Info card */}
        <div className="glass rounded-2xl overflow-hidden mb-4">
          {[
            { label: "Email",    value: profile?.email    || "—" },
            { label: "Username", value: profile?.username || "—" },
            { label: "Member since", value: joinDate },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center px-6 py-4 border-b border-gray-800/60 last:border-0">
              <span className="text-gray-500 text-sm">{label}</span>
              <span className="text-white text-sm font-medium">{value}</span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Link to="/orders"
            className="flex items-center justify-center gap-2 w-full text-sm font-medium text-gray-300 border border-gray-700 px-4 py-3 rounded-xl hover:border-gold/50 hover:text-gold transition-all duration-200">
            <OrdersIcon />
            My Orders
          </Link>

          {profile?.is_staff && (
            <Link to="/admin/dashboard"
              className="flex items-center justify-center gap-2 w-full text-sm font-medium text-gold border border-gold/40 px-4 py-3 rounded-xl hover:bg-gold hover:text-black transition-all duration-200">
              <ShieldIcon />
              Go to Admin Panel
            </Link>
          )}

          <button onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full text-sm font-medium text-gray-400 border border-gray-700 px-4 py-3 rounded-xl hover:border-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all duration-200">
            <LogoutIcon />
            Logout
          </button>
        </div>
      </motion.div>
    </div>
  );
}