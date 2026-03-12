import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 6 15 12 9 18"/>
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
            <div className="px-4 py-2.5 border-b border-white/5">
              <p className="text-gray-500 text-xs uppercase tracking-widest">{label}</p>
            </div>
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

// ── helpers ───────────────────────────────────────────────────────────────────
// Recursively collect all pages from a paginated DRF endpoint
async function fetchAllPages(params = {}) {
  let results = [];
  let url     = "products/";
  while (url) {
    const res  = await API.get(url, { params: url === "products/" ? params : undefined });
    const data = res.data;
    if (Array.isArray(data)) {
      // Not paginated
      return data;
    }
    results = results.concat(data.results || []);
    // next is an absolute URL like http://…/api/products/?page=2
    // strip to relative path so axios baseURL still works
    if (data.next) {
      try {
        const u   = new URL(data.next);
        url       = u.pathname.replace(/^\/api\//, "") + u.search;
      } catch {
        url = null;
      }
    } else {
      url = null;
    }
    // only pass params on first request; subsequent pages encode them in the URL
    params = {};
  }
  return results;
}

// ── Main Products Page ────────────────────────────────────────────────────────
export default function Products() {
  const navigate = useNavigate();

  // all products fetched without filters — used for grouped view
  const [allProducts,    setAllProducts]    = useState([]);
  // filtered/sorted products — used for flat view
  const [products,       setProducts]       = useState([]);
  const [categories,     setCategories]     = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [sortOrder,      setSortOrder]      = useState(""); // "" = grouped default

  // ── Fetch ALL products once for the grouped view ──────────────────────────
  useEffect(() => {
    fetchAllPages({ ordering: "-created_at" })
      .then(data => setAllProducts(data))
      .catch(() => setAllProducts([]));
  }, []);

  // ── Fetch categories ──────────────────────────────────────────────────────
  useEffect(() => {
    API.get("categories/")
      .then(res => setCategories(res.data.results || res.data))
      .catch(() => {});
  }, []);

  // ── Fetch filtered/sorted products for flat view ──────────────────────────
  const fetchFiltered = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (sortOrder)      params.ordering = sortOrder;
      if (search.trim())  params.search   = search.trim();
      if (activeCategory) params.category = activeCategory;
      // fetch all pages so we don't miss products
      const data = await fetchAllPages(params);
      setProducts(data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(fetchFiltered, 350);
    return () => clearTimeout(timer);
  }, [fetchFiltered]);

  // ── Grouped view — always uses allProducts sorted oldest→newest ───────────
  const categoryGroups = useMemo(() => {
    const groupMap      = {};
    const uncategorised = [];

    // allProducts already fetched with ordering=created_at (oldest first)
    allProducts.forEach(p => {
      const catName = p.category?.name || null;
      const catSlug = p.category?.slug || null;
      if (!catName) {
        uncategorised.push(p);
      } else {
        if (!groupMap[catName]) groupMap[catName] = { slug: catSlug, items: [] };
        groupMap[catName].items.push(p);
      }
    });

    const sortedKeys = Object.keys(groupMap).sort((a, b) => a.localeCompare(b));
    const groups = sortedKeys.map(name => ({
      name,
      slug: groupMap[name].slug,
      items: groupMap[name].items, // already oldest first from API
    }));
    if (uncategorised.length > 0) {
      groups.push({ name: "Uncategorised", slug: null, items: uncategorised });
    }
    return groups;
  }, [allProducts]);

  const isGroupedView    = sortOrder === "" && !activeCategory && !search.trim();
  const totalCount       = products.length;
  const clearFilters     = () => { setSearch(""); setActiveCategory(""); setSortOrder(""); };
  const hasActiveFilters = search.trim() || activeCategory || sortOrder !== "";

  const categoryOptions = [
    { label: "All Categories", value: "" },
    ...categories.map(c => ({ label: c.name, value: c.slug })),
  ];

  const handleViewMore = (slug) => {
    if (!slug) return;
    setActiveCategory(slug);
    setSortOrder("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // loading state: grouped view uses allProducts, flat view uses products fetch
  const showLoading = isGroupedView ? allProducts.length === 0 : loading;

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

        <CustomDropdown
          icon={SortIcon}
          label="Sort By"
          placeholder="Filter"
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
              {!loading && `${totalCount} result${totalCount !== 1 ? "s" : ""}`}
              {search         && <span className="text-gold"> · "{search}"</span>}
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

      {/* ── Products ── */}
      {showLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl h-[560px] animate-pulse"
              style={{ background: "rgba(255,255,255,0.04)" }} />
          ))}
        </div>

      ) : isGroupedView ? (
        /* ── Default: Category-grouped view, oldest 3 per category ── */
        categoryGroups.length === 0 ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-center py-24 space-y-4">
            <p className="text-5xl">🛍</p>
            <h3 className="text-2xl font-luxury text-gold">No products yet</h3>
          </motion.div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-14">
            {categoryGroups.map((group, gi) => (
              <motion.section
                key={group.name}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: gi * 0.07 }}
              >
                {/* Category heading */}
                <div className="flex items-center gap-4 mb-7">
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className="text-gold/60"><TagIcon /></span>
                    <h3 className="font-luxury text-2xl text-white tracking-wide">{group.name}</h3>
                  </div>
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(198,161,74,0.3), transparent)" }} />
                  {group.slug && group.items.length > 3 && (
                    <motion.button
                      onClick={() => handleViewMore(group.slug)}
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-1.5 flex-shrink-0 text-xs font-medium transition-colors duration-200"
                      style={{ color: "rgba(198,161,74,0.7)" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#C6A14A"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(198,161,74,0.7)"}
                    >
                      View More <ChevronRight />
                    </motion.button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <AnimatePresence mode="popLayout">
                    {group.items.slice(0, 3).map((product, i) => (
                      <motion.div key={product.id} layout
                        initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
                        exit={{ opacity:0, scale:0.95 }}
                        transition={{ delay: i * 0.05, duration:0.35 }}>
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.section>
            ))}
          </div>
        )

      ) : totalCount === 0 ? (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-center py-24 space-y-4">
          <p className="text-5xl">🔍</p>
          <h3 className="text-2xl font-luxury text-gold">No products found</h3>
          <p className="text-gray-400 text-sm">Try adjusting your search or filters.</p>
          <button onClick={clearFilters} className="btn-luxury mt-2">Clear Filters</button>
        </motion.div>

      ) : (
        /* ── Filtered / sorted: flat grid, all results ── */
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