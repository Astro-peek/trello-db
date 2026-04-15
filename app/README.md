# trello-db 🗂️

A RESTful backend API for a Trello-like project management application. Built with **Node.js**, **Express**, and **MongoDB** — supports user authentication, organizations, boards, and issue tracking.

---

## 🚀 Tech Stack

| Layer        | Technology           |
|--------------|----------------------|
| Runtime      | Node.js              |
| Framework    | Express.js           |
| Database     | MongoDB (Mongoose)   |
| Auth         | JWT (jsonwebtoken)   |

---

## 📁 Project Structure

```
app/
├── index.js        # Main Express server & route definitions
├── middleware.js   # JWT authentication middleware
├── models.js       # Mongoose models (User, Organization)
├── package.json    # Project dependencies
└── .gitignore
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas URI)

### Steps

```bash
# Clone the repository
git clone https://github.com/Astro-peek/trello-db.git
cd trello-db

# Install dependencies
npm install

# Start the server
node index.js
```

Server runs on **http://localhost:3000**

---

## 🔐 Authentication

This API uses **JWT (JSON Web Tokens)** for authentication.

Include the token in the `Authorization` header for protected routes:

```
Authorization: Bearer <your_token>
```

---

## 📡 API Endpoints

### Auth

| Method | Route      | Description              | Auth Required |
|--------|------------|--------------------------|---------------|
| POST   | `/signup`  | Register a new user      | ❌             |
| POST   | `/signin`  | Login and receive a JWT  | ❌             |

#### POST `/signup`
```json
{
  "username": "john_doe",
  "password": "securepassword"
}
```

#### POST `/signin`
```json
{
  "username": "john_doe",
  "password": "securepassword"
}
```
**Response:**
```json
{
  "token": "<jwt_token>"
}
```

---

### Organizations

| Method | Route                          | Description                        | Auth Required |
|--------|--------------------------------|------------------------------------|---------------|
| POST   | `/organization`                | Create a new organization          | ✅             |
| GET    | `/organization`                | Get organization details & members | ✅             |
| POST   | `/add-member-to-organization`  | Add a member to an organization    | ✅             |
| DELETE | `/members`                     | Remove a member from organization  | ✅             |

#### POST `/organization`
```json
{
  "title": "My Team",
  "description": "A collaborative team workspace"
}
```

#### POST `/add-member-to-organization`
```json
{
  "organizationId": "<org_id>",
  "memberUserUsername": "jane_doe"
}
```

#### GET `/organization`
```
GET /organization?organizationId=<org_id>
```

#### DELETE `/members`
```json
{
  "organizationId": "<org_id>",
  "memberUserUsername": "jane_doe"
}
```

---

### Boards & Issues *(coming soon)*

| Method | Route      | Description           |
|--------|------------|-----------------------|
| POST   | `/board`   | Create a board        |
| GET    | `/boards`  | Get all boards        |
| POST   | `/issue`   | Create an issue       |
| GET    | `/issues`  | Get all issues        |
| PUT    | `/issues`  | Update an issue       |

---

## 🗄️ Data Models

### User
```js
{
  username: String,  // unique
  password: String
}
```

### Organization
```js
{
  title: String,
  description: String,
  admin: ObjectId,    // ref: User
  members: [ObjectId] // ref: User
}
```

---

## 🛡️ Middleware

`authMiddleware` validates the JWT token from the `Authorization` header and attaches `req.userId` to the request for use in protected routes.

---

## 📌 Notes

- Only the **admin** of an organization can add/remove members or view organization details.
- Boards and Issues endpoints are placeholders currently under development.

---

## 📄 License

MIT
