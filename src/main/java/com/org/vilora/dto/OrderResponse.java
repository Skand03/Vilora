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
public class OrderResponse {

    private UUID id;
    private UUID userId;
    private AddressResponse address;

    @JsonProperty("shippingAddress")
    public AddressResponse getShippingAddress() {
        return address;
    }

    private BigDecimal subtotal;
    private BigDecimal shippingCharge;
    private BigDecimal tax;
    private BigDecimal discount;
    private BigDecimal totalAmount;

    private String status;
    private String paymentStatus;
    private String paymentMethod;

    @Builder.Default
    private List<OrderItemResponse> orderItems = new ArrayList<>();

    @JsonProperty("items")
    public List<OrderItemResponse> getItems() {
        return orderItems != null ? orderItems : List.of();
    }

    private LocalDateTime createdAt;
}
