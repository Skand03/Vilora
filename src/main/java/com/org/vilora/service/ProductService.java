package com.org.vilora.service;

import com.org.vilora.dto.ProductRequest;
import com.org.vilora.dto.ProductResponse;
import com.org.vilora.dtoHelper.PageResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request);

    ProductResponse getProductById(UUID id);

    List<ProductResponse> getAllProducts();

    PageResponse<ProductResponse> searchProducts(
            String search,
            List<String> categories,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            BigDecimal rating,
            Boolean inStock,
            Boolean organic,
            String sortOption,
            int page,
            int size
    );

    ProductResponse updateProduct(UUID id, ProductRequest request);

    void deleteProduct(UUID id);

    ProductResponse addProductImage(UUID id, String imageUrl);

    ProductResponse removeProductImage(UUID id, String imageUrl);
}