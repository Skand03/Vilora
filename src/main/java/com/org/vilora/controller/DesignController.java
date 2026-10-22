package com.org.vilora.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.server.ResponseStatusException;

@Controller
public class DesignController {

    @GetMapping("/design/{page:[a-zA-Z0-9_]+}")
    public String viewDesign(@PathVariable String page) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        if (page.startsWith("vilora_admin_") && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        return page;
    }
    
    @GetMapping("/")
    @org.springframework.web.bind.annotation.ResponseBody
    public java.util.Map<String, Object> index() {
        java.util.Map<String, Object> status = new java.util.HashMap<>();
        status.put("status", "UP");
        status.put("service", "Vilora Naturals API");
        return status;
    }

    @GetMapping({"/health", "/api/health"})
    @org.springframework.web.bind.annotation.ResponseBody
    public java.util.Map<String, Object> health() {
        java.util.Map<String, Object> status = new java.util.HashMap<>();
        status.put("status", "UP");
        status.put("service", "Vilora Naturals API");
        status.put("timestamp", System.currentTimeMillis());
        return status;
    }
}
