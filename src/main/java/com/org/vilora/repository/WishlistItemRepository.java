package com.org.vilora.repository;

import com.org.vilora.client.SupabaseClient;
import com.org.vilora.entity.Product;
import com.org.vilora.entity.User;
import com.org.vilora.entity.WishlistItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class WishlistItemRepository {

    private final SupabaseClient supabaseClient;
    private final ProductRepository productRepository;
    private static final String TABLE = "wishlist_items";

    public List<WishlistItem> findByUserId(UUID userId) {
        if (userId == null) return List.of();
        List<WishlistItem> items = supabaseClient.select(TABLE, "user_id=eq." + userId + "&order=created_at.desc", WishlistItem.class);
        items.forEach(this::populateRelations);
        return items;
    }

    public Optional<WishlistItem> findByUserIdAndProductId(UUID userId, UUID productId) {
        if (userId == null || productId == null) return Optional.empty();
        Optional<WishlistItem> item = supabaseClient.selectOne(TABLE, "user_id=eq." + userId + "&product_id=eq." + productId, WishlistItem.class);
        item.ifPresent(this::populateRelations);
        return item;
    }

    public Optional<WishlistItem> findById(UUID id) {
        if (id == null) return Optional.empty();
        Optional<WishlistItem> item = supabaseClient.selectOne(TABLE, "id=eq." + id, WishlistItem.class);
        item.ifPresent(this::populateRelations);
        return item;
    }

    public WishlistItem save(WishlistItem item) {
        if (item.getUser() != null && item.getUser().getId() != null) {
            item.setUserId(item.getUser().getId());
        }
        if (item.getProduct() != null && item.getProduct().getId() != null) {
            item.setProductId(item.getProduct().getId());
        }

        if (item.getId() == null) {
            item.setId(UUID.randomUUID());
            item.setCreatedAt(LocalDateTime.now());
            WishlistItem saved = supabaseClient.insert(TABLE, item, WishlistItem.class).orElse(item);
            populateRelations(saved);
            return saved;
        } else {
            WishlistItem updated = supabaseClient.update(TABLE, "id=eq." + item.getId(), item, WishlistItem.class).orElse(item);
            populateRelations(updated);
            return updated;
        }
    }

    public void delete(WishlistItem item) {
        if (item != null && item.getId() != null) {
            deleteById(item.getId());
        }
    }

    public void deleteById(UUID id) {
        if (id != null) {
            supabaseClient.delete(TABLE, "id=eq." + id);
        }
    }

    public void deleteAll() {
        supabaseClient.delete(TABLE, "id=neq.00000000-0000-0000-0000-000000000000");
    }

    private void populateRelations(WishlistItem item) {
        if (item == null) return;
        if (item.getUser() == null && item.getUserId() != null) {
            item.setUser(User.builder().id(item.getUserId()).build());
        }
        if (item.getProduct() == null && item.getProductId() != null) {
            productRepository.findById(item.getProductId()).ifPresent(item::setProduct);
        }
    }
}
