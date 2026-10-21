package com.org.vilora.service;

import com.org.vilora.dto.ProductRequest;
import com.org.vilora.dto.ProductResponse;
import com.org.vilora.dtoHelper.PageResponse;
import com.org.vilora.entity.Category;
import com.org.vilora.entity.Product;
import com.org.vilora.exception.ResourceNotFoundException;
import com.org.vilora.repository.CategoryRepository;
import com.org.vilora.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public ProductResponse createProduct(ProductRequest request) {
        String productName = request.getName().trim();

        if (productRepository.existsByNameIgnoreCase(productName)) {
            throw new IllegalArgumentException("Product already exists with name: " + productName);
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        validatePrices(request.getPrice(), request.getOriginalPrice());

        List<String> imageList = new ArrayList<>();
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            imageList.addAll(request.getImages());
        } else if (request.getImage() != null && !request.getImage().isBlank()) {
            imageList.add(request.getImage().trim());
        }

        String primaryImage = request.getImage();
        if ((primaryImage == null || primaryImage.isBlank()) && !imageList.isEmpty()) {
            primaryImage = imageList.get(0);
        }

        int initialStock = request.getStockQuantity() != null
                ? request.getStockQuantity()
                : (Boolean.FALSE.equals(request.getInStock()) ? 0 : 100);

        boolean initialInStock = request.getInStock() != null
                ? (request.getInStock() && initialStock > 0)
                : (initialStock > 0);

        Product product = Product.builder()
                .name(productName)
                .description(request.getDescription())
                .image(primaryImage)
                .images(imageList)
                .ingredients(request.getIngredients())
                .nutrition(request.getNutrition())
                .price(request.getPrice())
                .originalPrice(request.getOriginalPrice())
                .rating(BigDecimal.ZERO)
                .reviewCount(0)
                .stockQuantity(initialStock)
                .inStock(initialInStock)
                .organic(request.getOrganic() != null ? request.getOrganic() : false)
                .category(category)
                .build();

        return mapToResponse(productRepository.save(product));
    }

    @Override
    public ProductResponse getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToResponse(product);
    }

    @Override
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Override
    public PageResponse<ProductResponse> searchProducts(
            String search, List<String> categories, BigDecimal minPrice, BigDecimal maxPrice,
            BigDecimal rating, Boolean inStock, Boolean organic, String sortOption, int page, int size) {

        PageResponse<Product> productPage = productRepository.searchProducts(
                search, categories, minPrice, maxPrice, rating, inStock, organic, sortOption, page, size
        );

        List<ProductResponse> responseList = productPage.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return PageResponse.of(responseList, productPage.getPageNumber(), productPage.getPageSize(), productPage.getTotalElements());
    }

    @Override
    public ProductResponse updateProduct(UUID id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        String newName = request.getName().trim();
        if (!product.getName().equalsIgnoreCase(newName) && productRepository.existsByNameIgnoreCase(newName)) {
            throw new IllegalArgumentException("Product already exists with name: " + newName);
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        validatePrices(request.getPrice(), request.getOriginalPrice());

        product.setName(newName);
        product.setDescription(request.getDescription());
        
        if (request.getImage() != null) {
            product.setImage(request.getImage());
        }
        
        if (request.getImages() != null) {
            product.setImages(new ArrayList<>(request.getImages()));
            if ((product.getImage() == null || product.getImage().isBlank()) && !product.getImages().isEmpty()) {
                product.setImage(product.getImages().get(0));
            }
        }

        if (request.getIngredients() != null) {
            product.setIngredients(request.getIngredients());
        }
        if (request.getNutrition() != null) {
            product.setNutrition(request.getNutrition());
        }

        product.setPrice(request.getPrice());
        product.setOriginalPrice(request.getOriginalPrice());

        if (request.getStockQuantity() != null) {
            if (request.getStockQuantity() < 0) {
                throw new IllegalArgumentException("Stock quantity cannot be negative");
            }
            product.setStockQuantity(request.getStockQuantity());
            if (request.getInStock() == null) {
                product.setInStock(request.getStockQuantity() > 0);
            }
        }

        if (request.getInStock() != null) {
            product.setInStock(request.getInStock() && (product.getStockQuantity() == null || product.getStockQuantity() > 0));
        }

        product.setOrganic(request.getOrganic() != null ? request.getOrganic() : product.getOrganic());
        product.setCategory(category);

        return mapToResponse(productRepository.save(product));
    }

    @Override
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        try {
            productRepository.delete(product);
        } catch (Exception e) {
            // If foreign keys prevent hard delete, deactivate the product safely
            product.setInStock(false);
            productRepository.save(product);
        }
    }

    @Override
    public ProductResponse addProductImage(UUID id, String imageUrl) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (imageUrl == null || imageUrl.isBlank()) {
            throw new IllegalArgumentException("Image URL cannot be empty");
        }

        if (product.getImages() == null) {
            product.setImages(new ArrayList<>());
        }

        if (!product.getImages().contains(imageUrl.trim())) {
            product.getImages().add(imageUrl.trim());
        }

        if (product.getImage() == null || product.getImage().isBlank()) {
            product.setImage(imageUrl.trim());
        }

        return mapToResponse(productRepository.save(product));
    }

    @Override
    public ProductResponse removeProductImage(UUID id, String imageUrl) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (product.getImages() != null && imageUrl != null) {
            product.getImages().remove(imageUrl.trim());
            if (imageUrl.trim().equals(product.getImage())) {
                product.setImage(product.getImages().isEmpty() ? null : product.getImages().get(0));
            }
        }

        return mapToResponse(productRepository.save(product));
    }

    private void validatePrices(BigDecimal price, BigDecimal originalPrice) {
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price must be greater than zero");
        }
        if (originalPrice != null && originalPrice.compareTo(price) < 0) {
            throw new IllegalArgumentException("Original price cannot be less than selling price");
        }
    }

    private ProductResponse mapToResponse(Product product) {
        List<String> images = product.getImages() != null ? new ArrayList<>(product.getImages()) : new ArrayList<>();
        if (images.isEmpty() && product.getImage() != null && !product.getImage().isBlank()) {
            images.add(product.getImage());
        }

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .image(product.getImage())
                .images(images)
                .ingredients(product.getIngredients())
                .nutrition(product.getNutrition())
                .price(product.getPrice())
                .originalPrice(product.getOriginalPrice())
                .rating(product.getRating())
                .reviewCount(product.getReviewCount())
                .inStock(product.getInStock())
                .stockQuantity(product.getStockQuantity())
                .organic(product.getOrganic())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : product.getCategoryId())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}