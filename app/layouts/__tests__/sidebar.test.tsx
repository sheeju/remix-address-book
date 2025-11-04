import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SidebarLayout from '../sidebar';
import { mockContacts } from '../../../src/test/utils';

// Mock React Router hooks
const mockSubmit = vi.fn();
const mockNavigation = {
  state: 'idle',
  location: null,
};

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useSubmit: () => mockSubmit,
    useNavigation: () => mockNavigation,
    Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
    NavLink: ({ children, to, className, ...props }: any) => {
      const activeClass =
        typeof className === 'function'
          ? className({ isActive: false, isPending: false })
          : className;
      return (
        <a href={to} className={activeClass} {...props}>
          {children}
        </a>
      );
    },
    Outlet: () => <div data-testid="outlet">Route Content</div>,
  };
});

describe('SidebarLayout', () => {
  const mockLoaderData = {
    contacts: mockContacts,
    q: null,
  };

  beforeEach(() => {
    mockSubmit.mockClear();
  });

  it('renders sidebar with title and search form', () => {
    render(<SidebarLayout loaderData={mockLoaderData} />);

    // Check title
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /react router contacts/i })
    ).toHaveAttribute('href', 'about');

    // Check search form
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toHaveAttribute(
      'placeholder',
      'Search'
    );
    expect(screen.getByRole('searchbox')).toHaveAttribute('name', 'q');

    // Check New button
    expect(screen.getByRole('button', { name: /new/i })).toBeInTheDocument();
  });

  it('renders contact list when contacts exist', () => {
    render(<SidebarLayout loaderData={mockLoaderData} />);

    // Check navigation
    expect(screen.getByRole('navigation')).toBeInTheDocument();

    // Check contact links
    expect(screen.getByRole('link', { name: /john doe/i })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /jane smith/i })
    ).toBeInTheDocument();

    // Check favorite star for Jane Smith
    expect(screen.getByText('★')).toBeInTheDocument();
  });

  it('renders "No contacts" message when contacts array is empty', () => {
    const emptyLoaderData = {
      contacts: [],
      q: null,
    };

    render(<SidebarLayout loaderData={emptyLoaderData} />);

    expect(screen.getByText(/no contacts/i)).toBeInTheDocument();
  });

  it('renders contact with "No Name" when contact has no first or last name', () => {
    const contactsWithNoName = [
      {
        id: '3',
        first: '',
        last: '',
        email: 'noname@example.com',
        phone: '555-0000',
        avatar: null,
        favorite: false,
        notes: '',
        createdAt: Date.now(),
      },
    ];

    const loaderDataWithNoName = {
      contacts: contactsWithNoName,
      q: null,
    };

    render(<SidebarLayout loaderData={loaderDataWithNoName} />);

    expect(screen.getByText(/no name/i)).toBeInTheDocument();
  });

  it('initializes search input with query from loader data', () => {
    const loaderDataWithQuery = {
      ...mockLoaderData,
      q: 'john',
    };

    render(<SidebarLayout loaderData={loaderDataWithQuery} />);

    expect(screen.getByRole('searchbox')).toHaveValue('john');
  });

  it('updates search input value when user types', async () => {
    const user = userEvent.setup();
    render(<SidebarLayout loaderData={mockLoaderData} />);

    const searchInput = screen.getByRole('searchbox');

    await user.type(searchInput, 'test query');

    expect(searchInput).toHaveValue('test query');
  });

  it('submits form when user types in search input', async () => {
    const user = userEvent.setup();
    render(<SidebarLayout loaderData={mockLoaderData} />);

    const searchInput = screen.getByRole('searchbox');

    await user.type(searchInput, 'j');

    expect(mockSubmit).toHaveBeenCalled();
  });

  it('shows loading state on search input when searching', () => {
    // Mock navigation state for searching
    const searchingNavigation = {
      state: 'loading',
      location: {
        search: '?q=john',
        pathname: '/',
      },
    };

    vi.mocked(vi.importActual('react-router')).useNavigation = () =>
      searchingNavigation;

    render(<SidebarLayout loaderData={mockLoaderData} />);

    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toHaveClass('loading');
  });

  it('shows search spinner when searching', () => {
    // Mock navigation state for searching
    const searchingNavigation = {
      state: 'loading',
      location: {
        search: '?q=john',
        pathname: '/',
      },
    };

    vi.mocked(vi.importActual('react-router')).useNavigation = () =>
      searchingNavigation;

    render(<SidebarLayout loaderData={mockLoaderData} />);

    const spinner = screen.getByRole('generic', { hidden: true });
    expect(spinner).toHaveAttribute('id', 'search-spinner');
    expect(spinner).not.toHaveAttribute('hidden');
  });

  it('applies loading class to detail section when navigating', () => {
    // Mock navigation state for loading
    const loadingNavigation = {
      state: 'loading',
      location: null,
    };

    vi.mocked(vi.importActual('react-router')).useNavigation = () =>
      loadingNavigation;

    render(<SidebarLayout loaderData={mockLoaderData} />);

    const detailSection = screen.getByTestId('outlet').parentElement;
    expect(detailSection).toHaveClass('loading');
  });

  it('renders outlet for nested routes', () => {
    render(<SidebarLayout loaderData={mockLoaderData} />);

    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.getByText('Route Content')).toBeInTheDocument();
  });

  it('contact links have correct href attributes', () => {
    render(<SidebarLayout loaderData={mockLoaderData} />);

    expect(screen.getByRole('link', { name: /john doe/i })).toHaveAttribute(
      'href',
      'contacts/1'
    );
    expect(screen.getByRole('link', { name: /jane smith/i })).toHaveAttribute(
      'href',
      'contacts/2'
    );
  });
});
