package com.org.vilora.service;

import com.org.vilora.dto.WishlistResponse;

import java.util.List;
import java.util.UUID;

public interface WishlistService {
    
    WishlistResponse addToWishlist(UUID userId, UUID productId);
    
    List<WishlistResponse> getWishlist(UUID userId);
    
    void removeFromWishlist(UUID userId, UUID productId);
}
