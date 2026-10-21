package com.org.vilora;

import com.org.vilora.dto.AddressRequest;
import com.org.vilora.dto.AddressResponse;
import com.org.vilora.dto.CartItemRequest;
import com.org.vilora.dto.OrderRequest;
import com.org.vilora.dto.OrderResponse;
import com.org.vilora.dto.ReviewRequest;
import com.org.vilora.dto.ReviewResponse;
import com.org.vilora.entity.Category;
import com.org.vilora.entity.Product;
import com.org.vilora.entity.User;
import com.org.vilora.repository.*;
import com.org.vilora.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class OrderAndReviewIntegrationTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private CartService cartService;

    @Autowired
    private AddressService addressService;

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private ProductService productService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User customer1;
    private User customer2;
    private Product product1;
    private Product product2;
    private AddressResponse customerAddress;

    @BeforeEach
    void setUp() {
        reviewRepository.deleteAll();
        orderRepository.deleteAll();
        cartItemRepository.deleteAll();
        addressRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();

        customer1 = userRepository.save(User.builder()
                .fullName("Ananya Desai")
                .email("ananya@example.com")
                .password(passwordEncoder.encode("Password123"))
                .role("ROLE_CUSTOMER")
                .build());

        customer2 = userRepository.save(User.builder()
                .fullName("Vikram Seth")
                .email("vikram@example.com")
                .password(passwordEncoder.encode("Password123"))
                .role("ROLE_CUSTOMER")
                .build());

        Category category = categoryRepository.save(Category.builder()
                .name("Organic Essentials")
                .active(true)
                .build());

        product1 = productRepository.save(Product.builder()
                .name("Organic Himalayan Honey")
                .price(new BigDecimal("600.00"))
                .image("https://example.com/honey.jpg")
                .inStock(true)
                .category(category)
                .build());

        product2 = productRepository.save(Product.builder()
                .name("A2 Gir Cow Ghee")
                .price(new BigDecimal("1200.00"))
                .image("https://example.com/ghee.jpg")
                .inStock(true)
                .category(category)
                .build());

        AddressRequest addressRequest = AddressRequest.builder()
                .fullName("Ananya Desai")
                .street("74 Hill Road, Bandra West")
                .city("Mumbai")
                .state("Maharashtra")
                .zipCode("400050")
                .phone("9820123456")
                .build();

        customerAddress = addressService.addAddress(customer1.getId(), addressRequest);
    }

    @Test
    @DisplayName("Should create order with server-side pricing, clear cart, snapshot items, and keep payment pending")
    void testOrderCreationAndPaymentState() {
        // Add items to cart
        CartItemRequest item1 = new CartItemRequest(product1.getId(), 1); // 600.00
        cartService.addItemToCart(customer1.getId(), item1);

        OrderRequest orderReq = OrderRequest.builder()
                .addressId(customerAddress.getId())
                .paymentMethod("COD")
                .build();

        OrderResponse order = orderService.createOrder(customer1.getId(), orderReq);

        assertNotNull(order.getId());
        assertEquals("PENDING", order.getStatus());
        assertEquals("PENDING", order.getPaymentStatus()); // Phase 7: Explicit pending payment, no fake success
        assertEquals("COD", order.getPaymentMethod());

        // Subtotal = 600.00
        assertEquals(new BigDecimal("600.00"), order.getSubtotal());
        // Shipping is 0 because subtotal > 499
        assertEquals(new BigDecimal("0.00"), order.getShippingCharge());
        // 5% Tax on 600.00 = 30.00
        assertEquals(new BigDecimal("30.00"), order.getTax());
        // Total = 630.00
        assertEquals(new BigDecimal("630.00"), order.getTotalAmount());

        // Verify order items snapshot
        assertEquals(1, order.getOrderItems().size());
        assertEquals(1, order.getItems().size()); // Frontend alias
        assertEquals("Organic Himalayan Honey", order.getItems().get(0).getProductName());
        assertEquals("https://example.com/honey.jpg", order.getItems().get(0).getProductImage());

        // Cart must be cleared
        assertTrue(cartService.getCartItems(customer1.getId()).isEmpty());

        // User can view their order history
        List<OrderResponse> history = orderService.getOrderHistory(customer1.getId());
        assertEquals(1, history.size());
        assertEquals(order.getId(), history.get(0).getId());

        // Other customer cannot access this order
        assertThrows(SecurityException.class, () -> orderService.getOrderDetails(customer2.getId(), order.getId()));
    }

    @Test
    @DisplayName("Should enforce cancellation rules: allow PENDING cancellation, forbid SHIPPED cancellation")
    void testOrderCancellationRules() {
        CartItemRequest item1 = new CartItemRequest(product1.getId(), 1);
        cartService.addItemToCart(customer1.getId(), item1);

        OrderRequest orderReq = OrderRequest.builder()
                .addressId(customerAddress.getId())
                .build();

        OrderResponse order = orderService.createOrder(customer1.getId(), orderReq);
        assertEquals("PENDING", order.getStatus());

        // Customer cancels order
        OrderResponse cancelled = orderService.cancelOrder(customer1.getId(), order.getId());
        assertEquals("CANCELLED", cancelled.getStatus());

        // Cannot cancel again
        assertThrows(IllegalStateException.class, () -> orderService.cancelOrder(customer1.getId(), order.getId()));

        // Admin updates status to SHIPPED on a new order
        CartItemRequest item2 = new CartItemRequest(product2.getId(), 1);
        cartService.addItemToCart(customer1.getId(), item2);
        OrderResponse order2 = orderService.createOrder(customer1.getId(), orderReq);

        orderService.updateOrderStatusByAdmin(order2.getId(), "SHIPPED");

        // Customer cannot cancel SHIPPED order
        assertThrows(IllegalStateException.class, () -> orderService.cancelOrder(customer1.getId(), order2.getId()));
    }

    @Test
    @DisplayName("Should submit reviews, calculate product rating, prevent duplicates, and handle updates/deletions")
    void testReviewWorkflow() {
        // Customer 1 submits 5-star review
        ReviewRequest review1 = ReviewRequest.builder()
                .rating(5)
                .comment("Excellent golden honey, extremely fragrant and pure.")
                .build();

        ReviewResponse response1 = reviewService.addReview(customer1.getId(), product1.getId(), review1);
        assertNotNull(response1.getId());
        assertEquals(5, response1.getRating());

        // Product rating is now 5.00, count 1
        Product updatedP1 = productRepository.findById(product1.getId()).orElseThrow();
        assertEquals(new BigDecimal("5.00"), updatedP1.getRating());
        assertEquals(1, updatedP1.getReviewCount());

        // Customer 1 cannot submit duplicate review for same product
        assertThrows(IllegalArgumentException.class, () -> reviewService.addReview(customer1.getId(), product1.getId(), review1));

        // Customer 2 submits 3-star review
        ReviewRequest review2 = ReviewRequest.builder()
                .rating(3)
                .comment("Good product but packaging was slightly dented.")
                .build();

        reviewService.addReview(customer2.getId(), product1.getId(), review2);

        // Product average rating is now (5 + 3) / 2 = 4.00, count 2
        updatedP1 = productRepository.findById(product1.getId()).orElseThrow();
        assertEquals(new BigDecimal("4.00"), updatedP1.getRating());
        assertEquals(2, updatedP1.getReviewCount());

        // Customer 2 updates their review to 5 stars
        ReviewResponse c2Review = reviewService.getReviewsByProduct(product1.getId()).stream()
                .filter(r -> r.getUserId().equals(customer2.getId()))
                .findFirst().orElseThrow();

        ReviewRequest updateReq = ReviewRequest.builder()
                .rating(5)
                .comment("Support resolved the packaging issue, upgraded to 5 stars!")
                .build();

        reviewService.updateReview(customer2.getId(), c2Review.getId(), updateReq);

        // Product average rating is now (5 + 5) / 2 = 5.00
        updatedP1 = productRepository.findById(product1.getId()).orElseThrow();
        assertEquals(new BigDecimal("5.00"), updatedP1.getRating());

        // Customer 1 cannot edit Customer 2's review
        assertThrows(SecurityException.class, () -> reviewService.updateReview(customer1.getId(), c2Review.getId(), updateReq));

        // Delete Customer 2 review
        reviewService.deleteReview(customer2.getId(), c2Review.getId());
        updatedP1 = productRepository.findById(product1.getId()).orElseThrow();
        assertEquals(1, updatedP1.getReviewCount());
        assertEquals(new BigDecimal("5.00"), updatedP1.getRating());
    }
}
