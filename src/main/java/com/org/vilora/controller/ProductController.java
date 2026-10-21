package com.org.vilora.controller;

import com.org.vilora.dto.ProductRequest;
import com.org.vilora.dto.ProductResponse;
import com.org.vilora.dtoHelper.ApiResponse;
import com.org.vilora.dtoHelper.PageResponse;
import com.org.vilora.service.FileUploadService;
import com.org.vilora.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final FileUploadService fileUploadService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody ProductRequest request) {

        ProductResponse response = productService.createProduct(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(
            @PathVariable UUID id) {

        ProductResponse response = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Product fetched successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAllProducts() {
        List<ProductResponse> response = productService.getAllProducts();
        return ResponseEntity.ok(ApiResponse.success("Products fetched successfully", response));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> searchProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<String> categories,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) BigDecimal rating,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(required = false) Boolean organic,
            @RequestParam(required = false) Boolean isOrganic,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        List<String> effectiveCategories = new ArrayList<>();
        if (categories != null) {
            for (String cat : categories) {
                if (cat != null && !cat.isBlank()) {
                    for (String part : cat.split(",")) {
                        if (!part.trim().isEmpty()) {
                            effectiveCategories.add(part.trim());
                        }
                    }
                }
            }
        }
        if (category != null && !category.isBlank()) {
            for (String part : category.split(",")) {
                if (!part.trim().isEmpty()) {
                    effectiveCategories.add(part.trim());
                }
            }
        }

        Boolean effectiveOrganic = organic != null ? organic : isOrganic;

        PageResponse<ProductResponse> response = productService.searchProducts(
                search, effectiveCategories, minPrice, maxPrice, rating, inStock, effectiveOrganic, sort, page, size);

        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody ProductRequest request) {

        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @PathVariable UUID id) {

        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully"));
    }

    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
            @RequestParam("file") MultipartFile file) {

        String imageUrl = fileUploadService.uploadImage(file);
        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", Map.of("url", imageUrl)));
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<ApiResponse<ProductResponse>> addImageToProduct(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {

        String imageUrl = request.get("imageUrl");
        ProductResponse response = productService.addProductImage(id, imageUrl);
        return ResponseEntity.ok(ApiResponse.success("Image added to product", response));
    }

    @DeleteMapping("/{id}/images")
    public ResponseEntity<ApiResponse<ProductResponse>> removeImageFromProduct(
            @PathVariable UUID id,
            @RequestParam String imageUrl) {

        ProductResponse response = productService.removeProductImage(id, imageUrl);
        return ResponseEntity.ok(ApiResponse.success("Image removed from product", response));
    }
}