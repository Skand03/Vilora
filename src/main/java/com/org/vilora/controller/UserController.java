package com.org.vilora.controller;

import com.org.vilora.entity.User;
import com.org.vilora.repository.UserRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;

import java.security.Principal;

@Controller
@RequestMapping("/user")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @ModelAttribute
    public void userDetails(Model model, Principal principal) {

        String email = principal.getName();

        User user = userRepository.findByEmail(email);

        model.addAttribute("user", user);
    }

    @GetMapping("/")
    public String home() {
        return "user/home";
    }
}