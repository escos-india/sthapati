# Sthapati - The Master Creator

A modern, production-ready Next.js application for connecting architecture, construction, and engineering professionals.

## 🚀 Features

- **Modern Tech Stack**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Database**: MongoDB Atlas integration with optimized connection pooling
- **Production Ready**: Docker support, error handling, logging, health checks
- **Security**: Security headers, input validation, error sanitization
- **Performance**: Optimized builds, image optimization, code splitting
- **Admin Dashboard**: User management, reporting, analytics

## 📋 Prerequisites

- Node.js 20+ 
- MongoDB Atlas account (or local MongoDB instance)
- Docker & Docker Compose (for containerized deployment)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd Sthapati
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and set the following variables:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.mrdlh.mongodb.net/sthapati?retryWrites=true&w=majority
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:9002
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:9002`

## 🐳 Docker Deployment

### Build and Run with Docker

```bash
# Build the Docker image
npm run docker:build

# Run the container
npm run docker:run
```

### Using Docker Compose

```bash
# Start all services
npm run docker:compose

# Stop all services
npm run docker:compose:down
```

## 🏗️ Production Build

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Ensure all environment variables are set in your production environment:

- `MONGODB_URI` - MongoDB connection string
- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_URL` - Your production domain URL

## 📁 Project Structure

```
Sthapati/
├── src/
│   ├── app/              # Next.js app router pages and API routes
│   │   ├── api/          # API endpoints
│   │   │   ├── health/   # Health check endpoint
│   │   │   └── admin/    # Admin API routes
│   │   └── sthapati/     # Admin dashboard pages
│   ├── components/       # React components
│   │   ├── ui/           # Reusable UI components
│   │   └── layout/        # Layout components
│   ├── lib/              # Utility functions and configurations
│   │   ├── mongodb.ts    # MongoDB connection utilities
│   │   ├── error-handler.ts  # Error handling utilities
│   │   └── logger.ts     # Logging utilities
│   ├── models/           # MongoDB models
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
└── next.config.ts        # Next.js configuration
```

## 🔌 API Endpoints

### Health Check

```bash
GET /api/health
```

Returns application health status including database connectivity.

### User Management

```bash
GET /api/users/me?id={userId}
GET /api/admin/users
PATCH /api/admin/users
```

## 🛡️ Security Features

- Security headers (XSS protection, frame options, content type sniffing prevention)
- Input validation and sanitization
- Error message sanitization in production
- MongoDB injection prevention (via Mongoose)
- CORS configuration
- Environment variable protection

## 📊 Monitoring & Logging

The application includes built-in logging utilities:

- **Development**: Console logging with detailed information
- **Production**: Structured logging ready for integration with services like:
  - Sentry (error tracking)
  - LogRocket (session replay)
  - CloudWatch / Datadog (monitoring)

### Logging Usage

```typescript
import { logger } from '@/lib/logger';

logger.info('User action completed', { userId: '123' });
logger.error('Operation failed', error, { context: 'user-update' });
```

## 🔧 Error Handling

All API routes use centralized error handling:

```typescript
import { asyncHandler, AppError } from '@/lib/error-handler';

export const GET = asyncHandler(async (req: Request) => {
  // Your code here
  // Errors are automatically caught and formatted
});
```

## 🧪 Testing

```bash
# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📦 Build Optimizations

- **Standalone Output**: Optimized for Docker deployment
- **Image Optimization**: AVIF and WebP format support
- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Minification**: SWC-based minification

## 🚢 Deployment

### Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

1. Build the image: `docker build -t sthapati:latest .`
2. Run: `docker run -p 3000:3000 --env-file .env sthapati:latest`

### Other Platforms

The application can be deployed to any platform supporting Node.js:
- AWS (ECS, EC2, Lambda)
- Google Cloud Platform
- Azure
- DigitalOcean
- Railway
- Render

## 🔍 Health Checks

The application includes a health check endpoint at `/api/health` that returns:

- Application status
- Database connectivity
- Service availability
- Uptime information

Use this endpoint for:
- Load balancer health checks
- Monitoring systems
- Kubernetes liveness/readiness probes

## 📝 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `NODE_ENV` | Environment (development/production) | Yes | development |
| `NEXT_PUBLIC_APP_URL` | Application URL | No | http://localhost:9002 |

## 🐛 Troubleshooting

### MongoDB Connection Issues

1. Verify `MONGODB_URI` is correct
2. Check MongoDB Atlas network access settings
3. Ensure IP whitelist includes your server IP
4. Verify database user credentials

### Build Errors

1. Clear `.next` directory: `rm -rf .next`
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Check TypeScript errors: `npm run typecheck`

### Docker Issues

1. Ensure Docker is running
2. Check Docker logs: `docker logs <container-id>`
3. Verify environment variables are set
4. Check port availability (3000)

## 📄 License

[Your License Here]

## 👥 Contributing

[Contributing Guidelines]

## 📞 Support

For support, email [your-email] or open an issue in the repository.

---

Built with ❤️ using Next.js and MongoDB
