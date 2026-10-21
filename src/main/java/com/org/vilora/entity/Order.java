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
public class Order {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("user_id")
    @JsonAlias({"userId"})
    private UUID userId;

    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @JsonProperty("address_id")
    @JsonAlias({"addressId"})
    private UUID addressId;

    @com.fasterxml.jackson.annotation.JsonIgnore
    private Address address;

    @JsonProperty("subtotal")
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @JsonProperty("shipping_charge")
    @JsonAlias({"shippingCharge"})
    @Builder.Default
    private BigDecimal shippingCharge = BigDecimal.ZERO;

    @JsonProperty("tax")
    @Builder.Default
    private BigDecimal tax = BigDecimal.ZERO;

    @JsonProperty("discount")
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;

    @JsonProperty("total_amount")
    @JsonAlias({"totalAmount"})
    private BigDecimal totalAmount;

    @JsonProperty("status")
    @Builder.Default
    private String status = "PENDING";

    @JsonProperty("payment_status")
    @JsonAlias({"paymentStatus"})
    @Builder.Default
    private String paymentStatus = "PENDING";

    @JsonProperty("payment_method")
    @JsonAlias({"paymentMethod"})
    @Builder.Default
    private String paymentMethod = "COD";

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Builder.Default
    private List<OrderItem> orderItems = new ArrayList<>();

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
}
