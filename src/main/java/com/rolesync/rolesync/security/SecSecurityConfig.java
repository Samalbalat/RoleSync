package com.rolesync.rolesync.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

import com.rolesync.rolesync.services.ProfileService;

@Configuration
@EnableWebSecurity
public class SecSecurityConfig {

        @Autowired
        private ProfileService profileService;

        @Bean
        public UserDetailsService userDetailsService() {
                return profileService;
        }

        @Bean
        public InMemoryUserDetailsManager userInMemory() {
                UserDetails user1 = User.withUsername("user1")
                                .password(passwordEncoder().encode("user1Pass"))
                                .roles("USER")
                                .build();
                UserDetails user2 = User.withUsername("user2")
                                .password(passwordEncoder().encode("user2Pass"))
                                .roles("USER")
                                .build();
                UserDetails admin = User.withUsername("admin")
                                .password(passwordEncoder().encode("adminPass"))
                                .roles("ADMIN")
                                .build();
                return new InMemoryUserDetailsManager(user1, user2, admin);
        }

        @Bean
        PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationProvider authenticationProvider() {
                DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
                provider.setUserDetailsService(profileService);
                provider.setPasswordEncoder(passwordEncoder());
                return provider;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http            .csrf(AbstractHttpConfigurer::disable)
                                .formLogin((form) -> form
                                                .loginPage("/req/login")
                                                .permitAll())
                                //.authorizeHttpRequests((requests) -> requests.anyRequest().anonymous())
                                .authorizeHttpRequests(registry -> {
                                                registry.requestMatchers("/req/signup", "/css/**", "/js/**").permitAll(); 
                                                registry.anyRequest().authenticated();
                                })
                                .logout((logout) -> logout.permitAll());

                return http.build();
        }
}
