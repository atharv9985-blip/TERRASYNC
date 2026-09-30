package com.landportal;

import com.landportal.entity.*;
import com.landportal.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seed(
            UserRepository users,
            OfficerProfileRepository officers,
            ParcelRepository parcels,
            OwnershipRepository ownerships,
            AcquisitionCaseRepository cases,
            AcquisitionEventRepository events,
            CompensationRepository comps,
            PaymentRepository payments,
            HearingRepository hearings,
            DocumentRepository docs,
            GrievanceRepository grievances,
            NotificationRepository notifications,
            UtilityAssetRepository utilities,
            AuditLogRepository auditLogs,
            PasswordEncoder enc) {

        return args -> {

            // =========================
            // ADMIN
            // =========================
            User admin = users.findByEmail("admin@landportal.demo").orElseGet(() -> {
                User u = new User();
                u.setName("System Admin");
                u.setEmail("admin@landportal.demo");
                u.setPasswordHash(enc.encode("Admin@123"));
                u.setRole(Role.ADMIN);
                return users.save(u);
            });

            // =========================
            // LANDOWNER (Ramesh Kumar - TerraSync Primary)
            // =========================
            User ramesh = users.findByEmail("ramesh@demo.com").orElseGet(() -> {
                User u = new User();
                u.setName("Ramesh Kumar");
                u.setEmail("ramesh@demo.com");
                u.setPhone("9842109842");
                u.setAadhaarNumber("984210984210");
                u.setPasswordHash(enc.encode("Ramesh4210"));
                u.setRole(Role.LANDOWNER);
                return users.save(u);
            });
            ramesh.setPasswordHash(enc.encode("Ramesh4210"));
            users.save(ramesh);

            // =========================
            // LANDOWNER (Priya Sharma - Legacy Demo)
            // =========================
            User priya = users.findByEmail("priya@demo.com").orElseGet(() -> {
                User u = new User();
                u.setName("Priya Sharma");
                u.setEmail("priya@demo.com");
                u.setPhone("9999999999");
                u.setAadhaarNumber("999999999999");
                u.setPasswordHash(enc.encode("Priya9999"));
                u.setRole(Role.LANDOWNER);
                return users.save(u);
            });
            priya.setPasswordHash(enc.encode("Priya9999"));
            users.save(priya);

            // =========================
            // OFFICER (Arjun Mehta)
            // =========================
            User officer = users.findByEmail("officer@landportal.demo").orElseGet(() -> {
                User u = new User();
                u.setName("Arjun Mehta");
                u.setEmail("officer@landportal.demo");
                u.setPasswordHash(enc.encode("Officer@123"));
                u.setRole(Role.OFFICER);
                return users.save(u);
            });

            // =========================
            // OFFICER PROFILE
            // =========================
            officers.findByUserId(officer.getId()).orElseGet(() -> {
                OfficerProfile profile = new OfficerProfile();
                profile.setUser(officer);
                profile.setEmployeeId("GOV-OFF-1042");
                profile.setDepartment("Revenue & Land Acquisition");
                profile.setDesignation("SDM / Land Acquisition Officer");
                profile.setDistrict("Pune");
                profile.setOfficeName("Tehsil Land Acquisition Office");
                return officers.save(profile);
            });

            // =========================
            // PARCEL (Khasra 142/2)
            // =========================
            Parcel parcel = parcels.findBySurveyNumber("142/2").orElseGet(() -> {
                Parcel p = new Parcel();
                p.setSurveyNumber("142/2");
                p.setDistrict("Pune");
                p.setVillage("Khedi");
                p.setArea(2.5);
                p.setLatitude(18.5913);
                p.setLongitude(73.7389);
                return parcels.save(p);
            });

            // =========================
            // OWNERSHIP
            // =========================
            if (!ownerships.existsByUserIdAndParcelId(ramesh.getId(), parcel.getId())) {
                Ownership o = new Ownership();
                o.setUser(ramesh);
                o.setParcel(parcel);
                o.setOwnershipPercentage(100.0);
                ownerships.save(o);
            }

            // =========================
            // ACQUISITION CASE (TS-1042 / LA-2026-00128)
            // =========================
            AcquisitionCase acase = cases.findByCaseNumber("TS-1042").orElseGet(() -> {
                AcquisitionCase c = new AcquisitionCase();
                c.setCaseNumber("TS-1042");
                c.setParcel(parcel);
                c.setProjectName("NH-46 Highway Expansion Project");
                c.setAffectedArea(1.2);
                c.setStatus(CaseStatus.COMPENSATION_APPROVED);
                return cases.save(c);
            });

            // =========================
            // COMPENSATION WITH BREAKDOWN
            // =========================
            Compensation comp = comps.findByAcquisitionCaseId(acase.getId()).orElseGet(() -> {
                Compensation c = new Compensation();
                c.setAcquisitionCase(acase);
                c.setMarketValue(1250000);
                c.setSolatium(1250000);
                c.setAssetValuation(320000);
                c.setAssessedAmount(2820000);
                c.setApprovedAmount(2820000);
                c.setStatus("APPROVED");
                return comps.save(c);
            });

            // Update breakdown if already present
            if (comp.getMarketValue() == 0) {
                comp.setMarketValue(1250000);
                comp.setSolatium(1250000);
                comp.setAssetValuation(320000);
                comp.setApprovedAmount(2820000);
                comps.save(comp);
            }

            // =========================
            // PAYMENT
            // =========================
            if (payments.findByCompensationAcquisitionCaseId(acase.getId()).isEmpty()) {
                Payment payment = new Payment();
                payment.setCompensation(comp);
                payment.setAmount(2820000);
                payment.setTransactionReference("PFMS-DBT-2026-98421");
                payment.setStatus(PaymentStatus.PAID);
                payment.setPaidAt(LocalDateTime.now().minusDays(1));
                payments.save(payment);
            }

            // =========================
            // HEARINGS
            // =========================
            if (hearings.findByAcquisitionCaseId(acase.getId()).isEmpty()) {
                Hearing h1 = new Hearing();
                h1.setAcquisitionCase(acase);
                h1.setHearingDate(LocalDateTime.now().plusDays(5).withHour(10).withMinute(30));
                h1.setLocation("Tehsil Conference Hall, Room 204, Pithampur");
                h1.setVirtualLink("https://webex.nic.in/join/terrasync-hearing-1042");
                h1.setPresidingOfficer("Shri Alok Sharma (IAS, SDM)");
                h1.setStatus("SCHEDULED");
                h1.setRemarks("Bring original property deeds, ID proof, and latest tax receipts.");
                hearings.save(h1);

                Hearing h2 = new Hearing();
                h2.setAcquisitionCase(acase);
                h2.setHearingDate(LocalDateTime.now().plusDays(5).withHour(14).withMinute(0));
                h2.setLocation("Tehsil Conference Hall, Room 204, Pithampur");
                h2.setVirtualLink("https://webex.nic.in/join/terrasync-hearing-1043");
                h2.setPresidingOfficer("Shri Alok Sharma (IAS, SDM)");
                h2.setStatus("SCHEDULED");
                h2.setRemarks("Follow-up session for asset valuation inquiries.");
                hearings.save(h2);
            }

            // =========================
            // DOCUMENTS
            // =========================
            if (docs.findByAcquisitionCaseId(acase.getId()).isEmpty()) {
                String[][] docsData = {
                        {"Khasra-Khatauni (Rights)", "khasra-khatauni.pdf", "RECORD_OF_RIGHTS"},
                        {"Village Naksha (Map)", "village-naksha.pdf", "CADASTRAL_MAP"},
                        {"Joint Survey Report", "joint-survey-report.pdf", "SURVEY_REPORT"}
                };
                for (String[] docInfo : docsData) {
                    Document d = new Document();
                    d.setAcquisitionCase(acase);
                    d.setDocumentType(docInfo[2]);
                    d.setFilename(docInfo[1]);
                    d.setStoragePath("/demo-documents/" + docInfo[1]);
                    d.setUploadedBy(officer);
                    docs.save(d);
                }
            }

            // =========================
            // UTILITIES
            // =========================
            if (utilities.findByParcelId(parcel.getId()).isEmpty()) {
                UtilityAsset power = new UtilityAsset();
                power.setParcel(parcel);
                power.setUtilityType("ELECTRICITY");
                power.setIdentifier("MPEB No: 849201");
                power.setStatus("Paid (No Dues)");
                utilities.save(power);

                UtilityAsset water = new UtilityAsset();
                water.setParcel(parcel);
                water.setUtilityType("WATER");
                water.setIdentifier("Reg: BW-2018");
                water.setStatus("Registered & Valued");
                utilities.save(water);
            }

            // =========================
            // GRIEVANCES
            // =========================
            if (grievances.findBySubmittedById(ramesh.getId()).isEmpty()) {
                Grievance g = new Grievance();
                g.setAcquisitionCase(acase);
                g.setSubmittedBy(ramesh);
                g.setSubject("Valuation Dispute");
                g.setDescription("Market value considered is from 2018 circle rate instead of current 2026 circle rate.");
                g.setStatus(GrievanceStatus.SUBMITTED);
                g.setCreatedAt(LocalDateTime.now().minusDays(2));
                grievances.save(g);
            }

            // =========================
            // AUDIT LOGS WITH SHA-256
            // =========================
            if (auditLogs.count() < 2) {
                AuditLog log1 = new AuditLog();
                log1.setUser(officer);
                log1.setAction("Approved Award");
                log1.setEntityType("AcquisitionCase");
                log1.setEntityId(acase.getId());
                log1.setNewValue("COMPENSATION_APPROVED");
                log1.setHash("8f4a3c9b7e12d5a8b4c9e6f1a3d5b7c9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1");
                auditLogs.save(log1);

                AuditLog log2 = new AuditLog();
                log2.setUser(admin);
                log2.setAction("DigiLocker Sync");
                log2.setEntityType("ExternalGateway");
                log2.setNewValue("SYNC_SUCCESSFUL");
                log2.setHash("3e1d9f8a2b4c6e8f0a2c4e6a8b0d2e4f6a8c0e2a4b6d8e0f2a4c6e8b0d2e4f6a");
                auditLogs.save(log2);
            }

            // =========================
            // NOTIFICATION
            // =========================
            if (notifications.findByUserIdOrderByCreatedAtDesc(ramesh.getId()).isEmpty()) {
                Notification n = new Notification();
                n.setUser(ramesh);
                n.setMessage("Section 4 Notice Issued for Khasra 142/2");
                n.setNotificationType("SECTION_4_NOTICE");
                notifications.save(n);
            }
        };
    }
}