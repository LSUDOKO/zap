# zkTLS Proof Backend Server

A robust Node.js backend service for generating zero-knowledge proofs of GitHub pull requests using the Reclaim Protocol. This service enables secure, privacy-preserving verification of GitHub contributions without exposing sensitive user data.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Backend Architecture Explained](#backend-architecture-explained)
- [Development](#development)
- [Security Considerations](#security-considerations)

---

## Architecture Overview

This backend follows the **MVC (Model-View-Controller)** pattern with service layer architecture, ensuring:

- **Separation of Concerns**: Each layer has a specific responsibility
- **Scalability**: Easy to extend with new features and endpoints
- **Maintainability**: Clear code organization for long-term maintenance
- **Testability**: Each layer can be independently tested
- **Reusability**: Services can be shared across multiple controllers

### Technology Stack

- **Runtime**: Node.js with ES6 Modules
- **Framework**: Express.js
- **Authentication**: GitHub OAuth 2.0
- **Zero-Knowledge Proofs**: Reclaim Protocol (zk-fetch & js-sdk)
- **HTTP Client**: node-fetch

---

## Project Structure

```
zktls-proof/
│
├── config/
│   └── env.config.js           # Environment configuration & validation
│
├── controllers/
│   ├── auth.controller.js      # Handles authentication requests
│   └── proof.controller.js     # Handles proof generation requests
│
├── services/
│   ├── github.service.js       # GitHub API integration
│   └── reclaim.service.js      # Reclaim Protocol integration
│
├── routes/
│   ├── auth.routes.js          # Authentication routes
│   ├── proof.routes.js         # Proof generation routes
│   └── index.js                # Routes aggregator
│
├── utils/
│   └── extractGitHubPRInfo.js  # Helper functions
│
├── server.js                   # Application entry point
├── package.json                # Dependencies & scripts
├── .env.example                # Environment variables template
└── README.md                   # This file
```

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher recommended)
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

**1. Clone the repository**

```bash
git clone <repository-url>
cd zktls-proof
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

Create a `.env` file from the example template:

```bash
cp .env.example .env
```

**4. Set up your credentials**

Edit the `.env` file with your credentials:

```ini
# GitHub OAuth Credentials
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Reclaim Protocol Credentials
RECLAIM_ID=your_reclaim_id
RECLAIM_SECRET=your_reclaim_secret

# Server Configuration
PORT=5000
```

**How to get GitHub OAuth credentials:**

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details
4. Copy the Client ID and Client Secret

**How to get Reclaim Protocol credentials:**

1. Visit [Reclaim Protocol](https://reclaimprotocol.org)
2. Sign up for an account
3. Create a new application
4. Copy your App ID and App Secret

### Running the Server

**Development mode** (with auto-reload):

```bash
npm run dev
```

**Production mode**:

```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

---

## API Documentation

### 1. GitHub OAuth - Get Access Token

Exchange GitHub authorization code for an access token.

**Endpoint:**
```
GET /getAccessToken
```

**Query Parameters:**

| Parameter | Type   | Required | Description                                    |
|-----------|--------|----------|------------------------------------------------|
| code      | string | Yes      | Authorization code from GitHub OAuth callback |

**Example Request:**

```bash
curl "http://localhost:5000/getAccessToken?code=abc123def456"
```

**Success Response (200):**

```json
{
  "access_token": "gho_16C7e42F292c6912E7710c838347Ae178B4a",
  "scope": "repo,gist",
  "token_type": "bearer"
}
```

**Error Response (500):**

```json
{
  "error": "Error message description"
}
```

---

### 2. Generate Zero-Knowledge Proof

Generate cryptographic proofs for GitHub pull request and user identity.

**Endpoint:**
```
GET /generate-proof
```

**Headers:**

| Header        | Value                  | Required |
|---------------|------------------------|----------|
| Authorization | Bearer {access_token}  | Yes      |

**Query Parameters:**

| Parameter | Type   | Required | Description                      |
|-----------|--------|----------|----------------------------------|
| url       | string | Yes      | Full GitHub pull request URL     |

**Example Request:**

```bash
curl -X GET "http://localhost:5000/generate-proof?url=https://github.com/owner/repo/pull/123" \
  -H "Authorization: Bearer gho_16C7e42F292c6912E7710c838347Ae178B4a"
```

**Success Response (200):**

```json
{
  "prProofData": {
    "claimInfo": {
      "context": {
        "id": "123456789",
        "login": "username",
        "node_id": "MDExOlB1bGxSZXF1ZXN0MQ==",
        "merged_status": true
      },
      "parameters": "...",
      "provider": "github-pr"
    },
    "signedClaim": {
      "claim": {
        "epoch": "1",
        "identifier": "0x...",
        "owner": "0x...",
        "timestampS": "1234567890"
      },
      "signatures": ["0x..."]
    }
  },
  "userProofData": {
    "claimInfo": {
      "context": {
        "id": "123456789",
        "login": "username",
        "node_id": "MDQ6VXNlcjE="
      },
      "parameters": "...",
      "provider": "github-user"
    },
    "signedClaim": {
      "claim": {
        "epoch": "1",
        "identifier": "0x...",
        "owner": "0x...",
        "timestampS": "1234567890"
      },
      "signatures": ["0x..."]
    }
  }
}
```

**Error Responses:**

**500 - Failed to generate proof:**
```json
{
  "message": "Failed to generate proof"
}
```

**500 - Failed to verify proof:**
```json
{
  "message": "Failed to verify pull request or user proof"
}
```

**500 - General error:**
```json
{
  "error": "Error message description"
}
```

---

## Backend Architecture Explained

### Layer-by-Layer Breakdown

#### 1. **Config Layer** (`config/`)

**Purpose**: Centralized configuration management and validation

**Files**:
- `env.config.js` - Loads and validates environment variables

**Responsibilities**:
- Load environment variables from `.env` file
- Validate required credentials on startup
- Export configuration object for use across the application
- Fail fast if critical configuration is missing

**Example**:
```javascript
import config from './config/env.config.js';
console.log(config.server.port); // 5000
```

---

#### 2. **Service Layer** (`services/`)

**Purpose**: Business logic and external API integrations

**Files**:
- `github.service.js` - GitHub API operations
- `reclaim.service.js` - Reclaim Protocol operations

**Responsibilities**:
- Encapsulate business logic
- Handle external API calls
- Provide reusable methods across controllers
- No direct request/response handling

**GitHub Service** provides:
- `getAccessToken(code)` - Exchange OAuth code for token
- `getPublicOptions()` - Generate GitHub API headers
- `getPrivateOptions(token)` - Generate authenticated headers
- `buildApiUrls(owner, repo, pull_number)` - Construct API URLs

**Reclaim Service** provides:
- `generatePRProof()` - Create proof for pull request
- `generateUserProof()` - Create proof for user identity
- `verifyProof()` - Verify cryptographic proof
- `transformForOnchain()` - Transform proof for blockchain use

---

#### 3. **Controller Layer** (`controllers/`)

**Purpose**: Request/Response handling and orchestration

**Files**:
- `auth.controller.js` - Authentication logic
- `proof.controller.js` - Proof generation logic

**Responsibilities**:
- Receive HTTP requests
- Extract and validate parameters
- Call appropriate services
- Handle errors gracefully
- Format and send responses

**Flow Example** (Proof Generation):
```
Request → Controller → Services → External APIs → Services → Controller → Response
```

---

#### 4. **Routes Layer** (`routes/`)

**Purpose**: Define API endpoints and route them to controllers

**Files**:
- `auth.routes.js` - Authentication endpoints
- `proof.routes.js` - Proof generation endpoints
- `index.js` - Aggregate all routes

**Responsibilities**:
- Define HTTP methods and paths
- Map routes to controller methods
- Provide route-level documentation
- Centralize route management

---

#### 5. **Application Entry** (`server.js`)

**Purpose**: Initialize and configure the Express application

**Responsibilities**:
- Set up middleware (CORS, body-parser, etc.)
- Mount routes
- Start the HTTP server
- Keep code clean and minimal

---

### Request Flow Diagram

```
1. Client Request
   ↓
2. server.js (Express App)
   ↓
3. routes/index.js (Route Matching)
   ↓
4. routes/proof.routes.js (Specific Route)
   ↓
5. controllers/proof.controller.js (Request Handler)
   ↓
6. services/reclaim.service.js (Business Logic)
   ↓
7. services/github.service.js (API Integration)
   ↓
8. External APIs (GitHub, Reclaim Protocol)
   ↓
9. Response back through the chain
   ↓
10. Client receives response
```

---

## Development

### Code Style Guidelines

- Use **ES6+ syntax** (import/export, async/await, arrow functions)
- Follow **Singleton pattern** for services (export instance, not class)
- Use **JSDoc comments** for functions with parameters
- Keep functions **small and focused** (Single Responsibility Principle)
- Handle errors with **try-catch** and meaningful error messages

### Adding New Features

**Example: Adding a new endpoint**

1. **Create service method** (`services/new.service.js`):
```javascript
class NewService {
  async doSomething(param) {
    // Business logic here
  }
}
export default new NewService();
```

2. **Create controller** (`controllers/new.controller.js`):
```javascript
import newService from '../services/new.service.js';

class NewController {
  async handleRequest(req, res) {
    try {
      const result = await newService.doSomething(req.query.param);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
export default new NewController();
```

3. **Create route** (`routes/new.routes.js`):
```javascript
import express from 'express';
import newController from '../controllers/new.controller.js';

const router = express.Router();
router.get('/new-endpoint', newController.handleRequest);
export default router;
```

4. **Register route** in `routes/index.js`:
```javascript
import newRoutes from './new.routes.js';
router.use('/', newRoutes);
```

---

## Security Considerations

### Environment Variables
- **Never commit** `.env` file to version control
- Use strong, unique credentials for production
- Rotate secrets regularly

### API Security
- Always validate input parameters
- Use HTTPS in production
- Implement rate limiting for public endpoints
- Sanitize user inputs to prevent injection attacks

### GitHub OAuth
- Store access tokens securely
- Never log sensitive tokens
- Implement token refresh mechanism for long-lived sessions

### Zero-Knowledge Proofs
- Verify all proofs before accepting them
- Understand the regex patterns used in proof generation
- Monitor for unusual proof generation patterns

---

## Troubleshooting

**Server won't start:**
- Check if `.env` file exists and contains all required variables
- Verify port 5000 (or your PORT) is not already in use
- Check Node.js version (should be 18.x or higher)

**Proof generation fails:**
- Verify GitHub access token is valid
- Check if pull request URL is correctly formatted
- Ensure Reclaim credentials are correct
- Check network connectivity to GitHub and Reclaim APIs

**"Missing credentials" error:**
- Verify `.env` file is in the project root
- Check that all required variables are set
- Ensure no extra spaces in variable values

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Support

For issues, questions, or contributions, please open an issue on GitHub or contact the maintainers.

**Built with ❤️ using Reclaim Protocol and Express.js**
