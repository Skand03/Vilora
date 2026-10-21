package com.org.vilora.repository;

import com.org.vilora.client.SupabaseClient;
import com.org.vilora.dtoHelper.PageResponse;
import com.org.vilora.entity.Category;
import com.org.vilora.entity.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class ProductRepository {

    private final SupabaseClient supabaseClient;
    private final CategoryRepository categoryRepository;
    private static final String TABLE = "products";

    public Optional<Product> findById(UUID id) {
        if (id == null) return Optional.empty();
        Optional<Product> productOpt = supabaseClient.selectOne(TABLE, "id=eq." + id, Product.class);
        productOpt.ifPresent(this::populateCategory);
        return productOpt;
    }

    public boolean existsById(UUID id) {
        if (id == null) return false;
        return supabaseClient.count(TABLE, "id=eq." + id) > 0;
    }

    public Optional<Product> findByIdWithLock(UUID id) {
        return findById(id);
    }

    public List<Product> findAll() {
        List<Product> products = supabaseClient.select(TABLE, "order=created_at.desc", Product.class);
        populateCategories(products);
        return products;
    }

    public boolean existsByNameIgnoreCase(String name) {
        if (name == null || name.isBlank()) return false;
        String encoded = URLEncoder.encode(name.trim(), StandardCharsets.UTF_8);
        return supabaseClient.count(TABLE, "name=ilike." + encoded) > 0;
    }

    public boolean existsByCategoryId(UUID categoryId) {
        if (categoryId == null) return false;
        return supabaseClient.count(TABLE, "category_id=eq." + categoryId) > 0;
    }

    public long countByCategoryId(UUID categoryId) {
        if (categoryId == null) return 0;
        return supabaseClient.count(TABLE, "category_id=eq." + categoryId);
    }

    public Product save(Product product) {
        LocalDateTime now = LocalDateTime.now();
        if (product.getCategory() != null && product.getCategory().getId() != null) {
            product.setCategoryId(product.getCategory().getId());
        }

        if (product.getId() == null) {
            product.setId(UUID.randomUUID());
            product.setCreatedAt(now);
            product.setUpdatedAt(now);
            Product saved = supabaseClient.insert(TABLE, product, Product.class).orElse(product);
            populateCategory(saved);
            return saved;
        } else {
            product.setUpdatedAt(now);
            Product updated = supabaseClient.update(TABLE, "id=eq." + product.getId(), product, Product.class).orElse(product);
            populateCategory(updated);
            return updated;
        }
    }

    public void delete(Product product) {
        if (product != null && product.getId() != null) {
            deleteById(product.getId());
        }
    }

    public void deleteById(UUID id) {
        if (id != null) {
            supabaseClient.delete(TABLE, "id=eq." + id);
        }
    }

    public void deleteAll() {
        supabaseClient.delete(TABLE, "id=neq.00000000-0000-0000-0000-000000000000");
    }

    public PageResponse<Product> searchProducts(
            String search, List<String> categoryNamesOrIds, BigDecimal minPrice, BigDecimal maxPrice,
            BigDecimal minRating, Boolean inStock, Boolean organic, String sortOption, int page, int size) {

        int validPage = Math.max(0, page);
        int validSize = Math.max(1, size);

        // Fetch all products or filter by PostgREST query parameters
        List<String> queryParts = new ArrayList<>();

        if (inStock != null) {
            queryParts.add("in_stock=eq." + inStock);
        }
        if (organic != null) {
            queryParts.add("is_organic=eq." + organic);
        }
        if (minPrice != null) {
            queryParts.add("price=gte." + minPrice);
        }
        if (maxPrice != null) {
            queryParts.add("price=lte." + maxPrice);
        }
        if (minRating != null) {
            queryParts.add("rating=gte." + minRating);
        }

        // Sorting
        String orderParam = "created_at.desc";
        if (sortOption != null && !sortOption.isBlank()) {
            switch (sortOption.trim().toLowerCase()) {
                case "price-asc":
                    orderParam = "price.asc";
                    break;
                case "price-desc":
                    orderParam = "price.desc";
                    break;
                case "newest":
                    orderParam = "created_at.desc";
                    break;
                case "top-rated":
                    orderParam = "rating.desc";
                    break;
                default:
                    orderParam = "created_at.desc";
                    break;
            }
        }
        queryParts.add("order=" + orderParam);

        String queryParams = String.join("&", queryParts);
        List<Product> products = supabaseClient.select(TABLE, queryParams, Product.class);
        populateCategories(products);

        // Client-side filtering for search term and category names if applicable
        List<Product> filtered = products.stream()
                .filter(p -> {
                    if (search != null && !search.isBlank()) {
                        String term = search.trim().toLowerCase();
                        boolean nameMatch = p.getName() != null && p.getName().toLowerCase().contains(term);
                        boolean descMatch = p.getDescription() != null && p.getDescription().toLowerCase().contains(term);
                        if (!nameMatch && !descMatch) return false;
                    }
                    if (categoryNamesOrIds != null && !categoryNamesOrIds.isEmpty()) {
                        boolean match = false;
                        for (String cat : categoryNamesOrIds) {
                            if (cat == null || cat.isBlank()) continue;
                            String cTrim = cat.trim();
                            if (p.getCategoryId() != null && p.getCategoryId().toString().equalsIgnoreCase(cTrim)) {
                                match = true;
                                break;
                            }
                            if (p.getCategory() != null && p.getCategory().getName() != null &&
                                    p.getCategory().getName().equalsIgnoreCase(cTrim)) {
                                match = true;
                                break;
                            }
                        }
                        if (!match) return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());

        long totalElements = filtered.size();
        int fromIndex = Math.min(validPage * validSize, filtered.size());
        int toIndex = Math.min(fromIndex + validSize, filtered.size());
        List<Product> pagedList = filtered.subList(fromIndex, toIndex);

        return PageResponse.of(pagedList, validPage, validSize, totalElements);
    }

    private void populateCategory(Product product) {
        if (product == null) return;
        if (product.getCategory() == null && product.getCategoryId() != null) {
            categoryRepository.findById(product.getCategoryId()).ifPresent(product::setCategory);
        }
    }

    private void populateCategories(List<Product> products) {
        if (products == null || products.isEmpty()) return;
        List<Category> allCategories = categoryRepository.findAll();
        Map<UUID, Category> catMap = allCategories.stream()
                .collect(Collectors.toMap(Category::getId, c -> c, (a, b) -> a));

        for (Product p : products) {
            if (p.getCategory() == null && p.getCategoryId() != null) {
                p.setCategory(catMap.get(p.getCategoryId()));
            }
        }
    }
}