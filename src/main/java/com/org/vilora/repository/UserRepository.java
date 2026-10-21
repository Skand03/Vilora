package com.org.vilora.repository;

import com.org.vilora.client.SupabaseClient;
import com.org.vilora.entity.User;
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
public class UserRepository {

    private final SupabaseClient supabaseClient;
    private static final String TABLE = "users";

    public boolean existsByEmail(String email) {
        if (email == null || email.isBlank()) return false;
        String encoded = URLEncoder.encode(email.trim().toLowerCase(), StandardCharsets.UTF_8);
        return supabaseClient.count(TABLE, "email=ilike." + encoded) > 0;
    }

    public Optional<User> findByEmail(String email) {
        if (email == null || email.isBlank()) return Optional.empty();
        String encoded = URLEncoder.encode(email.trim().toLowerCase(), StandardCharsets.UTF_8);
        return supabaseClient.selectOne(TABLE, "email=ilike." + encoded, User.class);
    }

    public Optional<User> findById(UUID id) {
        if (id == null) return Optional.empty();
        return supabaseClient.selectOne(TABLE, "id=eq." + id, User.class);
    }

    public List<User> findAll() {
        return supabaseClient.select(TABLE, "order=created_at.desc", User.class);
    }

    public User save(User user) {
        if (user.getId() == null) {
            user.setId(UUID.randomUUID());
            if (user.getCreatedAt() == null) {
                user.setCreatedAt(LocalDateTime.now());
            }
            return supabaseClient.insert(TABLE, user, User.class).orElse(user);
        } else {
            return supabaseClient.update(TABLE, "id=eq." + user.getId(), user, User.class).orElse(user);
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
