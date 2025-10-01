# Banking Backend v0-KYC

A plug-and-play banking backend with integrated KYC (Know Your Customer) verification, built with Next.js 15, Better Auth, Prisma, and Google Gemini AI.

## 🚀 Features

- **🔐 Secure Authentication**: Built with Better Auth for enterprise-grade security
- **📄 AI-Powered KYC**: Automatic document verification using Google Gemini Vision
- **🏢 Multi-Tenant**: Isolated data per banking institution
- **⚡ Type-Safe APIs**: End-to-end type safety with tRPC
- **🎨 Modern UI**: Responsive design with Tailwind CSS
- **📊 Dashboard**: Banking widgets with mock financial data
- **🐳 Docker Ready**: Containerized for easy deployment

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: tRPC, Better Auth, Prisma ORM
- **Database**: Neon PostgreSQL
- **AI/ML**: Google Generative AI (Gemini Vision)
- **File Storage**: S3-compatible (MinIO for local dev)
- **Testing**: Jest, Vitest, Testing Library

## 📋 Prerequisites

- Node.js 18+ 
- npm or pnpm
- PostgreSQL database (Neon recommended)
- Google Gemini API key
- S3-compatible storage (optional for local dev)

## ⚡ Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd bank-backend
npm install
```

### 2. Environment Setup

Copy the environment template:

```bash
cp .env.example .env
```

Update `.env` with your credentials:

```bash
# Database (Get from Neon.tech)
DATABASE_URL="postgresql://username:password@host/database"
DIRECT_URL="postgresql://username:password@host/database"

# Authentication
NEXTAUTH_SECRET="your-32-char-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google Gemini AI (Required for KYC verification and RAG email generation)
GEMINI_API_KEY="your-gemini-api-key"

# File Storage (optional for local dev)
S3_ACCESS_KEY_ID="your-s3-access-key"
S3_SECRET_ACCESS_KEY="your-s3-secret-key"
S3_BUCKET_NAME="bank-backend-uploads"
S3_REGION="us-east-1"
```

### 3. Database Setup

Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Seed Database

Create a default tenant:

```bash
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see the application.

## 🔧 Development Workflow

### Database Management

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name migration_name

# Reset database (development only)
npx prisma migrate reset

# View data in Prisma Studio
npx prisma studio
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Linting & Formatting

```bash
# Check TypeScript types
npm run type-check

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🐳 Docker Deployment

### Local Development with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Build

```bash
# Build Docker image
docker build -t bank-backend .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="your-db-url" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e GEMINI_API_KEY="your-key" \
  bank-backend
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-in` | User sign-in |
| POST | `/api/auth/sign-up` | User registration |
| POST | `/api/auth/sign-out` | User sign-out |
| GET | `/api/auth/session` | Get current session |

### KYC Endpoints (tRPC)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trpc/kyc.getStatus` | Get KYC verification status |
| POST | `/api/trpc/kyc.upload` | Upload identity document |
| POST | `/api/trpc/kyc.submit` | Submit document for verification |

### Dashboard Endpoints (tRPC)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trpc/dashboard.getMockData` | Get dashboard mock data |

## 🔒 Security Features

- **Authentication**: Secure session management with Better Auth
- **Authorization**: Route-based access control middleware
- **File Upload**: Type and size validation (JPEG, PNG, PDF, max 10MB)
- **Rate Limiting**: API endpoint throttling
- **CSRF Protection**: Cross-site request forgery prevention
- **XSS Protection**: Content Security Policy headers

## 🧪 Testing KYC Flow

### 1. Create Test User

1. Navigate to http://localhost:3000
2. Click "Get Started" 
3. Fill out registration form with test data:
   - **Full Name**: "John Smith" (important for name matching)
   - **Email**: test@example.com
   - **Password**: password123

### 2. Test Document Upload

1. After registration, you'll be redirected to `/kyc`
2. Upload a government ID (JPEG, PNG, or PDF)
3. The system will process the document with Gemini AI
4. If the extracted name matches "John Smith", status will be `VERIFIED`
5. Otherwise, status will be `REVIEW` for manual review

### 3. Access Dashboard

- With `VERIFIED` status: Automatic redirect to dashboard
- With `REVIEW` status: Manual review message displayed
- Dashboard shows mock banking data and account information

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── kyc/              # KYC wizard page
│   ├── sign-in/          # Authentication pages
│   └── sign-up/
├── components/            # React components
│   ├── dashboard.tsx     # Dashboard component
│   ├── kyc-wizard.tsx    # KYC flow component
│   └── trpc-provider.tsx # tRPC client provider
├── lib/                  # Shared utilities
│   ├── auth.ts          # Better Auth configuration
│   ├── auth-client.ts   # Client-side auth hooks
│   └── prisma.ts        # Prisma client instance
├── server/               # Backend code
│   └── api/             # tRPC routers
│       ├── routers/     # Feature-specific routers
│       ├── root.ts      # Main router
│       └── trpc.ts      # tRPC setup
└── utils/               # Utility functions
    └── api.ts          # tRPC React client
```

## 📝 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `DIRECT_URL` | Direct database connection | ✅ |
| `NEXTAUTH_SECRET` | Auth encryption secret | ✅ |
| `NEXTAUTH_URL` | App base URL | ✅ |
| `GEMINI_API_KEY` | Google Gemini API key | ✅ |
| `S3_ACCESS_KEY_ID` | S3 access key | ⚠️ |
| `S3_SECRET_ACCESS_KEY` | S3 secret key | ⚠️ |
| `S3_BUCKET_NAME` | S3 bucket name | ⚠️ |
| `S3_REGION` | S3 region | ⚠️ |
| `S3_ENDPOINT` | S3 endpoint (MinIO) | ⚠️ |

⚠️ = Optional for local development

### Database Configuration

The application uses Prisma with PostgreSQL. Key models:

- **User**: Authentication and profile data
- **Tenant**: Multi-tenant isolation
- **KycCheck**: KYC verification status and data
- **File**: Document upload tracking
- **Session/Account**: Better Auth tables

## 🚨 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
Error: P1001: Can't reach database server
```
- Verify DATABASE_URL is correct
- Check if database is running
- Ensure network connectivity

**Gemini API Error**
```bash
Error: Gemini API call failed
```
- Verify GEMINI_API_KEY is valid
- Check API quota and billing
- Review document format (JPEG, PNG, PDF only)

**Auth Session Issues**
```bash
Error: Session not found
```
- Clear browser cookies
- Verify NEXTAUTH_SECRET is set
- Check session expiration settings

**File Upload Errors**
```bash
Error: File too large
```
- Maximum file size is 10MB
- Supported formats: JPEG, PNG, PDF
- Check S3 configuration if using external storage

### Debug Commands

```bash
# Check database connection
npx prisma db pull

# Validate Prisma schema
npx prisma validate

# View detailed logs
npm run dev -- --debug

# Reset development database
npx prisma migrate reset --force
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

### Code Standards

- TypeScript strict mode
- ESLint + Prettier formatting
- 80%+ test coverage
- Semantic commit messages

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: See `SPEC.md` for technical details
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions

## 🗺️ Roadmap

See `TODOS.md` and `PRD.md` for detailed development plans and product requirements.

### Upcoming Features

- Enhanced document types (passports, utility bills)
- Real-time webhook notifications
- Admin dashboard for KYC review
- Advanced fraud detection
- Mobile app support

---

**Built with ❤️ for the fintech community**
