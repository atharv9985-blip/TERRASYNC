package com.landportal.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "compensations")
public class Compensation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "case_id", unique = true)
    private AcquisitionCase acquisitionCase;

    private double assessedAmount;
    private double approvedAmount;
    private double marketValue;
    private double solatium;
    private double assetValuation;
    private String status;

    public Long getId() { return id; }
    public AcquisitionCase getAcquisitionCase() { return acquisitionCase; }
    public void setAcquisitionCase(AcquisitionCase v) { acquisitionCase = v; }
    public double getAssessedAmount() { return assessedAmount; }
    public void setAssessedAmount(double v) { assessedAmount = v; }
    public double getApprovedAmount() { return approvedAmount; }
    public void setApprovedAmount(double v) { approvedAmount = v; }
    public double getMarketValue() { return marketValue; }
    public void setMarketValue(double v) { marketValue = v; }
    public double getSolatium() { return solatium; }
    public void setSolatium(double v) { solatium = v; }
    public double getAssetValuation() { return assetValuation; }
    public void setAssetValuation(double v) { assetValuation = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { status = v; }
}
