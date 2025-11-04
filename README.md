# React Router Address Book

A contact management application built with React Router v7.

- [React Router Docs](https://reactrouter.com/home)

## Prerequisites

- Node.js >=20.0.0
- Yarn 4.x (configured with node_modules)

## Development

From your terminal:

```sh
yarn install  # Install dependencies
yarn dev      # Start development server
```

This starts your app in development mode, rebuilding assets on file changes.

## Code Quality & Formatting

This project uses ESLint and Prettier for code quality and consistent formatting:

```sh
yarn lint       # Check for linting errors
yarn lint:fix   # Auto-fix linting errors
yarn format     # Format all files with Prettier
yarn typecheck  # Run TypeScript type checking
```

### Code Style

- **2-space indentation** (configured in Prettier)
- **LF line endings** (Unix-style)
- **Single quotes** for strings
- **Trailing commas** where valid

### VSCode Setup

The project includes VSCode settings (`.vscode/settings.json`) that automatically:

- Format code on save with Prettier
- Fix ESLint errors on save
- Use 2-space tabs
- Convert line endings to LF
- Trim trailing whitespace

**Recommended VSCode Extensions:**

- ESLint
- Prettier - Code formatter

## Testing

This project uses Vitest and Testing Library for unit testing:

```sh
yarn test         # Run tests in watch mode
yarn test:run     # Run tests once
yarn test:coverage # Run tests with coverage report
yarn test:ui      # Run tests with Vitest UI
```

### Test Structure

- **Unit tests** for all pages and components
- **Test files** located in `__tests__` directories next to source files
- **Test utilities** in `src/test/utils.tsx` for common testing patterns
- **Happy-DOM** as the test environment for better performance

### Test Coverage

Current test coverage includes:

- ✅ **Root component** - Layout, ErrorBoundary, HydrateFallback
- ✅ **Sidebar layout** - Contact list, search functionality, navigation
- ✅ **About page** - Content rendering and navigation
- ✅ **Home page** - Content and links
- ✅ **Contact page** - Contact details, favorite functionality, forms

## Deployment

First, build your app for production:

```sh
yarn build
```

Then run the app in production mode:

```sh
yarn start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying node applications, the built-in React Router app server is production-ready.

Make sure to deploy the output of `react-router build`

- `build/server`
- `build/client`
