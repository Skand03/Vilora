package com.org.vilora;

import com.org.vilora.dto.AddressRequest;
import com.org.vilora.dto.AddressResponse;
import com.org.vilora.dto.CartItemRequest;
import com.org.vilora.dto.CartItemResponse;
import com.org.vilora.dto.WishlistResponse;
import com.org.vilora.entity.Category;
import com.org.vilora.entity.Product;
import com.org.vilora.entity.User;
import com.org.vilora.repository.*;
import com.org.vilora.service.AddressService;
import com.org.vilora.service.CartService;
import com.org.vilora.service.WishlistService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class CartWishlistAddressIntegrationTest {

    @Autowired
    private CartService cartService;

    @Autowired
    private WishlistService wishlistService;

    @Autowired
    private AddressService addressService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private WishlistItemRepository wishlistItemRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User user1;
    private User user2;
    private Product inStockProduct;
    private Product outOfStockProduct;

    @BeforeEach
    void setUp() {
        cartItemRepository.deleteAll();
        wishlistItemRepository.deleteAll();
        addressRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();

        String suffix = UUID.randomUUID().toString().substring(0, 8);
        user1 = userRepository.save(User.builder()
                .fullName("Customer One")
                .email("one" + suffix + "@example.com")
                .password(passwordEncoder.encode("Password123"))
                .role("ROLE_CUSTOMER")
                .build());

        user2 = userRepository.save(User.builder()
                .fullName("Customer Two")
                .email("two" + suffix + "@example.com")
                .password(passwordEncoder.encode("Password123"))
                .role("ROLE_CUSTOMER")
                .build());

        Category category = categoryRepository.save(Category.builder()
                .name("Dry Fruits " + suffix)
                .active(true)
                .build());

        inStockProduct = productRepository.save(Product.builder()
                .name("Premium Cashews " + suffix)
                .price(new BigDecimal("500.00"))
                .inStock(true)
                .category(category)
                .build());

        outOfStockProduct = productRepository.save(Product.builder()
                .name("Rare Saffron " + suffix)
                .price(new BigDecimal("2000.00"))
                .inStock(false)
                .category(category)
                .build());
    }

    @Test
    @DisplayName("Should add items to cart, consolidate duplicates, validate stock, and calculate totals")
    void testCartOperations() {
        CartItemRequest request = new CartItemRequest();
        request.setProductId(inStockProduct.getId());
        request.setQuantity(2);

        CartItemResponse response = cartService.addItemToCart(user1.getId(), request);
        assertNotNull(response.getId());
        assertEquals(2, response.getQuantity());
        assertEquals(new BigDecimal("1000.00"), response.getItemTotal());

        // Adding same product increments quantity
        request.setQuantity(1);
        CartItemResponse updated = cartService.addItemToCart(user1.getId(), request);
        assertEquals(3, updated.getQuantity());
        assertEquals(new BigDecimal("1500.00"), updated.getItemTotal());

        // Cannot add out of stock product
        CartItemRequest outOfStockReq = new CartItemRequest();
        outOfStockReq.setProductId(outOfStockProduct.getId());
        outOfStockReq.setQuantity(1);
        assertThrows(IllegalArgumentException.class, () -> cartService.addItemToCart(user1.getId(), outOfStockReq));

        // Update quantity
        CartItemResponse afterQtyUpdate = cartService.updateCartItemQuantity(user1.getId(), response.getId(), 4);
        assertEquals(4, afterQtyUpdate.getQuantity());
        assertEquals(new BigDecimal("2000.00"), afterQtyUpdate.getItemTotal());

        // Verify other user has empty cart
        assertTrue(cartService.getCartItems(user2.getId()).isEmpty());

        // Clear cart
        cartService.clearCart(user1.getId());
        assertTrue(cartService.getCartItems(user1.getId()).isEmpty());
    }

    @Test
    @DisplayName("Should manage wishlist idempotently and isolate between users")
    void testWishlistOperations() {
        WishlistResponse item = wishlistService.addToWishlist(user1.getId(), inStockProduct.getId());
        assertNotNull(item.getId());
        assertEquals("Premium Cashews", item.getProductName());

        // Idempotent duplicate check
        WishlistResponse duplicate = wishlistService.addToWishlist(user1.getId(), inStockProduct.getId());
        assertEquals(item.getId(), duplicate.getId());

        List<WishlistResponse> user1Wishlist = wishlistService.getWishlist(user1.getId());
        assertEquals(1, user1Wishlist.size());

        // User2 wishlist is empty
        assertTrue(wishlistService.getWishlist(user2.getId()).isEmpty());

        // Remove from wishlist
        wishlistService.removeFromWishlist(user1.getId(), inStockProduct.getId());
        assertTrue(wishlistService.getWishlist(user1.getId()).isEmpty());
    }

    @Test
    @DisplayName("Should add, update, manage default, and delete addresses with user ownership checks")
    void testAddressManagement() {
        AddressRequest req1 = AddressRequest.builder()
                .fullName("Customer One")
                .street("Flat 101, Green Meadows")
                .city("Pune")
                .state("Maharashtra")
                .zipCode("411001")
                .phone("9876543210")
                .build();

        AddressResponse addr1 = addressService.addAddress(user1.getId(), req1);
        assertNotNull(addr1.getId());
        assertTrue(addr1.getIsDefault()); // First address automatically becomes default

        AddressRequest req2 = AddressRequest.builder()
                .fullName("Customer One Office")
                .street("Floor 5, IT Park")
                .city("Pune")
                .state("Maharashtra")
                .zipCode("411057")
                .phone("9876543210")
                .isDefault(true)
                .build();

        AddressResponse addr2 = addressService.addAddress(user1.getId(), req2);
        assertTrue(addr2.getIsDefault());

        // First address is no longer default
        AddressResponse refetchedAddr1 = addressService.getAddressById(user1.getId(), addr1.getId());
        assertFalse(refetchedAddr1.getIsDefault());

        // User 2 cannot access User 1 address
        assertThrows(SecurityException.class, () -> addressService.getAddressById(user2.getId(), addr1.getId()));

        // Delete default address (addr2), addr1 should become default
        addressService.deleteAddress(user1.getId(), addr2.getId());
        List<AddressResponse> remaining = addressService.getAddresses(user1.getId());
        assertEquals(1, remaining.size());
        assertTrue(remaining.get(0).getIsDefault());
    }
}
