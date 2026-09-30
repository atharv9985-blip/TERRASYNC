package com.landportal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "utility_assets")
public class UtilityAsset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "parcel_id")
    private Parcel parcel;

    @Column(nullable = false)
    private String utilityType;

    private String identifier;

    @Column(nullable = false)
    private String status;

    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public Parcel getParcel() { return parcel; }
    public void setParcel(Parcel v) { parcel = v; }
    public String getUtilityType() { return utilityType; }
    public void setUtilityType(String v) { utilityType = v; }
    public String getIdentifier() { return identifier; }
    public void setIdentifier(String v) { identifier = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { status = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    @PrePersist
    void init() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
