package com.org.vilora.controller;

import com.org.vilora.model.User;
import com.org.vilora.service.UserService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/auth")
public class AuthController {

    //    @Autowired
    private UserService userService;


    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/")
    public String showHomePage() {
        return "index";
    }

    @GetMapping("/signin")
    public String showLoginPage() {
        return "login";
    }

    @GetMapping("/register")
    public String showRegisterPage() {
        return "register";
    }

    @PostMapping("/createUser")
    public String createUser(@ModelAttribute User user,
                             RedirectAttributes redirectAttributes) {

        boolean emailExists = userService.existsByEmail(user.getEmail());

        if (emailExists) {

            redirectAttributes.addFlashAttribute(
                    "message",
                    "Email already exists. Please use another email."
            );

        } else {

            User savedUser = userService.createUser(user);

            if (savedUser != null) {

                redirectAttributes.addFlashAttribute(
                        "message",
                        "Registration successful."
                );

            } else {

                redirectAttributes.addFlashAttribute(
                        "message",
                        "Something went wrong."
                );
            }
        }

        return "redirect:/auth/register";
    }
}