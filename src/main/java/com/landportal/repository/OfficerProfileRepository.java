package com.landportal.repository;

import com.landportal.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface OfficerProfileRepository extends JpaRepository<OfficerProfile, Long> {
    Optional<OfficerProfile> findByUserId(Long id);
    Optional<OfficerProfile> findByEmployeeId(String employeeId);
}
