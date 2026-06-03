package com.url_shortener.backend.exception;

public class ShortKeyNotFoundException extends RuntimeException {
    public ShortKeyNotFoundException(String message) {
        super(message);
    }
}
