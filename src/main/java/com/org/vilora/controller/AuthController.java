package com.org.vilora.controller;

import com.org.vilora.dto.AuthResponse;
import com.org.vilora.dto.LoginRequest;
import com.org.vilora.dto.RegisterRequest;
import com.org.vilora.dto.UserResponse;
import com.org.vilora.dtoHelper.ApiResponse;
import com.org.vilora.service.AuthService;
import com.org.vilora.service.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse authResponse = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("User logged in successfully", authResponse));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        AuthResponse authResponse = authService.register(signUpRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("User registered successfully", authResponse));
    }

    @GetMapping({"/me", "/profile"})
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User is not authenticated"));
        }

        UserResponse userResponse = authService.getCurrentUserProfile(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", userResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logoutUser() {
        // Stateless JWT logout acknowledged by backend
        return ResponseEntity.ok(ApiResponse.success("User logged out successfully"));
    }
}
