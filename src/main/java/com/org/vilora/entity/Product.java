package com.org.vilora.entity;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Product {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("description")
    private String description;

    @JsonProperty("image")
    private String image;

    @JsonProperty("images")
    @Builder.Default
    private List<String> images = new ArrayList<>();

    @JsonProperty("ingredients")
    private String ingredients;

    @JsonProperty("nutrition")
    private String nutrition;

    @JsonProperty("price")
    private BigDecimal price;

    @JsonProperty("original_price")
    @JsonAlias({"originalPrice"})
    private BigDecimal originalPrice;

    @JsonProperty("rating")
    @Builder.Default
    private BigDecimal rating = BigDecimal.ZERO;

    @JsonProperty("review_count")
    @JsonAlias({"reviewCount"})
    @Builder.Default
    private Integer reviewCount = 0;

    @JsonProperty("stock_quantity")
    @JsonAlias({"stockQuantity", "stock"})
    @Builder.Default
    private Integer stockQuantity = 100;

    @JsonProperty("in_stock")
    @JsonAlias({"inStock"})
    @Builder.Default
    private Boolean inStock = true;

    @JsonProperty("is_organic")
    @JsonAlias({"organic", "isOrganic"})
    @Builder.Default
    private Boolean organic = false;

    @JsonProperty("category_id")
    @JsonAlias({"categoryId"})
    private UUID categoryId;

    // Transient populated reference for convenience
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Category category;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    public boolean isAvailable(int requestedQuantity) {
        return Boolean.TRUE.equals(inStock) && stockQuantity != null && stockQuantity >= requestedQuantity;
    }
}