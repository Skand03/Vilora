package com.org.vilora;

import com.org.vilora.dto.CategoryRequest;
import com.org.vilora.dto.CategoryResponse;
import com.org.vilora.dto.ProductRequest;
import com.org.vilora.dto.ProductResponse;
import com.org.vilora.dtoHelper.PageResponse;
import com.org.vilora.repository.CategoryRepository;
import com.org.vilora.repository.ProductRepository;
import com.org.vilora.service.CategoryService;
import com.org.vilora.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class CatalogIntegrationTest {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private com.org.vilora.repository.OrderRepository orderRepository;

    @Autowired
    private com.org.vilora.repository.CartItemRepository cartItemRepository;

    @Autowired
    private com.org.vilora.repository.WishlistItemRepository wishlistItemRepository;

    @Autowired
    private com.org.vilora.repository.ReviewRepository reviewRepository;

    private CategoryResponse dryFruitsCategory;

    @BeforeEach
    void setUp() {
        reviewRepository.deleteAll();
        wishlistItemRepository.deleteAll();
        cartItemRepository.deleteAll();
        orderRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();

        CategoryRequest catReq = new CategoryRequest();
        catReq.setName("Dry Fruits");
        catReq.setDescription("Premium quality sun-dried nuts and fruits");
        dryFruitsCategory = categoryService.createCategory(catReq);
    }

    @Test
    @DisplayName("Should create category and reject duplicate category names")
    void testCategoryCreationAndDuplicatePrevention() {
        assertNotNull(dryFruitsCategory.getId());
        assertEquals("Dry Fruits", dryFruitsCategory.getName());

        CategoryRequest duplicateReq = new CategoryRequest();
        duplicateReq.setName("dry fruits");
        duplicateReq.setDescription("Another description");

        assertThrows(IllegalArgumentException.class, () -> categoryService.createCategory(duplicateReq));
    }

    @Test
    @DisplayName("Should safely deactivate category when active products are associated")
    void testSafeCategoryDeactivation() {
        ProductRequest productReq = ProductRequest.builder()
                .name("Kashmiri Walnuts")
                .description("Crispy natural Kashmiri walnuts")
                .price(new BigDecimal("899.00"))
                .originalPrice(new BigDecimal("999.00"))
                .inStock(true)
                .organic(true)
                .categoryId(dryFruitsCategory.getId())
                .build();

        productService.createProduct(productReq);

        // Attempt category deletion
        categoryService.deleteCategory(dryFruitsCategory.getId());

        // Category should be deactivated rather than crashing with foreign key exception
        CategoryResponse category = categoryService.getCategoryById(dryFruitsCategory.getId());
        assertFalse(category.getActive());
    }

    @Test
    @DisplayName("Should create product with gallery, validate prices and support isOrganic contract")
    void testProductCreationAndContracts() {
        ProductRequest productReq = ProductRequest.builder()
                .name("Mamra Almonds")
                .description("Authentic organic Mamra almonds sourced from high altitudes")
                .image("https://example.com/almonds.jpg")
                .images(List.of("https://example.com/almonds.jpg", "https://example.com/almonds-detail.jpg"))
                .ingredients("100% natural organic Mamra almonds")
                .nutrition("Protein: 22g, Healthy Fats: 50g")
                .price(new BigDecimal("1200.00"))
                .originalPrice(new BigDecimal("1400.00"))
                .inStock(true)
                .organic(true)
                .categoryId(dryFruitsCategory.getId())
                .build();

        ProductResponse response = productService.createProduct(productReq);

        assertNotNull(response.getId());
        assertEquals("Mamra Almonds", response.getName());
        assertTrue(response.getOrganic());
        assertTrue(response.getIsOrganic()); // Frontend contract check
        assertEquals(2, response.getGallery().size()); // Gallery contract check
        assertEquals("Dry Fruits", response.getCategoryName());
    }

    @Test
    @DisplayName("Should validate selling price cannot exceed original price")
    void testPriceValidation() {
        ProductRequest invalidPriceReq = ProductRequest.builder()
                .name("Overpriced Cashews")
                .price(new BigDecimal("1500.00"))
                .originalPrice(new BigDecimal("1200.00"))
                .categoryId(dryFruitsCategory.getId())
                .build();

        assertThrows(IllegalArgumentException.class, () -> productService.createProduct(invalidPriceReq));
    }

    @Test
    @DisplayName("Should search across product name and description, filter, sort and paginate")
    void testCatalogDiscoveryAndPagination() {
        ProductRequest p1 = ProductRequest.builder()
                .name("Organic Dried Figs")
                .description("Sweet and fibrous Turkish figs")
                .price(new BigDecimal("450.00"))
                .inStock(true)
                .organic(true)
                .categoryId(dryFruitsCategory.getId())
                .build();

        ProductRequest p2 = ProductRequest.builder()
                .name("Salted Pistachios")
                .description("Roasted in mineral salt")
                .price(new BigDecimal("750.00"))
                .inStock(false)
                .organic(false)
                .categoryId(dryFruitsCategory.getId())
                .build();

        productService.createProduct(p1);
        productService.createProduct(p2);

        // Search by description term "fibrous"
        PageResponse<ProductResponse> searchResult = productService.searchProducts(
                "fibrous", null, null, null, null, null, null, "price-asc", 0, 10
        );
        assertEquals(1, searchResult.getTotalElements());
        assertEquals("Organic Dried Figs", searchResult.getContent().get(0).getName());

        // Filter by inStock=true
        PageResponse<ProductResponse> inStockResult = productService.searchProducts(
                null, null, null, null, null, true, null, null, 0, 10
        );
        assertEquals(1, inStockResult.getTotalElements());
        assertEquals("Organic Dried Figs", inStockResult.getContent().get(0).getName());

        // Filter by organic=false
        PageResponse<ProductResponse> nonOrganicResult = productService.searchProducts(
                null, null, null, null, null, null, false, null, 0, 10
        );
        assertEquals(1, nonOrganicResult.getTotalElements());
        assertEquals("Salted Pistachios", nonOrganicResult.getContent().get(0).getName());

        // Sort by price-desc
        PageResponse<ProductResponse> sortedResult = productService.searchProducts(
                null, null, null, null, null, null, null, "price-desc", 0, 10
        );
        assertEquals(2, sortedResult.getTotalElements());
        assertEquals("Salted Pistachios", sortedResult.getContent().get(0).getName());
        assertEquals("Organic Dried Figs", sortedResult.getContent().get(1).getName());
    }

    @Test
    @DisplayName("Should manage product image addition and removal")
    void testProductImageManagement() {
        ProductRequest productReq = ProductRequest.builder()
                .name("Raw Walnuts")
                .price(new BigDecimal("600.00"))
                .image("https://example.com/walnut-1.jpg")
                .categoryId(dryFruitsCategory.getId())
                .build();

        ProductResponse product = productService.createProduct(productReq);

        // Add additional gallery image
        ProductResponse withAddedImg = productService.addProductImage(product.getId(), "https://example.com/walnut-2.jpg");
        assertTrue(withAddedImg.getImages().contains("https://example.com/walnut-2.jpg"));
        assertEquals(2, withAddedImg.getGallery().size());

        // Remove gallery image
        ProductResponse withRemovedImg = productService.removeProductImage(product.getId(), "https://example.com/walnut-2.jpg");
        assertFalse(withRemovedImg.getImages().contains("https://example.com/walnut-2.jpg"));
        assertEquals(1, withRemovedImg.getGallery().size());
    }
}
