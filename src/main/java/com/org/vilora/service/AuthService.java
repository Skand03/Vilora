package com.org.vilora.service;

import com.org.vilora.dto.AuthResponse;
import com.org.vilora.dto.LoginRequest;
import com.org.vilora.dto.RegisterRequest;
import com.org.vilora.dto.UserResponse;

import java.util.UUID;

public interface AuthService {
    
    AuthResponse register(RegisterRequest request);
    
    AuthResponse login(LoginRequest request);

    UserResponse getCurrentUserProfile(UUID userId);
}
