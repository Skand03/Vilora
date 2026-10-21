package com.org.vilora.controller;

import com.org.vilora.dto.ReviewRequest;
import com.org.vilora.dto.ReviewResponse;
import com.org.vilora.dtoHelper.ApiResponse;
import com.org.vilora.service.ReviewService;
import com.org.vilora.service.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/api/products/{productId}/reviews")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getProductReviews(
            @PathVariable UUID productId) {

        List<ReviewResponse> responses = reviewService.getReviewsByProduct(productId);
        return ResponseEntity.ok(ApiResponse.success("Reviews fetched successfully", responses));
    }

    @PostMapping("/api/products/{productId}/reviews")
    public ResponseEntity<ApiResponse<ReviewResponse>> addProductReview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID productId,
            @Valid @RequestBody ReviewRequest request) {

        ReviewResponse response = reviewService.addReview(userDetails.getId(), productId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review submitted successfully", response));
    }

    @PutMapping("/api/reviews/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID reviewId,
            @Valid @RequestBody ReviewRequest request) {

        ReviewResponse response = reviewService.updateReview(userDetails.getId(), reviewId, request);
        return ResponseEntity.ok(ApiResponse.success("Review updated successfully", response));
    }

    @DeleteMapping("/api/reviews/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID reviewId) {

        reviewService.deleteReview(userDetails.getId(), reviewId);
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully"));
    }
}
