package com.org.vilora.service;

import com.org.vilora.dto.ReviewRequest;
import com.org.vilora.dto.ReviewResponse;

import java.util.List;
import java.util.UUID;

public interface ReviewService {

    ReviewResponse addReview(UUID userId, UUID productId, ReviewRequest request);

    List<ReviewResponse> getReviewsByProduct(UUID productId);

    ReviewResponse updateReview(UUID userId, UUID reviewId, ReviewRequest request);

    void deleteReview(UUID userId, UUID reviewId);
}
