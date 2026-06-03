package com.url_shortener.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.url_shortener.backend.entity.UrlRecord;

import java.util.List;
import java.util.Optional;

public interface UrlRecordRepository extends JpaRepository<UrlRecord, Long> {
    Optional<UrlRecord> findById(long id);
    List<UrlRecord> findByAnonymousUserToken(String anonymousToken);
    void deleteByShortKey(String shortKey);
}
