from rest_framework import generics, filters, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer


class ProductListView(generics.ListAPIView):
    """
    GET /api/products/
    Query params:
      - search=<term>       — filter by name or description
      - category=<slug>     — filter by category slug
      - min_price=<num>     — minimum price
      - max_price=<num>     — maximum price
      - ordering=price / -price / created_at
    """
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = Product.objects.filter(is_available=True)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )

        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category__slug=category)

        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)

        return qs


class ProductDetailView(generics.RetrieveAPIView):
    """
    GET /api/products/<id>/
    """
    queryset = Product.objects.filter(is_available=True)
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class AdminProductListCreateView(generics.ListCreateAPIView):
    """
    Admin only:
    GET  /api/admin/products/  — all products (including unavailable)
    POST /api/admin/products/  — create new product
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin only:
    GET    /api/admin/products/<id>/
    PUT    /api/admin/products/<id>/
    PATCH  /api/admin/products/<id>/
    DELETE /api/admin/products/<id>/
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]


class CategoryListView(generics.ListAPIView):
    """
    GET /api/categories/
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
