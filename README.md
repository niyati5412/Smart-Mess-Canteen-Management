# MessMate — Backend Setup Guide

## ⚡ Quick Start

```bash
npm install
npm run dev
```

Open → **http://localhost:3000**

---

## 📁 Final Folder Structure

```
smart-mess-canteen-management/
├── data/
│   ├── users.json          ← stores registered users
│   ├── students.json       ← student records
│   ├── intentions.json     ← meal intentions (eat/skip)
│   ├── feedback.json       ← student meal feedback
│   ├── menu.json           ← weekly menu items
│   ├── canteen.json        ← canteen item catalog
│   ├── attendance.json     ← attendance records
│   └── complaints.json     ← student complaints
│
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── student.controller.js
│   │   ├── intention.controller.js
│   │   ├── feedback.controller.js
│   │   ├── menu.controller.js
│   │   ├── canteen.controller.js
│   │   └── complaint.controller.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── student.routes.js
│   │   ├── intention.routes.js
│   │   ├── feedback.routes.js
│   │   ├── menu.routes.js
│   │   ├── canteen.routes.js
│   │   └── complaint.routes.js
│   │
│   ├── utils/
│   │   └── file.util.js    ← readData() / writeData() helper
│   │
│   └── app.js              ← Express setup + all routes
│
├── public/                 ← All your HTML pages (served as-is)
│   ├── admin/
│   ├── student/
│   ├── guardian/
│   └── index.html
│
├── server.js               ← Entry point
├── package.json
└── README.md
```

---

## 🔌 Complete API Reference

### Auth  `/api/auth`
| Method | Endpoint | Body | What it does |
|--------|----------|------|--------------|
| POST | `/api/auth/register` | `{name, email, password, role}` | Create account |
| POST | `/api/auth/login` | `{email, password}` | Login |
| GET  | `/api/auth/users` | — | List all users (admin) |

### Students  `/api/students`
