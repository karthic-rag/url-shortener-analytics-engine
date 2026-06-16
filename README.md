# ⚡ High-Performance URL Shortener & Analytics Platform

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=java)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

A highly scalable, production-ready Full-Stack URL Shortener engineered to handle high-concurrency redirect traffic and real-time click metrics. This project combines a low-latency, multi-tier cached backend with a modern, glassmorphic React 19 single-page application dashboard.

## 🎯 Architecture Status & Project Roadmap

```text
[ Phase 1: Core API & DB Infrastructure ] ──> SUCCESS
[ Phase 2: High-Speed Redis Cache Layer ] ──> SUCCESS
[ Phase 3: React 19 + TypeScript SPA    ] ──> SUCCESS
[ Phase 4: Full-Stack Dockerization     ] ──> SUCCESS
```

* **Current State:** Fully functional, containerized full-stack web application ready for cloud deployment (e.g., Render, AWS, Railway).
* **Frontend:** Type-safe React 19 + TypeScript SPA, leveraging React Compiler, TanStack Query for server-state cache management, and Tailwind CSS for styling.
* **Backend:** Robust Spring Boot 4 engine with Redis multi-tier caching and MySQL persistent data layer.

---

## 🚀 Key System Design & Optimization Choices

* **Multi-Tier Caching ($O(1)$ Redirects):** Hot redirect routing requests are intercepted by an in-memory **Redis** cache layer for sub-millisecond response processing. On a cache miss, the system avoids expensive character-by-character string database index scans by mathematically decoding incoming Base62 keys back into native auto-incrementing integers, querying directly against MySQL's clustered primary key index.
* **Constant-Space Analytics Summary ($O(1)$ Heap Memory):** Rather than loading thousands of raw click log objects into the Spring Boot JVM application memory, analytical transformations (device, browser, referrer, geolocation) are computed directly on the database engine using highly optimized **JPQL Group By** database queries. This drops server memory consumption from $O(\text{Clicks})$ to a constant $O(1)$ footprint.
* **Cryptographic Identity Management:** Implements an unauthenticated session tracking layout using secure UUID structures (`X-Anonymous-User-ID`). This enables individual clients to retain exclusive ownership, dashboard analytics tracking rights, and secure multi-tier link deletions without traditional account creation barriers.
* **Single Container Deployment:** The React SPA is statically built and embedded into the Spring Boot resource folder during the Docker multi-stage build, serving the entire application from a single optimized container for simplified deployment operations.

---

## 🛠️ Tech Stack & System Requirements

### Frontend
* **Core:** React 19, TypeScript, Vite
* **Styling:** Tailwind CSS v4, Lucide React (Icons)
* **State & Data Fetching:** TanStack Query (React Query) v5, Axios
* **Visualization:** Chart.js, React-Chartjs-2

### Backend
* **Core Engine:** Java 21, Spring Boot 4
* **Data Layers:** MySQL (Persistent Storage), Redis (In-Memory Hot Caching)
* **Build Automation:** Maven

### DevOps & Infra
* **Containerization:** Docker (Multi-stage build)

---

## 🔌 Core API Contract (Headless Documentation)

The backend provides a complete RESTful API that can be consumed by any external client.

### 1. Shorten a Destination URL
* **Endpoint:** `POST /api/v1/shorten`
* **Headers:** `X-Anonymous-User-ID: <UUID>` *(Optional: Server issues a tracking identity token if missing)*
* **Request Body:**
  ```json
  {
    "longUrl": "https://example.com/deep/path/to/resource?ref=portfolio"
  }
  ```
* **Response Body (`201 Created`):**
  ```json
  {
    "shortKey": "Aa5",
    "shortUrl": "http://localhost:8080/Aa5",
    "originalUrl": "https://example.com/deep/path/to/resource?ref=portfolio",
    "anonymousToken": "4a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "tokenIssued": true
  }
  ```

### 2. High-Speed Link Redirection
* **Endpoint:** `GET /{shortKey}` *(e.g., `GET /Aa5`)*
* **Behavior:** Processes cache layers, records user-agent click metadata asynchronously, and issues a standard browser HTTP redirect.
* **Response Headers:**
  * `Status: 302 Found`
  * `Location: https://example.com/deep/path/to/resource?ref=portfolio`

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

### Option 1: Full-Stack Docker Build (Recommended)
This method perfectly replicates the production deployment environment by building both the Vite frontend and Spring Boot backend into a single image.

1. Ensure Docker is running on your machine.
2. Build and run the multi-stage image:
   ```bash
   docker build -t url-shortener .
   docker run -p 8080:8080 \
     -e SPRING_DATASOURCE_URL="jdbc:mysql://<your-db-host>:3306/<db-name>" \
     -e SPRING_DATASOURCE_USERNAME="<username>" \
     -e SPRING_DATASOURCE_PASSWORD="<password>" \
     -e SPRING_DATA_REDIS_HOST="<your-redis-host>" \
     url-shortener
   ```
3. Access the full application at `http://localhost:8080`

### Option 2: Local Development Mode (Split Services)

#### 1. Configure Environment Variables
Ensure your `backend/src/main/resources/application.properties` and `frontend/.env` point to your local MySQL and Redis instances.

#### 2. Boot the Spring App Engine
```bash
cd backend
./mvnw spring-boot:run
```
The backend API will run on port `8080`.

#### 3. Start the Vite React Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will start on the port specified by Vite (usually `5173`) and will proxy requests or point directly to the backend depending on your configuration. Access the UI via the local address provided in your terminal.

---

> **Why This Architecture Excels:**
> By isolating analytical memory overhead to the DB layer and routing fast-path reads through Redis, this architecture mimics large-scale enterprise URL routing systems. The addition of the React 19 Frontend and Docker multi-stage builds completes the pipeline for seamless end-to-end cloud deployment.