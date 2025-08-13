package com.rolesync.rolesync.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class GreetingController {

	@GetMapping("/req/login")
	public String login() {
		return "login";
	}

	@GetMapping("/req/signup")
	public String signup() {
		return "signup";
	}

}
