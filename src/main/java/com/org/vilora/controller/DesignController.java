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
    public String index() {
        return "vilora_naturals_home";
    }
}
