package com.org.vilora.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileUploadService {

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.key:}")
    private String supabaseKey;

    @Value("${supabase.bucket.name:product-images}")
    private String bucketName;

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private final Path localUploadDir = Paths.get("uploads/products");

    public String uploadImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload an empty file");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid file format. Allowed formats: JPEG, PNG, WEBP, GIF");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.lastIndexOf('.') != -1) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        } else {
            extension = ".jpg";
        }

        String uniqueFilename = UUID.randomUUID().toString() + extension;

        // If Supabase Storage is configured with valid URL & Key
        if (supabaseUrl != null && !supabaseUrl.isBlank() && !supabaseUrl.contains("<") &&
            supabaseKey != null && !supabaseKey.isBlank() && !supabaseKey.contains("<")) {
            try {
                return uploadToSupabaseStorage(file, uniqueFilename, contentType);
            } catch (Exception e) {
                System.err.println("Supabase upload failed, falling back to local storage: " + e.getMessage());
            }
        }

        // Safe local fallback storage
        return uploadToLocalStorage(file, uniqueFilename);
    }

    private String uploadToLocalStorage(MultipartFile file, String uniqueFilename) {
        try {
            if (!Files.exists(localUploadDir)) {
                Files.createDirectories(localUploadDir);
            }

            Path destinationPath = localUploadDir.resolve(uniqueFilename);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationPath, StandardCopyOption.REPLACE_EXISTING);
            }

            return "/uploads/products/" + uniqueFilename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store image locally: " + e.getMessage(), e);
        }
    }

    private String uploadToSupabaseStorage(MultipartFile file, String filename, String contentType) throws Exception {
        String uploadEndpoint = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucketName, filename);

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(uploadEndpoint))
                .header("apikey", supabaseKey)
                .header("Authorization", "Bearer " + supabaseKey)
                .header("Content-Type", contentType)
                .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            return String.format("%s/storage/v1/object/public/%s/%s", supabaseUrl, bucketName, filename);
        } else {
            throw new RuntimeException("Supabase Storage responded with HTTP " + response.statusCode() + ": " + response.body());
        }
    }
}
