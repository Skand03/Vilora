package com.org.vilora.controller;

import com.org.vilora.dto.CartItemRequest;
import com.org.vilora.dto.CartItemResponse;
import com.org.vilora.dtoHelper.ApiResponse;
import com.org.vilora.service.CartService;
import com.org.vilora.service.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping
    public ResponseEntity<ApiResponse<CartItemResponse>> addItemToCart(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody CartItemRequest request) {

        CartItemResponse response = cartService.addItemToCart(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CartItemResponse>>> getCartItems(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        List<CartItemResponse> responses = cartService.getCartItems(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Cart items fetched successfully", responses));
    }

    @PutMapping("/{cartItemId}")
    public ResponseEntity<ApiResponse<CartItemResponse>> updateCartItemQuantity(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID cartItemId,
            @RequestParam(required = false) Integer quantity,
            @RequestBody(required = false) Map<String, Integer> body) {

        Integer effectiveQuantity = quantity;
        if (effectiveQuantity == null && body != null && body.containsKey("quantity")) {
            effectiveQuantity = body.get("quantity");
        }
        if (effectiveQuantity == null) {
            effectiveQuantity = 1;
        }

        CartItemResponse response = cartService.updateCartItemQuantity(userDetails.getId(), cartItemId, effectiveQuantity);
        return ResponseEntity.ok(ApiResponse.success("Cart item quantity updated", response));
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<ApiResponse<Void>> removeCartItem(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID cartItemId) {

        cartService.removeCartItem(userDetails.getId(), cartItemId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart"));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        cartService.clearCart(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared"));
    }
}
