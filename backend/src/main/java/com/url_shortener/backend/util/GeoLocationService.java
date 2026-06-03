package com.url_shortener.backend.util;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
public class GeoLocationService {

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Resolves an IP address to a country name.
     */
    public String getCountryFromIp(String ipAddress) {
        // Handle local diagnostic loopback configurations instantly
        if (ipAddress == null || ipAddress.equals("127.0.0.1") || ipAddress.equals("0:0:0:0:0:0:0:1")) {
            return "Local Sandbox Development";
        }

        try {
            // High-speed API endpoint that returns json location blocks
            String url = "http://ip-api.com/json/" + ipAddress + "?fields=country";
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && "success".equals(response.get("status"))) {
                return (String) response.get("country");
            }

            // If the proxy split address is a comma-separated list, extract the first one
            if (ipAddress.contains(",")) {
                return getCountryFromIp(ipAddress.split(",")[0].trim());
            }

        } catch (Exception e) {
            System.err.println("[GEO ERROR] Failed to resolve country geolocation parameters: " + e.getMessage());
        }

        return "Unknown Location";
    }
}
