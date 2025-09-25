# Engineering Specification - v0-KYC Banking Backend

## Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App  │    │   tRPC Server   │    │   PostgreSQL    │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Better Auth    │    │  Gemini Vision  │    │   File Storage  │
│  (Auth System)  │    │   (AI/ML API)   │    │   (S3/MinIO)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: tRPC, Better Auth, Prisma ORM
- **Database**: Neon PostgreSQL
- **AI/ML**: Google Generative AI (Gemini Vision)
- **File Storage**: S3-compatible (MinIO for local dev)
- **Testing**: Jest, Vitest, Testing Library
- **Deployment**: Docker, Vercel

---

## Database Schema

### Complete Prisma Schema

```prisma
// Better Auth Core Tables
model User {
  id               String    @id @default(uuid())
  email            String    @unique
  emailVerified    Boolean   @default(false)
  name             String?
  fullName         String?   // For KYC name matching
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  // Relations
  accounts         Account[]
  sessions         Session[]
  kycCheck         KycCheck?
  tenantId         String?
  tenant           Tenant?   @relation(fields: [tenantId], references: [id])
  
  @@map("users")
}

model Account {
  id                String  @id @default(uuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// Custom Business Tables
model Tenant {
  id        String   @id @default(uuid())
  slug      String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  users     User[]
  kycChecks KycCheck[]
  
  @@map("tenants")
}

model KycCheck {
  id            String     @id @default(uuid())
  userId        String     @unique
  tenantId      String
  status        KycStatus  @default(PENDING)
  docType       String?
  docNumber     String?
  extractedName String?
  rawJson       Json?
  failureReason String?
  reviewNotes   String?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  
  // Relations
  user          User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  tenant        Tenant     @relation(fields: [tenantId], references: [id])
  files         File[]
  
  @@map("kyc_checks")
}

model File {
  id         String   @id @default(uuid())
  filename   String
  originalName String
  mimeType   String
  size       Int
  url        String
  kycCheckId String?
  uploadedBy String
  createdAt  DateTime @default(now())
  
  // Relations
  kycCheck   KycCheck? @relation(fields: [kycCheckId], references: [id])
  
  @@map("files")
}

// Future Banking Tables
model Account_Banking {
  id            String      @id @default(uuid())
  accountNumber String      @unique
  accountType   AccountType @default(CHECKING)
  balance       Decimal     @default(0.00) @db.Decimal(10, 2)
  userId        String
  tenantId      String
  status        AccountStatus @default(ACTIVE)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  @@map("banking_accounts")
}

model Transaction {
  id          String            @id @default(uuid())
  accountId   String
  amount      Decimal           @db.Decimal(10, 2)
  type        TransactionType
  status      TransactionStatus @default(PENDING)
  description String?
  reference   String?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  
  @@map("transactions")
}

// Enums
enum KycStatus {
  PENDING
  VERIFIED
  REVIEW
  REJECTED
}

enum AccountType {
  CHECKING
  SAVINGS
  BUSINESS
}

enum AccountStatus {
  ACTIVE
  SUSPENDED
  CLOSED
}

enum TransactionType {
  DEPOSIT
  WITHDRAWAL
  TRANSFER
  FEE
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  CANCELLED
}
```

---

## API Contracts

### tRPC Router Structure

```typescript
// Root Router
export const appRouter = createTRPCRouter({
  kyc: kycRouter,
  dashboard: dashboardRouter,
});

// KYC Router
export const kycRouter = createTRPCRouter({
  getStatus: tenantProcedure.query(),
  upload: tenantProcedure.input(uploadSchema).mutation(),
  submit: tenantProcedure.input(submitSchema).mutation(),
});

// Dashboard Router
export const dashboardRouter = createTRPCRouter({
  getMockData: tenantProcedure.query(),
});
```

### API Endpoints

#### Authentication (Better Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-in` | User sign-in |
| POST | `/api/auth/sign-up` | User registration |
| POST | `/api/auth/sign-out` | User sign-out |
| GET | `/api/auth/session` | Get current session |

#### KYC Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/trpc/kyc.getStatus` | Get user's KYC status | ✅ |
| POST | `/api/trpc/kyc.upload` | Upload document file | ✅ |
| POST | `/api/trpc/kyc.submit` | Submit for verification | ✅ |

