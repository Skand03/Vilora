package com.org.vilora.repository;

import com.org.vilora.client.SupabaseClient;
import com.org.vilora.entity.Product;
import com.org.vilora.entity.Review;
import com.org.vilora.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ReviewRepository {

    private final SupabaseClient supabaseClient;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private static final String TABLE = "reviews";

    public List<Review> findByProductIdOrderByCreatedAtDesc(UUID productId) {
        if (productId == null) return List.of();
        List<Review> reviews = supabaseClient.select(TABLE, "product_id=eq." + productId + "&order=created_at.desc", Review.class);
        reviews.forEach(this::populateRelations);
        return reviews;
    }

    public Optional<Review> findByUserIdAndProductId(UUID userId, UUID productId) {
        if (userId == null || productId == null) return Optional.empty();
        Optional<Review> review = supabaseClient.selectOne(TABLE, "user_id=eq." + userId + "&product_id=eq." + productId, Review.class);
        review.ifPresent(this::populateRelations);
        return review;
    }

    public boolean existsByUserIdAndProductId(UUID userId, UUID productId) {
        if (userId == null || productId == null) return false;
        return supabaseClient.count(TABLE, "user_id=eq." + userId + "&product_id=eq." + productId) > 0;
    }

    public Optional<Review> findById(UUID id) {
        if (id == null) return Optional.empty();
        Optional<Review> review = supabaseClient.selectOne(TABLE, "id=eq." + id, Review.class);
        review.ifPresent(this::populateRelations);
        return review;
    }

    public Review save(Review review) {
        LocalDateTime now = LocalDateTime.now();
        if (review.getUser() != null && review.getUser().getId() != null) {
            review.setUserId(review.getUser().getId());
        }
        if (review.getProduct() != null && review.getProduct().getId() != null) {
            review.setProductId(review.getProduct().getId());
        }

        if (review.getId() == null) {
            review.setId(UUID.randomUUID());
            review.setCreatedAt(now);
            review.setUpdatedAt(now);
            Review saved = supabaseClient.insert(TABLE, review, Review.class).orElse(review);
            populateRelations(saved);
            return saved;
        } else {
            review.setUpdatedAt(now);
            Review updated = supabaseClient.update(TABLE, "id=eq." + review.getId(), review, Review.class).orElse(review);
            populateRelations(updated);
            return updated;
        }
    }

    public void delete(Review review) {
        if (review != null && review.getId() != null) {
            deleteById(review.getId());
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

    private void populateRelations(Review review) {
        if (review == null) return;
        if (review.getUser() == null && review.getUserId() != null) {
            userRepository.findById(review.getUserId()).ifPresentOrElse(
                    review::setUser,
                    () -> review.setUser(User.builder().id(review.getUserId()).build())
            );
        }
        if (review.getProduct() == null && review.getProductId() != null) {
            productRepository.findById(review.getProductId()).ifPresent(review::setProduct);
        }
    }
}
