package com.landportal.repository;

import com.landportal.entity.Hearing;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HearingRepository extends JpaRepository<Hearing, Long> {
    List<Hearing> findByAcquisitionCaseId(Long id);
    List<Hearing> findAllByOrderByHearingDateDesc();
}
