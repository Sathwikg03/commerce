from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, IsAdminUser
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Avg
from products.models import Product
from .models import Review
from .serializers import ReviewSerializer

class ProductReviewsView(APIView):
    """
    GET  /api/products/<pk>/reviews/   — list reviews + stats (public)
    POST /api/products/<pk>/reviews/   — create review (auth required)
    """
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        reviews = Review.objects.filter(product=product).select_related("user")

        # star distribution
        distribution = {i: 0 for i in range(1, 6)}
        total = reviews.count()
        avg   = 0
        if total:
            agg = reviews.values("rating")
            for r in agg:
                distribution[r["rating"]] = distribution.get(r["rating"], 0) + 1
            avg = round(reviews.aggregate(a=Avg("rating"))["a"], 1)

        # mark user's own review
        user_review = None
        if request.user.is_authenticated:
            own = reviews.filter(user=request.user).first()
            if own:
                user_review = ReviewSerializer(own, context={"request": request}).data

        serializer = ReviewSerializer(reviews, many=True, context={"request": request})
        return Response({
            "count":        total,
            "average":      avg,
            "distribution": distribution,
            "user_review":  user_review,
            "reviews":      serializer.data,
        })

    def post(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        if Review.objects.filter(product=product, user=request.user).exists():
            return Response({"detail": "You have already reviewed this product."}, status=status.HTTP_400_BAD_REQUEST)
        serializer = ReviewSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save(product=product, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReviewDetailView(APIView):
    """
    DELETE /api/reviews/<pk>/  — owner or staff can delete
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        review = get_object_or_404(Review, pk=pk)
        if review.user != request.user and not request.user.is_staff:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        review.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
