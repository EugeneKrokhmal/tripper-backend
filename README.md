# Backend Documentation

## Overview
The backend is built using **Node.js** and serves as the server-side layer of the application. It provides RESTful APIs to handle client requests, manage data, and perform business logic. The backend interacts with the database and external services to ensure seamless functionality.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Environment Management**: dotenv
- **Logging**: Winston
- **Validation**: Joi
- **Package Manager**: npm

## Dependencies
The `package.json` file includes the following dependencies:

### Production Dependencies:
- `@paypal/checkout-server-sdk`: ^1.0.3
- `@sendgrid/mail`: ^8.1.4
- `axios`: ^1.7.7
- `bcryptjs`: ^2.4.3
- `cors`: ^2.8.5
- `dotenv`: ^16.4.5
- `express`: ^4.21.1
- `jsonwebtoken`: ^9.0.2
- `mongoose`: ^8.7.1
- `multer`: ^1.4.5-lts.1
- `passport`: ^0.7.0
- `passport-google-oauth20`: ^2.0.0
- `sharp`: ^0.33.5

### Development Dependencies:
- `nodemon`: ^3.1.7

## Project Structure
```
tripper-backend/
├── config/            # Configuration files
├── controllers/       # Handles request logic
├── helpers/           # Utility functions
├── middlewares/       # Custom middleware
├── models/            # Database schemas
├── node_modules/      # Dependencies
├── routes/            # API endpoints
├── uploads/           # File uploads
├── .env               # Environment variables
├── emailService.js    # Email handling logic
├── paypal.js          # PayPal integration logic
├── server.js          # Server initialization
├── package.json       # Dependencies and scripts
├── package-lock.json  # Lock file for dependencies
```

## Key Endpoints
| Method | Endpoint                           | Description                        |
|--------|-----------------------------------|------------------------------------|
| POST   | `/trips`                          | Create a new trip                  |
| POST   | `/trips/invite`                   | Invite to a trip                   |
| GET    | `/trips`                          | Fetch all trips                    |
| GET    | `/my-trips`                       | Fetch my trips                     |
| GET    | `/user-trips`                     | Fetch user trips                   |
| GET    | `/trips/:tripId`                  | Fetch trip by ID                   |
| PUT    | `/trips/:tripId`                  | Update trip by ID                  |
| DELETE | `/trips/:tripId`                  | Delete trip by ID                  |
| POST   | `/trips/:tripId/add-participant`  | Add a participant to a trip        |
| POST   | `/trips/:tripId/remove-participant` | Remove a participant from a trip |
| POST   | `/trips/:tripId/generate-join-link` | Generate a join link for a trip   |
| POST   | `/trips/invite-user-by-email`     | Invite user to trip by email       |
| POST   | `/join/:tripId/:token`            | Join a trip                        |
| GET    | `/trips/:tripId/:token`           | Get trip details using a token     |
| POST   | `/trips/:tripId/expenses`         | Create a trip expense              |
| GET    | `/trips/:tripId/expenses/:expenseId` | Get expense details by ID        |
| PUT    | `/trips/:tripId/expenses/:expenseId` | Edit an expense by ID            |
| DELETE | `/trips/:tripId/expenses/:expenseId` | Delete an expense by ID         |
| POST   | `/trips/:tripId/calculate-fair-share` | Calculate fair share of expenses|
| GET    | `/trips/:tripId/timeline`         | Get trip timeline                  |
| PUT    | `/trips/:tripId/timeline`         | Update trip timeline               |
| POST   | `/trips/:tripId/settlements/:settlementId/settle` | Settle debts               |
| POST   | `/trips/:tripId/upload-image`     | Upload an image to a trip          |
| POST   | `/trips/:tripId/administrators/add` | Add an administrator to a trip   |
| POST   | `/trips/:tripId/administrators/remove` | Remove an administrator from a trip |

## Authentication
- Authentication is managed using **JWT**.
- Clients must include the token in the `Authorization` header for protected routes:

  ```
  Authorization: Bearer <token>
  ```
- Tokens are generated during login and are validated via middleware.


## Running Locally
1. Clone the repository:
   ```bash
   git clone <repository_url>
   ```
2. Install dependencies:
   ```bash
   cd tripper-backend
   npm install
   ```
3. Set up the environment variables in `.env`.
4. Start the development server:
   ```bash
   npm run dev
   ```

## Testing
Run tests using:
```bash
npm test
```
Tests are located in the `tests/` directory and cover both unit and integration scenarios.

## Deployment
1. Ensure the `.env` file is configured for the production environment.
2. Build and run the app using a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js
   ```

## Render Deployment Status
- The application is currently deployed on **Render**.
- Render dashboard link: [Tripper Backend Dashboard](https://tripper-backend-4he2.onrender.com)
