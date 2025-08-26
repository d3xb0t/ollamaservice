# Qwen Code Context

## Session Information
- **Date:** Monday, August 25, 2025
- **Operating System:** linux
- **Working Directory:** /home/xxx/xxx/ChatBot/backend

## Project Overview

This is the backend for an AI-powered chat application, built with Node.js and Express. It connects to the Ollama service to generate responses to user messages. The project emphasizes modularity, security, and robustness.

### Key Features
- **Modular Architecture:** Organized into controllers, services, routes, and middleware for maintainability.
- **Input Validation:** Uses Zod for strict validation of user prompts.
- **Jailbreak Prevention:** Implements a list of forbidden patterns to block malicious requests.
- **Centralized Error Handling:** Robust system for consistent error capture and response.
- **Advanced Logging:** Logs requests, responses, and events using Winston, with daily file rotation.
- **Traceability:** Automatically assigns a unique ID to each request for debugging.
- **Rate Limiting:** Limits requests per user to prevent abuse.
- **API Documentation:** Automatic API documentation using Swagger/OpenAPI.
- **Database Connection:** Integration with MongoDB via Mongoose, including auto-retry on connection failures.
- **Testing:** Includes unit and integration tests.
- **Environment Configuration:** Flexible configuration using `dotenv`.

### Technologies Used
- **Runtime:** Node.js
- **Framework:** Express
- **AI Service:** Ollama
- **Database:** MongoDB (Mongoose)
- **Validation:** Zod
- **Logging:** Winston
- **API Docs:** Swagger
- **Testing:** Vitest
- **Other:** Cors, Helmet, Morgan, Dotenv, Express-rate-limit

## Building and Running

### Prerequisites
- Node.js (v18.x or higher recommended)
- npm
- Ollama instance running locally (Download: https://ollama.com/)
- MongoDB instance (local or via connection URL)

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```
2. Ensure environment variables are set (e.g., via a `.env` file):
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/chatbot # Adjust as needed
   ```

### Running the Application
- **Development Mode (with auto-restart):**
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:3000`. API documentation is at `http://localhost:3000/api-docs`.

### Running Tests
- **Run all tests:**
   ```bash
   npm test
   ```
- **Run tests once:**
   ```bash
   npm run test:run
   ```
- **Generate coverage report:**
   ```bash
   npm run test:coverage
   ```

## Development Conventions

- **Modular Structure:** Code is organized into `src/controller`, `src/service`, `src/routes`, `src/middleware`, `src/config`, etc.
- **Logging:** Uses `./src/logger.js` (Winston) for all logging needs, including request tracing.
- **Error Handling:** Asynchronous route handlers should use `asyncErrorHandler` wrapper from `./src/utils.js`.
- **Validation:** Input validation is handled by Zod schemas defined in `./src/zod.js` and applied via middleware in `./src/validations.js`.
- **Environment Variables:** Loaded via `dotenv` in `./src/config/env.js`.
- **Database:** MongoDB interaction is managed through Mongoose, with connection logic in `./src/dbDriver/mongoDriver.js`.
- **API Documentation:** Swagger/OpenAPI documentation is generated based on JSDoc comments and configuration in `./src/config/swagger.js`.
- **Security:** Security headers are applied using Helmet middleware.
- **CORS:** Configured in `./src/app.js`.
- **Rate Limiting:** Implemented via middleware in `./src/utils.js`.