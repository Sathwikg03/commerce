import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../components/ProductCard";
import API from "../services/api";

// ── Icons ─────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const SortIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6"  x2="21" y2="6"/>
    <line x1="6" y1="12" x2="18" y2="12"/>
    <line x1="9" y1="18" x2="15" y2="18"/>
  </svg>
);
const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const ChevronDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ── Sort options ──────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { label: "Newest First",      value: "-created_at" },
  { label: "Oldest First",      value: "created_at"  },
  { label: "Price: Low → High", value: "price"       },
  { label: "Price: High → Low", value: "-price"      },
  { label: "Name: A → Z",       value: "name"        },
  { label: "Name: Z → A",       value: "-name"       },
];

// ── Reusable custom dropdown ──────────────────────────────────────────────────
function CustomDropdown({ icon: IconComp, label, options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);
  const selected        = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border transition-all duration-200 whitespace-nowrap ${
          open || value
            ? "border-gold/50 text-gold bg-gold/5"
            : "border-gray-700 text-gray-300 hover:border-gold/40 hover:text-gold bg-transparent"
        }`}
      >
        <IconComp />
        <span>{selected ? selected.label : placeholder}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-52 z-30 rounded-xl overflow-hidden"
            style={{
              background: "rgba(18,18,18,0.97)",
              border: "1px solid rgba(212,175,55,0.2)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
              backdropFilter: "blur(16px)",
            }}
          >
            {/* Header */}
            <div className="px-4 py-2.5 border-b border-white/5">
              <p className="text-gray-500 text-xs uppercase tracking-widest">{label}</p>
            </div>

            {/* Options */}
            <div className="py-1.5 max-h-64 overflow-y-auto">
              {options.map(opt => {
                const active = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    className={`flex items-center justify-between w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${
                      active
                        ? "text-gold bg-gold/8"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {active && <CheckIcon />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Products Page ────────────────────────────────────────────────────────
export default function Products() {
  const [products,       setProducts]       = useState([]);
  const [categories,     setCategories]     = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState("");
  const [activeCategory, setActiveCategory] = useState("");   // "" = All
  const [sortOrder,      setSortOrder]      = useState("-created_at");

  useEffect(() => {
    API.get("categories/")
      .then(res => setCategories(res.data.results || res.data))
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ordering: sortOrder };
      if (search.trim())  params.search   = search.trim();
      if (activeCategory) params.category = activeCategory;
      const res = await API.get("products/", { params });
      setProducts(res.data.results || res.data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 350);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const clearFilters    = () => { setSearch(""); setActiveCategory(""); setSortOrder("-created_at"); };
  const hasActiveFilters = search.trim() || activeCategory || sortOrder !== "-created_at";

  // Build category options for dropdown
  const categoryOptions = [
    { label: "All Categories", value: "" },
    ...categories.map(c => ({ label: c.name, value: c.slug })),
  ];

  return (
    <div className="min-h-screen px-4 md:px-16 py-12">

      {/* ── Header ── */}
      <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-luxury text-gold mb-3">Our Collection</h2>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Discover our curated selection of luxury pieces
        </p>
      </motion.div>

      {/* ── Search + Category + Sort row ── */}
      <motion.div
        initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        className="max-w-4xl mx-auto mb-6 flex flex-wrap gap-3 items-center"
      >
        {/* Search bar — grows to fill space */}
        <div className="relative flex-1 min-w-[180px]">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><SearchIcon /></span>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full border border-gray-700 focus:border-gold pl-12 pr-10 py-2.5 rounded-xl text-white text-sm focus:outline-none transition duration-300 placeholder-gray-600"
            style={{ background: "rgba(255,255,255,0.03)" }}
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.8 }}
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold transition">
                <XIcon />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Category dropdown */}
        {categories.length > 0 && (
          <CustomDropdown
            icon={TagIcon}
            label="Category"
            placeholder="All Categories"
            options={categoryOptions}
            value={activeCategory}
            onChange={setActiveCategory}
          />
        )}

        {/* Sort dropdown */}
        <CustomDropdown
          icon={SortIcon}
          label="Sort By"
          placeholder="Newest First"
          options={SORT_OPTIONS}
          value={sortOrder}
          onChange={setSortOrder}
        />
      </motion.div>

      {/* ── Active filter summary ── */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
            className="max-w-4xl mx-auto mb-6 flex items-center gap-3 overflow-hidden"
          >
            <span className="text-gray-500 text-xs">
              {!loading && `${products.length} result${products.length !== 1 ? "s" : ""}`}
              {search        && <span className="text-gold"> · "{search}"</span>}
              {activeCategory && <span className="text-gold"> · {categories.find(c => c.slug === activeCategory)?.name}</span>}
            </span>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition border border-gray-700 hover:border-red-400/40 px-2.5 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <XIcon /> Reset
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Products Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl h-[560px] animate-pulse"
              style={{ background: "rgba(255,255,255,0.04)" }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-center py-24 space-y-4">
          <p className="text-5xl">🔍</p>
          <h3 className="text-2xl font-luxury text-gold">No products found</h3>
          <p className="text-gray-400 text-sm">
            {hasActiveFilters ? "Try adjusting your search or filters." : "No products are available right now."}
          </p>
          {hasActiveFilters && <button onClick={clearFilters} className="btn-luxury mt-2">Clear Filters</button>}
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <AnimatePresence mode="popLayout">
            {products.map((product, i) => (
              <motion.div key={product.id} layout
                initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, scale:0.95 }} transition={{ delay: i * 0.05, duration:0.35 }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}