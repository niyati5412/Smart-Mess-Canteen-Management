MessMate — Smart Mess & Canteen Management

MessMate is a full-stack web application designed to improve hostel mess and canteen management.
It allows students, administrators, and guardians to manage meals, orders, budgets, and food waste efficiently.

The system helps reduce food wastage, track meal consumption, and monitor spending while providing a smooth digital experience for hostel dining.

Features
👨‍🎓 Student Portal

Students can:

View daily mess menu

Mark meal intentions (Eat / Skip)

Order food from the canteen

Submit feedback

Track their meal value consumption

Monitor budget usage

👨‍💼 Admin Portal

Admins can:

Manage canteen items

Monitor orders

Track mess waste

Update menu

View budget statistics

Analyze food consumption data

👨‍👩‍👧 Guardian Portal

Guardians can:

Monitor student meal attendance

View budget efficiency

Track meal skipping patterns

Access monthly reports

Tech Stack
Frontend

HTML

CSS

JavaScript

Backend

Node.js

Express.js

Data Storage

JSON-based file storage


#FOLDER STRUCTURE 

SMART-MESS-CANTEEN-MANAGEMENT
│
├── data/                         # JSON files used as database
│   ├── budget.json
│   ├── canteen.json
│   ├── feedback.json
│   ├── intentions.json
│   ├── menu.json
│   ├── orders.json
│   ├── users.json
│   └── waste.json
│
├── node_modules/                 # Installed npm packages
│
├── public/                       # Frontend files (UI)
│
│   ├── admin/                    # Admin dashboard pages
│   │   ├── budget.html
│   │   ├── canteen.html
│   │   ├── dashboard.html
│   │   ├── menu.html
│   │   ├── orders.html
│   │   └── waste.html
│   │
│   ├── guardian/                 # Guardian dashboard
│   │   └── dashboard.html
│   │
│   ├── student/                  # Student portal
│   │   ├── canteen.html
│   │   ├── dashboard.html
│   │   ├── feedback.html
│   │   ├── intention.html
│   │   ├── menu.html
│   │   ├── orders.html
│   │   └── value.html
│   │
│   ├── css/
│   │   └── style.css             # Global stylesheet
│   │
│   ├── js/
│   │   └── main.js               # Common frontend JS
│   │
│   ├── about.html
│   ├── index.html
│   ├── login.html
│   └── signup.html
│
├── src/                          # Backend source code
│
│   ├── controllers/              # Business logic
│   │   ├── auth.controller.js
│   │   ├── budget.controller.js
│   │   ├── canteen.controller.js
│   │   ├── feedback.controller.js
│   │   ├── intention.controller.js
│   │   ├── menu.controller.js
│   │   ├── orders.controller.js
│   │   └── waste.controller.js
│   │
│   ├── routes/                   # API route definitions
│   │   ├── auth.routes.js
│   │   ├── budget.routes.js
│   │   ├── canteen.routes.js
│   │   ├── feedback.routes.js
│   │   ├── intention.routes.js
│   │   ├── menu.routes.js
│   │   ├── orders.routes.js
│   │   └── waste.routes.js
│   │
│   ├── utils/                    # Helper utilities
│   │   └── file.util.js
│   │
│   └── app.js                    # Express app configuration
│
├── package.json                  # Project dependencies
├── package-lock.json
├── server.js                     # Entry point of backend server
└── README.md                     # Project documentation
