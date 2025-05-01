package com.rolesync.rolesync;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.rolesync.rolesync.entities.Campanya;
import com.rolesync.rolesync.repositories.CampanyaRepository;

@SpringBootApplication
public class RolesyncApplication implements CommandLineRunner {

	@Autowired
	private CampanyaRepository campanyaRepository;

	public static void main(String[] args) {
		SpringApplication.run(RolesyncApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		Campanya campanya = new Campanya("Test Campaign", "This is a test campaign");
		campanyaRepository.save(campanya);

		List<Campanya> campanyas = (List<Campanya>) campanyaRepository.findAll();
		System.out.println("List of campaigns:");
		for (Campanya c : campanyas) {
			System.out.println("ID: " + c.getId() + ", Name: " + c.getNombre() + ", Description: " + c.getDescripcion());
		}
		System.out.println("Total campaigns: " + campanyas.size());
		System.out.println("Application started successfully!");
	}


}
