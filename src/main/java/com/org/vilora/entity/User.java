package com.org.vilora.entity;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class User {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("full_name")
    @JsonAlias({"fullName"})
    private String fullName;

    @JsonProperty("email")
    private String email;

    @JsonProperty("address")
    private String address;

    @JsonProperty("password")
    private String password;

    @JsonProperty("qualification")
    private String qualification;

    @JsonProperty("role")
    @Builder.Default
    private String role = "ROLE_CUSTOMER";

    @JsonProperty("created_at")
    @JsonAlias({"createdAt"})
    @com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = OffsetDateTimeDeserializer.class)
    private LocalDateTime createdAt;

    public static class OffsetDateTimeDeserializer extends com.fasterxml.jackson.databind.JsonDeserializer<LocalDateTime> {
        @Override
        public LocalDateTime deserialize(com.fasterxml.jackson.core.JsonParser p, com.fasterxml.jackson.databind.DeserializationContext ctxt) throws java.io.IOException {
            String text = p.getText();
            if (text == null || text.isBlank()) return null;
            try {
                return java.time.OffsetDateTime.parse(text).toLocalDateTime();
            } catch (Exception e) {
                return java.time.LocalDateTime.parse(text);
            }
        }
    }

    // Non-persistent fields not present in Supabase public.users table
    @JsonIgnore
    private String phone;

    @JsonIgnore
    private LocalDateTime updatedAt;
}