package com.org.vilora.repository;

import com.org.vilora.client.SupabaseClient;
import com.org.vilora.entity.Category;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class CategoryRepository {

    private final SupabaseClient supabaseClient;
    private static final String TABLE = "categories";

    public Optional<Category> findById(UUID id) {
        if (id == null) return Optional.empty();
        return supabaseClient.selectOne(TABLE, "id=eq." + id, Category.class);
    }

    public List<Category> findAll() {
        return supabaseClient.select(TABLE, "order=name.asc", Category.class);
    }

    public List<Category> findByActiveTrue() {
        return supabaseClient.select(TABLE, "active=eq.true&order=name.asc", Category.class);
    }

    public boolean existsByNameIgnoreCase(String name) {
        if (name == null || name.isBlank()) return false;
        String encoded = URLEncoder.encode(name.trim(), StandardCharsets.UTF_8);
        return supabaseClient.count(TABLE, "name=ilike." + encoded) > 0;
    }

    public Category save(Category category) {
        LocalDateTime now = LocalDateTime.now();
        if (category.getId() == null) {
            category.setId(UUID.randomUUID());
            category.setCreatedAt(now);
            category.setUpdatedAt(now);
            return supabaseClient.insert(TABLE, category, Category.class).orElse(category);
        } else {
            category.setUpdatedAt(now);
            return supabaseClient.update(TABLE, "id=eq." + category.getId(), category, Category.class).orElse(category);
        }
    }

    public void delete(Category category) {
        if (category != null && category.getId() != null) {
            deleteById(category.getId());
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
}