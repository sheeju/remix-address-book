import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { isRouteErrorResponse } from 'react-router';
import { App, Layout, ErrorBoundary, HydrateFallback } from '../root';

// Mock React Router
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Outlet Content</div>,
    Scripts: () => <div data-testid="scripts">Scripts</div>,
    ScrollRestoration: () => (
      <div data-testid="scroll-restoration">ScrollRestoration</div>
    ),
    isRouteErrorResponse: vi.fn(),
  };
});

// Mock CSS import
vi.mock('../app.css?url', () => ({
  default: '/app.css',
}));

describe('Root Components', () => {
  describe('App', () => {
    it('renders Outlet component', () => {
      render(<App />);
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
      expect(screen.getByText('Outlet Content')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('renders HTML document structure with children', () => {
      render(
        <Layout>
          <div data-testid="children">Test Children</div>
        </Layout>
      );

      // Check HTML structure
      const html = document.documentElement;
      expect(html).toHaveAttribute('lang', 'en');

      // Check meta tags
      const charsetMeta = document.querySelector('meta[charset]');
      expect(charsetMeta).toHaveAttribute('charset', 'utf-8');

      const viewportMeta = document.querySelector('meta[name="viewport"]');
      expect(viewportMeta).toHaveAttribute(
        'content',
        'width=device-width, initial-scale=1'
      );

      // Check stylesheet link
      const stylesheetLink = document.querySelector('link[rel="stylesheet"]');
      expect(stylesheetLink).toHaveAttribute('href', '/app.css');

      // Check children are rendered
      expect(screen.getByTestId('children')).toBeInTheDocument();
      expect(screen.getByText('Test Children')).toBeInTheDocument();

      // Check React Router components
      expect(screen.getByTestId('scroll-restoration')).toBeInTheDocument();
      expect(screen.getByTestId('scripts')).toBeInTheDocument();
    });
  });

  describe('ErrorBoundary', () => {
    const mockIsRouteErrorResponse = vi.mocked(isRouteErrorResponse);

    beforeEach(() => {
      mockIsRouteErrorResponse.mockReset();
    });

    it('renders 404 error when route error response with 404 status', () => {
      const error = { status: 404, statusText: 'Not Found' };
      mockIsRouteErrorResponse.mockReturnValue(true);

      render(<ErrorBoundary error={error} />);

      expect(screen.getByRole('main')).toHaveAttribute('id', 'error-page');
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        '404'
      );
      expect(
        screen.getByText('The requested page could not be found.')
      ).toBeInTheDocument();
    });

    it('renders generic error when route error response with non-404 status', () => {
      const error = { status: 500, statusText: 'Internal Server Error' };
      mockIsRouteErrorResponse.mockReturnValue(true);

      render(<ErrorBoundary error={error} />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Error'
      );
      expect(screen.getByText('Internal Server Error')).toBeInTheDocument();
    });

    it('renders fallback statusText when statusText is empty', () => {
      const error = { status: 500, statusText: '' };
      mockIsRouteErrorResponse.mockReturnValue(true);

      render(<ErrorBoundary error={error} />);

      expect(
        screen.getByText('An unexpected error occurred.')
      ).toBeInTheDocument();
    });

    it('renders error details in development mode', () => {
      const error = new Error('Test error message');
      error.stack = 'Error stack trace';
      mockIsRouteErrorResponse.mockReturnValue(false);

      // Mock development environment
      vi.stubGlobal('import.meta', { env: { DEV: true } });

      render(<ErrorBoundary error={error} />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Oops!'
      );
      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(screen.getByText('Error stack trace')).toBeInTheDocument();

      vi.unstubAllGlobals();
    });

    it('renders generic error in production mode', () => {
      const error = new Error('Test error message');
      mockIsRouteErrorResponse.mockReturnValue(false);

      // Mock production environment
      vi.stubGlobal('import.meta', { env: { DEV: false } });

      render(<ErrorBoundary error={error} />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Oops!'
      );
      expect(
        screen.getByText('An unexpected error occurred.')
      ).toBeInTheDocument();
      expect(screen.queryByText('Test error message')).not.toBeInTheDocument();

      vi.unstubAllGlobals();
    });
  });

  describe('HydrateFallback', () => {
    it('renders loading splash screen', () => {
      render(<HydrateFallback />);

      const loadingSplash = screen.getByText(
        'Loading, please wait...'
      ).parentElement;
      expect(loadingSplash).toHaveAttribute('id', 'loading-splash');

      const spinner = loadingSplash?.querySelector('#loading-splash-spinner');
      expect(spinner).toBeInTheDocument();

      expect(screen.getByText('Loading, please wait...')).toBeInTheDocument();
    });
  });
});
