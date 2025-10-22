# CONTRIBUTING.md
### Youth Self-Management App — Contribution Guidelines

Welcome to the Youth Self-Management App project!  
This document explains how our team collaborates, writes code, and submits contributions.  
Please read this carefully **before committing any code**.

---

## Project Overview

This app creates a fun environment for youth ages 14–18 build self-management skills for transitioning to adult healthcare.  
We’re currently building the **MVP (Minimum Viable Product)** over a short sprint, with three teams:

- **Frontend Team** – builds the user interface (React Native)
- **Backend Team** – develops the API and logic (Supabase)
- **Database Team** – manages schema design, queries, and migrations

---

## Branch Workflow

| Branch | Purpose | Maintained By |
|--------|----------|---------------|
| `main` | Production-ready, stable code | Project Lead |
| `dev` | Integration & testing branch | All teams |
| `frontend` | Active development for UI | Frontend team |
| `backend` | API, auth, logic | Backend team |
| `database` | DB schema, seed data | Database team |
| `feature/<name>` | Individual feature branches | Individual developers |


### Rules
- Never commit directly to `main` or `dev`.  
- Always branch off from your **team branch** (e.g., `frontend`) using:
  ```bash
  git checkout -b feature/your-feature-name frontend
  ```
- Create a Pull Request (PR) into your team branch once your task is ready.
- Team leads will merge into `dev` after reviews.
- Only the project lead merges into `main`.
---

## Pull Request (PR) Process

1. Push your branch to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Open a **Pull Request (PR)** into your **team branch** (not `main`).
3. Request at least **one review** from a teammate or your team lead.
4. Ensure the PR:
   - Has a clear title and summary.
   - Passes any existing tests or linter checks.
   - Doesn’t include unrelated file changes.
5. Once approved, the team lead merges it into the team branch.
6. The project lead will periodically merge team branches → `dev` → `main`.

---

## Folder Structure

```
YouthSelfManagementApp/
│
├── frontend/      # React Native code
├── backend/       # Supabase API
├── database/      # SQL schema, migrations, sample data
├── README.md
└── CONTRIBUTING.md
```

Each team should maintain a small `README.md` inside their folder with setup and run instructions.

---

## Code Style Guidelines

**General**
- Write clear, self-documenting code.
- Use consistent indentation (2 spaces for JS, 4 for SQL).
- Write meaningful commit messages:  
  Example → `feat(frontend): add goal-setting screen layout`

**Frontend**
- Follow functional React patterns (hooks, components).
- Keep components modular and reusable.

**Backend**
- Use async/await.
- Validate all inputs and handle errors gracefully.

**Database**
- Use descriptive table and column names.
- Keep schema changes version-controlled (e.g., migration scripts).
---
## Testing
- Each team is responsible for testing their module before PR submission.
- Manual validation is acceptable for the MVP.

## Contribution Workflow Summary

1. Clone the repo  
2. Create a feature branch from your team branch  
3. Commit and push your changes  
4. Open a Pull Request → get review → merge into team branch  
5. Team lead merges into `dev`  
6. Project lead merges `dev` → `main`
