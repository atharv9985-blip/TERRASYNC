package com.landportal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "acquisition_events")
public class AcquisitionEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "acquisition_case_id", nullable = false)
    private AcquisitionCase acquisitionCase;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CaseStatus status;

    private String remarks;

    private LocalDateTime eventTime;

    @ManyToOne(optional = false)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    public Long getId() {
        return id;
    }

    public AcquisitionCase getAcquisitionCase() {
        return acquisitionCase;
    }

    public void setAcquisitionCase(AcquisitionCase acquisitionCase) {
        this.acquisitionCase = acquisitionCase;
    }

    public CaseStatus getStatus() {
        return status;
    }

    public void setStatus(CaseStatus status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDateTime getEventTime() {
        return eventTime;
    }

    public void setEventTime(LocalDateTime eventTime) {
        this.eventTime = eventTime;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    @PrePersist
    void init() {
        eventTime = LocalDateTime.now();
    }
}