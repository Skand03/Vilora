package com.org.vilora.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Component
@Slf4j
public class SupabaseClient {

    private final String supabaseUrl;
    private final String supabaseKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public SupabaseClient(
            @Value("${supabase.url}") String supabaseUrl,
            @Value("${supabase.key}") String supabaseKey,
            ObjectMapper objectMapper) {
        this.supabaseUrl = supabaseUrl.endsWith("/") ? supabaseUrl.substring(0, supabaseUrl.length() - 1) : supabaseUrl;
        this.supabaseKey = supabaseKey;
        this.objectMapper = objectMapper.copy();

        com.fasterxml.jackson.databind.module.SimpleModule customTimeModule = new com.fasterxml.jackson.databind.module.SimpleModule();
        customTimeModule.addDeserializer(java.time.LocalDateTime.class, new com.fasterxml.jackson.databind.JsonDeserializer<>() {
            @Override
            public java.time.LocalDateTime deserialize(com.fasterxml.jackson.core.JsonParser p, com.fasterxml.jackson.databind.DeserializationContext ctxt) throws java.io.IOException {
                String text = p.getText();
                if (text == null || text.isBlank()) return null;
                try {
                    return java.time.OffsetDateTime.parse(text).toLocalDateTime();
                } catch (Exception e) {
                    return java.time.LocalDateTime.parse(text);
                }
            }
        });
        this.objectMapper.registerModule(customTimeModule);
        this.objectMapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    private HttpRequest.Builder baseRequest(String pathAndQuery) {
        String url = supabaseUrl + "/rest/v1/" + pathAndQuery;
        return HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("apikey", supabaseKey)
                .header("Authorization", "Bearer " + supabaseKey)
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(15));
    }

    public <T> List<T> select(String table, String queryParams, Class<T> clazz) {
        try {
            String path = table + (queryParams != null && !queryParams.isBlank() ? "?" + queryParams : "");
            HttpRequest request = baseRequest(path)
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return objectMapper.readValue(response.body(), objectMapper.getTypeFactory().constructCollectionType(List.class, clazz));
            } else {
                log.warn("Supabase select [{}] returned status {}: {}", table, response.statusCode(), response.body());
                return Collections.emptyList();
            }
        } catch (Exception e) {
            log.error("Error executing Supabase select on {}: {}", table, e.getMessage());
            return Collections.emptyList();
        }
    }

    public <T> Optional<T> selectOne(String table, String queryParams, Class<T> clazz) {
        List<T> list = select(table, queryParams, clazz);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public <T> Optional<T> insert(String table, Object body, Class<T> clazz) {
        try {
            String jsonBody = objectMapper.writeValueAsString(body);
            HttpRequest request = baseRequest(table)
                    .header("Prefer", "return=representation")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                List<T> list = objectMapper.readValue(response.body(), objectMapper.getTypeFactory().constructCollectionType(List.class, clazz));
                return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
            } else {
                log.error("Supabase insert [{}] failed with status {}: {}", table, response.statusCode(), response.body());
                throw new RuntimeException("Supabase insert failed on " + table + ": " + response.body());
            }
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error executing Supabase insert on " + table + ": " + e.getMessage(), e);
        }
    }

    public <T> List<T> insertList(String table, List<?> bodyList, Class<T> clazz) {
        if (bodyList == null || bodyList.isEmpty()) {
            return Collections.emptyList();
        }
        try {
            String jsonBody = objectMapper.writeValueAsString(bodyList);
            HttpRequest request = baseRequest(table)
                    .header("Prefer", "return=representation")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return objectMapper.readValue(response.body(), objectMapper.getTypeFactory().constructCollectionType(List.class, clazz));
            } else {
                log.error("Supabase insertList [{}] failed with status {}: {}", table, response.statusCode(), response.body());
                throw new RuntimeException("Supabase insertList failed on " + table + ": " + response.body());
            }
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error executing Supabase insertList on " + table + ": " + e.getMessage(), e);
        }
    }

    public <T> Optional<T> update(String table, String filter, Object body, Class<T> clazz) {
        try {
            String jsonBody = objectMapper.writeValueAsString(body);
            String path = table + (filter != null && !filter.isBlank() ? "?" + filter : "");
            HttpRequest request = baseRequest(path)
                    .header("Prefer", "return=representation")
                    .method("PATCH", HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                List<T> list = objectMapper.readValue(response.body(), objectMapper.getTypeFactory().constructCollectionType(List.class, clazz));
                return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
            } else {
                log.error("Supabase update [{}] failed with status {}: {}", table, response.statusCode(), response.body());
                throw new RuntimeException("Supabase update failed on " + table + ": " + response.body());
            }
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error executing Supabase update on " + table + ": " + e.getMessage(), e);
        }
    }

    public void delete(String table, String filter) {
        try {
            String path = table + (filter != null && !filter.isBlank() ? "?" + filter : "");
            HttpRequest request = baseRequest(path)
                    .DELETE()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.warn("Supabase delete [{}] returned status {}: {}", table, response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("Error executing Supabase delete on {}: {}", table, e.getMessage());
        }
    }

    public long count(String table, String filter) {
        try {
            String path = table + "?select=id" + (filter != null && !filter.isBlank() ? "&" + filter : "");
            HttpRequest request = baseRequest(path)
                    .header("Prefer", "count=exact")
                    .header("Range", "0-0")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            Optional<String> contentRange = response.headers().firstValue("content-range");
            if (contentRange.isPresent()) {
                String range = contentRange.get();
                if (range.contains("/")) {
                    String total = range.substring(range.lastIndexOf('/') + 1).trim();
                    if (!total.equals("*")) {
                        return Long.parseLong(total);
                    }
                }
            }
            List<?> list = objectMapper.readValue(response.body(), List.class);
            return list.size();
        } catch (Exception e) {
            log.error("Error executing Supabase count on {}: {}", table, e.getMessage());
            return 0;
        }
    }
}
