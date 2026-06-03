package com.url_shortener.backend.controller;

import com.url_shortener.backend.dtos.ShortenUrlResponse;
import com.url_shortener.backend.service.AnalyticsService;
import com.url_shortener.backend.service.UrlService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class UrlController {
    private final UrlService urlService;
    private final AnalyticsService analyticsService;

    @PostMapping("/api/v1/shorten")
    public ResponseEntity<ShortenUrlResponse> createShortUrl(@RequestBody Map<String, String> request,
                                                             @RequestHeader(value = "X-Anonymous-User-ID", required = false) String anonymousToken,
                                                             HttpServletRequest httpRequest) {

        String longUrl = request.get("longUrl");

        // Extract the client's real public IP address
        String clientIp = httpRequest.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isEmpty()) {
            clientIp = httpRequest.getRemoteAddr();
        }

        return ResponseEntity.ok(urlService.shortenUrl(longUrl, clientIp, anonymousToken));
    }

    @GetMapping("/{shortKey:[^\\.]+}")
    public void redirectToOriginalUrl(
            @PathVariable String shortKey,
            @RequestHeader(value = "User-Agent", required = false) String userAgent,
            @RequestHeader(value = "Referer", required = false) String referer,
            HttpServletRequest httpRequest,
            HttpServletResponse response) throws IOException {

            // 1. Core Fast Path: Fetch the original long URL mapping from your service layer
            String originalUrl = urlService.getOriginalUrl(shortKey);

            // 2. Extract Client IP context (Checks if cloud proxies like AWS/Railway passed an X-Forwarded-For header)
            String clientIp = httpRequest.getHeader("X-Forwarded-For");
            if (clientIp == null || clientIp.isEmpty()) {
                clientIp = httpRequest.getRemoteAddr();
            }

            // 3. The Asynchronous Hand-off: Fires instantly to your background worker thread pool
            // This will resolve the country, browser, device, and referrer completely in the background!
            analyticsService.recordClick(shortKey, userAgent, referer, clientIp);

            // 4. Send HTTP 302 redirect back to the client browser instantly
            response.sendRedirect(originalUrl);
    }

    @DeleteMapping("/api/v1/delete/{shortKey}")
    public ResponseEntity<Map<String, String>> deleteLink(
            @PathVariable String shortKey,
            @RequestHeader("X-Anonymous-User-ID") String anonymousToken) {

            urlService.deleteShortUrl(shortKey, anonymousToken);

            return ResponseEntity.ok(Map.of("message", "Short URL successfully deleted."));
    }
}
