package com.org.vilora.service;

import com.org.vilora.dto.ReviewRequest;
import com.org.vilora.dto.ReviewResponse;
import com.org.vilora.entity.Product;
import com.org.vilora.entity.Review;
import com.org.vilora.entity.User;
import com.org.vilora.exception.ResourceNotFoundException;
import com.org.vilora.repository.ProductRepository;
import com.org.vilora.repository.ReviewRepository;
import com.org.vilora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public ReviewResponse addReview(UUID userId, UUID productId, ReviewRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (reviewRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new IllegalArgumentException("You have already submitted a review for this product");
        }

        Review review = Review.builder()
                .product(product)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment().trim())
                .build();

        Review savedReview = reviewRepository.save(review);

        // Recalculate product rating and review count
        recalculateProductRating(product);

        return mapToResponse(savedReview);
    }

    @Override
    public List<ReviewResponse> getReviewsByProduct(UUID productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }

        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ReviewResponse updateReview(UUID userId, UUID reviewId, ReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        if (!review.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized: You can only edit your own reviews");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());

        Review updatedReview = reviewRepository.save(review);
        recalculateProductRating(review.getProduct());

        return mapToResponse(updatedReview);
    }

    @Override
    public void deleteReview(UUID userId, UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        if (!review.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized: You can only delete your own reviews");
        }

        Product product = review.getProduct();
        reviewRepository.delete(review);
        recalculateProductRating(product);
    }

    private void recalculateProductRating(Product product) {
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(product.getId());
        if (reviews.isEmpty()) {
            product.setRating(BigDecimal.ZERO);
            product.setReviewCount(0);
        } else {
            double average = reviews.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
            product.setRating(BigDecimal.valueOf(average).setScale(2, RoundingMode.HALF_UP));
            product.setReviewCount(reviews.size());
        }
        productRepository.save(product);
    }

    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .userId(review.getUser().getId())
                .userName(review.getUser().getFullName() != null ? review.getUser().getFullName() : "Customer")
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
