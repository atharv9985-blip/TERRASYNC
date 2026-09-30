package com.landportal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_settings")
public class SystemSetting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String settingKey;

    @Column(nullable = false)
    private String settingValue;

    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public String getSettingKey() { return settingKey; }
    public void setSettingKey(String v) { settingKey = v; }
    public String getSettingValue() { return settingValue; }
    public void setSettingValue(String v) { settingValue = v; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    @PrePersist
    @PreUpdate
    void timestamp() {
        updatedAt = LocalDateTime.now();
    }
}
