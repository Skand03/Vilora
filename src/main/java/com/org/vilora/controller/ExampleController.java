package com.org.vilora.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.org.vilora.model.Example;

@Controller
public class ExampleController {
	
	@GetMapping("/")
	public String getView() {
		return "helloWorld";
	}

}
