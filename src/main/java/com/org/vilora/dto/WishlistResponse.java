package com.org.vilora.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistResponse {
    
    private UUID id;
    private UUID productId;
    private String productName;
    private String productImage;
    private BigDecimal productPrice;
    private BigDecimal productRating;
    private Boolean inStock;

    @JsonProperty("name")
    public String getName() {
        return productName;
    }

    @JsonProperty("image")
    public String getImage() {
        return productImage;
    }

    @JsonProperty("price")
    public BigDecimal getPrice() {
        return productPrice;
    }

    @JsonProperty("rating")
    public BigDecimal getRating() {
        return productRating;
    }
}
