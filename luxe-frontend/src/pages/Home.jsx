import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-6xl md:text-7xl font-luxury text-gold mb-6">
        Timeless Luxury
      </h1>

      <p className="text-gray-400 max-w-xl mb-8">
        Discover premium handcrafted collections designed with
        perfection, elegance, and modern sophistication.
      </p>

      <Link to="/products" className="btn-luxury">
        Explore Collection
      </Link>
    </section>
  );
}