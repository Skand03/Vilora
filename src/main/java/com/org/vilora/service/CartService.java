package com.org.vilora.service;

import com.org.vilora.dto.CartItemRequest;
import com.org.vilora.dto.CartItemResponse;

import java.util.List;
import java.util.UUID;

public interface CartService {
    
    CartItemResponse addItemToCart(UUID userId, CartItemRequest request);
    
    List<CartItemResponse> getCartItems(UUID userId);
    
    CartItemResponse updateCartItemQuantity(UUID userId, UUID cartItemId, Integer quantity);
    
    void removeCartItem(UUID userId, UUID cartItemId);
    
    void clearCart(UUID userId);
}
