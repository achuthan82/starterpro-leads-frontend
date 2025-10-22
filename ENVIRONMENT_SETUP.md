# Environment Configuration Guide

This guide explains how to configure environment variables for the AegisSuite application.

## Quick Setup

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file** with your desired configuration:
   ```bash
   # AegisSuite API Configuration
   VITE_API_BASE_URL=https://shieldnest-backend-staging-437a38552d5f.herokuapp.com
   
   # Environment
   VITE_NODE_ENV=development
   
   # API Configuration
   VITE_API_TIMEOUT=30000
   ```

3. **Restart your development server** for changes to take effect:
   ```bash
   npm run dev
   ```

## Environment Variables

### Required Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | Staging URL | `https://shieldnest-backend-staging-437a38552d5f.herokuapp.com` |

### Optional Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_NODE_ENV` | Environment mode | `development` | `development`, `production` |
| `VITE_API_TIMEOUT` | API request timeout (ms) | `30000` | `30000` |

## Available Environments

### Staging Environment
```bash
VITE_API_BASE_URL=https://shieldnest-backend-staging-437a38552d5f.herokuapp.com
```
- **Purpose**: Development and testing
- **Features**: Latest features, may be unstable
- **Data**: Test data, safe to experiment

### Production Environment
```bash
VITE_API_BASE_URL=https://shieldnest-backend-production-cfedfcca08b0.herokuapp.com
```
- **Purpose**: Live application
- **Features**: Stable, tested features only
- **Data**: Real user data, handle with care

## Security Considerations

1. **Never commit `.env` files** to version control
   - The `.env` file is already in `.gitignore`
   - Use `.env.example` for documenting required variables

2. **Use environment-specific files** for different deployments:
   - `.env.development` - Development environment
   - `.env.staging` - Staging environment  
   - `.env.production` - Production environment

3. **Validate environment variables** in your application:
   ```javascript
   if (!import.meta.env.VITE_API_BASE_URL) {
     throw new Error('VITE_API_BASE_URL environment variable is required');
   }
   ```

## Vite Environment Variables

This project uses Vite, which has specific requirements for environment variables:

1. **Prefix**: All environment variables must be prefixed with `VITE_` to be accessible in the client code
2. **Access**: Use `import.meta.env.VARIABLE_NAME` to access variables
3. **Build time**: Variables are replaced at build time, not runtime

### Example Usage
```javascript
// ✅ Correct - accessible in client code
const apiUrl = import.meta.env.VITE_API_BASE_URL;

// ❌ Incorrect - not accessible (no VITE_ prefix)
const secret = import.meta.env.SECRET_KEY;
```

## Troubleshooting

### Variables not loading
1. Ensure variable names start with `VITE_`
2. Restart the development server after changing `.env`
3. Check that `.env` is in the root directory (same level as `package.json`)

### API connection issues
1. Verify the `VITE_API_BASE_URL` is correct
2. Check network connectivity to the API endpoint
3. Ensure the API server is running and accessible

### Build issues
1. Make sure all required environment variables are defined
2. Check for typos in variable names
3. Verify the `.env` file format (no spaces around `=`)

## Best Practices

1. **Document all variables** in `.env.example`
2. **Use descriptive names** for environment variables
3. **Provide sensible defaults** in your code
4. **Validate required variables** at application startup
5. **Keep sensitive data secure** - never log or expose API keys

## Development Workflow

1. **Local Development**: Use `.env` with staging API
2. **Testing**: Use `.env.test` with test data
3. **Staging Deployment**: Use staging environment variables
4. **Production Deployment**: Use production environment variables

Remember to always test your configuration changes in a development environment before deploying to production! 