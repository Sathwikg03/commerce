import { useEffect, useState } from "react";
import API from "../services/api";
import ProductCard from "../components/ProductCard";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("products/").then(res => {
      setProducts(res.data.results);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-center text-gold mt-20">Loading collection...</p>;

  return (
    <div className="px-10 py-10">
      <h2 className="text-5xl font-luxury text-gold mb-12 text-center">Our Collection</h2>
      <div className="grid md:grid-cols-3 gap-10">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}