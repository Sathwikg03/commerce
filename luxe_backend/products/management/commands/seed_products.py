from django.core.management.base import BaseCommand
from products.models import Product, Category
from django.utils.text import slugify


SEED_DATA = [
    {
        "category": "Watches",
        "name": "Royal Chronograph",
        "description": "Swiss precision with timeless craftsmanship.",
        "price": 125000,
        "image_url": "https://images.unsplash.com/photo-1523170335258-f5ed11844a49",
        "stock": 10,
    },
    {
        "category": "Bags",
        "name": "Signature Leather Bag",
        "description": "Handcrafted Italian elegance.",
        "price": 98000,
        "image_url": "https://images.unsplash.com/photo-1584917865442-de89df76afd3",
        "stock": 7,
    },
    {
        "category": "Jewellery",
        "name": "Minimal Gold Bracelet",
        "description": "Understated luxury for modern style.",
        "price": 45000,
        "image_url": "https://images.unsplash.com/photo-1617038220319-276d3cfab638",
        "stock": 15,
    },
]


class Command(BaseCommand):
    help = 'Seed the database with initial luxury products'

    def handle(self, *args, **kwargs):
        for item in SEED_DATA:
            cat, _ = Category.objects.get_or_create(
                name=item['category'],
                defaults={'slug': slugify(item['category'])}
            )
            product, created = Product.objects.get_or_create(
                name=item['name'],
                defaults={
                    'description': item['description'],
                    'price': item['price'],
                    'image_url': item['image_url'],
                    'stock': item['stock'],
                    'category': cat,
                    'is_available': True,
                }
            )
            status = 'Created' if created else 'Already exists'
            self.stdout.write(f'  [{status}] {product.name}')

        self.stdout.write(self.style.SUCCESS('\n✓ Seed complete!'))
