package com.rolesync.rolesync.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.rolesync.rolesync.model.LoginSession;

public interface LoginSessionRepository extends JpaRepository<LoginSession, Long> {

    Optional<LoginSession> findFirstByEmailAndActiveTrue(String email);
    List<LoginSession> findByActiveTrue();

    @Query("""
        SELECT COUNT(DISTINCT FUNCTION('DATE', ls.loginTime))
        FROM LoginSession ls
        WHERE ls.email = :email
    """)
    Long countDistinctLoginDays(@Param("email") String email);
}