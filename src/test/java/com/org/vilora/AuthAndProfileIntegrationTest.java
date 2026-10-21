package com.org.vilora;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.org.vilora.dto.LoginRequest;
import com.org.vilora.dto.ProductRequest;
import com.org.vilora.dto.RegisterRequest;
import com.org.vilora.dto.UserUpdateRequest;
import com.org.vilora.entity.Category;
import com.org.vilora.entity.User;
import com.org.vilora.repository.CategoryRepository;
import com.org.vilora.repository.ProductRepository;
import com.org.vilora.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthAndProfileIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Should register new customer, hash password, and reject duplicates")
    void testRegisterAndDuplicatePrevention() throws Exception {
        String testEmail = "aarav" + UUID.randomUUID().toString().substring(0, 8) + "@example.com";
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setFullName("Aarav Sharma");
        registerReq.setEmail(testEmail);
        registerReq.setPassword("SecretPassword123");
        registerReq.setAddress("42 Palm Grove, Mumbai");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.email").value(testEmail))
                .andExpect(jsonPath("$.data.role").value("ROLE_CUSTOMER"));

        // Verify password is encrypted in database
        User savedUser = userRepository.findByEmail(testEmail).orElseThrow();
        assertTrue(passwordEncoder.matches("SecretPassword123", savedUser.getPassword()));
        assertFalse(savedUser.getPassword().contains("SecretPassword123"));

        // Attempt duplicate registration
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Should login successfully and reject bad credentials")
    void testLoginAndBadCredentials() throws Exception {
        User user = User.builder()
                .fullName("Priya Patel")
                .email("priya@example.com")
                .password(passwordEncoder.encode("ValidPassword123"))
                .role("ROLE_CUSTOMER")
                .build();
        userRepository.save(user);

        // Valid login
        LoginRequest validLogin = new LoginRequest("priya@example.com", "ValidPassword123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty());

        // Invalid password
        LoginRequest invalidLogin = new LoginRequest("priya@example.com", "WrongPassword");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Should access /me and update profile when authenticated, reject unauthenticated access")
    void testProfileAndAuthenticationProtection() throws Exception {
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setFullName("Rohan Gupta");
        registerReq.setEmail("rohan@example.com");
        registerReq.setPassword("Password123");
        registerReq.setAddress("Old Address");

        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        Map<?, ?> responseBody = objectMapper.readValue(regResult.getResponse().getContentAsString(), Map.class);
        Map<?, ?> dataMap = (Map<?, ?>) responseBody.get("data");
        String token = (String) dataMap.get("token");

        // Access /api/auth/profile without token -> 401
        mockMvc.perform(get("/api/auth/profile"))
                .andExpect(status().isUnauthorized());

        // Access /api/auth/profile with token -> 200 without password hash
        mockMvc.perform(get("/api/auth/profile")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("rohan@example.com"))
                .andExpect(jsonPath("$.data.fullName").value("Rohan Gupta"))
                .andExpect(jsonPath("$.data.password").doesNotExist());

        // Update profile
        UserUpdateRequest updateReq = UserUpdateRequest.builder()
                .fullName("Rohan S. Gupta")
                .address("100 Marine Drive, Mumbai")
                .phone("9876543210")
                .build();

        mockMvc.perform(put("/api/users/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fullName").value("Rohan S. Gupta"))
                .andExpect(jsonPath("$.data.address").value("100 Marine Drive, Mumbai"));
    }

    @Test
    @DisplayName("Should forbid customer from performing administrative catalog modifications")
    void testRoleBasedAccessControl() throws Exception {
        Category category = Category.builder()
                .name("Superfoods")
                .active(true)
                .build();
        categoryRepository.save(category);

        // Register customer
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setFullName("Customer User");
        registerReq.setEmail("customer@example.com");
        registerReq.setPassword("CustomerPassword123");

        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        Map<?, ?> responseBody = objectMapper.readValue(regResult.getResponse().getContentAsString(), Map.class);
        Map<?, ?> dataMap = (Map<?, ?>) responseBody.get("data");
        String customerToken = (String) dataMap.get("token");

        // Customer attempts to create product -> 403 Forbidden
        ProductRequest productReq = ProductRequest.builder()
                .name("Unauthorized Chia Seeds")
                .price(new BigDecimal("350.00"))
                .categoryId(category.getId())
                .build();

        mockMvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(productReq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }
}
