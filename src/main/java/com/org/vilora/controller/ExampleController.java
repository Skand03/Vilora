//package com.org.vilora.controller;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Controller;
//import org.springframework.ui.Model;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.ModelAttribute;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//
//import com.org.vilora.model.Example;
//import com.org.vilora.pojo.ExamplePojo;
//import com.org.vilora.service.ExampleService;
//
//@Controller
//public class ExampleController {
//
//	@Autowired
//	ExampleService egService;
//
//	@GetMapping("/")
//	public String getView() {
//		return "helloWorld";
//	}
//
//	@PostMapping("/welcome")
//	public String welcomePage(@RequestParam("name") String name, @RequestParam("email") String email,
//			@ModelAttribute ExamplePojo egPojo, Model model) {
//
//		System.out.println("USERNAME::: " + name);
//
//		model.addAttribute("username", name);
//
//		egService.save(egPojo);
//
//		/*
//		 or we can also avoid using @RequestParam for name and email
//
//		 model.addAttribute(egPojo, "egPojo");
//		 */
//
//		return "welcome";
//	}
//
//}
