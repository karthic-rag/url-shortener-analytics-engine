package com.url_shortener.backend.dtos;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UrlAnalyticsResponse {
    private String shortKey;
    private long totalClicks;
    private Map<String, Long> deviceBreakdown;
    private Map<String, Long> referrerBreakdown;
    private Map<String, Long> browserBreakdown;
    private Map<String, Long> countryBreakdown;
}
