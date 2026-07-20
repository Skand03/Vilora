package com.org.vilora.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class DesignController {

    @GetMapping("/design/{page}")
    public String viewDesign(@PathVariable String page) {
        return page;
    }
    
    @GetMapping("/")
    public String index() {
        return "vilora_naturals_home";
    }
}
