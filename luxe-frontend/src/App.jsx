import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { WishlistProvider } from "./context/WishlistContext";

const WithNav = ({ children }) => (
  <>
    <Navbar />
    <div className="pt-[68px]">{children}</div>
  </>
);

function App() {
  return (
    <WishlistProvider>
      <Routes>
        {/* Admin — no Navbar */}
        <Route path="/admin/login"     element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Public / User — with Navbar */}
        <Route path="/"              element={<WithNav><Home /></WithNav>} />
        <Route path="/products"      element={<WithNav><Products /></WithNav>} />
        <Route path="/products/:id"  element={<WithNav><ProductDetail /></WithNav>} />
        <Route path="/login"         element={<WithNav><Login /></WithNav>} />
        <Route path="/signup"        element={<WithNav><Signup /></WithNav>} />
        <Route path="/cart"          element={<WithNav><Cart /></WithNav>} />
        <Route path="/orders"        element={<WithNav><MyOrders /></WithNav>} />
        <Route path="/profile"       element={<WithNav><Profile /></WithNav>} />
        <Route path="/wishlist"      element={<WithNav><Wishlist /></WithNav>} />
      </Routes>
    </WishlistProvider>
  );
}

export default App;