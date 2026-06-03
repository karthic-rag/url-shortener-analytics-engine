package com.url_shortener.backend.dtos;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShortenUrlResponse {
    private String shortKey;
    private String fullShortUrl;
    private String originalUrl;
    private String anonymousToken;
    private boolean tokenIssued;
}
