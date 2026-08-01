# DairyCare AI - Database Design

## 1. Database Technology

DairyCare AI will use MongoDB as the primary database.

MongoDB stores data in flexible document-based collections and integrates well with the Node.js and Express.js backend.

---

## 2. Database Collections

The application will contain the following main collections:

- Users
- Farms
- Animals
- Injections
- Diet Plans
- Health Records
- Reminders
- Audit Logs

---

## 3. User Collection

Stores information about registered users.

## User

text
{
  _id,
  name,
  email,
  passwordHash,
  role,
  createdAt,
  updatedAt
}
## Farm Collection
{
  _id,
  farmName,
  location,
  ownerId,
  createdAt,
  updatedAt
}

## Animal Collection
{
  _id,
  animalTagId,
  name,
  breed,
  gender,
  dateOfBirth,
  weight,
  milkProduction,
  pregnancyStatus,
  farmId,
  createdAt,
  updatedAt
}

## Injection Collection and Vaccination Collection
{
  _id,
  animalId,
  injectionName,
  dateGiven,
  nextDueDate,
  veterinarianName,
  notes,
  createdAt
}
## DietPlan Collection
{
  _id,
  animalId,
  feedName,
  quantity,
  feedingTime,
  nutritionalNotes,
  startDate,
  endDate,
  createdAt,
  updatedAt
}

## Health Record Collection
{
  _id,
  animalId,
  temperature,
  appetite,
  activityLevel,
  milkProduction,
  symptoms,
  notes,
  recordedAt
}
## Reminder Collection
{
  _id,
  animalId,
  reminderType,
  title,
  dueDate,
  status,
  createdAt
}
## Audit log Collection
{
  _id,
  userId,
  action,
  resource,
  resourceId,
  ipAddress,
  timestamp,
  status
}
## Complete Database relationship
User
 │
 ├── Farm
 │    │
 │    └── Animal
 │         ├── Injection
 │         ├── DietPlan
 │         ├── HealthRecord
 │         └── Reminder
 │
 └── AuditLog

## Data Isolation and Security
Farmer A
    │
    └── Farm A
          │
          └── Animals A
                │
                ├── Injection Records
                ├── Diet Plans
                └── Health Records
Farmer B
    │
    └── Farm B
          │
          └── Animals B

## AI data flow
Animal Data
    │
    ├── Age
    ├── Breed
    ├── Weight
    ├── Milk Production
    └── Health Information
            │
            ▼
      Authorization Check
            │
            ▼
        AI Service
            │
            ▼
   AI Recommendation
