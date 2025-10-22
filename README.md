# Youth Self-Management App
### Supporting Adolescents in the Transition to Adult Healthcare

---
### Overview

The **Youth Self-Management App** empowers adolescents (ages 14–18) to develop essential self-management skills as they prepare to transition from pediatric to adult healthcare.  
Many youth struggle with the independence required for adult care — managing appointments, medications, insurance, and personal health information.  

This project provides a **structured, engaging, and educational tool** to close that gap.

---

### Objectives

- Equip youth with tools to build healthcare self-management skills.  
- Help providers monitor progress through structured assessments.  
- Simplify the transition to adult care by fostering independence early.

---

### MVP Features

| Feature | Description |
|----------|--------------|
| **User Accounts** | Basic sign-up and login using secure authentication (Supabase) |
| **Self-Assessment** | Questionnaire based on the Got Transition framework |
| **Goal Setting** | Create and track goals (e.g., scheduling appointments, medication management) |
| **Appointment Tracker** | Simple calendar/reminder for appointments and medication refills |
| **Progress Feedback** | Visual display of user growth and completion milestones |

---

### System Architecture (MVP)

**Tech Stack**

| Layer | Technology | Description |
|-------|-------------|--------------|
| **Frontend** | React Native (Expo) | Cross-platform mobile interface |
| **Backend** | Node.js / Express | Handles API, business logic, and user routes |
| **Database** | Supabase (PostgreSQL) | Manages authentication and persistent data |
| **Version Control** | GitHub | Collaboration, code review, and deployment workflow |

---

### Development Workflow

- Main branches:
  - `main` → Production-ready code
  - `dev` → Integration and testing
  - `frontend`, `backend`, `database` → Team branches
- Individual developers create `feature/<name>` branches.

For details, see:  
[`CONTRIBUTING.md`](./CONTRIBUTING.md)

---
