import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import type { ReactElement } from 'react';

// Mock data for tests
export const mockContacts = [
  {
    id: '1',
    first: 'John',
    last: 'Doe',
    email: 'john@example.com',
    phone: '555-1234',
    avatar: null,
    favorite: false,
    notes: 'Test contact',
    createdAt: Date.now(),
  },
  {
    id: '2',
    first: 'Jane',
    last: 'Smith',
    email: 'jane@example.com',
    phone: '555-5678',
    avatar: null,
    favorite: true,
    notes: 'Another test contact',
    createdAt: Date.now(),
  },
];

// Helper to render components with React Router context
export function renderWithRouter(
  ui: ReactElement,
  { initialEntries = ['/'], ...options } = {}
) {
  const router = createMemoryRouter(
    [
      {
        path: '*',
        element: ui,
      },
    ],
    {
      initialEntries,
    }
  );

  return render(<RouterProvider router={router} />, options);
}

// Mock loader data
export const mockLoaderData = {
  contacts: mockContacts,
  q: null,
};
