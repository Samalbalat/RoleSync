package com.rolesync.rolesync.filters;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

import org.checkerframework.checker.units.qual.A;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.rolesync.rolesync.model.User;
import com.rolesync.rolesync.repository.LoginSessionRepository;
import com.rolesync.rolesync.security.service.UserDetailsImpl;
import com.rolesync.rolesync.utils.UtilsCalls;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Profile("!test")
@Component
public class ActivityTrackingFilter
        extends OncePerRequestFilter {

    @Autowired
    private LoginSessionRepository sessionRepository;
    @Autowired
    private UtilsCalls utils;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        Authentication auth =
                SecurityContextHolder.getContext()
                        .getAuthentication();

        if(auth != null
                && auth.isAuthenticated()) {

            Instant now = Instant.now();

            Optional<User> userOpt = utils.getUserFromUsername(auth);

            if(userOpt.isPresent()){
                sessionRepository
                    .findFirstByUserAndActiveTrue(userOpt.get())
                    .ifPresent(session -> {

                        Instant lastRequest =
                                session.getLastRequest();

                        if(shouldUpdateLastRequest(lastRequest, now)) {

                            session.setLastRequest(now);

                            sessionRepository.save(session);
                        }
                    });
                
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean shouldUpdateLastRequest(
            Instant lastRequest,
            Instant now) {

        if (lastRequest == null) {
            return true;
        }

        return Duration.between(
                lastRequest,
                now).toSeconds() > 60;
    }
}