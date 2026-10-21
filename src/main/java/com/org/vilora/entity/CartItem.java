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
public class CartItem {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("user_id")
    @JsonAlias({"userId"})
    private UUID userId;

    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @JsonProperty("product_id")
    @JsonAlias({"productId"})
    private UUID productId;

    @com.fasterxml.jackson.annotation.JsonIgnore
    private Product product;

    @JsonProperty("quantity")
    private Integer quantity;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
}
