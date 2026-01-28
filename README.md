# Pastebin-Lite

##  Project Description

Pastebin-Lite is a simple backend-focused web application that allows users to create text pastes and share them via a unique URL. Each paste can optionally expire after a certain amount of time (TTL) or after a limited number of views. Once a paste expires or exceeds its view limit, it becomes permanently unavailable.

This project is designed to demonstrate clean API design, correct backend logic, persistence, and test-friendly behavior. It fully satisfies the requirements of the provided take-home assignment and is compatible with automated testing.

---

##  Features

* Create a text paste
* Receive a shareable URL for the paste
* View paste via API or browser
* Optional time-based expiry (TTL)
* Optional view-count limit
* Automatic paste invalidation when constraints are met
* Safe HTML rendering (no script execution)
* Deterministic time handling for testing

---

##  Technology Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB (using Mongoose)
* **Persistence:** MongoDB Atlas (cloud database)
* **Environment Management:** dotenv

---

##  API Endpoints

### Health Check

```
GET /api/healthz
```

Response:

```json
{ "ok": true }
```

---

### Create Paste

```
POST /api/pastes
```

Request body:

```json
{
  "content": "Hello Pastebin Lite",
  "ttl_seconds": 60,
  "max_views": 3
}
```

Response:

```json
{
  "id": "paste_id",
  "url": "https://your-domain/p/paste_id"
}
```

---

### Fetch Paste (API)

```
GET /api/pastes/:id
```

Response:

```json
{
  "content": "Hello Pastebin Lite",
  "remaining_views": 2,
  "expires_at": "2026-01-01T00:00:00.000Z"
}
```

Unavailable or expired pastes return **HTTP 404**.

---

### View Paste (HTML)

```
GET /p/:id
```

* Returns an HTML page displaying the paste content
* Returns **404** if the paste is unavailable
* Content is safely rendered

---

##  Deterministic Time for Testing

To support automated testing:

* If the environment variable `TEST_MODE=1` is set
* The request header `x-test-now-ms` (milliseconds since epoch) is used as the current time **only for expiry logic**
* If the header is absent, real system time is used

---

##  Persistence Layer

The application uses **MongoDB** as a persistent data store. This ensures that pastes survive across requests and server restarts, which is required for serverless and cloud deployments. No in-memory storage is used.

---

##  How to Run Locally

### Prerequisites

* Node.js (v16 or later)
* MongoDB Atlas account or local MongoDB

### Steps

```bash
# Clone the repository
git clone <repository-url>
cd pastebin-lite/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your MongoDB connection string in .env

# Start the server
npm run dev
```

The server will start on:

```
http://localhost:5000
```

---

##  Environment Variables

Example `.env.example`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
TEST_MODE=0
```

---

##  Important Design Decisions

* MongoDB is used instead of in-memory storage to ensure persistence
* TTL logic is handled in application code (not MongoDB TTL indexes) to support deterministic testing
* Atomic database updates are used to safely enforce view limits
* All unavailable pastes consistently return HTTP 404

---

##  Status

This project fully satisfies all functional, technical, and repository-level requirements of the Pastebin-Lite take-home assignment and is ready for deployment and submission.
