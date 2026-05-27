package com.rolesync.rolesync.model;

import jakarta.persistence.*;
import java.time.Duration;
import java.time.Instant;

@Entity
public class LoginSession {

    private static final Duration SESSION_TIMEOUT =
        Duration.ofMinutes(30);

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private Instant loginTime;

    private Instant logoutTime;

    private Instant lastRequest;

    private Instant inferredEndTime;

    private Long effectiveDurationSeconds;

    private boolean active;

    public LoginSession() {}

    public LoginSession(User user) {
        this.lastRequest = Instant.now();
        this.user = user;
        this.loginTime = Instant.now();
        this.active = true;
    }

    public void closeSession() {
        this.logoutTime = Instant.now();
        this.inferredEndTime = lastRequest.plus(SESSION_TIMEOUT);
        // El tiempo efectivo es el menor entre el tiempo real de sesión y el tiempo inferido por inactividad
        this.effectiveDurationSeconds =
                Math.min(Duration.between(loginTime, logoutTime).getSeconds(),
                    Duration.between(loginTime, inferredEndTime).getSeconds());
        this.active = false;
    }

    public void sessionTimeout(){
        this.inferredEndTime = lastRequest.plus(SESSION_TIMEOUT);
        this.logoutTime = Instant.now();
        this.effectiveDurationSeconds =
                Duration.between(loginTime, inferredEndTime).getSeconds();
        this.active = false;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Instant getLoginTime() {
        return loginTime;
    }

    public void setLoginTime(Instant loginTime) {
        this.loginTime = loginTime;
    }

    public Instant getLogoutTime() {
        return logoutTime;
    }

    public void setLogoutTime(Instant logoutTime) {
        this.logoutTime = logoutTime;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Instant getLastRequest() {
        return lastRequest;
    }

    public void setLastRequest(Instant lastRequest) {
        this.lastRequest = lastRequest;
    }

    public Instant getInferredEndTime() {
        return inferredEndTime;
    }

    public void setInferredEndTime(Instant inferredEndTime) {
        this.inferredEndTime = inferredEndTime;
    }

    public Long getEffectiveDurationSeconds() {
        return effectiveDurationSeconds;
    }

    public void setEffectiveDurationSeconds(Long effectiveDurationSeconds) {
        this.effectiveDurationSeconds = effectiveDurationSeconds;
    }

    

    
}
