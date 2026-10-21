package com.org.vilora.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private UUID id;
    private String fullName;
    private String email;
    private String address;
    private String phoneNumber;
    private String qualification;
    private String role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @com.fasterxml.jackson.annotation.JsonProperty("name")
    public String getName() {
        return fullName;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("phone")
    public String getPhone() {
        return phoneNumber;
    }
}
