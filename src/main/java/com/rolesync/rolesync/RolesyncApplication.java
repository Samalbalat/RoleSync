package com.rolesync.rolesync;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class RolesyncApplication {

	public static void main(String[] args) {
		SpringApplication.run(RolesyncApplication.class, args);
	}

}
