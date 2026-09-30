package com.landportal.repository;

import com.landportal.entity.Parcel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface ParcelRepository extends JpaRepository<Parcel, Long> {
    List<Parcel> findByDistrictIgnoreCase(String district);
    Optional<Parcel> findBySurveyNumber(String surveyNumber);
}
