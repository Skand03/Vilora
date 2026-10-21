package com.org.vilora.service;

import com.org.vilora.dto.UserResponse;
import com.org.vilora.dto.UserUpdateRequest;
import com.org.vilora.entity.User;

import java.util.UUID;

public interface UserService {
    
    User getUserById(UUID id);
    
    User getUserByEmail(String email);
    
    boolean existsByEmail(String email);

    UserResponse getUserProfile(UUID id);
    
    UserResponse updateUserProfile(UUID id, UserUpdateRequest request);
}
