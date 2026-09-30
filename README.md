# 🌍 TerraSync — Digital Land Acquisition Information & Grievance Portal

A unified, role-based portal that brings land acquisition information, compensation details, notices, and grievance tracking into one transparent platform.

**SISTec Innovation Hackathon 2026** · Problem ID: DT-2 · Theme: Digital Transformations · Team: TerraSync

> ⚠️ Hackathon prototype using **mock data only**. Not an official government record system.

## Problem
Landowners affected by infrastructure projects get scattered, delayed information about acquisition, compensation, notices, and grievances across multiple offices.

## Solution
One portal where landowners view their parcel, compensation, and notices, and submit and track grievances. Admins manage cases from a basic dashboard.

## MVP Modules
1. Registration / login & profile
2. Land parcel details & acquisition status
3. Compensation visibility
4. Notices & documents access
5. Grievance submission with reference number & tracking
6. Basic admin dashboard

**Chatbot (extension):** an authenticated assistant that answers questions from the user's own portal data (status, compensation, grievances) and guides grievance filing.

## Tech Stack
Java 17 · Spring Boot · Spring Data JPA · MySQL · REST APIs with role-based access · Basic responsive frontend

## Run Locally
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
# create a MySQL database named "terrasync" and set credentials in
# src/main/resources/application.properties
./mvnw spring-boot:run
```
App runs at `http://localhost:8080`.

## Security
Password hashing · role-based access · minimal data collection · audit-friendly status history

## Team
| Name              | Role                        |
|------             |------                       |
|Atharv Raghuwanshi | Team Lead and AI Integration|
|Anadi Swarnkar     | Frontend Devloper           |
|Aryan Nayak        | Backend Devloper            |
|Akshat Malviya     | UI/UX and Database Designer |

## References
[DILRMP](https://dolr.gov.in/) · [LARR Act 2013](https://www.indiacode.nic.in/) · [CPGRAMS](https://pgportal.gov.in/) · [World Bank Land Governance](https://www.worldbank.org/en/topic/land)
