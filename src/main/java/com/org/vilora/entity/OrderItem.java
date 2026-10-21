package com.org.vilora.entity;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@JsonIgnoreProperties(ignoreUnknown = true)
public class OrderItem {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("order_id")
    @JsonAlias({"orderId"})
    private UUID orderId;

    @com.fasterxml.jackson.annotation.JsonIgnore
    private Order order;

    @JsonProperty("product_id")
    @JsonAlias({"productId"})
    private UUID productId;

    @JsonProperty("product_name")
    @JsonAlias({"productName"})
    private String productName;

    @JsonProperty("product_image")
    @JsonAlias({"productImage"})
    private String productImage;

    @JsonProperty("price")
    private BigDecimal price;

    @JsonProperty("quantity")
    private Integer quantity;

    @JsonProperty("item_total")
    @JsonAlias({"itemTotal"})
    private BigDecimal itemTotal;
}
