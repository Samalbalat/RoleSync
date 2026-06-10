package com.rolesync.rolesync.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import com.rolesync.rolesync.controller.CharacterSheetController;
import com.rolesync.rolesync.dto.charactersheetcontroller.CharacterSchemaField;
import com.rolesync.rolesync.dto.charactersheetcontroller.CharacterSheetInPostDTO;
import com.rolesync.rolesync.model.Campaign;
import com.rolesync.rolesync.model.CharacterSheet;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.repository.CampaignRepository;
import com.rolesync.rolesync.repository.CharacterSheetRepository;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.utils.UtilsCalls;

@ExtendWith(MockitoExtension.class)
class CharacterSheetControllerTest {

        @Mock
        private CampaignRepository campaignRepository;
        @Mock
        private CharacterSheetRepository characterSheetRepository;
        @Mock
        private ProfileRepository profileRepository;
        @Mock
        private UtilsCalls utilsCalls;
        @Mock
        private Authentication authentication;

        @InjectMocks
        private CharacterSheetController controller;

        private Profile profile;

        @BeforeEach
        void setup() {
                profile = new Profile();
                profile.setProfilename("testUser");
        }

        // --------------------------------------------------
        // AUTH FAILURE (GLOBAL CHECK)
        // --------------------------------------------------

        @Test
        void shouldReturn403whenAuthFailsOnCreateCharacter() {
                CharacterSheetInPostDTO dto = new CharacterSheetInPostDTO();

                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(false);

                ResponseEntity<?> response = controller.createFreeCharacter(authentication, dto, "testUser");

                assertEquals(403, response.getStatusCode().value());
        }

        // --------------------------------------------------
        // CREATE CHARACTER - PROFILE NOT FOUND
        // --------------------------------------------------

        @Test
        void shouldReturn403WhenProfileNotFoundOnCreate() {
                CharacterSheetInPostDTO dto = new CharacterSheetInPostDTO();

                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);
                when(profileRepository.findByProfilename("testUser"))
                                .thenReturn(Optional.empty());

                ResponseEntity<?> response = controller.createFreeCharacter(authentication, dto, "testUser");

