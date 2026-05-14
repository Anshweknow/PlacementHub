# ⭐ PlacementHub — Placement Management System

<p align="center">
  <b>A full-stack placement management platform with skill assessment, HR intelligence, and student performance analytics.</b>
</p>

---

## 🚀 Overview

**PlacementHub** is a modern, full-stack placement management system designed to digitize and streamline the campus hiring process.

The platform bridges the gap between **students and recruiters** by introducing **skill-based assessments**, **intelligent candidate matching**, and a **centralized placement workflow**.

This project follows **real-world system architecture**, focusing on scalability, modularity, and clean UI/UX.

---

## 🎯 Core Objectives

* Provide students with a structured placement ecosystem
* Enable HR teams to discover skill-verified candidates
* Introduce transparent, test-based candidate evaluation
* Simulate real corporate placement platforms

---

## 👨‍🎓 Student Ecosystem

### ✅ Features

* Secure authentication (JWT-based registration/login with hashed passwords)
* Student dashboard with animated mesh gradient UI
* Profile management (education, skills, resume upload)
* Resume upload and preview (PDF)
* Skill Assessment Module 2.0
* Test history tracking
* Job browsing interface

### 🎓 Skill Assessment 2.0

* Category-based domain selection
* Randomized question engine
* 15-minute countdown timer
* Auto submission on timeout
* Instant score generation
* Persistent test history (stored locally / backend-ready)

---

## 🧑‍💼 HR Intelligence Module

### ✅ Features

* HR dashboard
* Skill-based candidate searching
* Candidate match percentage calculation
* Deep profile inspection
* Resume viewing
* Assessment score visibility

This allows recruiters to evaluate candidates **beyond resumes** using actual performance data.

---

## 🧠 Skill Assessment Architecture

```
Domain Selection
      ↓
Randomized Questions (15)
      ↓
Timer-Based Evaluation
      ↓
Auto Submission
      ↓
Result Generation
      ↓
Test History Storage
```

Each assessment attempt is unique due to question shuffling, preventing repeated patterns.

---

## 🛠 Tech Stack

### Frontend

* React (Vite)
* React Router DOM
* Axios
* Context API
* Glassmorphism UI
* Animated Mesh Gradients

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Bcrypt password hashing
* Multer (Resume Upload)

---

## 📁 Project Structure

```
PlacementHub/
│
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── profileController.js
│   │   └── hrController.js
│   ├── models/
│   │   ├── User.js
│   │   └── StudentProfile.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── profile.js
│   └── server.js
│
├── placement-frontend/
│   ├── src/
│   │   ├── Components/
│   │   ├── Pages/
│   │   ├── Context/
│   │   ├── data/
│   │   │   └── questionsData.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── public/
│       └── uploads/
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Anshweknow/PlacementHub.git
cd PlacementHub
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm start
```

Server runs on:

```
http://localhost:5000
```

---

### 3️⃣ Frontend Setup

```bash
cd placement-frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` at the repository root for the backend and create `placement-frontend/.env` for Vite.

Backend variables:

```
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=use_a_long_random_secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=optional_cloudinary_cloud_name
CLOUDINARY_API_KEY=optional_cloudinary_api_key
CLOUDINARY_API_SECRET=optional_cloudinary_api_secret
```

Frontend variables (`placement-frontend/.env`):

```
VITE_API_BASE_URL=http://localhost:5000
```

---

## 📊 Current Capabilities

* ✔ Full authentication flow
* ✔ Resume upload system
* ✔ Skill-based testing
* ✔ HR candidate evaluation
* ✔ Clean UI/UX architecture
* ✔ Modular codebase
* ✔ Backend-ready analytics system

---

## 🚧 Future Roadmap

### Phase 1

* Job posting system
* Skill requirement-based matching
* HR shortlisting

### Phase 2

* In-app notifications
* Interview scheduling
* Student alerts

### Phase 3

* AI resume parser
* Skill extraction from PDFs
* Performance analytics dashboard
* Domain-wise growth charts

---

## 💡 Learning Outcomes

This project helped implement:

* Real-world full-stack architecture
* Authentication & authorization
* File handling (resume upload)
* Timer-based systems
* Modular React design
* Backend–frontend integration
* Placement workflow simulation

---

## 📸 Screenshots

*(Add screenshots here once uploaded)*

---

## 👤 Author

**Ansh Kulshreshtha**
Final Year Engineering Student

🔗 GitHub: [https://github.com/Anshweknow](https://github.com/Anshweknow)
🔗 LinkedIn: [https://www.linkedin.com/in/ansh-kulshreshtha/](https://www.linkedin.com/in/ansh-kulshreshtha/)

---

## ⭐ Support

If you find this project helpful:

* ⭐ Star the repository
* 🍴 Fork it
* 📩 Share feedback

---

### 🚀 “PlacementHub is not just a project — it’s a system.”

---
