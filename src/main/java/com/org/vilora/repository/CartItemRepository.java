package com.org.vilora.repository;

import com.org.vilora.client.SupabaseClient;
import com.org.vilora.entity.CartItem;
import com.org.vilora.entity.Product;
import com.org.vilora.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class CartItemRepository {

    private final SupabaseClient supabaseClient;
    private final ProductRepository productRepository;
    private static final String TABLE = "cart_items";

    public List<CartItem> findByUserId(UUID userId) {
        if (userId == null) return List.of();
        List<CartItem> items = supabaseClient.select(TABLE, "user_id=eq." + userId + "&order=created_at.desc", CartItem.class);
        items.forEach(this::populateRelations);
        return items;
    }

    public Optional<CartItem> findByUserIdAndProductId(UUID userId, UUID productId) {
        if (userId == null || productId == null) return Optional.empty();
        Optional<CartItem> item = supabaseClient.selectOne(TABLE, "user_id=eq." + userId + "&product_id=eq." + productId, CartItem.class);
        item.ifPresent(this::populateRelations);
        return item;
    }

    public Optional<CartItem> findById(UUID id) {
        if (id == null) return Optional.empty();
        Optional<CartItem> item = supabaseClient.selectOne(TABLE, "id=eq." + id, CartItem.class);
        item.ifPresent(this::populateRelations);
        return item;
    }

    public CartItem save(CartItem cartItem) {
        LocalDateTime now = LocalDateTime.now();
        if (cartItem.getUser() != null && cartItem.getUser().getId() != null) {
            cartItem.setUserId(cartItem.getUser().getId());
        }
        if (cartItem.getProduct() != null && cartItem.getProduct().getId() != null) {
            cartItem.setProductId(cartItem.getProduct().getId());
        }

        if (cartItem.getId() == null) {
            cartItem.setId(UUID.randomUUID());
            cartItem.setCreatedAt(now);
            cartItem.setUpdatedAt(now);
            CartItem saved = supabaseClient.insert(TABLE, cartItem, CartItem.class).orElse(cartItem);
            populateRelations(saved);
            return saved;
        } else {
            cartItem.setUpdatedAt(now);
            CartItem updated = supabaseClient.update(TABLE, "id=eq." + cartItem.getId(), cartItem, CartItem.class).orElse(cartItem);
            populateRelations(updated);
            return updated;
        }
    }

    public void delete(CartItem cartItem) {
        if (cartItem != null && cartItem.getId() != null) {
            deleteById(cartItem.getId());
        }
    }

    public void deleteById(UUID id) {
        if (id != null) {
            supabaseClient.delete(TABLE, "id=eq." + id);
        }
    }

    public void deleteByUserId(UUID userId) {
        if (userId != null) {
            supabaseClient.delete(TABLE, "user_id=eq." + userId);
        }
    }

    public void deleteAll() {
        supabaseClient.delete(TABLE, "id=neq.00000000-0000-0000-0000-000000000000");
    }

    private void populateRelations(CartItem item) {
        if (item == null) return;
        if (item.getUser() == null && item.getUserId() != null) {
            item.setUser(User.builder().id(item.getUserId()).build());
        }
        if (item.getProduct() == null && item.getProductId() != null) {
            productRepository.findById(item.getProductId()).ifPresent(item::setProduct);
        }
    }
}
