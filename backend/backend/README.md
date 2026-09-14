# Question Paper Generator System (QPGS)

An automated backend system built with Spring Boot to efficiently create, manage, and export customized academic question papers based on specific constraints, difficulty levels, and subject parameters.

---

## Tech Stack

* **Core Framework:** Spring Boot 4.1.1
* **Language:** Java 21
* **Database:** MySQL 8+ (via Spring Data JPA / Hibernate)
* **Security & Auth:** Spring Security with JSON Web Tokens (JWT 0.11.5)
* **Document Export:** iTextPDF (PDF generation) & Apache POI (Word `.docx` generation)
* **API Documentation:** SpringDoc OpenAPI 2.5.0 (Swagger UI)
* **Build Tool:** Maven

---

## System Architecture Flow

```text
[ Client / Frontend ] 
       │
       ▼  HTTP Request (with Bearer Token)
[ Spring Boot Security Filter Chain ] 
       │
       ├─► Invalid / Missing Token ──► [ 401 Unauthorized ]
       │
       ▼ Valid JWT
[ REST Controllers (API Endpoints) ]
       │
       ▼
[ Service Layer (Business Logic & Paper Generation Algorithm) ]
       │
       ├─► [ Spring Data JPA ] ──► [ MySQL Database ]
       │
       └─► [ iTextPDF / Apache POI ] ──► File Download (PDF / Word)