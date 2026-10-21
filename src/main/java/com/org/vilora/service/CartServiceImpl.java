package com.org.vilora.service;

import com.org.vilora.dto.CartItemRequest;
import com.org.vilora.dto.CartItemResponse;
import com.org.vilora.entity.CartItem;
import com.org.vilora.entity.Product;
import com.org.vilora.entity.User;
import com.org.vilora.exception.ResourceNotFoundException;
import com.org.vilora.repository.CartItemRepository;
import com.org.vilora.repository.ProductRepository;
import com.org.vilora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public CartItemResponse addItemToCart(UUID userId, CartItemRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!Boolean.TRUE.equals(product.getInStock()) || (product.getStockQuantity() != null && product.getStockQuantity() <= 0)) {
            throw new IllegalArgumentException("Product is out of stock");
        }

        // Check if item already exists in cart
        Optional<CartItem> existingItemOpt = cartItemRepository.findByUserIdAndProductId(userId, request.getProductId());
        
        int requestedTotalQuantity = request.getQuantity();
        if (existingItemOpt.isPresent()) {
            requestedTotalQuantity += existingItemOpt.get().getQuantity();
        }

        if (product.getStockQuantity() != null && product.getStockQuantity() < requestedTotalQuantity) {
            throw new IllegalArgumentException("Insufficient stock available for '" + product.getName()
                    + "'. Available: " + product.getStockQuantity() + ", Requested: " + requestedTotalQuantity);
        }

        CartItem cartItem;
        if (existingItemOpt.isPresent()) {
            cartItem = existingItemOpt.get();
            cartItem.setQuantity(requestedTotalQuantity);
        } else {
            cartItem = CartItem.builder()
                    .user(user)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
        }

        CartItem savedItem = cartItemRepository.save(cartItem);
        return mapToResponse(savedItem);
    }

    @Override
    public List<CartItemResponse> getCartItems(UUID userId) {
        return cartItemRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public CartItemResponse updateCartItemQuantity(UUID userId, UUID cartItemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized access to cart item");
        }
        
        if (quantity < 1) {
            throw new IllegalArgumentException("Quantity must be at least 1");
        }

        Product product = cartItem.getProduct();
        if (product.getStockQuantity() != null && product.getStockQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient stock available for '" + product.getName()
                    + "'. Available: " + product.getStockQuantity() + ", Requested: " + quantity);
        }

        cartItem.setQuantity(quantity);
        return mapToResponse(cartItemRepository.save(cartItem));
    }

    @Override
    public void removeCartItem(UUID userId, UUID cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized access to cart item");
        }

        cartItemRepository.delete(cartItem);
    }

    @Override
    public void clearCart(UUID userId) {
        cartItemRepository.deleteByUserId(userId);
    }

    private CartItemResponse mapToResponse(CartItem cartItem) {
        Product product = cartItem.getProduct();
        BigDecimal itemTotal = product.getPrice().multiply(new BigDecimal(cartItem.getQuantity()));
        
        return CartItemResponse.builder()
                .id(cartItem.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productImage(product.getImage())
                .productPrice(product.getPrice())
                .quantity(cartItem.getQuantity())
                .itemTotal(itemTotal)
                .build();
    }
}
