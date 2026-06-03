package com.url_shortener.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "urls", indexes = {
        @Index(name = "idx_short_key", columnList = "short_key", unique = true),
        @Index(name = "idx_anon_user_token", columnList = "anonymous_user_token")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UrlRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "url_seq_gen")
    @SequenceGenerator(
            name = "url_seq_gen",
            sequenceName = "url_record_seq",
            initialValue = 100000,
            allocationSize = 1
    )
    private Long id;

    @Column(name = "long_url", nullable = false, columnDefinition = "TEXT")
    private String longUrl;

    @Column(name = "short_key", nullable = false, length = 7, columnDefinition = "VARCHAR(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin")
    private String shortKey;

    @Column(name = "anonymous_user_token", nullable = false)
    private String anonymousUserToken;

    @Column(name = "created_at", insertable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}
