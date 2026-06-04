package com.url_shortener.backend.util;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class GeoLocationService {

    private final RestTemplate restTemplate = new RestTemplate();

    public String getCountryFromIp(String ipAddress) {

        // Handle localhost
        if (ipAddress == null ||
                ipAddress.isBlank() ||
                "127.0.0.1".equals(ipAddress) ||
                "0:0:0:0:0:0:0:1".equals(ipAddress)) {

            return "Local Sandbox Development";
        }

        // Handle X-Forwarded-For containing multiple IPs
        if (ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0].trim();
        }

        try {

            String url =
                    "http://ip-api.com/json/"
                            + ipAddress
                            + "?fields=status,country";

            Map<String, Object> response =
                    restTemplate.getForObject(url, Map.class);

            System.out.println("IP Address: " + ipAddress);
            System.out.println("Geo Response: " + response);

            if (response != null &&
                    "success".equals(response.get("status"))) {

                return response.get("country").toString();
            }

        } catch (Exception e) {

            System.err.println(
                    "[GEO ERROR] Failed to resolve country: "
                            + e.getMessage()
            );
        }

        return "Unknown Location";
    }
}