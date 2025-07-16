package com.rolesync.rolesync;

import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.rolesync.rolesync.entities.Campaign;
import com.rolesync.rolesync.entities.TabletopCampaign;
import com.rolesync.rolesync.entities.Profile;
import com.rolesync.rolesync.enums.Communication;
import com.rolesync.rolesync.enums.WeekDay;
import com.rolesync.rolesync.enums.TimeZone;
import com.rolesync.rolesync.enums.Language;
import com.rolesync.rolesync.enums.RPGSystem;
import com.rolesync.rolesync.repositories.CampaignRepository;
import com.rolesync.rolesync.repositories.ProfileRepository;

@SpringBootApplication
public class RolesyncApplication implements CommandLineRunner {

	@Autowired
	private CampaignRepository campanyaRepository;

	@Autowired
	private ProfileRepository perfilRepository;

	public static void main(String[] args) {
		SpringApplication.run(RolesyncApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		String nombre = "Campaña de Prueba";
		String tematica = "Tecnología";
		String descripcion = "Esta es una campaña de prueba para verificar la funcionalidad del sistema.";
		// Aquí se puede crear un objeto Profile para el propietario si es necesario
		Profile propietario = new Profile("Juan Pérez", "juanpe@gmail.com", 667896543);
		perfilRepository.save(propietario);

		Set<Language> idiomas = Set.of(Language.Spanish, Language.Japanese);
		Set<Communication> comunicacion = Set.of(Communication.Discord, Communication.Facebook);
		TimeZone horario = TimeZone.GMTE3;
		String imagen = "https://example.com/imagen-campanya.jpg";
		Campaign campanya = new Campaign(nombre, tematica, descripcion, propietario, Set.of(propietario), comunicacion, idiomas, horario, imagen);
		campanyaRepository.save(campanya);

		Profile propietario2 = new Profile("Olga Pérez", "olgpe@gmail.com", 667896542);
		propietario2.setMemberOf(Set.of(campanya));
		perfilRepository.save(propietario2);

		// Crear una TabletopCampaign como ejemplo
		RPGSystem sistema = RPGSystem.CallOfCthulhu;
		WeekDay diaSemana = WeekDay.MONDAY;
		Double duracion = 2.0; // Duración en horas
		TabletopCampaign campanyaMesa = new TabletopCampaign(nombre, tematica, descripcion, propietario2, Set.of(propietario2), comunicacion, idiomas, horario, imagen, sistema, diaSemana, descripcion, duracion);
		campanyaRepository.save(campanyaMesa);

		List<Campaign> campanyas = (List<Campaign>) campanyaRepository.findAll();
		System.out.println("List of campaigns:");
		for (Campaign c : campanyas) {
			System.out.println("ID: " + c.getId() + ", Name: " + c.getName() + ", Description: " + c.getDescription());
		}
		System.out.println("Total campaigns: " + campanyas.size());
		System.out.println("Application started successfully!");
	}


}
