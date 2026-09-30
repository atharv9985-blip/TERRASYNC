package com.landportal.controller;

import com.landportal.entity.*;
import com.landportal.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/grievances")
public class GrievanceController {
    private final GrievanceRepository g;
    private final UserRepository u;
    private final AcquisitionCaseRepository c;
    private final OwnershipRepository o;

    public GrievanceController(GrievanceRepository g, UserRepository u, AcquisitionCaseRepository c, OwnershipRepository o) {
        this.g = g;
        this.u = u;
        this.c = c;
        this.o = o;
    }

    @PostMapping("/case/{caseId}")
    public Grievance create(@PathVariable Long caseId, @RequestBody Grievance x, Authentication a) {
        var user = u.findByEmail(a.getName()).orElseThrow();
        var ca = c.findById(caseId).orElseThrow();
        if (user.getRole() == Role.LANDOWNER && !o.existsByUserIdAndParcelId(user.getId(), ca.getParcel().getId())) {
            throw new RuntimeException("Access denied");
        }
        x.setAcquisitionCase(ca);
        x.setSubmittedBy(user);
        x.setCreatedAt(LocalDateTime.now());
        if (x.getStatus() == null) {
            x.setStatus(GrievanceStatus.SUBMITTED);
        }
        return g.save(x);
    }

    public record SimpleGrievanceRequest(Long caseId, String type, String subject, String description) {}

    @PostMapping
    public Grievance createSimple(@RequestBody SimpleGrievanceRequest req, Authentication a) {
        var user = u.findByEmail(a.getName()).orElseThrow();
        AcquisitionCase targetCase = null;
        if (req.caseId() != null) {
            targetCase = c.findById(req.caseId()).orElse(null);
        }
        if (targetCase == null) {
            var userCases = c.findForOwner(user.getId());
            if (!userCases.isEmpty()) {
                targetCase = userCases.get(0);
            } else {
                targetCase = c.findAll().stream().findFirst().orElseThrow(() -> new RuntimeException("No case found"));
            }
        }

        Grievance x = new Grievance();
        x.setAcquisitionCase(targetCase);
        x.setSubmittedBy(user);
        x.setSubject(req.subject() != null ? req.subject() : (req.type() != null ? req.type() : "General Grievance"));
        x.setDescription(req.description() != null ? req.description() : "");
        x.setStatus(GrievanceStatus.SUBMITTED);
        x.setCreatedAt(LocalDateTime.now());
        return g.save(x);
    }

    @GetMapping
    public List<Grievance> mine(Authentication a) {
        var user = u.findByEmail(a.getName()).orElseThrow();
        if (user.getRole() == Role.ADMIN || user.getRole() == Role.OFFICER) {
            return g.findAllByOrderByCreatedAtDesc();
        }
        return g.findBySubmittedById(user.getId());
    }

    @GetMapping("/{id}")
    public Grievance one(@PathVariable Long id, Authentication a) {
        var x = g.findById(id).orElseThrow();
        var user = u.findByEmail(a.getName()).orElseThrow();
        if (user.getRole() == Role.LANDOWNER && !x.getSubmittedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }
        return x;
    }
}
