# High-Performance URL Shortener & Analytics Engine

A highly scalable, production-ready RESTful API engineered to handle high-concurrency redirect traffic and real-time click metrics. This project is built using a **Backend-First Engineering approach**, prioritizing low-latency data structures, multi-tier caching, and memory-isolated analytical processing before UI layering.

---

## 🎯 Architecture Status & Project Roadmap


```

[ Phase 1: Core API & DB Infrastructure ] ──> SUCCESS (Complete & Verified)
[ Phase 2: High-Speed Redis Cache Layer ] ──> SUCCESS (Complete & Verified)
[ Phase 3: React 19 + TypeScript SPA    ] ──> IN PROGRESS / FUTURE MILESTONE

```

* **Current State:** Fully functional, production-ready **Headless API Engine**.
* **Next Milestone:** Type-safe **React 19 + TypeScript SPA** client compilation, leveraging the modern *React Compiler* for automatic memoization and *TanStack Query* for asynchronous server-state cache management.

---

## 🚀 Key System Design & Optimization Choices

* **Multi-Tier Caching ($O(1)$ Redirects):** Hot redirect routing requests are intercepted by an in-memory **Redis** cache layer for sub-millisecond response processing. On a cache miss, the system avoids expensive character-by-character string database index scans by mathematically decoding incoming Base62 keys back into native auto-incrementing integers, querying directly against MySQL's clustered primary key index.
* **Constant-Space Analytics Summary ($O(1)$ Heap Memory):** Rather than loading thousands of raw click log objects into the Spring Boot JVM application memory—which risks `java.lang.OutOfMemoryError` on viral links—analytical transformations (device, browser, referrer, geolocation) are computed directly on the database engine using highly optimized **JPQL Group By** database queries. This drops server memory consumption from $O(\text{Clicks})$ to a constant $O(1)$ footprint.
* **Cryptographic Identity Management:** Implements an unauthenticated session tracking layout using secure UUID structures (`X-Anonymous-User-ID`), enabling individual clients to retain exclusive ownership, dashboard analytics tracking rights, and secure multi-tier link deletions without traditional account creation barriers.

---

## 🛠️ Tech Stack & System Requirements

* **Core Engine:** Java 17+, Spring Boot, Spring Data JPA
* **Data Layers:** MySQL (Persistent Data Storage), Redis (In-Memory Hot Caching)
* **Build Automation:** Maven

---

## 🔌 Core API Contract (Headless Documentation)

All backend endpoints are fully implemented and can be tested natively using tools like Postman, Bruno, or `curl`.

### 1. Shorten a Destination URL
* **Endpoint:** `POST /api/v1/shorten`
* **Headers:** `X-Anonymous-User-ID: <UUID>` *(Optional: Server issues a tracking identity token if missing)*
* **Request Body:**
```json
{
  "longUrl": "[https://example.com/deep/path/to/resource?ref=engineering-portfolio](https://example.com/deep/path/to/resource?ref=engineering-portfolio)"
}

```

* **Response Body (`201 Created`):**

```json
{
  "shortKey": "Aa5",
  "shortUrl": "http://localhost:8080/Aa5",
  "originalUrl": "[https://example.com/deep/path/to/resource?ref=engineering-portfolio](https://example.com/deep/path/to/resource?ref=engineering-portfolio)",
  "anonymousToken": "4a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "tokenIssued": true
}

```

### 2. High-Speed Link Redirection

* **Endpoint:** `GET /{shortKey}` *(e.g., `GET /Aa5`)*
* **Behavior:** Processes cache layers, records user-agent click metadata asynchronously, and issues a standard browser HTTP redirect.
* **Response Headers:**
* `Status: 302 Found`
* `Location: https://example.com/deep/path/to/resource?ref=engineering-portfolio`



### 3. Fetch Secured Ownership Analytics Dashboard Data

* **Endpoint:** `GET /api/v1/analytics/{shortKey}`
* **Headers:** `X-Anonymous-User-ID: 4a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d` *(Required: Enforces resource ownership bounds)*
* **Response Body (`200 OK`):**

```json
{
  "shortKey": "Aa5",
  "totalClicks": 12504,
  "deviceMap": { "Desktop": 8420, "Mobile": 3904, "Tablet": 180 },
  "referrerMap": { "Direct": 6000, "Twitter/X": 4504, "LinkedIn": 2000 },
  "browserMap": { "Chrome": 9100, "Safari": 2404, "Firefox": 1000 },
  "countryMap": { "IN": 7500, "US": 4004, "DE": 1000 }
}

```

---

## ⚡ Local Setup & Execution

### 1. Spin up Core Dependencies

A `docker-compose.yml` file is provided in the root directory to spin up isolated, pre-configured containers for MySQL and Redis instantly:

```bash
docker compose up -d

```

### 2. Configure Environment Variables

Ensure your `src/main/resources/application.properties` configuration points securely to your active Redis and MySQL connection instances.

### 3. Boot the Spring App Engine

```bash
./mvnw spring-boot:run

```

The API engine will compile, initialize, and anchor onto port `8080`.

```

### Why This Formatting Wins in Technical Screenings:
1. **The Visual Roadmap:** The visual text diagram at the top instantly flags the current completion status. It makes your future frontend development goals look like a planned execution phase rather than a missing component.
2. **Defines clear API Boundaries:** Highlighting the request headers and specific JSON responses proves you understand decoupled architecture—meaning your backend is so modular that any client could bind to it later.
3. **Infrastructure Rigor:** It highlights the algorithmic and architectural solutions you designed (Redis cache hits, Base62 conversions, JPQL aggregations), which is exactly what backend hiring managers want to review.

```