package com.org.vilora.dto;

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
public class ProductResponse {

    private UUID id;
    private String name;
    private String description;
    private String image;

    @Builder.Default
    private List<String> images = new ArrayList<>();

    @JsonProperty("gallery")
    public List<String> getGallery() {
        if (images != null && !images.isEmpty()) {
            return images;
        }
        if (image != null && !image.isBlank()) {
            return List.of(image);
        }
        return List.of();
    }

    private BigDecimal price;
    private BigDecimal originalPrice;
    private BigDecimal rating;
    private Integer reviewCount;
    private Boolean inStock;
    private Integer stockQuantity;

    @JsonProperty("stock")
    public Integer getStock() {
        return stockQuantity;
    }

    private Boolean organic;

    @JsonProperty("isOrganic")
    public Boolean getIsOrganic() {
        return organic != null ? organic : false;
    }

    private String ingredients;
    private String nutrition;

    private UUID categoryId;
    private String categoryName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}