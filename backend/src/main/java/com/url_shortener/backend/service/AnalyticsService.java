package com.url_shortener.backend.service;

import com.url_shortener.backend.dtos.UrlAnalyticsResponse;
import com.url_shortener.backend.entity.ClickAnalytics;
import com.url_shortener.backend.entity.UrlRecord;
import com.url_shortener.backend.exception.UnauthorizedAccessException;
import com.url_shortener.backend.repository.ClickAnalyticsRepository;
import com.url_shortener.backend.repository.UrlRecordRepository;
import com.url_shortener.backend.util.Base62Converter;
import com.url_shortener.backend.util.GeoLocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ClickAnalyticsRepository analyticsRepository;
    private final UrlRecordRepository urlRepository;
    private final GeoLocationService geoLocationService;

    @Value("${base.url}")
    private String baseUrl;

    /**
     * Asynchronously logs click metadata
     */
    @Async("analyticsExecutor")
    public void recordClick(String shortKey, String userAgent, String refererHeader, String clientIp) {
        System.out.println("[ASYNC WORKER] Gathering metrics processing for client IP: " + clientIp);

        ClickAnalytics analytic = ClickAnalytics.builder()
                .shortKey(shortKey)
                .clickTime(LocalDateTime.now())
                .build();

        // 1. Resolve Country Location based on the Client IP Address parameter
        String country = geoLocationService.getCountryFromIp(clientIp);
        analytic.setCountry(country);

        // 2. Process Referrer Header (Platform tracking context)
        if (refererHeader == null || refererHeader.isBlank()) {
            analytic.setReferrer("Direct Traffic");
        } else {
            analytic.setReferrer(cleanReferrerUrl(refererHeader));
        }

        // 3. Parse basic User-Agent string properties (Device & Browser)
        if (userAgent != null) {
            String uaLower = userAgent.toLowerCase();

            if (uaLower.contains("mobile") || uaLower.contains("iphone") || uaLower.contains("android")) {
                analytic.setDeviceType("Mobile");
            } else {
                analytic.setDeviceType("Desktop");
            }

            if (uaLower.contains("chrome")) {
                analytic.setBrowser("Chrome");
            } else if (uaLower.contains("safari") && !uaLower.contains("chrome")) {
                analytic.setBrowser("Safari");
            } else {
                analytic.setBrowser("Other");
            }
        } else {
            analytic.setDeviceType("Unknown");
            analytic.setBrowser("Unknown");
        }

        // 4. Save to MySQL database disk index smoothly
        analyticsRepository.save(analytic);
        System.out.println("[ASYNC WORKER] Saved click log complete for '" + shortKey + "' from country: " + country);
    }

    public UrlAnalyticsResponse getUrlAnalytics(String shortKey, String anonymousToken) {

        // 1. Security Check (Unchanged)
        long dbId = Base62Converter.decode(shortKey);
        UrlRecord urlRecord = urlRepository.findById(dbId)
                .orElseThrow(() -> new RuntimeException("Link not found."));

        if (!urlRecord.getAnonymousUserToken().equals(anonymousToken)) {
            throw new UnauthorizedAccessException("Unauthorized access to analytics.");
        }

        // 2. Fetch Aggregations Directly from Database (Zero row-bloat in RAM)
        long totalClicks = analyticsRepository.countByShortKey(shortKey);

        Map<String, Long> deviceMap = convertToMap(analyticsRepository.getDeviceCounts(shortKey));
        Map<String, Long> referrerMap = convertToMap(analyticsRepository.getReferrerCounts(shortKey));
        Map<String, Long> browserMap = convertToMap(analyticsRepository.getBrowserCounts(shortKey));
        Map<String, Long> countryMap = convertToMap(analyticsRepository.getCountryCounts(shortKey));

        return new UrlAnalyticsResponse(shortKey, totalClicks, deviceMap, referrerMap, browserMap, countryMap);
    }

    public List<Map<String, Object>> getMyLinks(String anonymousToken) {
        // Query 1: Get all links (1 trip)
        List<UrlRecord> userLinks = urlRepository.findByAnonymousUserToken(anonymousToken);
        if (userLinks.isEmpty()) return java.util.Collections.emptyList();

        // Extract just the short keys
        List<String> shortKeys = userLinks.stream()
                .map(UrlRecord::getShortKey)
                .collect(Collectors.toList());

        // Query 2: Fetch ALL click counts simultaneously in 1 grouped database trip
        List<Object[]> aggregatedCounts = analyticsRepository.countClicksForMultipleKeys(shortKeys);

        // Transform database rows into a fast-lookup memory map
        Map<String, Long> clickCountMap = aggregatedCounts.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));

        // Combine everything cleanly in memory using stable HashMaps
        return userLinks.stream().map(link -> {
            long clicks = clickCountMap.getOrDefault(link.getShortKey(), 0L);

            Map<String, Object> item = new java.util.HashMap<>();
            item.put("shortKey", link.getShortKey());
            item.put("originalUrl", link.getLongUrl() != null ? link.getLongUrl() : "");
            item.put("shortUrl", baseUrl + link.getShortKey());
            item.put("clicks", clicks);

            return item;
        }).collect(Collectors.toList());
    }

    // Helper method to map Database Object Arrays into clean JSON Maps
    private Map<String, Long> convertToMap(List<Object[]> resultList) {
        return resultList.stream().collect(Collectors.toMap(
                row -> (String) row[0],
                row -> (Long) row[1]
        ));
    }

    // Helper method to clean the referer URL
    private String cleanReferrerUrl(String referer) {
        try {
            String domain = referer.replaceFirst("^(https?://)?(www\\.)?", "");
            int slashIndex = domain.indexOf('/');
            return slashIndex > 0 ? domain.substring(0, slashIndex) : domain;
        } catch (Exception e) {
            return "Other External";
        }
    }
}
