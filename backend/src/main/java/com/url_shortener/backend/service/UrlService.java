package com.url_shortener.backend.service;

import com.url_shortener.backend.dtos.ShortenUrlResponse;
import com.url_shortener.backend.entity.UrlRecord;
import com.url_shortener.backend.exception.ResourceNotFoundException;
import com.url_shortener.backend.exception.ShortKeyNotFoundException;
import com.url_shortener.backend.exception.UnauthorizedAccessException;
import com.url_shortener.backend.repository.ClickAnalyticsRepository;
import com.url_shortener.backend.repository.UrlRecordRepository;
import com.url_shortener.backend.util.Base62Converter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class UrlService {
    private final UrlRecordRepository urlRepository;
    private final StringRedisTemplate redisTemplate;
    private final ClickAnalyticsRepository analyticsRepository;

    private static final String CACHE_PREFIX = "url:";

    @Value("${base.url}")
    private String baseUrl;

    @Transactional
    public ShortenUrlResponse shortenUrl(String longUrl, String clientIp, String anonymousToken) {
        if (longUrl == null || longUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("Target URL path cannot be empty.");
        }

        boolean isNewUser = false;

        // If the browser didn't send a token, generate a secure one right here on the server
        if (anonymousToken == null || anonymousToken.isBlank() || anonymousToken.equals("null")) {
            anonymousToken = java.util.UUID.randomUUID().toString();
            isNewUser = true;
        }

        // SANITIZATION CLEANUP STEP:
        // Trim whitespace and check if the user forgot the protocol prefix
        String sanitizedUrl = longUrl.trim();
        if (!sanitizedUrl.startsWith("http://") && !sanitizedUrl.startsWith("https://")) {
            // If they just typed "www.google.com", rewrite it to "https://www.google.com"
            sanitizedUrl = "https://" + sanitizedUrl;
        }

        String idempotencyKey = "lock:" + clientIp + ":" + sanitizedUrl.hashCode();

        ShortenUrlResponse response = new ShortenUrlResponse();
        response.setAnonymousToken(anonymousToken);
        response.setOriginalUrl(longUrl);
        response.setTokenIssued(isNewUser);

        // BACKEND DOUBLE-SUBMIT CHECK
        String recentShortKey = redisTemplate.opsForValue().get(idempotencyKey);
        if (recentShortKey != null) {
            System.out.println("[IDEMPOTENCY BLOCK] Returning user's recently generated key: " + recentShortKey);
            response.setShortKey(recentShortKey);
            response.setFullShortUrl(baseUrl + recentShortKey);
            return response;
        }

        // 1. Create and save a new record shell to get a unique auto-incremented database ID
        UrlRecord record = new UrlRecord();
        record.setLongUrl(sanitizedUrl);
        record.setShortKey("PENDING"); // Temporary placeholder until ID is generated
        record.setAnonymousUserToken(anonymousToken);
        record = urlRepository.save(record);

        // 2. Perform Base-62 math conversion using the generated ID
        String shortKey = Base62Converter.encode(record.getId());

        // 3. Update the record with its final unique key mapping
        record.setShortKey(shortKey);
        urlRepository.save(record);

        response.setShortKey(shortKey);
        response.setFullShortUrl(baseUrl + shortKey);

        // 4. Save the lock (Only blocks THIS specific IP from spamming THIS specific link)
        redisTemplate.opsForValue().set(idempotencyKey, shortKey, 30, TimeUnit.SECONDS);

        // 5. Opt-in optimization: Proactively cache it to Redis for instant first-time use
        redisTemplate.opsForValue().set(CACHE_PREFIX + shortKey, sanitizedUrl, 24, TimeUnit.HOURS);

        return response;
    }

    public String getOriginalUrl(String shortKey) {
        String cacheKey = CACHE_PREFIX + shortKey;

        // 1. High-speed RAM Check: Try to find the link within Redis
        String cachedUrl = redisTemplate.opsForValue().get(cacheKey);
        if (cachedUrl != null) {
            System.out.println("[REDIS CACHE HIT] Served key from memory: " + shortKey);
            return cachedUrl;
        }

        // 2. Cache Miss: Decode short key to identify exact Primary Key ID
        System.out.println("[REDIS CACHE MISS] Querying MySQL disk index for key: " + shortKey);
        long dbId = Base62Converter.decode(shortKey);

        // 3. Fetch from disk database by primary key index O(1)
        UrlRecord record = urlRepository.findById(dbId)
                .orElseThrow(() -> new ShortKeyNotFoundException("The requested shortened URL link does not exist."));

        // 4. Save to Redis so the very next user gets a sub-millisecond Cache Hit
        redisTemplate.opsForValue().set(cacheKey, record.getLongUrl(), 24, TimeUnit.HOURS);

        return record.getLongUrl();
    }

    @Transactional
    public void deleteShortUrl(String shortKey, String anonymousToken) {
        // 1. Fetch the existing record from the database
        long dbId = Base62Converter.decode(shortKey);
        UrlRecord record = urlRepository.findById(dbId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: The link you are trying to delete does not exist."));


        // 2. Security Boundary: Compare the record owner token against the requester token
        if (!record.getAnonymousUserToken().equals(anonymousToken)) {
            throw new UnauthorizedAccessException("Unauthorized: You do not have permission to delete this short URL.");
        }

        // 3. Clean up Cache Layer: Remove routing rules from Redis memory instantly
        redisTemplate.delete("url:cache:" + shortKey);

        // 4. Clean up Analytics Layer
        analyticsRepository.deleteByShortKey(shortKey);

        // 5. Database Purge: Execute the delete command safely
        urlRepository.deleteByShortKey(shortKey);
    }

    public boolean isAllowed(String ipAddress, int limit) {
        String rateLimitKey = "ratelimit:" + ipAddress;

        // Increment the request count for this IP address atomicity safely
        Long currentRequests = redisTemplate.opsForValue().increment(rateLimitKey);

        if (currentRequests != null && currentRequests == 1) {
            // If it's the first request in this window, set an expiration window of 60 seconds
            redisTemplate.expire(rateLimitKey, 60, TimeUnit.SECONDS);
        }

        // If current count exceeds the threshold limit, block the request
        return currentRequests != null && currentRequests <= limit;
    }
}
