# Contributing to Seentics

Thank you for your interest in contributing to Seentics! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Go 1.21+
- Docker (for local development)
- Git

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/seentics/seentics.git`
3. Install dependencies:
   ```bash
   # Frontend
   cd frontend && npm install
   
   # Services
   cd services/users && npm install
   cd services/workflows && npm install
   cd services/analytics && go mod tidy
   ```
4. Set up environment variables (see `.env.example` files)
5. Start dependencies: `docker compose up -d`

## 📝 How to Contribute

### 1. Reporting Issues
- Use the issue templates
- Provide clear reproduction steps
- Include system information and logs
- Check existing issues first

### 2. Suggesting Features
- Open a feature request issue
- Describe the use case and benefits
- Consider if it fits the project scope

### 3. Submitting Code Changes
1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Add tests if applicable
4. Ensure code follows style guidelines
5. Commit with clear messages: `git commit -m "feat: add new analytics endpoint"`
6. Push and create a pull request

## 🎯 Development Guidelines

### Code Style
- **Frontend**: Follow Next.js and React best practices
- **Backend**: Use consistent naming conventions
- **Go**: Follow Go formatting standards (`go fmt`)
- **JavaScript/TypeScript**: Use Prettier and ESLint

### Testing
- Write tests for new functionality
- Ensure existing tests pass
- Test both success and error cases

### Documentation
- Update README.md if adding new features
- Document API changes
- Add inline comments for complex logic

## 🔧 Project Structure

```
Seentics/
├── frontend/                 # Next.js application
├── services/
│   ├── users/               # User management service
│   ├── analytics/           # Analytics service (Go)
│   ├── workflows/           # Workflow management service
│   └── admin/               # Admin panel service
├── docs/                    # Documentation
├── nginx/                   # Nginx configuration
└── docker-compose.yml       # Development environment
```

## 🐛 Common Issues

### Database Connection Issues
- Ensure MongoDB, TimescaleDB, and Redis are running
- Check environment variables
- Verify network connectivity

### Frontend Build Issues
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## 📞 Getting Help

- **Issues**: Use GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Documentation**: Check the docs/ directory and README files

## 🎉 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes
- Project documentation

Thank you for contributing to Seentics! 🚀
