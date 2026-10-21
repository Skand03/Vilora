package com.org.vilora.config;

import com.org.vilora.entity.User;
import com.org.vilora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Provides secure, environment-variable-driven administrator provisioning on startup.
 * To bootstrap an admin, configure:
 * - ADMIN_BOOTSTRAP_EMAIL
 * - ADMIN_BOOTSTRAP_PASSWORD
 * - ADMIN_BOOTSTRAP_NAME (optional, defaults to 'Administrator')
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminBootstrapConfig implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.bootstrap.email:${ADMIN_BOOTSTRAP_EMAIL:}}")
    private String adminEmail;

    @Value("${admin.bootstrap.password:${ADMIN_BOOTSTRAP_PASSWORD:}}")
    private String adminPassword;

    @Value("${admin.bootstrap.name:${ADMIN_BOOTSTRAP_NAME:Administrator}}")
    private String adminName;

    @Override
    public void run(String... args) {
        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            log.info("No ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_PASSWORD configured. Skipping admin bootstrapping.");
            return;
        }

        String email = adminEmail.trim().toLowerCase();
        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setPassword(passwordEncoder.encode(adminPassword));
            user.setRole("ROLE_ADMIN");
            userRepository.save(user);
            log.info("Updated password and elevated user '{}' to ROLE_ADMIN.", email);
        } else {
            User admin = User.builder()
                    .fullName(adminName)
                    .email(email)
                    .password(passwordEncoder.encode(adminPassword))
                    .role("ROLE_ADMIN")
                    .build();
            userRepository.save(admin);
            log.info("Successfully provisioned initial administrator account with email '{}'.", email);
        }
    }
}
