# Edunutshell Backend 🌱

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

A backend API for Edunutshell — handles users, tasks, resources, tickets, and dynamic forms with role-based access control. Created with Node.js, Express, MongoDB, and JWT auth.

---

## 📍 Live Demo

You can test the deployed API here:  
**Base URL:** https://edunutshell-backend.onrender.com

---

## 📦 Repository

GitHub repo with full source:  
https://github.com/Sarthak-Butola/Edunutshell_Backend.git

---

## ⚙️ Features

- Authentication  
  - Login (access + refresh tokens)  
  - Signup (admin-only)  
  - Role-based user permissions (`user`, `admin`, `both`)  
- Tasks  
  - Admin can create & assign tasks  
  - Users can view their tasks  
  - Assigned user or admin can update task status  
- Resources  
  - Admin uploads resources  
  - Users/admins fetch resources visible to them  
- Tickets  
  - Users and admins can open tickets  
  - Responses (threaded) inside tickets  
  - Admin can close tickets  
- Dynamic Forms  
  - Admin can build forms (custom fields)  
  - Users can submit responses tied to form fields  
  - Fetch forms & responses filtered by role  

---

## 🧱 Tech Stack

| Component | Description |
|-----------|-------------|
| **Backend** | Node.js + Express |
| **Database** | MongoDB (Mongoose) |
| **Authentication** | JWT (Access & Refresh tokens) |
| **Security** | Role-based access, bcrypt password hashing |
| **Hosting** | Deployed on Render.com |

---

## 📂 Project Structure

Edunutshell_Backend/
├── src/
│ ├── config/
│ │ └── db.js # MongoDB connection
│ ├── models/
│ │ ├── User.js
│ │ ├── Task.js
│ │ ├── Resource.js
│ │ ├── Ticket.js
│ │ ├── Form.js
│ │ └── Response.js
│ ├── routes/
│ │ ├── userRoutes.js
│ │ ├── taskRoutes.js
│ │ ├── resourceRoutes.js
│ │ ├── ticketRoutes.js
│ │ └── formRoutes.js
│ ├── middleware/
│ │ ├── auth.js
│ │ └── requireRole.js
│ ├── utils/ # helper functions
│ ├── server.js # starts the app
│ └── app.js # where routes and middleware are mounted
├── .env.sample # sample env variables
├── package.json
└── README.md


---

## 🛠️ Setup / Local Development

1. Clone the repo:

   ```bash
   git clone https://github.com/Sarthak-Butola/Edunutshell_Backend.git
   cd Edunutshell_Backend

2. Install dependencies:
    npm install

3. Create .env file in root directory (copy .env.sample). Required variables:
    PORT=5000
    MONGO_URI=<replace-with-your-secret>
    JWT_SECRET=<your-access-token-secret>
    JWT_REFRESH_SECRET=<your-refresh-token-secret>

⚠️ **Important:** Never commit your actual `.env` file with real secrets. Always use `.env.sample` as a template and keep the real `.env` private.

4. Start server (development):
    npm run dev

   or production:
   npm start

5. API should now be running at http://localhost:5000/.

📌 Key API Endpoints
Endpoint	Method	Access	Purpose
/api/auth/login	POST	Public	Login, get access & refresh tokens
/api/auth/refresh	POST	Public (with refresh cookie)	Get new access token
/api/users/signup	POST	Admin only	Create new user
/api/users/profile	PATCH	Authenticated user	Update own name/phone
/api/tasks/create	POST	Admin only	Create a new task
/api/tasks/:userId	GET	Owner or admin	Get tasks for a specific user
/api/tasks/:taskId/status	PATCH	Assigned user or admin	Update task status
/api/resources	GET	Authenticated user or admin	Get visible resources
/api/resources/upload	POST	Admin only	Upload a new resource
/api/tickets/create	POST	Authenticated user	Create new ticket
/api/tickets/:id/respond	POST	Ticket owner or admin	Add response to ticket
/api/tickets/:id/close	PATCH	Admin only	Close ticket
/api/forms/create	POST	Admin only	Create dynamic form template
/api/forms	GET	Authenticated	List forms assigned to role
/api/forms/:formId/submit	POST	Authenticated user	Submit a form response
/api/forms/:formId/responses	GET	Admin or relevant user	View submitted responses in question-answer format
🔒 Security & Permissions

JWT access tokens should include role in payload

Refresh token flow fetches user role from DB (to avoid stale role issues)

Role-check middleware ensures only permitted roles can hit certain endpoints

Passwords are hashed with bcrypt.