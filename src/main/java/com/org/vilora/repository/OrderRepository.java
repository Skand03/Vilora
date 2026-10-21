package com.org.vilora.repository;

import com.org.vilora.client.SupabaseClient;
import com.org.vilora.entity.Address;
import com.org.vilora.entity.Order;
import com.org.vilora.entity.OrderItem;
import com.org.vilora.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class OrderRepository {

    private final SupabaseClient supabaseClient;
    private final AddressRepository addressRepository;
    private static final String ORDERS_TABLE = "orders";
    private static final String ORDER_ITEMS_TABLE = "order_items";

    public List<Order> findByUserIdOrderByCreatedAtDesc(UUID userId) {
        if (userId == null) return List.of();
        List<Order> orders = supabaseClient.select(ORDERS_TABLE, "user_id=eq." + userId + "&order=created_at.desc", Order.class);
        orders.forEach(this::populateOrderDetails);
        return orders;
    }

    public List<Order> findAllByOrderByCreatedAtDesc() {
        List<Order> orders = supabaseClient.select(ORDERS_TABLE, "order=created_at.desc", Order.class);
        orders.forEach(this::populateOrderDetails);
        return orders;
    }

    public Optional<Order> findById(UUID id) {
        if (id == null) return Optional.empty();
        Optional<Order> orderOpt = supabaseClient.selectOne(ORDERS_TABLE, "id=eq." + id, Order.class);
        orderOpt.ifPresent(this::populateOrderDetails);
        return orderOpt;
    }

    public Order save(Order order) {
        LocalDateTime now = LocalDateTime.now();
        if (order.getUser() != null && order.getUser().getId() != null) {
            order.setUserId(order.getUser().getId());
        }
        if (order.getAddress() != null && order.getAddress().getId() != null) {
            order.setAddressId(order.getAddress().getId());
        }

        Order savedOrder;
        boolean isNew = order.getId() == null;
        if (isNew) {
            order.setId(UUID.randomUUID());
            order.setCreatedAt(now);
            order.setUpdatedAt(now);
            savedOrder = supabaseClient.insert(ORDERS_TABLE, order, Order.class).orElse(order);
        } else {
            order.setUpdatedAt(now);
            savedOrder = supabaseClient.update(ORDERS_TABLE, "id=eq." + order.getId(), order, Order.class).orElse(order);
        }

        // Save order items if new order and items exist
        if (isNew && order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            List<OrderItem> itemsToInsert = new ArrayList<>();
            for (OrderItem item : order.getOrderItems()) {
                if (item.getId() == null) {
                    item.setId(UUID.randomUUID());
                }
                item.setOrderId(savedOrder.getId());
                if (item.getItemTotal() == null && item.getPrice() != null && item.getQuantity() != null) {
                    item.setItemTotal(item.getPrice().multiply(new BigDecimal(item.getQuantity())));
                }
                itemsToInsert.add(item);
            }
            List<OrderItem> savedItems = supabaseClient.insertList(ORDER_ITEMS_TABLE, itemsToInsert, OrderItem.class);
            savedOrder.setOrderItems(savedItems.isEmpty() ? itemsToInsert : savedItems);
        } else if (!isNew && (savedOrder.getOrderItems() == null || savedOrder.getOrderItems().isEmpty())) {
            populateOrderDetails(savedOrder);
        }

        populateOrderDetails(savedOrder);
        return savedOrder;
    }

    public void delete(Order order) {
        if (order != null && order.getId() != null) {
            deleteById(order.getId());
        }
    }

    public void deleteById(UUID id) {
        if (id != null) {
            supabaseClient.delete(ORDER_ITEMS_TABLE, "order_id=eq." + id);
            supabaseClient.delete(ORDERS_TABLE, "id=eq." + id);
        }
    }

    public void deleteAll() {
        supabaseClient.delete(ORDER_ITEMS_TABLE, "id=neq.00000000-0000-0000-0000-000000000000");
        supabaseClient.delete(ORDERS_TABLE, "id=neq.00000000-0000-0000-0000-000000000000");
    }

    private void populateOrderDetails(Order order) {
        if (order == null) return;

        if (order.getUser() == null && order.getUserId() != null) {
            order.setUser(User.builder().id(order.getUserId()).build());
        }

        if (order.getAddress() == null && order.getAddressId() != null) {
            addressRepository.findById(order.getAddressId()).ifPresentOrElse(
                    order::setAddress,
                    () -> order.setAddress(Address.builder().id(order.getAddressId()).build())
            );
        }

        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            List<OrderItem> items = supabaseClient.select(ORDER_ITEMS_TABLE, "order_id=eq." + order.getId(), OrderItem.class);
            order.setOrderItems(items);
        }
    }
}
