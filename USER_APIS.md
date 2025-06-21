# User APIs Documentation

## Overview
This document describes all the available APIs for user management in the e-commerce application.

## Base URL
```
http://localhost:3000/user
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. Get User Profile
**GET** `/user/profile`

Get the current user's profile information.

**Headers:**
- Authorization: Bearer <token> (required)

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "role": "user",
  "isConfirm": true
}
```

### 2. Update User Profile
**PUT** `/user/profile`

Update the current user's profile information.

**Headers:**
- Authorization: Bearer <token> (required)
- Content-Type: application/json

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "phone": "+1234567891"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "user_id",
    "name": "John Doe Updated",
    "email": "john.updated@example.com",
    "phone": "+1234567891",
    "role": "user",
    "isConfirm": true
  }
}
```

### 3. Change Password
**PUT** `/user/change-password`

Change the current user's password.

**Headers:**
- Authorization: Bearer <token> (required)
- Content-Type: application/json

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 4. Get All Users (Admin Only)
**GET** `/user/all`

Get a paginated list of all users. Only accessible by admin users.

**Headers:**
- Authorization: Bearer <token> (required)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `search` (optional): Search by name or email
- `role` (optional): Filter by role (user, admin, delivery)

**Example:**
```
GET /user/all?page=1&limit=5&search=john&role=user
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id_1",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "user",
      "isConfirm": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 25,
    "pages": 5
  }
}
```

### 5. Get User by ID (Admin Only)
**GET** `/user/:id`

Get a specific user's information by ID. Only accessible by admin users.

**Headers:**
- Authorization: Bearer <token> (required)

**Path Parameters:**
- `id`: User ID

**Example:**
```
GET /user/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "user",
    "isConfirm": true
  }
}
```

### 6. Update User Role (Admin Only)
**PUT** `/user/:id/role`

Update a user's role. Only accessible by admin users.

**Headers:**
- Authorization: Bearer <token> (required)
- Content-Type: application/json

**Path Parameters:**
- `id`: User ID

**Request Body:**
```json
{
  "role": "admin"
}
```

**Available Roles:**
- `user`: Regular user
- `admin`: Administrator
- `delivery`: Delivery personnel

**Response:**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "admin",
    "isConfirm": true
  }
}
```

### 7. Delete User (Admin Only)
**DELETE** `/user/:id`

Delete a user by ID. Only accessible by admin users.

**Headers:**
- Authorization: Bearer <token> (required)

**Path Parameters:**
- `id`: User ID

**Example:**
```
DELETE /user/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Current password is incorrect",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

## Validation Rules

### UpdateProfileDto
- `name`: Optional string
- `email`: Optional valid email format
- `phone`: Optional string

### ChangePasswordDto
- `currentPassword`: Required string, minimum 6 characters
- `newPassword`: Required string, minimum 6 characters

### UpdateUserRoleDto
- `role`: Required enum value (user, admin, delivery)

### GetUsersQueryDto
- `page`: Optional string (will be converted to number)
- `limit`: Optional string (will be converted to number)
- `search`: Optional string
- `role`: Optional enum value (user, admin, delivery)

## Security Notes

1. **Password Security**: Passwords are hashed using bcrypt before storage
2. **Role-Based Access**: Admin-only endpoints are protected by role guards
3. **Email Uniqueness**: Email addresses must be unique across all users
4. **Sensitive Data**: Password and verification codes are excluded from responses
5. **Input Validation**: All inputs are validated using class-validator decorators

## Testing

You can test these APIs using the provided Postman collection: `E-Commerce-API.postman_collection.json`

Make sure to:
1. First authenticate to get a JWT token
2. Use the token in the Authorization header for subsequent requests
3. For admin endpoints, ensure your user has admin role 