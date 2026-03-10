# LUXE Backend — Django REST API

A production-ready Django REST Framework backend powering the **LUXE** luxury e-commerce frontend.

---

## 🏗️ Project Structure

```
luxe_backend/
├── manage.py
├── requirements.txt
├── setup.sh                    ← one-shot setup script
├── luxe_backend/               ← Django project config
│   ├── settings.py
│   └── urls.py
├── accounts/                   ← JWT auth + user profiles
│   ├── models.py               (Custom User model)
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── products/                   ← Product catalogue
│   ├── models.py               (Product, Category)
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── management/commands/seed_products.py
└── cart/                       ← Shopping cart
    ├── models.py               (Cart, CartItem)
    ├── serializers.py
    ├── views.py
    └── urls.py
```

---

## ⚡ Quick Start

```bash
# 1. Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# 2. Run the setup script (installs deps, migrates, seeds, creates admin)
chmod +x setup.sh
./setup.sh
```

Or manually:

```bash
pip install -r requirements.txt
python manage.py makemigrations accounts products cart
python manage.py migrate
python manage.py seed_products      # loads the 3 original products
python manage.py createsuperuser
python manage.py runserver
```

---

## 🔌 API Reference

### Base URL: `http://127.0.0.1:8000/api/`

---

### 🔐 Auth

| Method | Endpoint | Body | Auth | Description |
|--------|----------|------|------|-------------|
| POST | `signup/` | `{ username, email, full_name, password, confirm_password }` | None | Register new user |
| POST | `login/` | `{ username, password }` | None | Login → returns `{ access, refresh, user }` |
| POST | `token/refresh/` | `{ refresh }` | None | Get new access token |
| GET | `profile/` | — | ✅ Bearer | Get logged-in user details |
| PUT | `profile/` | `{ full_name, email }` | ✅ Bearer | Update profile |

**Login response example:**
```json
{
  "access": "eyJ0eXAi...",
  "refresh": "eyJ0eXAi...",
  "user": { "id": 1, "username": "john", "email": "john@example.com", "full_name": "John Doe" }
}
```

---

### 🛍️ Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `products/` | None | List all available products |
| GET | `products/<id>/` | None | Single product detail |
| GET | `categories/` | None | List all categories |

**Query params for `products/`:**
- `search=<term>` — search name & description
- `category=<slug>` — e.g. `category=watches`
- `min_price=<num>` / `max_price=<num>`
- `ordering=price` / `-price` / `created_at`
- `page=<n>` — paginated (12 per page)

**Product response example:**
```json
{
  "id": 1,
  "name": "Royal Chronograph",
  "description": "Swiss precision with timeless craftsmanship.",
  "price": "125000.00",
  "image": "https://images.unsplash.com/photo-1523170335258-f5ed11844a49",
  "category": { "id": 1, "name": "Watches", "slug": "watches" },
  "stock": 10,
  "is_available": true,
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

### 🛒 Cart (Requires JWT)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET | `cart/` | — | Get full cart with items & total |
| POST | `cart/add/` | `{ product_id, quantity }` | Add to cart (merges if exists) |
| PATCH | `cart/items/<id>/` | `{ quantity }` | Update item quantity |
| DELETE | `cart/items/<id>/` | — | Remove single item |
| DELETE | `cart/clear/` | — | Empty the entire cart |

**Cart response example:**
```json
{
  "id": 1,
  "items": [
    {
      "id": 1,
      "product": { "id": 1, "name": "Royal Chronograph", "price": "125000.00", ... },
      "quantity": 2,
      "subtotal": "250000.00"
    }
  ],
  "total": "250000.00",
  "item_count": 2
}
```

---

### 🔧 Admin Endpoints (Superuser only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `admin/products/` | List all / create product |
| GET/PUT/PATCH/DELETE | `admin/products/<id>/` | Manage single product |

---

## 🔑 Frontend Integration

The frontend's `api.js` already handles auth headers. Connect the static data to the API by updating `Products.jsx`:

```jsx
// src/pages/Products.jsx
import { useEffect, useState } from "react";
import API from "../services/api";
import ProductCard from "../components/ProductCard";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("products/").then(res => {
      setProducts(res.data.results);   // paginated
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-center text-gold mt-20">Loading...</p>;

  return (
    <div className="px-10 py-10">
      <h2 className="text-5xl font-luxury text-gold mb-12 text-center">Our Collection</h2>
      <div className="grid md:grid-cols-3 gap-10">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
```

Also update `Signup.jsx` to wire the API:
```jsx
const onSubmit = async (data) => {
  try {
    const res = await API.post("signup/", {
      username: data.email.split("@")[0],   // or add a username field
      email: data.email,
      full_name: data.name,
      password: data.password,
      confirm_password: data.confirmPassword,
    });
    const { access, refresh } = res.data;
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    login({ name: res.data.user.username });
    navigate("/");
  } catch (err) {
    alert(err.response?.data?.detail || "Signup failed");
  }
};
```

---

## 🌐 Django Admin

Visit `http://127.0.0.1:8000/admin/` to manage products, categories, users, and carts visually.

---

## 🔒 Security Notes for Production

- Change `SECRET_KEY` in `settings.py`
- Set `DEBUG = False`
- Replace SQLite with PostgreSQL
- Set `ALLOWED_HOSTS` to your domain
- Use environment variables for secrets (e.g. `python-decouple`)
