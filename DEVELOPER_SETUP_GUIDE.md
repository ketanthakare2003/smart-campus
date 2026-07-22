# Developer Setup Guide

Welcome to the **Smart Campus Management System** setup guide! Follow these instructions to configure and run both the backend and frontend services on a clean developer machine.

---

## 📋 Prerequisites

Ensure your development computer has the following tools installed:

| Prerequisite | Recommended Version | Verification Command |
| :--- | :--- | :--- |
| **Java JDK** | JDK 17 | `java -version` |
| **Node.js** | v18.x or higher (with npm 9.x+) | `node -version` |
| **PostgreSQL** | v14 or higher | `psql --version` |
| **Maven** (Optional) | v3.8.x or higher | `mvn -version` |

*Note: If you do not have Maven installed globally, you can run the backend directly through your IDE (such as IntelliJ IDEA or Eclipse).*

---

## 🗄️ PostgreSQL Database Setup

### 1. Database Creation
Open your PostgreSQL terminal (psql) or GUI client (such as pgAdmin or DBeaver) and run the following command to create the database:
```sql
CREATE DATABASE smart_campus;
```

### 2. Table Creation (Automatic)
The project is configured to use Hibernate's schema auto-update capability. In `application.properties`, the setting is configured as:
```properties
spring.jpa.hibernate.ddl-auto=update
```
**No manual SQL schema import files are required!** When you start the Spring Boot application for the first time, Hibernate will inspect the JPA entities and create all the tables, relations, foreign keys, and indexes automatically.

### 3. Optional: Initial Seed Data SQL Script
Although the application **automatically seeds a default Admin user on startup**, you can optionally run the following SQL script to insert additional test roles and demo notices into your database for testing:

```sql
-- Clean up any existing records to avoid conflicts
TRUNCATE TABLE users CASCADE;

-- 1. Insert default admin account (Password: Admin@SmartCampus2026)
INSERT INTO users (id, full_name, email, password, role, status)
VALUES (1, 'Campus Administrator', 'admin@campus.edu', '$2a$10$Y5n2v0QzO7qKkQ72XmU6ueuB8Z2h4uWb.J.O96.b68.L68g0g9b8a', 'ADMIN', 'ACTIVE');

-- 2. Insert a pre-approved Student account (Password: student123)
INSERT INTO users (id, full_name, email, password, role, status)
VALUES (2, 'John Doe', 'student@campus.edu', '$2a$10$tZ2c.HhE1R3bsp633x5t/.rLz24n75a5rAbeuWk4j0H25Z8a/pBfW', 'STUDENT', 'ACTIVE');

-- 3. Insert a Student Profile linked to the student user
INSERT INTO student_profiles (id, roll_number, department, cgpa, skills, resume_url, user_id)
VALUES (1, 'CS202601', 'Computer Science', 9.20, 'React, TypeScript, Java, PostgreSQL', 'https://example.com/resume.pdf', 2);

-- 4. Insert a pre-approved TPO account (Password: tpo12345)
INSERT INTO users (id, full_name, email, password, role, status)
VALUES (3, 'Placement Officer', 'tpo@campus.edu', '$2a$10$59b3w9Z8x9p3c834x9t/.u9v2Z0y8U2l4a5rAbeuWk4j0H25Z8a/p', 'TPO', 'ACTIVE');

-- 5. Insert an initial notice board announcement
INSERT INTO notices (id, title, content, posted_by_id, posted_date)
VALUES (1, 'Campus Recruitment Drive 2026', 'Welcome to the Smart Campus recruitment portal. Stay tuned for upcoming placement drives and schedules.', 1, NOW());
```

---

## ⚙️ Configuration Properties

Before running the project, you must inspect and configure the environment variables in `application.properties`.

### 1. Database Connection Parameters
Edit these lines with your PostgreSQL username and password:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/smart_campus
spring.datasource.username=postgres
spring.datasource.password=YOUR_PG_PASSWORD
```

### 2. JWT Configuration & Security Credentials
For security, do not reuse the default developer keys. You should customize these settings:
```properties
app.jwt.secret=9a67471b79841c62f281249b6b7a26f658097b6e927adca3cb682df6d4e81561
app.jwt.expiration-ms=86400000
```
- **JWT Secret**: Generates the signatures for stateless user sessions. Replace this with a 256-bit secure hex key.
- **JWT Expiration**: Set to `86400000` (24 hours) by default.

### 3. Frontend API Base URL
The React frontend communicates with the backend via the Axios client defined in `frontend/src/api/api.ts`. If you run the Spring Boot backend on a port other than `8080`, edit the `baseURL` property:
```typescript
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Update if backend port changes
  headers: {
    'Content-Type': 'application/json',
  },
});
```

---

## 🚀 Running the Project

### 1. Backend Service (Spring Boot)

#### Option A: Running via IntelliJ IDEA (Recommended)
1. Open IntelliJ IDEA and select **Open**.
2. Navigate to the `backend` folder and click **OK** to open the Maven project.
3. Wait for IntelliJ to download dependencies and configure index listings.
4. Locate the main application class: `com.campus.smart.SmartCampusApplication` (located in `backend/src/main/java/com/campus/smart/SmartCampusApplication.java`).
5. Right-click the file and click **Run 'SmartCampusApplication'**.

#### Option B: Running via Command Line (Requires Global Maven)
1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Build the project and run the server:
   ```bash
   mvn spring-boot:run
   ```

*Once started, verify the server is running by opening the Swagger Documentation at **[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)**.*

---

### 2. Frontend Web App (React)

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the package dependencies:
   ```bash
   npm install
   ```
3. Launch the local Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the URL printed in the terminal (usually **[http://localhost:5173](http://localhost:5173)**).

---

## 🔐 Credentials Audit for First Login

### Default Admin
- 📧 **Email**: `admin@campus.edu`
- 🔒 **Password**: `Admin@SmartCampus2026`
- **Role**: `ADMIN`
- **Status**: `ACTIVE`

*Security Note: The Admin seeder configuration resides in `SmartCampusApplication.java`. The seeder dynamically generates the Admin password hash on startup using the active BCrypt encoder. You do not need to manually compute hashes.*
