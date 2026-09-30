package com.landportal.controller;

import com.landportal.entity.*;
import com.landportal.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final UserRepository users;
    private final OfficerProfileRepository profiles;
    private final AuditLogRepository audit;
    private final PasswordEncoder enc;
    private final HearingRepository hearings;
    private final SystemSettingRepository settings;

    public AdminController(
            UserRepository u,
            OfficerProfileRepository p,
            AuditLogRepository a,
            PasswordEncoder e,
            HearingRepository h,
            SystemSettingRepository s) {
        users = u;
        profiles = p;
        audit = a;
        enc = e;
        hearings = h;
        settings = s;
    }

    @GetMapping("/users")
    public List<User> users() {
        return users.findAll();
    }

    @GetMapping("/officers")
    public List<OfficerProfile> officers() {
        return profiles.findAll();
    }

    @GetMapping("/audit-logs")
    public List<AuditLog> logs() {
        return audit.findAll();
    }

    @GetMapping("/hearings")
    public List<Hearing> globalHearings() {
        return hearings.findAllByOrderByHearingDateDesc();
    }

    @GetMapping("/gateways/health")
    public Map<String, Object> gatewayHealth() {
        return Map.of(
                "digilocker", Map.of("name", "DigiLocker Sync", "status", "UP", "operational", true),
                "bhulekh", Map.of("name", "Bhulekh State Land Registry API", "status", "UP", "operational", true),
                "pfms", Map.of("name", "PFMS Payment Gateway", "status", "UP", "operational", true)
        );
    }

    @GetMapping("/system/status")
    public Map<String, Object> systemStatus() {
        var setting = settings.findBySettingKey("SYSTEM_HALTED").orElse(null);
        boolean halted = setting != null && "true".equalsIgnoreCase(setting.getSettingValue());
        return Map.of("halted", halted);
    }

    @PostMapping("/system/halt")
    public Map<String, Object> toggleHalt(@RequestParam(required = false) Boolean halt) {
        var setting = settings.findBySettingKey("SYSTEM_HALTED").orElseGet(() -> {
            var s = new SystemSetting();
            s.setSettingKey("SYSTEM_HALTED");
            s.setSettingValue("false");
            return s;
        });

        boolean newHalt = (halt != null) ? halt : !"true".equalsIgnoreCase(setting.getSettingValue());
        setting.setSettingValue(String.valueOf(newHalt));
        settings.save(setting);

        return Map.of(
                "success", true,
                "halted", newHalt,
                "message", newHalt ? "All land acquisition operations have been globally HALTED." : "System operations resumed successfully."
        );
    }

    public record OfficerCreate(String name, String email, String phone, String password, String employeeId, String department, String designation, String district, String officeName) {}

    @PostMapping("/officers")
    public OfficerProfile create(@RequestBody OfficerCreate x) {
        if (users.findByEmail(x.email()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        User u = new User();
        u.setName(x.name());
        u.setEmail(x.email());
        u.setPhone(x.phone());
        u.setPasswordHash(enc.encode(x.password()));
        u.setRole(Role.OFFICER);
        u = users.save(u);

        OfficerProfile p = new OfficerProfile();
        p.setUser(u);
        p.setEmployeeId(x.employeeId());
        p.setDepartment(x.department());
        p.setDesignation(x.designation());
        p.setDistrict(x.district());
        p.setOfficeName(x.officeName());
        return profiles.save(p);
    }

    @PutMapping("/users/{id}/status")
    public User status(@PathVariable Long id, @RequestParam boolean active) {
        var u = users.findById(id).orElseThrow();
        u.setActive(active);
        return users.save(u);
    }
}
