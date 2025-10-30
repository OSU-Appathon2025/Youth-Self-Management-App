from datetime import date, datetime, timedelta, UTC
import os
import random
from faker import Faker
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
fake = Faker()

NUM_USERS = 15

def date_iso(days_offset=0):
    return (date.today() + timedelta(days=days_offset)).isoformat()

def utc_iso(days_offset=0):
    return (datetime.now(UTC) + timedelta(days=days_offset)).isoformat()

def seed_randomized():
    print(f"Generating {NUM_USERS} randomized test users...")

    tables = [
        "PROGRESS_REPORT",
        "MEDICATION",
        "APPOINTMENT",
        "GOAL",
        "EMERGENCY_CONTACT",
        "HEALTH_INFO",
        "SELF_ASSESSMENT",
        "USER",
    ]
    for t in tables:
        supabase.table(t).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()

    users = []
    for _ in range(NUM_USERS):
        users.append({
            "id": fake.uuid4(),
            "email": fake.email(),
            "full_name": fake.name(),
            "date_of_birth": fake.date_of_birth(minimum_age=14, maximum_age=18).isoformat(),
        })
    supabase.table("USER").insert(users).execute()
    print(f"Inserted {len(users)} users")

    for user in users:
        uid = user["id"]

        categories = ["medication management", "appointment scheduling", "insurance understanding", "self-advocacy"]
        self_assessments = [
            {
                "user_id": uid,
                "category": cat,
                "question": f"Do you feel confident about {cat}?",
                "response": random.randint(1, 5),
                "assessment_date": date_iso(-random.randint(0, 60)),
            }
            for cat in random.sample(categories, 3)
        ]
        supabase.table("SELF_ASSESSMENT").insert(self_assessments).execute()

        health_info = {
            "user_id": uid,
            "insurance_provider": random.choice(["Aetna", "Cigna", "UnitedHealth", "BlueCross"]),
            "insurance_id": fake.bothify(text="???-#####"),
            "primary_physician": f"Dr. {fake.last_name()}",
            "allergies": random.choice(["None", "Peanuts", "Penicillin", "Pollen"]),
            "health_conditions": random.choice(["Asthma", "Type 1 Diabetes", "Healthy", "ADHD"]),
            "health_summary": fake.sentence(nb_words=12),
        }
        supabase.table("HEALTH_INFO").insert(health_info).execute()

        contact = {
            "user_id": uid,
            "name": fake.name(),
            "relationship": random.choice(["Parent", "Guardian", "Sibling"]),
            "phone": fake.phone_number(),
            "email": fake.email(),
            "address": fake.address(),
        }
        supabase.table("EMERGENCY_CONTACT").insert(contact).execute()

        goal_templates = [
            ("Schedule my next doctor visit", "appointments"),
            ("Learn how to refill prescriptions", "medications"),
            ("Track health metrics weekly", "self-care"),
            ("Update emergency contacts", "organization"),
        ]
        goals = []
        for g in random.sample(goal_templates, 2):
            goals.append({
                "user_id": uid,
                "title": g[0],
                "description": fake.sentence(),
                "category": g[1],
                "target_date": date_iso(random.randint(7, 30)),
                "status": random.choice(["not started", "in progress", "completed"]),
            })
        supabase.table("GOAL").insert(goals).execute()

        appointments = []
        for _ in range(random.randint(1, 2)):
            appointments.append({
                "user_id": uid,
                "title": random.choice(["Check-up", "Specialist Visit", "Follow-up"]),
                "provider": f"Dr. {fake.last_name()}",
                "appointment_date": utc_iso(random.randint(1, 14)),
                "location": f"{fake.city()} Health Center",
                "purpose": random.choice(["Routine review", "Medication renewal", "Lab results"]),
                "notes_before": "Prepare questions for doctor",
                "notes_after": random.choice(["Doctor adjusted treatment", "All good", "Need follow-up"]),
            })
        supabase.table("APPOINTMENT").insert(appointments).execute()

        meds = []
        for name in random.sample(["Albuterol", "Insulin", "Adderall", "Zyrtec"], random.randint(1, 2)):
            meds.append({
                "user_id": uid,
                "name": name,
                "dosage": random.choice(["10mg", "50mg", "2 puffs"]),
                "frequency": random.choice(["Once daily", "Twice daily", "As needed"]),
                "start_date": date_iso(-random.randint(30, 90)),
                "next_refill_date": date_iso(random.randint(5, 20)),
                "reminder_enabled": True,
            })
        supabase.table("MEDICATION").insert(meds).execute()

        progress = {
            "user_id": uid,
            "period_start": date_iso(-30),
            "period_end": date_iso(),
            "avg_self_assessment": round(random.uniform(2.0, 5.0), 2),
            "goals_completed": random.randint(0, 2),
            "appointments_attended": random.randint(0, 3),
        }
        supabase.table("PROGRESS_REPORT").insert(progress).execute()

    print("data generation complete")

if __name__ == "__main__":
    seed_randomized()
