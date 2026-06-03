package com.url_shortener.backend.interceptor;

import com.url_shortener.backend.service.UrlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    @Autowired
    private UrlService urlService;

    private static final int MAX_REQUESTS_PER_MINUTE = 10;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 1. Extract the true client IP address (handles proxies or cloud deployments)
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = request.getRemoteAddr();
        }

        // 2. Only enforce strict rate limiting on the URL creation endpoint (POST requests)
        if ("POST".equalsIgnoreCase(request.getMethod()) && request.getRequestURI().contains("/api/v1/shorten")) {
            boolean allowed = urlService.isAllowed(ipAddress, MAX_REQUESTS_PER_MINUTE);

            if (!allowed) {
                // Return a clean HTTP 429 Too Many Requests status
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Rate limit exceeded. Please try again in a minute.\"}");
                return false; // Blocks the request from moving forward to the Controller
            }
        }

        return true; // Request is safe, pass it forward to the controller
    }
}
