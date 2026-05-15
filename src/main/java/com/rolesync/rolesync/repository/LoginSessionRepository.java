package com.rolesync.rolesync.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rolesync.rolesync.model.LoginSession;

public interface LoginSessionRepository extends JpaRepository<LoginSession, Long> {

    Optional<LoginSession> findFirstByEmailAndActiveTrue(String email);
    List<LoginSession> findByActiveTrue();
}