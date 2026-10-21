package com.org.vilora.controller;

import com.org.vilora.dto.OrderRequest;
import com.org.vilora.dto.OrderResponse;
import com.org.vilora.dtoHelper.ApiResponse;
import com.org.vilora.service.OrderService;
import com.org.vilora.service.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody OrderRequest request) {

        OrderResponse response = orderService.createOrder(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrderHistory(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        List<OrderResponse> responses = orderService.getOrderHistory(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Order history fetched successfully", responses));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderDetails(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID orderId) {

        OrderResponse response = orderService.getOrderDetails(userDetails.getId(), orderId);
        return ResponseEntity.ok(ApiResponse.success("Order details fetched successfully", response));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID orderId) {

        OrderResponse response = orderService.cancelOrder(userDetails.getId(), orderId);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", response));
    }

    // Administrative order endpoints
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrdersAdmin() {
        List<OrderResponse> responses = orderService.getAllOrdersForAdmin();
        return ResponseEntity.ok(ApiResponse.success("All orders fetched successfully", responses));
    }

    @PutMapping("/admin/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatusAdmin(
            @PathVariable UUID orderId,
            @RequestParam String status) {

        OrderResponse response = orderService.updateOrderStatusByAdmin(orderId, status);
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", response));
    }

    @PutMapping("/admin/{orderId}/payment-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderPaymentStatusAdmin(
            @PathVariable UUID orderId,
            @RequestParam String paymentStatus) {

        OrderResponse response = orderService.updateOrderPaymentStatusByAdmin(orderId, paymentStatus);
        return ResponseEntity.ok(ApiResponse.success("Order payment status updated successfully", response));
    }
}
