package com.rolesync.rolesync;

import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.rolesync.rolesync.entities.Campanya;
import com.rolesync.rolesync.entities.CampanyaMesa;
import com.rolesync.rolesync.entities.Perfil;
import com.rolesync.rolesync.enums.Comunicacion;
import com.rolesync.rolesync.enums.DiaSemana;
import com.rolesync.rolesync.enums.Horario;
import com.rolesync.rolesync.enums.Idioma;
import com.rolesync.rolesync.enums.Sistema;
import com.rolesync.rolesync.repositories.CampanyaRepository;
import com.rolesync.rolesync.repositories.PerfilRepository;

@SpringBootApplication
public class RolesyncApplication implements CommandLineRunner {

	@Autowired
	private CampanyaRepository campanyaRepository;

	@Autowired
	private PerfilRepository perfilRepository;

	public static void main(String[] args) {
		SpringApplication.run(RolesyncApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		String nombre = "Campaña de Prueba";
		String tematica = "Tecnología";
		String descripcion = "Esta es una campaña de prueba para verificar la funcionalidad del sistema.";
		// Aquí se puede crear un objeto Perfil para el propietario si es necesario
		Perfil propietario = new Perfil("Juan Pérez", "juanpe@gmail.com", 667896543);
		perfilRepository.save(propietario);

		Set<Idioma> idiomas = Set.of(Idioma.Español, Idioma.Japonés);
		Set<Comunicacion> comunicacion = Set.of(Comunicacion.Discord, Comunicacion.Facebook);
		Horario horario = Horario.GMTE3;
		String imagen = "https://example.com/imagen-campanya.jpg";
		Campanya campanya = new Campanya(nombre, tematica, descripcion, propietario, Set.of(propietario), comunicacion, idiomas, horario, imagen);
		campanyaRepository.save(campanya);

		Perfil propietario2 = new Perfil("Olga Pérez", "olgpe@gmail.com", 667896542);
		propietario2.setCampanyasMiembro(Set.of(campanya));
		perfilRepository.save(propietario2);

		// Crear una CampanyaMesa como ejemplo
		Sistema sistema = Sistema.CallOfCthulhu;
		DiaSemana diaSemana = DiaSemana.LUNES;
		Double duracion = 2.0; // Duración en horas
		CampanyaMesa campanyaMesa = new CampanyaMesa(nombre, tematica, descripcion, propietario2, Set.of(propietario2), comunicacion, idiomas, horario, imagen, sistema, diaSemana, descripcion, duracion, "Madrid");
		campanyaRepository.save(campanyaMesa);

		List<Campanya> campanyas = (List<Campanya>) campanyaRepository.findAll();
		System.out.println("List of campaigns:");
		for (Campanya c : campanyas) {
			System.out.println("ID: " + c.getId() + ", Name: " + c.getNombre() + ", Description: " + c.getDescripcion());
		}
		System.out.println("Total campaigns: " + campanyas.size());
		System.out.println("Application started successfully!");
	}


}
