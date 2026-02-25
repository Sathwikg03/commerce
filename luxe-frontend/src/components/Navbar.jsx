import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { cart }         = useContext(CartContext);
  const itemCount        = cart?.item_count || 0;

  return (
    <nav className="fixed w-full z-50 px-12 py-5 glass flex justify-between items-center">

      {/* Logo */}
      <Link to="/" className="text-3xl font-luxury text-gold tracking-wide">LUXE</Link>

      {/* Nav Links */}
      <div className="space-x-8 hidden md:flex items-center">
        <Link to="/" className="hover:text-gold transition duration-300 text-sm">Home</Link>
        <Link to="/products" className="hover:text-gold transition duration-300 text-sm">Collection</Link>
        {user && (
          <Link to="/orders" className="hover:text-gold transition duration-300 text-sm">My Orders</Link>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5">

        {/* Cart icon */}
        {user && (
          <Link to="/cart" className="relative text-gray-300 hover:text-gold transition duration-300">
            <CartIcon />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
        )}

        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-gold font-medium hidden sm:inline text-sm">{user.name}</span>

            {/* Admin Panel button — staff only */}
            {user.is_staff && (
              <Link to="/admin/dashboard"
                className="flex items-center gap-1.5 text-xs border border-gold/50 text-gold px-3 py-1.5 rounded-lg hover:bg-gold/10 transition-all duration-300">
                <ShieldIcon />
                Admin Panel
              </Link>
            )}

            <button onClick={logout} className="btn-luxury text-sm">Logout</button>
          </div>
        ) : (
          <Link to="/login" className="btn-luxury">Login</Link>
        )}
      </div>
    </nav>
  );
}