package com.landportal.service;

import com.landportal.entity.*;
import com.landportal.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final ParcelRepository parcels;
    private final OwnershipRepository ownerships;

    public UserService(UserRepository r, PasswordEncoder e, ParcelRepository p, OwnershipRepository o) {
        repo = r;
        encoder = e;
        parcels = p;
        ownerships = o;
    }

    public User register(String name, String email, String phone, String password) {
        return register(name, email, phone, password, null);
    }

    public User register(String name, String email, String phone, String password, String aadhaarNumber) {
        if (repo.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        String cleanAadhaar = (aadhaarNumber != null) ? aadhaarNumber.replaceAll("[^0-9]", "") : null;
        if (cleanAadhaar != null && !cleanAadhaar.isBlank() && repo.findByAadhaarNumber(cleanAadhaar).isPresent()) {
            throw new RuntimeException("Aadhaar number already registered");
        }

        User u = new User();
        u.setName(name);
        u.setEmail(email);
        u.setPhone(phone);
        u.setAadhaarNumber(cleanAadhaar);
        u.setPasswordHash(encoder.encode(password != null && !password.isBlank() ? password : "Land@123"));
        u.setRole(Role.LANDOWNER);
        u.setActive(true);
        User saved = repo.save(u);

        // Associate with first parcel so newly registered citizen immediately has active case data
        try {
            var firstParcel = parcels.findAll().stream().findFirst();
            if (firstParcel.isPresent()) {
                Ownership o = new Ownership();
                o.setUser(saved);
                o.setParcel(firstParcel.get());
                o.setOwnershipPercentage(100.0);
                ownerships.save(o);
            }
        } catch (Exception ignored) {
            // Keep registration resilient
        }

        return saved;
    }
}
