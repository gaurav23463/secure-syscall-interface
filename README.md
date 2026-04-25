# Secure System Call Interface

A secure and user-friendly operating system project that simulates system call handling with authentication, role-based access, and audit logging.

## Project Structure

- `server.js` - Express server entry point.
- `routes/` - Authentication, system call handler, and log access routes.
- `models/` - MongoDB schemas for users and syscall logs.
- `middleware/` - JWT authentication and role-based authorization.
- `public/` - Frontend assets, HTML pages, styles, and JavaScript.
- `storage/` - Safe file storage area used by simulated file system operations.

## Run Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` if you do not already have one:
   ```bash
   MONGO_URI=mongodb://localhost:27017/secure-syscall-interface
   JWT_SECRET=secret123
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open the browser at:
   ```bash
   http://localhost:4000
   ```
