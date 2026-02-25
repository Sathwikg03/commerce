#!/bin/bash
# ── LUXE Backend — One-shot setup ──────────────────────────────────────────
set -e

echo "📦  Installing dependencies..."
pip install -r requirements.txt

echo "🗄️   Running migrations..."
python manage.py makemigrations accounts products cart
python manage.py migrate

echo "🌱  Seeding products..."
python manage.py seed_products

echo ""
echo "👤  Create a superuser (for Django Admin):"
python manage.py createsuperuser

echo ""
echo "🚀  Starting development server on http://127.0.0.1:8000"
python manage.py runserver
