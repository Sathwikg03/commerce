import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

const WithNav = ({ children }) => (
  <>
    <Navbar />
    <div className="pt-24">{children}</div>
  </>
);

function App() {
  return (
    <Routes>
      {/* Admin — no Navbar */}
      <Route path="/admin/login"     element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* Public / User — with Navbar */}
      <Route path="/"         element={<WithNav><Home /></WithNav>} />
      <Route path="/products" element={<WithNav><Products /></WithNav>} />
      <Route path="/login"    element={<WithNav><Login /></WithNav>} />
      <Route path="/signup"   element={<WithNav><Signup /></WithNav>} />
      <Route path="/cart"     element={<WithNav><Cart /></WithNav>} />
      <Route path="/orders"   element={<WithNav><MyOrders /></WithNav>} />
    </Routes>
  );
}

export default App;