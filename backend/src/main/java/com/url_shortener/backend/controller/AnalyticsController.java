package com.url_shortener.backend.controller;

import com.url_shortener.backend.dtos.UrlAnalyticsResponse;
import com.url_shortener.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/{shortKey}")
    public ResponseEntity<UrlAnalyticsResponse> getLinkMetrics(
            @PathVariable String shortKey,
            @RequestHeader("X-Anonymous-User-ID") String anonymousToken) {

            UrlAnalyticsResponse report = analyticsService.getUrlAnalytics(shortKey, anonymousToken);
            return ResponseEntity.ok(report);
    }

    @GetMapping("/my-links")
    public ResponseEntity<List<Map<String, Object>>> getMyLinks(
            @RequestHeader("X-Anonymous-User-ID") String anonymousToken) {
        return ResponseEntity.ok(analyticsService.getMyLinks(anonymousToken));
    }
}
