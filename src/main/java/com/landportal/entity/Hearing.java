package com.landportal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "hearings")
public class Hearing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private AcquisitionCase acquisitionCase;

    private LocalDateTime hearingDate;
    private String location;
    private String virtualLink;
    private String presidingOfficer;
    private String status;
    private String remarks;

    public Long getId() { return id; }
    public AcquisitionCase getAcquisitionCase() { return acquisitionCase; }
    public void setAcquisitionCase(AcquisitionCase v) { acquisitionCase = v; }
    public LocalDateTime getHearingDate() { return hearingDate; }
    public void setHearingDate(LocalDateTime v) { hearingDate = v; }
    public String getLocation() { return location; }
    public void setLocation(String v) { location = v; }
    public String getVirtualLink() { return virtualLink; }
    public void setVirtualLink(String v) { virtualLink = v; }
    public String getPresidingOfficer() { return presidingOfficer; }
    public void setPresidingOfficer(String v) { presidingOfficer = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { status = v; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String v) { remarks = v; }
}
