package com.url_shortener.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "click_analytics", indexes = {
        @Index(name = "idx_short_key", columnList = "short_key"),
        @Index(name = "idx_click_time", columnList = "click_time")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClickAnalytics {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "short_key", nullable = false)
    private String shortKey;

    @Column(name = "click_time", nullable = false)
    private LocalDateTime clickTime;

    @Column(name = "referrer")
    private String referrer;

    @Column(name = "browser")
    private String browser;

    @Column(name = "device_type")
    private String deviceType;

    @Column(name = "country")
    private String country;
}
