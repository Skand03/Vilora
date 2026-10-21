package com.org.vilora.service;

import com.org.vilora.dto.AddressResponse;
import com.org.vilora.dto.OrderItemResponse;
import com.org.vilora.dto.OrderRequest;
import com.org.vilora.dto.OrderResponse;
import com.org.vilora.entity.Address;
import com.org.vilora.entity.CartItem;
import com.org.vilora.entity.Order;
import com.org.vilora.entity.OrderItem;
import com.org.vilora.entity.Product;
import com.org.vilora.entity.User;
import com.org.vilora.exception.ResourceNotFoundException;
import com.org.vilora.repository.AddressRepository;
import com.org.vilora.repository.CartItemRepository;
import com.org.vilora.repository.OrderRepository;
import com.org.vilora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final com.org.vilora.repository.ProductRepository productRepository;

    private static final Set<String> VALID_ORDER_STATUSES = Set.of(
            "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"
    );

    private static final Set<String> VALID_PAYMENT_STATUSES = Set.of(
            "PENDING", "PAID", "FAILED"
    );

    @Override
    public synchronized OrderResponse createOrder(UUID userId, OrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Address address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized access to delivery address");
        }

        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new IllegalStateException("Cannot create an order from an empty cart");
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        Order order = Order.builder()
                .user(user)
                .address(address)
                .status("PENDING")
                .paymentStatus("PENDING")
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod().toUpperCase() : "COD")
                .orderItems(new ArrayList<>())
                .build();

        for (CartItem cartItem : cartItems) {
            UUID productId = cartItem.getProduct().getId();
            // Lock product record using PESSIMISTIC_WRITE to prevent concurrent overselling
            Product product = productRepository.findByIdWithLock(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

            if (!Boolean.TRUE.equals(product.getInStock()) || product.getStockQuantity() == null || product.getStockQuantity() < cartItem.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for product '" + product.getName()
                        + "' (Available: " + (product.getStockQuantity() != null ? product.getStockQuantity() : 0)
                        + ", Requested: " + cartItem.getQuantity() + ")");
            }

            // Deduct stock atomically
            int remainingStock = product.getStockQuantity() - cartItem.getQuantity();
            product.setStockQuantity(remainingStock);
            if (remainingStock <= 0) {
                product.setInStock(false);
            }
            productRepository.save(product);

            BigDecimal itemPrice = product.getPrice();
            BigDecimal itemTotal = itemPrice.multiply(new BigDecimal(cartItem.getQuantity()));
            subtotal = subtotal.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productId(product.getId())
                    .productName(product.getName())
                    .productImage(product.getImage())
                    .price(itemPrice)
                    .quantity(cartItem.getQuantity())
                    .build();

            order.getOrderItems().add(orderItem);
        }

        // Shipping calculation: Free over ₹499, otherwise ₹49
        BigDecimal shippingCharge = subtotal.compareTo(new BigDecimal("499.00")) > 0
                ? new BigDecimal("0.00")
                : new BigDecimal("49.00");

        BigDecimal discount = new BigDecimal("0.00");

        // 5% GST tax calculation
        BigDecimal taxableAmount = subtotal.subtract(discount);
        BigDecimal tax = taxableAmount.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalAmount = subtotal.add(shippingCharge).subtract(discount).add(tax).setScale(2, RoundingMode.HALF_UP);

        order.setSubtotal(subtotal);
        order.setShippingCharge(shippingCharge);
        order.setDiscount(discount);
        order.setTax(tax);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        // Clear user's cart upon order confirmation
        cartItemRepository.deleteByUserId(userId);

        return mapToResponse(savedOrder);
    }

    @Override
    public List<OrderResponse> getOrderHistory(UUID userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public OrderResponse getOrderDetails(UUID userId, UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized access to order");
        }

        return mapToResponse(order);
    }

    @Override
    public OrderResponse cancelOrder(UUID userId, UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized access to order");
        }

        if ("SHIPPED".equalsIgnoreCase(order.getStatus()) || "DELIVERED".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalStateException("Order cannot be cancelled as it has already been " + order.getStatus());
        }

        if ("CANCELLED".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalStateException("Order is already cancelled");
        }

        // Restore inventory stock atomically
        for (OrderItem item : order.getOrderItems()) {
            productRepository.findByIdWithLock(item.getProductId()).ifPresent(product -> {
                int restoredStock = (product.getStockQuantity() != null ? product.getStockQuantity() : 0) + item.getQuantity();
                product.setStockQuantity(restoredStock);
                if (restoredStock > 0) {
                    product.setInStock(true);
                }
                productRepository.save(product);
            });
        }

        order.setStatus("CANCELLED");
        return mapToResponse(orderRepository.save(order));
    }

    @Override
    public List<OrderResponse> getAllOrdersForAdmin() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public OrderResponse updateOrderStatusByAdmin(UUID orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        String upperStatus = newStatus.trim().toUpperCase();
        if (!VALID_ORDER_STATUSES.contains(upperStatus)) {
            throw new IllegalArgumentException("Invalid order status: " + newStatus);
        }

        order.setStatus(upperStatus);
        return mapToResponse(orderRepository.save(order));
    }

    @Override
    public OrderResponse updateOrderPaymentStatusByAdmin(UUID orderId, String paymentStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        String upperStatus = paymentStatus.trim().toUpperCase();
        if (!VALID_PAYMENT_STATUSES.contains(upperStatus)) {
            throw new IllegalArgumentException("Invalid payment status: " + paymentStatus);
        }

        order.setPaymentStatus(upperStatus);
        return mapToResponse(orderRepository.save(order));
    }

    private OrderResponse mapToResponse(Order order) {
        Address address = order.getAddress();
        AddressResponse addressResponse = AddressResponse.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .street(address.getStreet())
                .addressLine2(address.getAddressLine2())
                .city(address.getCity())
                .state(address.getState())
                .zipCode(address.getZipCode())
                .phone(address.getPhone())
                .isDefault(address.getIsDefault())
                .build();

        List<OrderItemResponse> orderItemResponses = order.getOrderItems().stream().map(item ->
                OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .productImage(item.getProductImage())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .itemTotal(item.getPrice().multiply(new BigDecimal(item.getQuantity())))
                        .build()
        ).toList();

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .address(addressResponse)
                .subtotal(order.getSubtotal())
                .shippingCharge(order.getShippingCharge())
                .tax(order.getTax())
                .discount(order.getDiscount())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .orderItems(orderItemResponses)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
