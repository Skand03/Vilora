package com.org.vilora.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 150, message = "Product name must not exceed 150 characters")
    private String name;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @Size(max = 1000, message = "Image URL must not exceed 1000 characters")
    private String image;

    private List<String> images;

    @JsonAlias({"gallery"})
    public void setGallery(List<String> gallery) {
        if (gallery != null && !gallery.isEmpty()) {
            this.images = gallery;
        }
    }

    @Size(max = 1000, message = "Ingredients must not exceed 1000 characters")
    private String ingredients;

    @Size(max = 1000, message = "Nutrition info must not exceed 1000 characters")
    private String nutrition;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    @DecimalMin(value = "0.01", message = "Original price must be greater than 0")
    private BigDecimal originalPrice;

    private Boolean inStock;

    @jakarta.validation.constraints.PositiveOrZero(message = "Stock quantity cannot be negative")
    private Integer stockQuantity;

    @JsonAlias({"stock"})
    public void setStock(Integer stock) {
        if (stock != null) {
            this.stockQuantity = stock;
        }
    }

    @JsonProperty("organic")
    @JsonAlias({"isOrganic"})
    private Boolean organic;

    @NotNull(message = "Category is required")
    private UUID categoryId;

    public Boolean getOrganic() {
        return organic != null ? organic : false;
    }
}