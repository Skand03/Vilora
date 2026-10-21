package com.org.vilora;

import com.org.vilora.dto.AddressRequest;
import com.org.vilora.dto.AddressResponse;
import com.org.vilora.dto.CartItemRequest;
import com.org.vilora.dto.OrderRequest;
import com.org.vilora.dto.OrderResponse;
import com.org.vilora.dto.ProductRequest;
import com.org.vilora.dto.ProductResponse;
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
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class InventoryIntegrationTest {

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private CartService cartService;

    @Autowired
    private AddressService addressService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User customer1;
    private User customer2;
    private Category category;
    private AddressResponse customer1Address;
    private AddressResponse customer2Address;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        cartItemRepository.deleteAll();
        addressRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();

        customer1 = userRepository.save(User.builder()
                .fullName("Rohan Sharma")
                .email("rohan@example.com")
                .password(passwordEncoder.encode("Password123"))
                .role("ROLE_CUSTOMER")
                .build());

        customer2 = userRepository.save(User.builder()
                .fullName("Pooja Verma")
                .email("pooja@example.com")
                .password(passwordEncoder.encode("Password123"))
                .role("ROLE_CUSTOMER")
                .build());

        category = categoryRepository.save(Category.builder()
                .name("Premium Dry Fruits")
                .active(true)
                .build());

        customer1Address = addressService.addAddress(customer1.getId(), AddressRequest.builder()
                .fullName("Rohan Sharma")
                .street("10 MG Road")
                .city("Bengaluru")
                .state("Karnataka")
                .zipCode("560001")
                .phone("9876543210")
                .build());

        customer2Address = addressService.addAddress(customer2.getId(), AddressRequest.builder()
                .fullName("Pooja Verma")
                .street("22 Park Street")
                .city("Kolkata")
                .state("West Bengal")
                .zipCode("700016")
                .phone("9876543211")
                .build());
    }

    @Test
    @DisplayName("Should validate requested quantities against available stock in cart and order creation")
    void testInsufficientStockValidation() {
        ProductResponse product = productService.createProduct(ProductRequest.builder()
                .name("Kashmiri Walnuts")
                .price(new BigDecimal("500.00"))
                .categoryId(category.getId())
                .stockQuantity(3)
                .inStock(true)
                .build());

        // Attempting to add more than available stock to cart throws IllegalArgumentException
        assertThrows(IllegalArgumentException.class, () ->
                cartService.addItemToCart(customer1.getId(), new CartItemRequest(product.getId(), 4)));

        // Adding exactly 3 succeeds
        cartService.addItemToCart(customer1.getId(), new CartItemRequest(product.getId(), 3));

        // Attempting to update cart quantity beyond available stock throws IllegalArgumentException
        UUID cartItemId = cartService.getCartItems(customer1.getId()).get(0).getId();
        assertThrows(IllegalArgumentException.class, () ->
                cartService.updateCartItemQuantity(customer1.getId(), cartItemId, 5));

        // Place order for 3 items
        OrderResponse order = orderService.createOrder(customer1.getId(), OrderRequest.builder()
                .addressId(customer1Address.getId())
                .paymentMethod("COD")
                .build());

        assertNotNull(order.getId());

        // Product stock should now be 0 and marked out of stock
        Product updatedProduct = productRepository.findById(product.getId()).orElseThrow();
        assertEquals(0, updatedProduct.getStockQuantity());
        assertFalse(updatedProduct.getInStock());

        // Another customer attempting to add the out-of-stock product to cart is rejected
        assertThrows(IllegalArgumentException.class, () ->
                cartService.addItemToCart(customer2.getId(), new CartItemRequest(product.getId(), 1)));
    }

    @Test
    @DisplayName("Should deduct inventory atomically upon order placement and restore it upon cancellation")
    void testStockDeductionAndRestorationOnCancellation() {
        ProductResponse product = productService.createProduct(ProductRequest.builder()
                .name("Organic Almonds")
                .price(new BigDecimal("800.00"))
                .categoryId(category.getId())
                .stockQuantity(10)
                .inStock(true)
                .build());

        // Customer 1 places order for 4 units
        cartService.addItemToCart(customer1.getId(), new CartItemRequest(product.getId(), 4));
        OrderResponse order = orderService.createOrder(customer1.getId(), OrderRequest.builder()
                .addressId(customer1Address.getId())
                .paymentMethod("COD")
                .build());

        // Stock decreased from 10 to 6
        Product afterPurchase = productRepository.findById(product.getId()).orElseThrow();
        assertEquals(6, afterPurchase.getStockQuantity());
        assertTrue(afterPurchase.getInStock());

        // Cancel the order
        orderService.cancelOrder(customer1.getId(), order.getId());

        // Stock restored back to 10
        Product afterCancel = productRepository.findById(product.getId()).orElseThrow();
        assertEquals(10, afterCancel.getStockQuantity());
        assertTrue(afterCancel.getInStock());
    }

    @Test
    @DisplayName("Should reject negative stock quantity updates and update inStock flag accordingly")
    void testStockQuantityAdminUpdates() {
        ProductResponse product = productService.createProduct(ProductRequest.builder()
                .name("Organic Cashews")
                .price(new BigDecimal("700.00"))
                .categoryId(category.getId())
                .stockQuantity(20)
                .inStock(true)
                .build());

        // Negative stock throws exception
        assertThrows(IllegalArgumentException.class, () ->
                productService.updateProduct(product.getId(), ProductRequest.builder()
                        .name("Organic Cashews")
                        .price(new BigDecimal("700.00"))
                        .categoryId(category.getId())
                        .stockQuantity(-5)
                        .build()));

        // Setting stock to 0 automatically marks inStock = false
        ProductResponse zeroStock = productService.updateProduct(product.getId(), ProductRequest.builder()
                .name("Organic Cashews")
                .price(new BigDecimal("700.00"))
                .categoryId(category.getId())
                .stockQuantity(0)
                .build());

        assertEquals(0, zeroStock.getStockQuantity());
        assertFalse(zeroStock.getInStock());

        // Restocking to 15 restores inStock = true
        ProductResponse restocked = productService.updateProduct(product.getId(), ProductRequest.builder()
                .name("Organic Cashews")
                .price(new BigDecimal("700.00"))
                .categoryId(category.getId())
                .stockQuantity(15)
                .build());

        assertEquals(15, restocked.getStockQuantity());
        assertTrue(restocked.getInStock());
    }

    @Test
    @DisplayName("Should prevent concurrent orders from overselling inventory via database row locking")
    void testConcurrentOrdersPreventOverselling() throws InterruptedException {
        // Product has exactly 1 in stock
        ProductResponse product = productService.createProduct(ProductRequest.builder()
                .name("Rare Organic Saffron")
                .price(new BigDecimal("999.00"))
                .categoryId(category.getId())
                .stockQuantity(1)
                .inStock(true)
                .build());

        // Both customers have 1 in their cart
        cartService.addItemToCart(customer1.getId(), new CartItemRequest(product.getId(), 1));
        cartService.addItemToCart(customer2.getId(), new CartItemRequest(product.getId(), 1));

        int threadCount = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch endLatch = new CountDownLatch(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        executor.submit(() -> {
            try {
                startLatch.await();
                orderService.createOrder(customer1.getId(), OrderRequest.builder()
                        .addressId(customer1Address.getId())
                        .paymentMethod("COD")
                        .build());
                successCount.incrementAndGet();
            } catch (Exception e) {
                failureCount.incrementAndGet();
            } finally {
                endLatch.countDown();
            }
        });

        executor.submit(() -> {
            try {
                startLatch.await();
                orderService.createOrder(customer2.getId(), OrderRequest.builder()
                        .addressId(customer2Address.getId())
                        .paymentMethod("COD")
                        .build());
                successCount.incrementAndGet();
            } catch (Exception e) {
                failureCount.incrementAndGet();
            } finally {
                endLatch.countDown();
            }
        });

        // Trigger concurrent execution
        startLatch.countDown();
        boolean completed = endLatch.await(10, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(completed, "Concurrent orders did not complete in time");
        assertEquals(1, successCount.get(), "Exactly one order must succeed when stock is 1");
        assertEquals(1, failureCount.get(), "The second order must fail due to exhausted stock");

        // Final stock must be exactly 0, never negative
        Product finalProduct = productRepository.findById(product.getId()).orElseThrow();
        assertEquals(0, finalProduct.getStockQuantity());
        assertFalse(finalProduct.getInStock());
    }
}
