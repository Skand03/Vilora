package com.org.vilora.controller;

import com.org.vilora.dto.WishlistResponse;
import com.org.vilora.dtoHelper.ApiResponse;
import com.org.vilora.service.UserDetailsImpl;
import com.org.vilora.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<WishlistResponse>> addToWishlist(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID productId) {

        WishlistResponse response = wishlistService.addToWishlist(userDetails.getId(), productId);
        return ResponseEntity.ok(ApiResponse.success("Product added to wishlist", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistResponse>>> getWishlist(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        List<WishlistResponse> responses = wishlistService.getWishlist(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Wishlist fetched successfully", responses));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID productId) {

        wishlistService.removeFromWishlist(userDetails.getId(), productId);
        return ResponseEntity.ok(ApiResponse.success("Product removed from wishlist"));
    }
}
