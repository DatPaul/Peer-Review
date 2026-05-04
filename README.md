# Peer Review Platform

A full-stack web application for academic journal peer review, 
connecting editors with qualified reviewers based on their 
domain of expertise.

---

## About the Project

Early-career editors who want to publish a scientific journal 
often struggle to find available, qualified reviewers. This 
platform solves that problem through an automatic matching 
system that pairs editors with reviewers based on the journal's 
domain and the reviewer's declared expertise.

---

## Features

- **Automatic Matching** - the platform assigns a suitable 
reviewer for each journal based on domain alignment
- **Complete Review Workflow** - from journal submission to 
finalized review
- **Communication Forum** - a dedicated channel between editor 
and reviewer throughout the review process, with PDF file upload
- **Rating System** - editors can rate reviewers after review 
completion
- **Role-Based Access** - three distinct roles: Admin, Editor, 
and Reviewer, each with their own dashboard
- **Notification System** - users are notified at each stage 
of the process
- **Admin Approval** - reviewer accounts require admin approval 
before they can accept journals

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MySQL |
| Authentication | JWT (JSON Web Tokens) |
| File Upload | Multer |
| HTTP Client | Axios |

---

## Project Structure

```
peer-review/
├── client/                  # React frontend
│   └── src/
│       ├── api/             # Axios configuration
│       ├── components/      # Reusable components
│       ├── context/         # Authenthication context
│       ├── hooks/           # Custom hooks
│       └── pages/           # Page components by role
├── server/                  # Express backend
│   ├── config/              # Database configuration
│   ├── controllers/         # Business logic
│   ├── middleware/          # JWT auth, file upload
│   ├── routes/              # API route definitions
│   └── scripts/             # Database seed script
└── package.json             
```

## Application Flow

### Registration and Approval
1. User creates an account as either **Editor** or **Reviewer**
2. Editor accounts are activated immediately
3. Reviewer accounts require approval from an **Admin**

### Peer Review Process
1. Editor creates a journal and selects its domain
2. Platform automatically assigns a reviewer with matching expertise
3. Reviewer accepts or declines the journal
4. Upon acceptance, a **communication forum** opens between 
editor and reviewer
5. Editor uploads the journal file; reviewer submits their review
6. Reviewer marks the review as complete - forum is archived
7. Editor submits a **rating** for the reviewer

---

## Author

Dat Paul George  
Second-year Computer Science student, West University of Timișoara  
Built during university practice stage
