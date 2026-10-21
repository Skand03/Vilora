package com.org.vilora.repository;

import com.org.vilora.client.SupabaseClient;
import com.org.vilora.entity.Address;
import com.org.vilora.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class AddressRepository {

    private final SupabaseClient supabaseClient;
    private static final String TABLE = "addresses";

    public List<Address> findByUserId(UUID userId) {
        if (userId == null) return List.of();
        List<Address> list = supabaseClient.select(TABLE, "user_id=eq." + userId + "&order=is_default.desc,created_at.desc", Address.class);
        list.forEach(this::populateUser);
        return list;
    }

    public Optional<Address> findById(UUID id) {
        if (id == null) return Optional.empty();
        Optional<Address> opt = supabaseClient.selectOne(TABLE, "id=eq." + id, Address.class);
        opt.ifPresent(this::populateUser);
        return opt;
    }

    private void populateUser(Address address) {
        if (address != null && address.getUser() == null && address.getUserId() != null) {
            address.setUser(User.builder().id(address.getUserId()).build());
        }
    }

    public Address save(Address address) {
        LocalDateTime now = LocalDateTime.now();
        if (address.getUser() != null && address.getUser().getId() != null) {
            address.setUserId(address.getUser().getId());
        }

        if (address.getId() == null) {
            address.setId(UUID.randomUUID());
            address.setCreatedAt(now);
            address.setUpdatedAt(now);
            return supabaseClient.insert(TABLE, address, Address.class).orElse(address);
        } else {
            address.setUpdatedAt(now);
            return supabaseClient.update(TABLE, "id=eq." + address.getId(), address, Address.class).orElse(address);
        }
    }

    public void delete(Address address) {
        if (address != null && address.getId() != null) {
            deleteById(address.getId());
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
