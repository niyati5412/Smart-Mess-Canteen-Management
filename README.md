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
| Method | Endpoint | Body | What it does |
|--------|----------|------|--------------|
| GET | `/api/students` | — | Get all students |
| GET | `/api/students/:id` | — | Get one student |
| POST | `/api/students` | `{name, email, roll, branch}` | Add student |
| PUT | `/api/students/:id` | any fields | Update student |
| DELETE | `/api/students/:id` | — | Delete student |

### Intentions  `/api/intentions`
| Method | Endpoint | Body | What it does |
|--------|----------|------|--------------|
| GET | `/api/intentions` | — | All intentions |
| GET | `/api/intentions/student/:studentId` | — | One student's intentions |
| POST | `/api/intentions` | `{studentId, meal, date, status}` | Mark intention |
| PUT | `/api/intentions/:id` | `{status}` | Update intention |
| DELETE | `/api/intentions/:id` | — | Remove intention |

### Feedback  `/api/feedback`
| Method | Endpoint | Body | What it does |
|--------|----------|------|--------------|
| GET | `/api/feedback` | — | All feedback |
| GET | `/api/feedback/:id` | — | One feedback |
| POST | `/api/feedback` | `{studentId, meal, rating, comment}` | Submit feedback |
| DELETE | `/api/feedback/:id` | — | Delete feedback |

### Menu  `/api/menu`
| Method | Endpoint | Body | What it does |
|--------|----------|------|--------------|
| GET | `/api/menu` | — | Full menu |
| GET | `/api/menu/:id` | — | One item |
| POST | `/api/menu` | `{name, meal, day, tags}` | Add menu item |
| PUT | `/api/menu/:id` | any fields | Update item |
| DELETE | `/api/menu/:id` | — | Remove item |

### Canteen  `/api/canteen`
| Method | Endpoint | Body | What it does |
|--------|----------|------|--------------|
| GET | `/api/canteen` | — | All canteen items |
| GET | `/api/canteen/:id` | — | One item |
| POST | `/api/canteen` | `{name, price, stock, category}` | Add item |
| PUT | `/api/canteen/:id` | any fields | Update item/price/stock |
| DELETE | `/api/canteen/:id` | — | Remove item |

### Complaints  `/api/complaints`
| Method | Endpoint | Body | What it does |
|--------|----------|------|--------------|
| GET | `/api/complaints` | — | All complaints |
| GET | `/api/complaints/:id` | — | One complaint |
| POST | `/api/complaints` | `{studentId, title, description, category}` | Submit complaint |
| PUT | `/api/complaints/:id` | `{status}` | Resolve/reject |
| DELETE | `/api/complaints/:id` | — | Delete |

---

## 🧪 First Time Setup — Create Test Users

After starting server, open browser console at http://localhost:3000 and run:

```js
// Create admin
fetch("/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Admin", email: "admin@messmate.com", password: "admin123", role: "admin" })
}).then(r => r.json()).then(console.log);

// Create student  
fetch("/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Test Student", email: "student@messmate.com", password: "student123", role: "student" })
}).then(r => r.json()).then(console.log);
```

Then login at **http://localhost:3000/login.html** ✅