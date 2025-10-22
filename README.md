# AegisSuite Frontend Application

A modern React application for the AegisSuite insurance platform, built with Vite for optimal development experience and performance.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your API configuration (see [Environment Setup](#environment-setup))

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

## Environment Setup

This application uses environment variables for configuration. See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed instructions.

### Quick Configuration
```bash
# .env
VITE_API_BASE_URL=https://shieldnest-backend-staging-437a38552d5f.herokuapp.com
VITE_NODE_ENV=development
VITE_API_TIMEOUT=30000
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically

## Project Structure

```
src/
├── app/                    # Application components
│   ├── contexts/          # React contexts
│   ├── layouts/           # Layout components
│   ├── pages/             # Page components
│   └── router/            # Routing configuration
├── components/            # Reusable UI components
├── configs/               # Configuration files
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions and API services
└── styles/                # Global styles and CSS
```

## Key Features

- **Modern React**: Built with React 18 and functional components
- **Vite**: Fast development and optimized builds
- **Environment Configuration**: Secure API configuration via environment variables
- **API Integration**: Comprehensive API service layer
- **Authentication**: JWT-based authentication system
- **Responsive Design**: Mobile-first responsive UI
- **Component Library**: Reusable UI components

## API Integration

The application integrates with the AegisSuite backend API. See [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) for detailed API usage instructions.

## Security

- Environment variables are used for all sensitive configuration
- API tokens are securely stored and managed
- CORS is properly configured for API communication

## Development

This template uses:

- **[@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md)** - Uses [Babel](https://babeljs.io/) for Fast Refresh
- **[@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc)** - Alternative using [SWC](https://swc.rs/) for Fast Refresh

## Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set production environment variables** in your deployment platform

3. **Deploy the `dist` folder** to your hosting service

## Troubleshooting

- **API Connection Issues**: Check your `VITE_API_BASE_URL` in `.env`
- **Environment Variables Not Loading**: Ensure variables start with `VITE_` and restart dev server
- **Build Issues**: Verify all required environment variables are set

For more detailed troubleshooting, see [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)
