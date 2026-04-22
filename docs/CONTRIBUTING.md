# Contributing to Hive

Thank you for your interest in contributing to Hive! This document provides guidelines and instructions for contributing.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Code Standards](#code-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)

---

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the issue, not the person
- Help others learn and grow

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (for frontend)
- **Python** 3.11+ (for backend)
- **Git** 2.30+
- **Docker & Docker Compose** (optional, for containerized development)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hive
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
   # Create .env file with required variables
   cp .env.example .env
   
   # Run migrations
   alembic upgrade head
   
   # Start server
   uvicorn app.main:app --reload
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Create .env.local file
   cp .env.local.example .env.local
   
   # Start dev server
   npm run dev
   ```

4. **Verify Setup**
   - Backend: http://localhost:8000/docs
   - Frontend: http://localhost:3000

---

## Development Workflow

### Branch Strategy

```
main
├── develop          # Integration branch
├── feature/*        # New features
├── bugfix/*         # Bug fixes
├── hotfix/*         # Production hotfixes
└── release/*        # Release preparation
```

### Creating a Feature Branch

```bash
# Update your local main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ...

# Push your branch
git push -u origin feature/your-feature-name
```

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend linting
cd frontend
npm run lint
```

---

## Code Standards

### Backend (Python/FastAPI)

- **Style Guide:** PEP 8
- **Type Hints:** Required for all function signatures
- **Docstrings:** Required for public functions

```python
from typing import Optional

def create_product(
    title: str,
    price: float,
    description: Optional[str] = None
) -> dict:
    """
    Create a new product.
    
    Args:
        title: Product title (max 100 chars)
        price: Product price in INR
        description: Optional product description
        
    Returns:
        dict: Created product object
        
    Raises:
        ValidationError: If title exceeds 100 characters
    """
    pass
```

**File Organization:**
- `models/` - SQLAlchemy models
- `schemas/` - Pydantic schemas
- `routers/` - API endpoints
- `services/` - Business logic
- `utils/` - Helper functions

### Frontend (TypeScript/React)

- **Style Guide:** ESLint configuration
- **Components:** Functional components with TypeScript
- **Naming:** PascalCase for components, camelCase for functions

```tsx
interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
}

export function ProductCard({ 
  id, 
  title, 
  price, 
  imageUrl 
}: ProductCardProps) {
  return (
    <div className="rounded-lg border p-4">
      {/* ... */}
    </div>
  );
}
```

**File Organization:**
- `app/` - Next.js pages and layouts
- `components/` - Reusable components
- `components/ui/` - UI primitives
- `lib/` - Utilities and API client
- `store/` - Zustand stores

### CSS/Styling

- Use **Tailwind CSS** utility classes
- Follow the design system in `brand-guidelines.md`
- Use CSS variables for theming

```tsx
// ✅ Good
<button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800">
  Add to Cart
</button>

// ❌ Bad - Inline styles
<button style={{ backgroundColor: 'black', color: 'white' }}>
  Add to Cart
</button>
```

---

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, semicolons) |
| `refactor` | Code refactoring |
| `test` | Adding tests |
| `chore` | Maintenance tasks |

### Examples

```bash
# Feature
git commit -m "feat(cart): add persistent cart functionality"

# Bug fix
git commit -m "fix(auth): resolve JWT token expiration issue"

# Documentation
git commit -m "docs(api): add cart endpoints documentation"

# Refactoring
git commit -m "refactor(products): extract product service from router"
```

### Best Practices

1. **Atomic commits:** One logical change per commit
2. **Present tense:** "Add feature" not "Added feature"
3. **Imperative mood:** "Fix bug" not "Fixes bug"
4. **Line length:** Subject < 50 chars, body < 72 chars per line

---

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] Tests added/updated
- [ ] Documentation updated if needed
- [ ] No console.log or debug statements
- [ ] Branch is up to date with main

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Steps to test the changes:
1. ...
2. ...

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed
- [ ] Tests pass
- [ ] Documentation updated
```

### Review Process

1. Submit PR with description
2. Automated checks must pass
3. At least 1 reviewer approval required
4. Address review feedback
5. Squash and merge

---

## Questions?

If you have questions about contributing:
1. Check existing issues and documentation
2. Open a new issue with the `question` label
3. Reach out to maintainers

---

Thank you for contributing to Hive! 🐝
