# Hive Deployment Guide

This guide covers deploying Hive using Docker Compose for both development and production environments.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Configuration](#environment-configuration)
4. [Docker Compose Deployment](#docker-compose-deployment)
5. [Production Considerations](#production-considerations)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Docker** 24.0+ ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose** 2.0+ (included with Docker Desktop)
- **Git** (for cloning the repository)

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 4 GB | 8 GB |
| Storage | 10 GB | 20 GB |
| CPU | 2 cores | 4 cores |

---

## Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd hive

# 2. Create environment files
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# 3. Update environment variables (see below)

# 4. Build and start all services
docker-compose up --build -d

# 5. Run database migrations
docker-compose exec backend alembic upgrade head

# 6. Verify deployment
curl http://localhost:8000/health
```

Access the application:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Nginx Proxy:** http://localhost

---

## Environment Configuration

### Backend Environment (`backend/.env`)

```env
# Database
DATABASE_URL=sqlite:///./data/marketplace.db

# JWT - CHANGE THIS IN PRODUCTION!
JWT_SECRET_KEY=generate-a-secure-random-string-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_DAYS=7

# File Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@usehive.com

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost
```

### Frontend Environment (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Generating a Secure JWT Secret

```bash
# Using Python
python -c "import secrets; print(secrets.token_urlsafe(64))"

# Using OpenSSL
openssl rand -base64 64
```

---

## Docker Compose Deployment

### Service Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Nginx (Port 80)                   │
│                   Reverse Proxy                      │
└─────────────────────┬───────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│ Frontend (3000) │     │ Backend (8000)  │
│    Next.js      │     │    FastAPI      │
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │     SQLite      │
                        │   (file-based)  │
                        └─────────────────┘
```

### Docker Compose Commands

```bash
# Start all services
docker-compose up -d

# Start with build
docker-compose up --build -d

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f backend

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart a service
docker-compose restart backend

# Scale a service (if needed)
docker-compose up -d --scale backend=2
```

### Service Management

```bash
# Check service status
docker-compose ps

# Execute command in container
docker-compose exec backend alembic upgrade head
docker-compose exec frontend npm run build

# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh

# View resource usage
docker stats
```

---

## Production Considerations

### 1. Security

**JWT Secret Key:**
```bash
# Generate a strong secret
openssl rand -base64 64
```

**Environment Variables:**
- Never commit `.env` files to version control
- Use secrets management in production (AWS Secrets Manager, HashiCorp Vault)
- Rotate secrets periodically

**CORS Configuration:**
```env
# Restrict to your domain only
CORS_ORIGINS=https://usehive.com,https://www.usehive.com
```

### 2. Database

For production, consider migrating from SQLite to PostgreSQL:

```env
# PostgreSQL connection
DATABASE_URL=postgresql://user:password@db-host:5432/hive
```

Add PostgreSQL service to `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: hive
      POSTGRES_PASSWORD: secure_password
      POSTGRES_DB: hive
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### 3. HTTPS/SSL

Add SSL certificates via Nginx:

```nginx
server {
    listen 443 ssl;
    server_name usehive.com;

    ssl_certificate /etc/ssl/certs/fullchain.pem;
    ssl_certificate_key /etc/ssl/private/privkey.pem;

    # ... rest of config
}
```

Or use a reverse proxy like **Traefik** or **Caddy** for automatic SSL.

### 4. Backups

**Database Backup (SQLite):**
```bash
# Create backup
docker-compose exec backend cp /app/data/marketplace.db /app/data/backup_$(date +%Y%m%d).db

# For PostgreSQL
docker-compose exec db pg_dump -U hive hive > backup.sql
```

**Upload Files Backup:**
```bash
# Backup uploads directory
tar -czvf uploads_backup_$(date +%Y%m%d).tar.gz backend/uploads/
```

### 5. Monitoring

Consider adding:
- **Prometheus** for metrics collection
- **Grafana** for visualization
- **Sentry** for error tracking

### 6. Logging

Configure centralized logging:

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Check what's using the port
lsof -i :8000
# or
netstat -tulpn | grep 8000

# Stop the conflicting process or change the port in docker-compose.yml
```

#### 2. Permission Denied on Volumes

```bash
# Fix ownership
sudo chown -R $USER:$USER backend/uploads backend/data

# Or set permissions in Dockerfile
RUN chmod -R 755 /app/uploads /app/data
```

#### 3. Database Migration Errors

```bash
# Reset migrations (development only!)
docker-compose exec backend alembic downgrade base
docker-compose exec backend alembic upgrade head

# Check migration history
docker-compose exec backend alembic history
```

#### 4. Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Check container status
docker-compose ps

# Rebuild from scratch
docker-compose down -v
docker-compose up --build -d
```

#### 5. Network Issues Between Containers

```bash
# Check network
docker network ls
docker network inspect hive_default

# Containers should use service names, not localhost
# Backend: backend:8000
# Frontend: frontend:3000
```

### Health Checks

```bash
# Backend health
curl http://localhost:8000/health

# Frontend health
curl http://localhost:3000

# Check all services
docker-compose ps
```

### Viewing Application Logs

```bash
# All logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs -f backend
```

---

## Environment-Specific Configurations

### Development

```yaml
# docker-compose.override.yml (auto-loaded)
version: '3.8'
services:
  backend:
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    volumes:
      - ./backend:/app  # Hot reload

  frontend:
    command: npm run dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
```

### Production

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  backend:
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
    restart: always

  frontend:
    command: npm run start
    restart: always
```

Run with:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## Useful Scripts

### `scripts/deploy.sh`

```bash
#!/bin/bash
set -e

echo "🚀 Deploying Hive..."

# Pull latest code
git pull origin main

# Build and start services
docker-compose up --build -d

# Run migrations
docker-compose exec backend alembic upgrade head

# Health check
sleep 5
curl -f http://localhost:8000/health || exit 1

echo "✅ Deployment complete!"
```

### `scripts/backup.sh`

```bash
#!/bin/bash
BACKUP_DIR="/backups/hive"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp backend/data/marketplace.db "$BACKUP_DIR/db_$DATE.db"

# Backup uploads
tar -czvf "$BACKUP_DIR/uploads_$DATE.tar.gz" backend/uploads/

# Keep only last 7 days of backups
find $BACKUP_DIR -mtime +7 -delete

echo "✅ Backup complete: $BACKUP_DIR"
```

---

## Support

For deployment issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review container logs: `docker-compose logs`
3. Verify environment variables
4. Contact the development team
