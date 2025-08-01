package com.rolesync.rolesync;

import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.rolesync.rolesync.entities.Campaign;
import com.rolesync.rolesync.entities.TabletopCampaign;
import com.rolesync.rolesync.entities.WrittenCampaign;
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
		// This method method below will prove CRUD operations on campaigns
		campaignCRUD();
		
	}

	public void campaignCRUD() {
		// Create a Profile to own the campaigns
		Profile owner = new Profile();
		owner.setName("gmUser");
		owner.setEmail("gm@example.com");
		owner.setPhone(123456789);

		Profile member1 = new Profile();
		member1.setName("playerOne");
		member1.setEmail("player1@example.com");
		member1.setPhone(987654321);

		Profile member2 = new Profile();
		member2.setName("playerTwo");
		member2.setEmail("player2@example.com");
		member2.setPhone(555666777);
		Set<Profile> profiles = Set.of(owner, member1, member2);

		perfilRepository.saveAll(profiles);

		// CREATE TabletopCampaign
		TabletopCampaign tabletop = new TabletopCampaign();
		tabletop.setName("Epic Tabletop Adventure");
		tabletop.setDescription("A classic fantasy tabletop campaign.");
		tabletop.setOwner(owner);
		tabletop.setLanguages(Set.of(Language.ENGLISH, Language.SPANISH));
		tabletop.setCommunications(Set.of(Communication.DISCORD, Communication.ZOOM));
		tabletop.setRPGSystem(RPGSystem.DUNGEONS_AND_DRAGONS);
		tabletop.setWeekDay(WeekDay.FRIDAY);
		tabletop.setTimeZone(TimeZone.GMTE10);
		tabletop.setMembers(Set.of(member1, member2));
		tabletop.setImage("https://cdn.prod.website-files.com/646df590700064e1c084f708/65cf741bb83c9eb63075389e_20170202_135906.jpeg");
		tabletop.setFrecuency("Weekly");
		tabletop.setDuration(2.0);
		tabletop.setTheme("Fantasía");
		campanyaRepository.save(tabletop);

		// CREATE WrittenCampaign
		WrittenCampaign written = new WrittenCampaign();
		written.setName("Mystery by Post");
		written.setDescription("A slow-paced, text-based mystery campaign.");
		written.setOwner(owner);
		written.setLanguages(Set.of(Language.ENGLISH));
		written.setCommunications(Set.of(Communication.FACEBOOK, Communication.TWITTER));
		written.setTimeZone(TimeZone.GMTE1);
		written.setTheme("Renacimiento");
		written.setImage("https://vramon1958.wordpress.com/wp-content/uploads/2014/02/escena-de-carnaval-domenico-tiepolo.jpg");
		written.setMembers(Set.of(member1));
		campanyaRepository.save(written);

		// READ campaigns
		Iterable<Campaign> allCampaigns = campanyaRepository.findAll();
		System.out.println("All campaigns:");
		allCampaigns.forEach(c -> System.out.println(c.getName()+"\n"));

		// UPDATE TabletopCampaign
		tabletop.setDescription(tabletop.getDescription()+" Updated: Now with more dragons!");
		campanyaRepository.save(tabletop);

		// UPDATE WrittenCampaign
		written.setDescription(written.getDescription()+" Updated: Now with more mystery!");
		campanyaRepository.save(written);

		Iterable<Campaign> allCampaigns2 = campanyaRepository.findAll();
		System.out.println("All campaigns (Updated):");
		allCampaigns2.forEach(c -> System.out.println(c+"\n"));

		// DELETE campaigns
		//campanyaRepository.delete(tabletop);
		//campanyaRepository.delete(written);

		Iterable<Campaign> allCampaigns3 = campanyaRepository.findAll();
		System.out.println("All campaigns (Deleted):");
		allCampaigns3.forEach(c -> System.out.println(c+"\n"));

		// Optionally, delete the owner profile if not needed elsewhere
		//perfilRepository.delete(owner);
	}
}
