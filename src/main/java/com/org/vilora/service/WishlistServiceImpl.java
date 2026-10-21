package com.org.vilora.service;

import com.org.vilora.dto.WishlistResponse;
import com.org.vilora.entity.Product;
import com.org.vilora.entity.User;
import com.org.vilora.entity.WishlistItem;
import com.org.vilora.exception.ResourceNotFoundException;
import com.org.vilora.repository.ProductRepository;
import com.org.vilora.repository.UserRepository;
import com.org.vilora.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistItemRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public WishlistResponse addToWishlist(UUID userId, UUID productId) {
        // Idempotent: return existing if it's already there
        Optional<WishlistItem> existingItem = wishlistRepository.findByUserIdAndProductId(userId, productId);
        if (existingItem.isPresent()) {
            return mapToResponse(existingItem.get());
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        WishlistItem item = WishlistItem.builder()
                .user(user)
                .product(product)
                .build();

        return mapToResponse(wishlistRepository.save(item));
    }

    @Override
    public List<WishlistResponse> getWishlist(UUID userId) {
        return wishlistRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void removeFromWishlist(UUID userId, UUID productId) {
        Optional<WishlistItem> item = wishlistRepository.findByUserIdAndProductId(userId, productId);
        item.ifPresent(wishlistRepository::delete);
    }

    private WishlistResponse mapToResponse(WishlistItem item) {
        Product product = item.getProduct();
        return WishlistResponse.builder()
                .id(item.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productImage(product.getImage())
                .productPrice(product.getPrice())
                .productRating(product.getRating())
                .inStock(product.getInStock())
                .build();
    }
}
