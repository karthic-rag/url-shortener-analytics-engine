package com.url_shortener.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${frontend.url}")
    private String allowedOrigin;

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // 1. Allow credentials (cookies, authorization headers, custom headers)
        config.setAllowCredentials(true);

        // 2. Whitelist the frontend origin (patterns required when credentials are enabled)
        config.setAllowedOriginPatterns(List.of(allowedOrigin));

        // 3. Allow headers used by the React client (wildcard is invalid with credentials)
        config.setAllowedHeaders(List.of(
                "Content-Type",
                "Authorization",
                "X-Anonymous-User-ID"
        ));

        // 4. Expose your custom identity token so the React application can save it
        config.setExposedHeaders(List.of("X-Anonymous-User-ID"));

        // 5. Allow standard REST application execution verbs
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Apply this configuration to every single URL route path
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
