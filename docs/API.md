# Smart Leads Dashboard API

Base URL: `http://localhost:5000/api`

All non-auth endpoints require header:

`Authorization: Bearer <jwt_token>`

## Health Check

### GET `/health`

Response:

```json
{
  "success": true,
  "message": "Backend is healthy"
}
```

## Authentication

### POST `/auth/register`

Request body:

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "secret123",
  "role": "sales"
}
```

Response:

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "<jwt>",
    "user": {
      "id": "user_id",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "role": "sales"
    }
  }
}
```

### POST `/auth/login`

Request body:

```json
{
  "email": "rahul@example.com",
  "password": "secret123"
}
```

### GET `/auth/me`

Returns current logged-in user.

## Leads

### POST `/leads`

Create a lead.

Request body:

```json
{
  "name": "Aman Gupta",
  "email": "aman@example.com",
  "status": "new",
  "source": "website"
}
```

Allowed roles: `admin`, `sales`

### GET `/leads`

Query params:

- `page` (number, default `1`)
- `status` (`new|contacted|qualified|lost`)
- `source` (`website|instagram|referral`)
- `search` (matches name/email)
- `sort` (`latest|oldest`, default `latest`)

Response includes pagination metadata:

```json
{
  "success": true,
  "message": "Leads fetched successfully",
  "data": {
    "leads": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 24,
      "totalPages": 3
    }
  }
}
```

### GET `/leads/:id`

Fetch single lead details.

### PATCH `/leads/:id`

Update one or more lead fields.

Allowed roles: `admin`, `sales`

### DELETE `/leads/:id`

Delete a lead.

Allowed role: `admin` only

### GET `/leads/export/csv`

Exports CSV for current filtered data.
Accepts same query params as `GET /leads`.

Response headers:

- `Content-Type: text/csv`
- `Content-Disposition: attachment; filename=leads.csv`
