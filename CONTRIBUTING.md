# CONTRIBUTING.md
### Youth Self-Management App — Contribution Guidelines

Welcome to the Youth Self-Management App project!
This document explains how our team collaborates, writes code, and submits contributions.
Please read this carefully before committing any code.

---

## Project Overview

This app creates an engaging environment for youth ages 14–18 to build self-management skills for transitioning to adult healthcare.

We’re currently building the MVP (Minimum Viable Product) over a short sprint with three main teams:

- Frontend Team – builds the user interface (React Native)
- Backend Team – develops the API and logic (Supabase)
- Database Team – manages schema design, queries, and migrations

---

## Branch Workflow

| Branch | Purpose | Maintained By |
|--------|----------|---------------|
| main | Production-ready, stable code | Project Lead |
| dev | Integration & testing branch | All teams |
| frontend | Active development for UI | Frontend team |
| backend | API, auth, logic | Backend team |
| database | DB schema, seed data | Database team |
| feature/<name> | Individual feature branches | Individual developers |

### Branching Rules

- Never commit directly to main or dev.
- Always branch off from your team branch (e.g., frontend, backend, or database).
- Always use feature branches for your own work.
- Pull Requests (PRs) should go into your team branch — not directly into main or dev.

---

## Getting Started (New Member Setup)

Follow these steps when joining the project for the first time:

1. Clone the Repository
   ```bash
   git clone https://github.com/<your-org>/<repo-name>.git
   cd <repo-name>
   ```

2. Switch to Your Team Branch
   Replace <team-branch> with frontend-dev, backend-dev, or database-dev.
   ```bash
   git checkout <team-branch>
   ```

3. Pull the Latest Updates
   Always make sure your local branch is up to date.
   ```bash
   git pull origin <team-branch>
   ```

4. Create Your Personal Feature Branch
   Replace <feature-name> with something descriptive like login-page or api-auth.
   ```bash
   git checkout -b feature/<feature-name> <team-branch>
   ```

5. Work on Your Feature
   Add, edit, and commit code as needed.
   ```bash
   git add .
   git commit -m "feat(frontend): add login screen"
   ```

6. Push Your Branch to GitHub
   ```bash
   git push origin feature/<feature-name>
   ```

7. Open a Pull Request (PR)
   - On GitHub, open a PR from your feature branch → into your team branch.
   - Request at least one review from a teammate or team lead.
   - Once approved, the team lead merges into the team branch.

8. Merging Upstream
   - Team leads will merge into dev.
   - The project lead will periodically merge dev → main.

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

Each team should maintain a small README.md inside their folder with setup and run instructions.

---

## Code Style Guidelines

General
- Write clear, self-documenting code.
- Use consistent indentation (2 spaces for JS, 4 for SQL).
- Write meaningful commit messages, e.g.:
  ```bash
  feat(frontend): add goal-setting screen layout
  ```

Frontend
- Use React functional components and hooks.
- Keep components modular and reusable.

Backend
- Use async/await.
- Validate all inputs and handle errors gracefully.

Database
- Use descriptive table and column names.
- Keep schema changes version-controlled (migration scripts).

---

## Testing

- Each team is responsible for testing their module before PR submission.
- Manual validation is acceptable for the MVP.

---

## Contribution Workflow Summary

1. Clone the repo
2. Checkout your team branch
3. Create a personal feature branch
4. Work → commit → push
5. Open a Pull Request → get review → merge into team branch
6. Team lead merges into dev
7. Project lead merges dev → main