#### Dashboard
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/trpc/dashboard.getMockData` | Get dashboard data | ✅ |

### Request/Response Schemas

#### KYC Upload Request
```typescript
{
  filename: string;
  mimeType: string; // "image/jpeg" | "image/png" | "application/pdf"
  size: number; // Max 10MB (10485760 bytes)
}
```

#### KYC Upload Response
```typescript
{
  fileId: string;
  uploadUrl: string; // Presigned S3 URL
}
```

#### KYC Submit Request
```typescript
{
  fileId: string;
}
```

#### KYC Submit Response
```typescript
{
  status: "VERIFIED" | "REVIEW" | "REJECTED";
  kycCheck: {
    id: string;
    status: KycStatus;
    docType?: string;
    docNumber?: string;
    extractedName?: string;
    failureReason?: string;
  };
  message: string;
}
```

---

## Sequence Diagrams

### User Registration & KYC Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth API
    participant T as tRPC API
    participant D as Database
    participant G as Gemini AI
    participant S as S3 Storage

    U->>F: Fill registration form
    F->>A: POST /api/auth/sign-up
    A->>D: Create user record
    A->>F: Registration success
    F->>F: Redirect to /kyc
    
    U->>F: Upload document
    F->>T: kyc.upload(file metadata)
    T->>D: Create KycCheck & File records
    T->>S: Generate presigned URL
    T->>F: Return upload URL
    F->>S: Upload file to S3
    
    F->>T: kyc.submit(fileId)
    T->>G: Process document with Gemini
    G->>T: Return extracted data
    T->>T: Compare names & determine status
    T->>D: Update KycCheck status
    T->>F: Return verification result
    
    alt Status is VERIFIED
        F->>F: Redirect to /dashboard
    else Status is REVIEW
        F->>F: Show manual review message
    end
```

### Dashboard Access Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant M as Middleware
    participant T as tRPC API
    participant D as Database

    U->>F: Navigate to /dashboard
    F->>M: Check authentication
    M->>T: Get KYC status
    T->>D: Query user's KycCheck
    D->>T: Return KYC status
    
    alt KYC not verified
        M->>F: Redirect to /kyc
    else KYC verified
        M->>F: Allow access
        F->>T: dashboard.getMockData()
        T->>F: Return dashboard data
        F->>U: Display dashboard
    end
```

---

## Environment Variables Matrix

### Development Environment
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/bank_backend_dev"
DIRECT_URL="postgresql://username:password@localhost:5432/bank_backend_dev"

# Authentication
NEXTAUTH_SECRET="dev-secret-key-32-chars-min"
NEXTAUTH_URL="http://localhost:3000"

# AI/ML
GEMINI_API_KEY="your-gemini-api-key"

# File Storage (Local MinIO)
S3_ACCESS_KEY_ID="minioadmin"
S3_SECRET_ACCESS_KEY="minioadmin"
S3_BUCKET_NAME="bank-backend-dev"
S3_REGION="us-east-1"
S3_ENDPOINT="http://localhost:9000"

# App Config
TENANT_SLUG="default"
NODE_ENV="development"
```

### Staging Environment
```bash
# Database (Neon staging)
DATABASE_URL="postgresql://user:pass@staging-db.neon.tech/bank_backend_staging"
DIRECT_URL="postgresql://user:pass@staging-db.neon.tech/bank_backend_staging"

# Authentication
NEXTAUTH_SECRET="staging-secret-key-64-chars-secure"
NEXTAUTH_URL="https://staging.bank-backend.vercel.app"

# AI/ML
GEMINI_API_KEY="staging-gemini-api-key"

# File Storage (AWS S3)
S3_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
S3_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
S3_BUCKET_NAME="bank-backend-staging"
S3_REGION="us-east-1"
S3_ENDPOINT="" # Use default AWS S3

# App Config
TENANT_SLUG="staging"
NODE_ENV="staging"
```

### Production Environment
```bash
# Database (Neon production)
DATABASE_URL="postgresql://prod_user:secure_pass@prod-db.neon.tech/bank_backend"
DIRECT_URL="postgresql://prod_user:secure_pass@prod-db.neon.tech/bank_backend"

# Authentication
NEXTAUTH_SECRET="production-secret-key-128-chars-ultra-secure"
NEXTAUTH_URL="https://bank-backend.com"

# AI/ML
GEMINI_API_KEY="production-gemini-api-key"

# File Storage (AWS S3 with encryption)
S3_ACCESS_KEY_ID="AKIAIOSFODNN7PROD"
S3_SECRET_ACCESS_KEY="production-secret-key-encrypted"
S3_BUCKET_NAME="bank-backend-production"
S3_REGION="us-east-1"
S3_ENDPOINT="" # Use default AWS S3

# App Config
TENANT_SLUG="production"
NODE_ENV="production"
```

---

## Testing Strategy & Matrix

### Unit Tests
| Component | Test Cases | Coverage Target |
|-----------|------------|----------------|
| Name Matching Utility | Exact match, partial match, case sensitivity | 95% |
| KYC Status Logic | Status transitions, validation rules | 90% |
| Auth Middleware | Session validation, tenant isolation | 85% |
| tRPC Resolvers | Input validation, error handling | 80% |

