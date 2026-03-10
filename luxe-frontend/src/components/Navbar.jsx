import { Link, useLocation } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { NotificationContext } from "../context/NotificationContext";
import { WishlistContext } from "../context/WishlistContext";

// ── Icons ─────────────────────────────────────────────────────────────────────
const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const LoginIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
    <polyline points="10 17 15 12 10 7"/>
    <line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
);
const OrdersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);
const CollectionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const WishlistIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const PackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const MenuIcon = ({ open }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open
      ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
      : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
    }
  </svg>
);

// ── Notification Bell ─────────────────────────────────────────────────────────
function NotificationBell() {
  const { notifications, markRead, markAllRead, deleteNotification, clearAll } = useContext(NotificationContext);
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);
  const unreadCount     = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const typeIcon  = (type) => type === "order" ? <PackageIcon /> : <TagIcon />;
  const typeColor = (type) => type === "order" ? "text-blue-400" : "text-amber-400";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`relative p-1 transition-colors duration-200 ${open ? "text-gold" : "text-gray-400 hover:text-gold"}`}
        aria-label="Notifications">
        <motion.div
          animate={unreadCount > 0 ? { rotate: [0, -10, 10, -8, 8, 0] } : {}}
          transition={{ duration: 0.5, delay: 1, repeat: Infinity, repeatDelay: 8 }}>
          <BellIcon />
        </motion.div>
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span key="badge"
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="absolute -top-1.5 -right-1.5 bg-gold text-black font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none"
              style={{ fontSize: "10px" }}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-[calc(100%+12px)] w-80 z-50 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            style={{ background: "rgba(10,10,14,0.96)", backdropFilter: "blur(20px)" }}>
            <div className="absolute -top-1.5 right-3 w-3 h-3 rotate-45 border-l border-t border-white/10"
              style={{ background: "rgba(10,10,14,0.96)" }} />
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h4 className="text-sm font-semibold text-white tracking-wide">Notifications</h4>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button onClick={markAllRead}
                    className="flex items-center gap-1 text-xs text-gold hover:text-yellow-300 transition-colors">
                    <CheckIcon /> Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clearAll}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors border border-gray-700/60 hover:border-red-400/40 px-2 py-0.5 rounded-full">
                    Clear all
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">No notifications yet.</div>
              ) : (
                notifications.map((n) => (
                  <motion.div key={n.id} layout
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0, paddingTop: 0, paddingBottom: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`group flex items-start gap-3 px-4 py-3 transition-colors duration-150 ${
                      n.read ? "hover:bg-white/3" : "bg-gold/5 hover:bg-gold/8"
                    }`}>
                    <button onClick={() => markRead(n.id)} className="flex items-start gap-3 flex-1 min-w-0 text-left">
                      <span className={`mt-0.5 flex-shrink-0 ${typeColor(n.type)}`}>{typeIcon(n.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${n.read ? "text-gray-300" : "text-white"}`}>{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                      </div>
                    </button>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-600">{n.time}</span>
                        <button onClick={() => deleteNotification(n.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-gray-600 hover:text-red-400 rounded-full hover:bg-red-400/10 p-0.5">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-gold" />}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            <div className="px-4 py-2.5 border-t border-white/5 text-center">
              <Link to="/orders" onClick={() => setOpen(false)}
                className="text-xs text-gray-500 hover:text-gold transition-colors">
                View all orders →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
export default function Navbar() {
  const { user, logout }       = useContext(AuthContext);
  const { cart }               = useContext(CartContext);
  const { wishlistCount }      = useContext(WishlistContext);
  const location               = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const itemCount = cart?.item_count || 0;

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const navLinks = [
    { to: "/",         label: "Home",       Icon: HomeIcon       },
    ...(user ? [
      { to: "/products", label: "Collection", Icon: CollectionIcon },
      { to: "/orders",   label: "My Orders",  Icon: OrdersIcon     },
    ] : []),
  ];

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const close = () => setMenuOpen(false);

  return (
    <>
      <nav className="fixed w-full z-50 glass border-b border-white/5" style={{ height: "68px" }}>
        <div className="h-full max-w-screen-xl mx-auto px-5 md:px-8 flex items-center justify-between md:grid md:items-center"
          style={{ gridTemplateColumns: "1fr auto 1fr" }}>

          {/* ── Logo ── */}
          <Link to="/" className="text-2xl font-luxury text-gold tracking-widest z-10">LUXE</Link>

          {/* ── Desktop center links ── */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to}
                className={`relative text-sm tracking-wide transition-colors duration-200 pb-0.5 ${
                  isActive(to) ? "text-gold" : "text-gray-300 hover:text-white"
                }`}>
                {label}
                {isActive(to) && (
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-gold rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* ── Desktop right actions ── */}
          <div className="hidden md:flex items-center justify-end gap-3">
            {user ? (
              <>
                {/* Wishlist */}
                <Link to="/wishlist"
                  className={`relative p-1 transition-colors duration-200 ${
                    isActive("/wishlist") ? "text-gold" : "text-gray-400 hover:text-gold"
                  }`}
                  aria-label="Wishlist">
                  <HeartIcon />
                  {wishlistCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 bg-gold text-black font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none"
                      style={{ fontSize: "10px" }}>
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </motion.span>
                  )}
                </Link>

                {/* Cart */}
                <Link to="/cart" className="relative text-gray-400 hover:text-gold transition-colors p-1">
                  <CartIcon />
                  {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-gold text-black font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none"
                      style={{ fontSize: "10px" }}>
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </Link>

                {/* Notifications */}
                <NotificationBell />

                {/* Profile */}
                <Link to="/profile"
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-300 border border-gray-600/70 px-3 py-1.5 rounded-full hover:border-gold/50 hover:text-gold transition-all duration-200 max-w-[140px]">
                  <UserIcon /><span className="truncate">{user.name}</span>
                </Link>

                {user.is_staff && (
                  <Link to="/admin/dashboard"
                    className="flex items-center gap-1.5 text-xs font-medium text-gold border border-gold/40 px-3 py-1.5 rounded-full hover:bg-gold hover:text-black transition-all duration-200">
                    <ShieldIcon />Admin
                  </Link>
                )}
                <button onClick={logout}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-400 border border-gray-600/70 px-3 py-1.5 rounded-full hover:border-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all duration-200">
                  <LogoutIcon />Logout
                </button>
              </>
            ) : (
              <Link to="/login"
                className="flex items-center gap-1.5 text-xs font-medium text-gold border border-gold/40 px-4 py-1.5 rounded-full hover:bg-gold hover:text-black transition-all duration-200">
                <LoginIcon />Login
              </Link>
            )}
          </div>

          {/* ── Mobile right: wishlist + cart + bell + hamburger ── */}
          <div className="flex md:hidden items-center gap-3 ml-auto">
            {user && (
              <>
                {/* Wishlist */}
                <Link to="/wishlist"
                  className={`relative p-1 transition-colors duration-200 ${
                    isActive("/wishlist") ? "text-gold" : "text-gray-400 hover:text-gold"
                  }`}>
                  <HeartIcon />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-gold text-black font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none"
                      style={{ fontSize: "10px" }}>
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <Link to="/cart" className="relative text-gray-400 hover:text-gold transition-colors p-1">
                  <CartIcon />
                  {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-gold text-black font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none"
                      style={{ fontSize: "10px" }}>
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </Link>

                <NotificationBell />
              </>
            )}
            <button onClick={() => setMenuOpen(o => !o)}
              className="text-gray-300 hover:text-gold transition-colors p-1">
              <MenuIcon open={menuOpen} />
            </button>
          </div>

        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={close} />

            <motion.div key="drawer"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 right-0 h-full z-50 w-72 glass border-l border-gold/10 flex flex-col md:hidden">

              <div className="flex items-center justify-between px-6 py-5 border-b border-gold/10">
                <span className="text-xl font-luxury text-gold tracking-widest">LUXE</span>
                <button onClick={close} className="text-gray-400 hover:text-gold transition-colors">
                  <MenuIcon open={true} />
                </button>
              </div>

              {user && (
                <div className="px-6 py-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold text-sm font-semibold">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium truncate max-w-[160px]">{user.name}</p>
                      <p className="text-gray-500 text-xs">{user.is_staff ? "Administrator" : "Member"}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {navLinks.map(({ to, label, Icon }) => (
                  <Link key={to} to={to} onClick={close}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                      isActive(to)
                        ? "bg-gold/10 text-gold border border-gold/20"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}>
                    <Icon /> {label}
                  </Link>
                ))}

                <div className="h-px bg-white/5 my-3" />

                {user ? (
                  <>
                    {/* Wishlist link in drawer */}
                    <Link to="/wishlist" onClick={close}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                        isActive("/wishlist")
                          ? "bg-gold/10 text-gold border border-gold/20"
                          : "text-gray-300 hover:text-white hover:bg-white/5"
                      }`}>
                      <WishlistIcon />
                      Wishlist
                      {wishlistCount > 0 && (
                        <span className="ml-auto text-xs font-bold text-black bg-gold rounded-full w-5 h-5 flex items-center justify-center">
                          {wishlistCount > 9 ? "9+" : wishlistCount}
                        </span>
                      )}
                    </Link>

                    <Link to="/profile" onClick={close}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all">
                      <UserIcon /> Profile
                    </Link>
                    {user.is_staff && (
                      <Link to="/admin/dashboard" onClick={close}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gold hover:bg-gold/10 transition-all">
                        <ShieldIcon /> Admin Panel
                      </Link>
                    )}
                    <button onClick={() => { logout(); close(); }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all">
                      <LogoutIcon /> Logout
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={close}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gold border border-gold/30 hover:bg-gold/10 transition-all">
                    <LoginIcon /> Login
                  </Link>
                )}
              </div>

              <div className="px-6 py-4 border-t border-white/5">
                <p className="text-gray-600 text-xs text-center">© 2026 LUXE. All rights reserved.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}