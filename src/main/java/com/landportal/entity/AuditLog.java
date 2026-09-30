package com.landportal.entity;

import jakarta.persistence.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User user;

    private String action;
    private String entityType;
    private Long entityId;

    @Column(columnDefinition = "text")
    private String previousValue;

    @Column(columnDefinition = "text")
    private String newValue;

    private String hash;
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User v) { user = v; }
    public String getAction() { return action; }
    public void setAction(String v) { action = v; }
    public String getEntityType() { return entityType; }
    public void setEntityType(String v) { entityType = v; }
    public Long getEntityId() { return entityId; }
    public void setEntityId(Long v) { entityId = v; }
    public String getPreviousValue() { return previousValue; }
    public void setPreviousValue(String v) { previousValue = v; }
    public String getNewValue() { return newValue; }
    public void setNewValue(String v) { newValue = v; }
    public String getHash() { return hash; }
    public void setHash(String v) { hash = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    @PrePersist
    void init() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (hash == null || hash.isBlank()) {
            hash = generateSha256(String.format("%s:%s:%s:%s:%s",
                user != null ? user.getEmail() : "SYSTEM",
                action,
                entityType,
                entityId,
                createdAt
            ));
        }
    }

    public static String generateSha256(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return "hash-err-" + System.currentTimeMillis();
        }
    }
}
