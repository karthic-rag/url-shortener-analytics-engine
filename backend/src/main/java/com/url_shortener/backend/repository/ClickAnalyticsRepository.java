package com.url_shortener.backend.repository;

import com.url_shortener.backend.entity.ClickAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ClickAnalyticsRepository extends JpaRepository<ClickAnalytics, Long> {
    // 1. Ultra-fast total count
    long countByShortKey(String shortKey);

    // 2. Grouped counts using database aggregation
    @Query("SELECT c.deviceType, COUNT(c) FROM ClickAnalytics c WHERE c.shortKey = :shortKey GROUP BY c.deviceType")
    List<Object[]> getDeviceCounts(@Param("shortKey") String shortKey);

    @Query("SELECT c.referrer, COUNT(c) FROM ClickAnalytics c WHERE c.shortKey = :shortKey GROUP BY c.referrer")
    List<Object[]> getReferrerCounts(@Param("shortKey") String shortKey);

    @Query("SELECT c.browser, COUNT(c) FROM ClickAnalytics c WHERE c.shortKey = :shortKey GROUP BY c.browser")
    List<Object[]> getBrowserCounts(@Param("shortKey") String shortKey);

    @Query("SELECT c.country, COUNT(c) FROM ClickAnalytics c WHERE c.shortKey = :shortKey GROUP BY c.country")
    List<Object[]> getCountryCounts(@Param("shortKey") String shortKey);

    @Query("SELECT c.shortKey, COUNT(c) FROM ClickAnalytics c WHERE c.shortKey IN :shortKeys GROUP BY c.shortKey")
    List<Object[]> countClicksForMultipleKeys(@Param("shortKeys") List<String> shortKeys);

    // 3. Delete rows using short key
    void deleteByShortKey(String shortKey);
}
