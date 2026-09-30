package com.landportal.repository;

import com.landportal.entity.UtilityAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UtilityAssetRepository extends JpaRepository<UtilityAsset, Long> {
    List<UtilityAsset> findByParcelId(Long parcelId);
    List<UtilityAsset> findByParcelIdAndUtilityType(Long parcelId, String utilityType);
}
