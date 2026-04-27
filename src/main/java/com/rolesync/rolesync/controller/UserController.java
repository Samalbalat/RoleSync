package com.rolesync.rolesync.controller;

import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rolesync.rolesync.dto.usercontroller.SimpleProfileDTO;
import com.rolesync.rolesync.dto.usercontroller.UserInfoResponseDetailed;
import com.rolesync.rolesync.dto.usercontroller.UserPutInDTO;
import com.rolesync.rolesync.model.Profile;
import com.rolesync.rolesync.model.User;
import com.rolesync.rolesync.repository.ProfileRepository;
import com.rolesync.rolesync.repository.UserRepository;
import com.rolesync.rolesync.security.jwt.JwtUtils;
import com.rolesync.rolesync.utils.UtilsCalls;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/rolesync")
public class UserController {
    @Autowired UserRepository userRepository;
    @Autowired ProfileRepository profileRepository;
    @Autowired PasswordEncoder encoder;
    @Autowired JwtUtils jwtUtils;
    @Autowired UtilsCalls utilsCalls;


    /**
     * Get the authenticated user's information, including their email, time zone, and profiles. The user's information is retrieved from the database using their email as the identifier. 
     * If the user is found, a UserInfoResponseDetailed object is created and returned in the response body with a 200 OK status. If the user is not found, a 404 Not Found response is returned with a "User not found" message.
     * @param authentication The authentication object containing the user's details
     * @return ResponseEntity containing a UserInfoResponseDetailed object with the user's information if the user is found, or a 404 Not Found response if the user is not found
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication authentication) {
        //TO-DO return user info
        return ResponseEntity.ok(authentication.getPrincipal());
    }

    /**
     * Update the authenticated user's information, including their email, time zone, and password. The new information is provided in the request body as a UserPutInDTO object. 
     * If the user is found, their information is updated and saved to the database. If the user is not found, no action is taken.
     * @param authentication The authentication object containing the user's details
     * @return String response indicating whether the user's information was successfully updated or if the user was not found
     */
    @GetMapping("/user")
    public ResponseEntity<?> getUserInfo(Authentication authentication) {
        Optional<User> user = utilsCalls.getUserFromUsername(authentication);
        if (user.isPresent()) {
            List<Profile> profiles = profileRepository.findAllByUsername(user.get().getEmail());
            UserInfoResponseDetailed response = new UserInfoResponseDetailed();
            response.setId(user.get().getId());
            response.setEmail(user.get().getEmail());
            response.setTimeZone(user.get().getTimeZone());
            List<SimpleProfileDTO> profileDTOs = profiles.stream().map(profile -> 
                new SimpleProfileDTO(profile.getId(), profile.getProfilename(), profile.getImage(), profile.getProfileType().name())
            ).toList();
            response.setProfiles(profileDTOs);
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(404).body("User not found");
        }
    }

    /**
     * Update the authenticated user's information, including their email, time zone, and password. The new information is provided in the request body as a UserPutInDTO object.
     * If the user is found, their information is updated and saved to the database, and a 200 OK response is returned. If the user is not found, a 404 Not Found response is returned with a "User not found" message.
     * @param authentication The authentication object containing the user's details
     * @param userPutInDTO The UserPutInDTO object containing the new information for the user, including email, time zone, and password
     * @return ResponseEntity indicating whether the user's information was successfully updated with a 200 OK status, or a 404 Not Found response if the user was not found
     */
    @PutMapping("/user")
    public ResponseEntity<?> putUserInfo(Authentication authentication, @RequestBody UserPutInDTO userPutInDTO) {
        Optional<User> user = utilsCalls.getUserFromUsername(authentication);
        if (user.isPresent()) {
            User updatedUser = user.get();
            ResponseEntity<?> checks = userPutChecks(userPutInDTO, updatedUser);
            if(checks != null){
                return checks;
            }
            updatedUser.setEmail(userPutInDTO.getEmail());
            updatedUser.setTimeZone(userPutInDTO.getTimeZone());
            updatedUser.setPassword(encoder.encode(userPutInDTO.getPassword()));
            userRepository.save(updatedUser);
            return ResponseEntity.ok().build();
        }else{
            return ResponseEntity.status(404).body("User not found");
        }
    }

    private boolean checkPassword(String password) {
        String regExpn = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,20}$";

        Pattern pattern = Pattern.compile(regExpn, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(password);
        return matcher.matches();
    }

    private ResponseEntity<?> userPutChecks(UserPutInDTO userPutInDTO, User updatedUser){
        if(userRepository.findByEmail(userPutInDTO.getEmail()).isPresent() && !updatedUser.getEmail().equals(userPutInDTO.getEmail())){
                return ResponseEntity.status(403).body("Email already exists and is not the current email");
            }
            if (userPutInDTO.getEmail().isBlank() || userPutInDTO.getPassword().isBlank() || userPutInDTO.getTimeZone().isBlank()) {
                return ResponseEntity.status(400).body("Email, password and time zone cannot be blank");
            }
            if(!updatedUser.getPassword().equals(userPutInDTO.getOldPassword())){
                return ResponseEntity.status(403).body("Old password is incorrect");
            }
            if (!checkPassword(userPutInDTO.getPassword())) {
                return ResponseEntity.status(400).body("Password must be 8-20 characters long, contain at least one digit,"+
                "one lowercase letter, one uppercase letter, one special character (@#$%^&+=) and have no whitespace");
            }
            return null;
    }
}