### Integration Tests
| Flow | Test Scenarios | Tools |
|------|---------------|-------|
| User Registration | Sign-up → KYC redirect | Testing Library |
| KYC Submission | Upload → Process → Verify | Mock Gemini API |
| Dashboard Access | Auth check → Data fetch | tRPC testing utils |
| Tenant Isolation | Cross-tenant data access | Prisma test client |

### End-to-End Tests
| User Journey | Test Steps | Expected Outcome |
|--------------|------------|------------------|
| Happy Path | Register → Upload ID → Get verified → Access dashboard | Full flow completion |
| Review Path | Register → Upload non-matching ID → Get review status | Manual review trigger |
| Error Path | Register → Upload invalid file → Get error | Proper error handling |

### Test Configuration
```typescript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
};

// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

---

## Security Considerations

### Authentication & Authorization
- **Session Management**: Secure HTTP-only cookies with SameSite protection
- **CSRF Protection**: Anti-CSRF tokens on state-changing operations
- **Rate Limiting**: API endpoint throttling (100 requests/minute per IP)
- **Password Security**: bcrypt hashing with salt rounds >= 12

### Data Protection
- **Encryption in Transit**: TLS 1.3 for all communications
- **Encryption at Rest**: Database column encryption for PII
- **File Security**: Presigned URLs with 15-minute expiration
- **Data Minimization**: Store only necessary KYC information

### Input Validation
- **File Upload**: Type, size, and content validation
- **SQL Injection**: Prisma ORM with parameterized queries
- **XSS Prevention**: Content Security Policy headers
- **Input Sanitization**: Zod schema validation on all inputs

### Audit & Compliance
- **Audit Logging**: All KYC operations logged with timestamps
- **Data Retention**: Configurable retention policies
- **Access Control**: Role-based permissions (future)
- **Compliance Monitoring**: Regular security scans and updates

---

## Performance Requirements

### Response Time Targets
- **API Endpoints**: < 200ms p95 (excluding AI processing)
- **Document Processing**: < 30 seconds end-to-end
- **Page Load Times**: < 2 seconds initial load
- **File Uploads**: Streaming with progress indicators

### Scalability Metrics
- **Concurrent Users**: 1,000 simultaneous sessions
- **Database Connections**: Connection pooling (max 100 connections)
- **File Storage**: 1TB+ with CDN distribution
- **API Throughput**: 10,000 requests/minute sustained

### Monitoring & Alerting
```typescript
// Performance monitoring points
const metrics = {
  apiResponseTime: histogram('api_response_time_seconds'),
  kycProcessingTime: histogram('kyc_processing_time_seconds'),
  fileUploadSize: histogram('file_upload_size_bytes'),
  databaseQueryTime: histogram('db_query_time_seconds'),
  errorRate: counter('api_errors_total'),
  activeUsers: gauge('active_users_current'),
};
```

---

## Deployment Architecture

### Container Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
COPY . .
RUN npm run build

FROM base AS runtime
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose (Local Development)
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/bank_backend
    depends_on:
      - db
      - minio

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: bank_backend
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  minio_data:
```

### CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## Gemini AI Integration

### Document Processing Prompt
```typescript
const DOCUMENT_EXTRACTION_PROMPT = `
Analyze this government ID document and extract the following information in JSON format:

{
  "extractedName": "Full legal name as written on document",
  "dateOfBirth": "YYYY-MM-DD format",
  "docNumber": "Document number/ID number",
  "docType": "Type of document (e.g., Driver's License, Passport, National ID)",
  "isValid": true/false,
  "confidence": 0.0-1.0,
  "extractedText": "Raw text extracted from document"
}

Requirements:
- Extract text exactly as it appears on the document
- Validate that this appears to be a legitimate government-issued ID
- Provide confidence score based on document quality and clarity
- If unable to extract information clearly, set confidence < 0.7
`;
```

### API Integration Code
```typescript
async function processDocumentWithGemini(fileUrl: string, mimeType: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
  
  const imagePart = {
    inlineData: {
      data: await fetchFileAsBase64(fileUrl),
      mimeType: mimeType,
    },
  };

  const result = await model.generateContent([
    DOCUMENT_EXTRACTION_PROMPT,
    imagePart,
  ]);

  const response = await result.response;
  const text = response.text();
  
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error('Failed to parse Gemini response as JSON');
  }
}
```

### Error Handling & Fallbacks
```typescript
async function processDocumentWithRetry(fileUrl: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await processDocumentWithGemini(fileUrl);
      
      if (result.confidence < 0.7) {
        throw new Error('Low confidence in document processing');
      }
      
      return result;
    } catch (error) {
      if (attempt === maxRetries) {
        // Fall back to manual review
        return {
          extractedName: null,
          status: 'REVIEW',
          failureReason: 'Document processing failed after retries',
        };
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
}
```

This engineering specification provides a comprehensive technical foundation for implementing the v0-KYC banking backend, ensuring scalability, security, and maintainability.
