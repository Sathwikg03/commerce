import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import API from "../services/api";

const statusColor = (s) => ({
  pending:   "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  shipped:   "bg-purple-500/15 text-purple-400 border-purple-500/30",
  delivered: "bg-green-500/15 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
}[s] || "bg-gray-500/15 text-gray-400 border-gray-500/30");

const statusIcon = (s) => {
  const icons = {
    pending:   "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
    confirmed: "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
    shipped:   "M5 12h14M12 5l7 7-7 7",
    delivered: "M20 6L9 17l-5-5",
    cancelled: "M18 6L6 18M6 6l12 12",
  };
  return icons[s] || icons.pending;
};

const EmptyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-700">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/>
    <path d="M9 12h6M9 16h4"/>
  </svg>
);

export default function MyOrders() {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    API.get("orders/")
      .then(res => setOrders(res.data.results || res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-lg">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 gap-6">
        <EmptyIcon />
        <h2 className="text-3xl font-luxury text-gold">No Orders Yet</h2>
        <p className="text-gray-400 max-w-sm">
          You haven't placed any orders. Explore our collection and find something beautiful.
        </p>
        <Link to="/products" className="btn-luxury">Explore Collection</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 md:px-16 py-12 max-w-4xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-luxury text-gold mb-3 text-center"
      >
        My Orders
      </motion.h2>
      <p className="text-gray-400 text-center mb-10 text-sm">
        {orders.length} order{orders.length !== 1 ? "s" : ""} placed
      </p>

      <div className="space-y-4">
        {orders.map((order, idx) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="glass rounded-2xl overflow-hidden"
          >
            {/* ── Order Header (clickable to expand) ── */}
            <div
              className="flex items-center gap-4 p-5 cursor-pointer hover:bg-white/2 transition"
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
            >
              {/* Status icon */}
              <div className={`w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0 ${statusColor(order.status)}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={statusIcon(order.status)} />
                </svg>
              </div>

              {/* Info grid */}
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Order ID</p>
                  <p className="text-white font-medium">#{order.id}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Date</p>
                  <p className="text-white">{new Date(order.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Items</p>
                  <p className="text-white">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Total</p>
                  <p className="text-gold font-semibold">₹ {Number(order.total).toLocaleString("en-IN")}</p>
                </div>
              </div>

              {/* Status badge + chevron */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full border capitalize ${statusColor(order.status)}`}>
                  {order.status}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" className={`text-gray-400 transition-transform duration-300 ${expanded === order.id ? "rotate-180" : ""}`}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>

            {/* ── Expanded order items ── */}
            <AnimatePresence>
              {expanded === order.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden border-t border-gray-700/50"
                >
                  <div className="p-5">
                    <h4 className="text-sm font-semibold text-gray-300 mb-4">Items in this order</h4>
                    <div className="space-y-3">
                      {order.items.map(item => (
                        <div key={item.id}
                          className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0">
                          <div>
                            <p className="text-white text-sm font-medium">{item.name}</p>
                            <p className="text-gray-500 text-xs mt-0.5">
                              ₹ {Number(item.price).toLocaleString("en-IN")} × {item.quantity}
                            </p>
                          </div>
                          <p className="text-gold font-semibold text-sm">
                            ₹ {Number(item.subtotal).toLocaleString("en-IN")}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Order total summary */}
                    <div className="mt-4 pt-4 border-t border-gray-700/50 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">Order placed on</p>
                        <p className="text-gray-300 text-sm">
                          {new Date(order.created_at).toLocaleString("en-IN", {
                            day:"numeric", month:"long", year:"numeric",
                            hour:"2-digit", minute:"2-digit"
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Order Total</p>
                        <p className="text-gold text-lg font-luxury">
                          ₹ {Number(order.total).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}