                assertEquals(403, response.getStatusCode().value());
        }

        // --------------------------------------------------
        // CREATE CHARACTER - SUCCESS (NO CAMPAIGN)
        // --------------------------------------------------

        @Test
        void shouldCreateCharacterSuccessfully() {
                CharacterSheetInPostDTO dto = new CharacterSheetInPostDTO();
                dto.setName("Hero");
                List<CharacterSchemaField> fields = List
                                .of(new CharacterSchemaField("strength", "Strength", "number", true, 1, 20, 10));
                dto.setAttributes(fields);
                dto.setAvatar_url("img.png");
                dto.setIsPublic(true);

                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);
                when(profileRepository.findByProfilename("testUser"))
                                .thenReturn(Optional.of(profile));

                when(characterSheetRepository.save(any())).thenAnswer(inv -> {
                        CharacterSheet cs = inv.getArgument(0);
                        cs.setId(1L);
                        return cs;
                });

                ResponseEntity<?> response = controller.createFreeCharacter(authentication, dto, "testUser");

                assertEquals(200, response.getStatusCode().value());
        }

        // --------------------------------------------------
        // GET MY CHARACTERS - AUTH FAIL
        // --------------------------------------------------

        @Test
        void shouldReturn403OnGetMyCharactersWhenAuthFails() {
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(false);

                ResponseEntity<?> response = controller.getMyCharacters(authentication, "testUser");

                assertEquals(403, response.getStatusCode().value());
        }

        // --------------------------------------------------
        // GET MY CHARACTERS - SUCCESS
        // --------------------------------------------------

        @Test
        void shouldReturnCharactersOnGetMyCharacters() {
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);
                when(profileRepository.findByProfilename("testUser"))
                                .thenReturn(Optional.of(profile));

                CharacterSheet sheet = new CharacterSheet();
                sheet.setId(1L);
                sheet.setOwner(profile);
                sheet.setName("Hero");

                when(characterSheetRepository.findByOwnerAndIsTemplate(profile, false))
                                .thenReturn(List.of(sheet));

                ResponseEntity<?> response = controller.getMyCharacters(authentication, "testUser");

                assertEquals(200, response.getStatusCode().value());
        }

        // --------------------------------------------------
        // GET BY ID - NOT FOUND
        // --------------------------------------------------

        @Test
        void shouldReturn404WhenCharacterNotFoundById() {
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);
                when(profileRepository.findByProfilename("testUser"))
                                .thenReturn(Optional.of(profile));
                when(characterSheetRepository.findByIdAndIsTemplate(1L, false))
                                .thenReturn(Optional.empty());

                ResponseEntity<?> response = controller.getCharacterById(authentication, 1L, "testUser");

                assertEquals(404, response.getStatusCode().value());
        }

        // --------------------------------------------------
        // GET BY ID - SUCCESS PUBLIC CHARACTER
        // --------------------------------------------------

        @Test
        void shouldReturn200WhenPublicCharacter() {
                CharacterSheet sheet = new CharacterSheet();
                sheet.setId(1L);
                sheet.setIsPublic(true);
                sheet.setOwner(profile);

                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);
                when(profileRepository.findByProfilename("testUser"))
                                .thenReturn(Optional.of(profile));
                when(characterSheetRepository.findByIdAndIsTemplate(1L, false))
                                .thenReturn(Optional.of(sheet));

                ResponseEntity<?> response = controller.getCharacterById(authentication, 1L, "testUser");

                assertEquals(200, response.getStatusCode().value());
        }

        // --------------------------------------------------
        // UPDATE CHARACTER - NOT OWNER
        // --------------------------------------------------

        @Test
        void shouldReturn403WhenNotOwnerOnUpdate() {
                CharacterSheet sheet = new CharacterSheet();
                Profile other = new Profile();
                other.setId(2L);
                other.setProfilename("other");

                sheet.setOwner(other);

                CharacterSheetInPostDTO dto = new CharacterSheetInPostDTO();

                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);
                when(profileRepository.findByProfilename("testUser"))
                                .thenReturn(Optional.of(profile));
                when(characterSheetRepository.findById(1L))
                                .thenReturn(Optional.of(sheet));

                ResponseEntity<?> response = controller.updateCharacter(authentication, 1L, dto, "testUser");

                assertEquals(403, response.getStatusCode().value());
        }

        // --------------------------------------------------
        // UPDATE CHARACTER - SUCCESS
        // --------------------------------------------------

        @Test
        void shouldUpdateCharacterSuccessfully() {
                CharacterSheet sheet = new CharacterSheet();
                sheet.setOwner(profile);
                sheet.setId(1L);

                CharacterSheetInPostDTO dto = new CharacterSheetInPostDTO();
                dto.setName("Updated");

                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);
                when(profileRepository.findByProfilename("testUser"))
                                .thenReturn(Optional.of(profile));
                when(characterSheetRepository.findById(1L))
                                .thenReturn(Optional.of(sheet));

                ResponseEntity<?> response = controller.updateCharacter(authentication, 1L, dto, "testUser");

                assertEquals(200, response.getStatusCode().value());
                verify(characterSheetRepository).save(sheet);
        }

        // --------------------------------------------------
        // GET CAMPAIGN SHEETS - NOT FOUND CAMPAIGN
        // --------------------------------------------------

        @Test
        void shouldReturn404WhenCampaignNotFound() {
                when(campaignRepository.findById(1L)).thenReturn(Optional.empty());

                ResponseEntity<?> response = controller.getTemplatesFromCampaign(authentication, 1L, "testUser");

                assertEquals(404, response.getStatusCode().value());
        }

        // --------------------------------------------------
        // GET CAMPAIGN SHEETS - FORBIDDEN NOT MEMBER
        // --------------------------------------------------

        @Test
        void shouldReturn403WhenNotMemberOfCampaign() {
                Campaign campaign = mock(Campaign.class);
                Profile owner = new Profile();
                owner.setId(1L);
                owner.setProfilename("owner");

                when(campaign.getOwner()).thenReturn(owner);
                when(campaign.getMembers()).thenReturn(List.of("someoneElse"));

                when(campaignRepository.findById(1L)).thenReturn(Optional.of(campaign));
                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);

                ResponseEntity<?> response = controller.getCharactersFromCampaign(authentication, 1L, "testUser");

                assertEquals(403, response.getStatusCode().value());
        }

        @Test
        void shouldReturn200WhenCampaignMemberGetsCharacters() {
                Campaign campaign = mock(Campaign.class);

                Profile owner = new Profile();
                owner.setProfilename("owner");

                when(campaign.getOwner()).thenReturn(owner);
                when(campaign.getMembers()).thenReturn(List.of("testUser"));

                when(campaignRepository.findById(1L))
                                .thenReturn(Optional.of(campaign));

                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);

                when(characterSheetRepository.findByCampaignAndIsTemplate(campaign, false))
                                .thenReturn(List.of());

                ResponseEntity<?> response = controller.getCharactersFromCampaign(authentication, 1L, "testUser");

                assertEquals(200, response.getStatusCode().value());
        }

        @Test
        void shouldReturn200WhenOwnerGetsPrivateCharacter() {
                CharacterSheet sheet = new CharacterSheet();
                sheet.setOwner(profile);
                sheet.setIsPublic(false);

                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);

                when(profileRepository.findByProfilename("testUser"))
                                .thenReturn(Optional.of(profile));

                when(characterSheetRepository.findByIdAndIsTemplate(1L, false))
                                .thenReturn(Optional.of(sheet));

                ResponseEntity<?> response = controller.getCharacterById(authentication, 1L, "testUser");

                assertEquals(200, response.getStatusCode().value());
        }

        @Test
        void shouldReturn403WhenNonOwnerGetsPrivateTemplate() {
                Profile owner = new Profile();
                owner.setProfilename("owner");

                CharacterSheet sheet = new CharacterSheet();
                sheet.setOwner(owner);
                sheet.setIsTemplate(true);
                sheet.setIsPublic(false);

                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);

                when(profileRepository.findByProfilename("testUser"))
                                .thenReturn(Optional.of(profile));

                when(characterSheetRepository.findByIdAndIsTemplate(1L, true))
                                .thenReturn(Optional.of(sheet));

                ResponseEntity<?> response = controller.getTemplateById(authentication, 1L, "testUser");

                assertEquals(403, response.getStatusCode().value());
                assertEquals(
                                "User is not the owner of this template",
                                response.getBody());
        }

        @Test
        void shouldReturn404WhenCampaignNotFoundOnCreateCharacter() {
                CharacterSheetInPostDTO dto = new CharacterSheetInPostDTO();
                dto.setCampaign_id(1L);

                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);
                when(profileRepository.findByProfilename("testUser"))
                                .thenReturn(Optional.of(profile));
                when(campaignRepository.findById(1L))
                                .thenReturn(Optional.empty());

                ResponseEntity<?> response = controller.createFreeCharacter(authentication, dto, "testUser");

                assertEquals(404, response.getStatusCode().value());
        }

        @Test
        void shouldReturn403WhenNotMemberAndNotOwnerOnCreateCharacterWithCampaign() {
                CharacterSheetInPostDTO dto = new CharacterSheetInPostDTO();
                dto.setCampaign_id(1L);

                Campaign campaign = mock(Campaign.class);

                Profile owner = new Profile();
                owner.setProfilename("owner");

                when(campaign.getOwner()).thenReturn(owner);
                when(campaign.getMembers()).thenReturn(List.of("someoneElse"));

                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);
                when(profileRepository.findByProfilename("testUser"))
                                .thenReturn(Optional.of(profile));
                when(campaignRepository.findById(1L))
                                .thenReturn(Optional.of(campaign));

                ResponseEntity<?> response = controller.createFreeCharacter(authentication, dto, "testUser");

                assertEquals(403, response.getStatusCode().value());
        }

        @Test
        void shouldAssignCampaignWhenOwnerCreatesCharacter() {
                CharacterSheetInPostDTO dto = new CharacterSheetInPostDTO();
                dto.setCampaign_id(1L);

                Campaign campaign = mock(Campaign.class);

                Profile owner = new Profile();
                owner.setProfilename("testUser");

                when(campaign.getOwner()).thenReturn(owner);

                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);
                when(profileRepository.findByProfilename("testUser"))
                                .thenReturn(Optional.of(profile));
                when(campaignRepository.findById(1L))
                                .thenReturn(Optional.of(campaign));

                when(characterSheetRepository.save(any())).thenAnswer(i -> {
                        CharacterSheet cs = i.getArgument(0);
                        cs.setId(1L);
                        return cs;
                });

                ResponseEntity<?> response = controller.createFreeCharacter(authentication, dto, "testUser");

                assertEquals(200, response.getStatusCode().value());
        }

        @Test
        void shouldAssignCampaignWhenMemberCreatesCharacter() {
                CharacterSheetInPostDTO dto = new CharacterSheetInPostDTO();
                dto.setCampaign_id(1L);

                Campaign campaign = mock(Campaign.class);

                Profile owner = new Profile();
                owner.setProfilename("owner");

                when(campaign.getOwner()).thenReturn(owner);
                when(campaign.getMembers()).thenReturn(List.of("testUser"));

                when(utilsCalls.checkAuthAndProfile(authentication, "testUser"))
                                .thenReturn(true);
                when(profileRepository.findByProfilename("testUser"))
                                .thenReturn(Optional.of(profile));
                when(campaignRepository.findById(1L))
                                .thenReturn(Optional.of(campaign));

                when(characterSheetRepository.save(any())).thenAnswer(i -> {
                        CharacterSheet cs = i.getArgument(0);
                        cs.setId(1L);
                        return cs;
                });

                ResponseEntity<?> response = controller.createFreeCharacter(authentication, dto, "testUser");

                assertEquals(200, response.getStatusCode().value());
        }

        @Test
        void shouldReturnTemplateWithoutCampaignAndImage() {
                CharacterSheet sheet = new CharacterSheet();
                sheet.setId(1L);
                sheet.setIsTemplate(true);
                sheet.setIsPublic(true);
                sheet.setImage(null);
                sheet.setCampaign(null);
                sheet.setSchema(List.of());

                when(characterSheetRepository.findByIsTemplateAndIsPublic(true, true))
                                .thenReturn(List.of(sheet));

                ResponseEntity<?> response = controller.getTemplates();

                assertEquals(200, response.getStatusCode().value());
        }

        @Test
        void shouldReturnTemplatesWithCampaignAndImage() {
                CharacterSheet sheet = new CharacterSheet();
                sheet.setId(1L);
                sheet.setIsTemplate(true);
                sheet.setIsPublic(true);

                Campaign campaign = mock(Campaign.class);
                when(campaign.getId()).thenReturn(1L);
                when(campaign.getName()).thenReturn("Camp");

                sheet.setCampaign(campaign);
                sheet.setImage("img.png");

                when(characterSheetRepository.findByIsTemplateAndIsPublic(true, true))
                                .thenReturn(List.of(sheet));

                ResponseEntity<?> response = controller.getTemplates();

                assertEquals(200, response.getStatusCode().value());
        }

        @Test
        void shouldReturnCharactersWithCampaignAndImage() {
                CharacterSheet sheet = new CharacterSheet();
                sheet.setId(1L);
                sheet.setIsTemplate(false);
                sheet.setIsPublic(true);

                Campaign campaign = mock(Campaign.class);
                when(campaign.getId()).thenReturn(1L);
                when(campaign.getName()).thenReturn("Camp");

                sheet.setCampaign(campaign);
                sheet.setImage("img.png");

                when(characterSheetRepository.findByIsTemplateAndIsPublic(false, true))
                                .thenReturn(List.of(sheet));

                ResponseEntity<?> response = controller.getCharacters();

                assertEquals(200, response.getStatusCode().value());
        }
}