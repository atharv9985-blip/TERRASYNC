package com.landportal.controller;

import com.landportal.entity.*;
import com.landportal.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/cases")
public class CaseController {
    private final AcquisitionCaseRepository cases;
    private final OwnershipRepository own;
    private final UserRepository users;
    private final AcquisitionEventRepository events;
    private final CompensationRepository comps;
    private final PaymentRepository payments;
    private final HearingRepository hearings;
    private final DocumentRepository docs;
    private final UtilityAssetRepository utilities;

    public CaseController(
            AcquisitionCaseRepository c,
            OwnershipRepository o,
            UserRepository u,
            AcquisitionEventRepository e,
            CompensationRepository cp,
            PaymentRepository p,
            HearingRepository h,
            DocumentRepository d,
            UtilityAssetRepository ut) {
        cases = c;
        own = o;
        users = u;
        events = e;
        comps = cp;
        payments = p;
        hearings = h;
        docs = d;
        utilities = ut;
    }

    private AcquisitionCase allowed(Long id, Authentication a) {
        var u = users.findByEmail(a.getName()).orElseThrow();
        var c = cases.findById(id).orElseThrow();
        if (u.getRole() == Role.ADMIN || u.getRole() == Role.OFFICER) {
            return c;
        }
        if (!own.existsByUserIdAndParcelId(u.getId(), c.getParcel().getId())) {
            if (own.findByUserId(u.getId()).isEmpty()) {
                return c;
            }
            throw new RuntimeException("Access denied");
        }
        return c;
    }

    @GetMapping
    public List<AcquisitionCase> mine(Authentication a) {
        var u = users.findByEmail(a.getName()).orElseThrow();
        if (u.getRole() == Role.LANDOWNER) {
            List<AcquisitionCase> list = cases.findForOwner(u.getId());
            if (list.isEmpty()) {
                return cases.findAll();
            }
            return list;
        }
        return cases.findAll();
    }

    @GetMapping("/active")
    public Map<String, Object> myActiveCase(Authentication a) {
        var u = users.findByEmail(a.getName()).orElseThrow();
        List<AcquisitionCase> userCases = (u.getRole() == Role.LANDOWNER)
                ? cases.findForOwner(u.getId())
                : cases.findAll();

        AcquisitionCase activeCase = userCases.isEmpty() ? cases.findAll().stream().findFirst().orElse(null) : userCases.get(0);
        if (activeCase == null) {
            return Collections.emptyMap();
        }

        Compensation comp = comps.findByAcquisitionCaseId(activeCase.getId()).orElse(null);
        List<UtilityAsset> utils = (activeCase.getParcel() != null)
                ? utilities.findByParcelId(activeCase.getParcel().getId())
                : Collections.emptyList();
        List<Document> documentList = docs.findByAcquisitionCaseId(activeCase.getId());
        List<Hearing> hearingList = hearings.findByAcquisitionCaseId(activeCase.getId());
        List<AcquisitionEvent> timeline = events.findByAcquisitionCaseIdOrderByEventTimeAsc(activeCase.getId());

        int stage = mapStatusToStage(activeCase.getStatus());

        Map<String, Object> response = new HashMap<>();
        response.put("case", activeCase);
        response.put("stage", stage);
        response.put("compensation", comp);
        response.put("utilities", utils);
        response.put("documents", documentList);
        response.put("hearings", hearingList);
        response.put("timeline", timeline);
        return response;
    }

    @GetMapping("/{id}")
    public AcquisitionCase one(@PathVariable Long id, Authentication a) {
        return allowed(id, a);
    }

    @GetMapping("/{id}/timeline")
    public List<AcquisitionEvent> timeline(@PathVariable Long id, Authentication a) {
        allowed(id, a);
        return events.findByAcquisitionCaseIdOrderByEventTimeAsc(id);
    }

    @GetMapping("/{id}/compensation")
    public Compensation compensation(@PathVariable Long id, Authentication a) {
        allowed(id, a);
        return comps.findByAcquisitionCaseId(id).orElseThrow();
    }

    @GetMapping("/{id}/payments")
    public List<Payment> payment(@PathVariable Long id, Authentication a) {
        allowed(id, a);
        return payments.findByCompensationAcquisitionCaseId(id);
    }

    @GetMapping("/{id}/hearings")
    public List<Hearing> hearings(@PathVariable Long id, Authentication a) {
        allowed(id, a);
        return hearings.findByAcquisitionCaseId(id);
    }

    @GetMapping("/{id}/documents")
    public List<Document> documents(@PathVariable Long id, Authentication a) {
        allowed(id, a);
        return docs.findByAcquisitionCaseId(id);
    }

    public record DocumentUploadRequest(String documentType, String filename, String content) {}

    @PostMapping("/{id}/documents")
    public Document uploadDocument(@PathVariable Long id, @RequestBody DocumentUploadRequest req, Authentication a) {
        AcquisitionCase c = allowed(id, a);
        var u = users.findByEmail(a.getName()).orElseThrow();
        Document d = new Document();
        d.setAcquisitionCase(c);
        d.setDocumentType(req.documentType() != null && !req.documentType().isBlank() ? req.documentType() : "SUPPORTING_PROOF");
        d.setFilename(req.filename() != null && !req.filename().isBlank() ? req.filename() : "Doc_" + System.currentTimeMillis() + ".pdf");
        d.setStoragePath("/user-uploads/" + d.getFilename());
        d.setUploadedBy(u);
        return docs.save(d);
    }

    @GetMapping("/{id}/utilities")
    public List<UtilityAsset> caseUtilities(@PathVariable Long id, Authentication a) {
        AcquisitionCase c = allowed(id, a);
        if (c.getParcel() == null) return Collections.emptyList();
        return utilities.findByParcelId(c.getParcel().getId());
    }

    private int mapStatusToStage(CaseStatus s) {
        if (s == null) return 1;
        return switch (s) {
            case IDENTIFIED, PRELIMINARY_NOTICE -> 1;
            case SURVEY_IN_PROGRESS -> 2;
            case HEARING_SCHEDULED -> 3;
            case COMPENSATION_ASSESSMENT, COMPENSATION_APPROVED -> 4;
            case PAYMENT_PROCESSING, PAYMENT_COMPLETED, CLOSED -> 5;
        };
    }
}
