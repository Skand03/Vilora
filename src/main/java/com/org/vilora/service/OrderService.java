package com.org.vilora.service;

import com.org.vilora.dto.OrderRequest;
import com.org.vilora.dto.OrderResponse;

import java.util.List;
import java.util.UUID;

public interface OrderService {

    OrderResponse createOrder(UUID userId, OrderRequest request);

    List<OrderResponse> getOrderHistory(UUID userId);

    OrderResponse getOrderDetails(UUID userId, UUID orderId);

    OrderResponse cancelOrder(UUID userId, UUID orderId);

    List<OrderResponse> getAllOrdersForAdmin();

    OrderResponse updateOrderStatusByAdmin(UUID orderId, String status);

    OrderResponse updateOrderPaymentStatusByAdmin(UUID orderId, String paymentStatus);
}
