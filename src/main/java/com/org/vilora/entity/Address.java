package com.org.vilora.entity;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
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
@JsonIgnoreProperties(ignoreUnknown = true)
public class Address {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("user_id")
    @JsonAlias({"userId"})
    private UUID userId;

    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @JsonProperty("full_name")
    @JsonAlias({"fullName"})
    private String fullName;

    @JsonProperty("street")
    @JsonAlias({"addressLine1"})
    private String street;

    @JsonProperty("address_line2")
    @JsonAlias({"addressLine2"})
    private String addressLine2;

    @JsonProperty("city")
    private String city;

    @JsonProperty("state")
    private String state;

    @JsonProperty("zip_code")
    @JsonAlias({"zipCode", "pincode"})
    private String zipCode;

    @JsonProperty("phone")
    @JsonAlias({"phoneNumber"})
    private String phone;

    @JsonProperty("is_default")
    @JsonAlias({"isDefault"})
    @Builder.Default
    private Boolean isDefault = false;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
}
