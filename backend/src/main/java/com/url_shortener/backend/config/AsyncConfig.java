package com.url_shortener.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "analyticsExecutor")
    public Executor analyticsExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        // 1. Core Pool Size: The number of threads that stay alive constantly
        executor.setCorePoolSize(5);

        // 2. Max Pool Size: The maximum threads allowed if the queue fills up
        executor.setMaxPoolSize(10);

        // 3. Queue Capacity: The holding area for tasks waiting for an available thread
        executor.setQueueCapacity(500);

        // 4. Thread Name Prefix: Makes debugging easy in your console logs
        executor.setThreadNamePrefix("AnalyticsThread-");

        executor.initialize();
        return executor;
    }
}
