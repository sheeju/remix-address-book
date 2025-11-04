import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact from '../contact';

// Mock React Router hooks and components
const mockUseFetcher = vi.fn();
const mockConfirm = vi.fn();

vi.mock('react-router', () => ({
  Form: ({ children, action, method, onSubmit, ...props }: any) => (
    <form
      data-action={action}
      data-method={method}
      onSubmit={onSubmit}
      {...props}
    >
      {children}
    </form>
  ),
  useFetcher: () => mockUseFetcher(),
}));

// Mock global confirm
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
});

describe('Contact Route', () => {
  const mockContact = {
    id: '1',
    first: 'John',
    last: 'Doe',
    email: 'john@example.com',
    phone: '555-1234',
    avatar: 'https://example.com/avatar.jpg',
    twitter: 'johndoe',
    favorite: false,
    notes: 'This is a test contact with notes.',
    createdAt: Date.now(),
  };

  const mockLoaderData = {
    contact: mockContact,
  };

  beforeEach(() => {
    mockUseFetcher.mockReturnValue({
      Form: ({ children, method, ...props }: any) => (
        <form data-method={method} {...props}>
          {children}
        </form>
      ),
      formData: null,
    });
    mockConfirm.mockClear();
  });

  it('renders contact information correctly', () => {
    render(<Contact loaderData={mockLoaderData} />);

    // Check container
    const contactContainer = screen
      .getByRole('heading', { name: /john doe/i })
      .closest('#contact');
    expect(contactContainer).toBeInTheDocument();

    // Check contact name
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'John Doe'
    );

    // Check avatar
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(avatar).toHaveAttribute('alt', 'John Doe avatar');

    // Check twitter link
    const twitterLink = screen.getByRole('link', { name: /johndoe/i });
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/johndoe');

    // Check notes
    expect(
      screen.getByText('This is a test contact with notes.')
    ).toBeInTheDocument();
  });

  it('renders "No Name" when contact has no first or last name', () => {
    const contactWithNoName = {
      ...mockContact,
      first: '',
      last: '',
    };

    render(<Contact loaderData={{ contact: contactWithNoName }} />);

    expect(screen.getByText('No Name')).toBeInTheDocument();
  });

  it('does not render twitter link when twitter is not provided', () => {
    const contactWithoutTwitter = {
      ...mockContact,
      twitter: '',
    };

    render(<Contact loaderData={{ contact: contactWithoutTwitter }} />);

    expect(
      screen.queryByRole('link', { name: /twitter/i })
    ).not.toBeInTheDocument();
  });

  it('does not render notes when notes are empty', () => {
    const contactWithoutNotes = {
      ...mockContact,
      notes: '',
    };

    render(<Contact loaderData={{ contact: contactWithoutNotes }} />);

    expect(
      screen.queryByText('This is a test contact with notes.')
    ).not.toBeInTheDocument();
  });

  it('renders Edit button with correct form action', () => {
    render(<Contact loaderData={mockLoaderData} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeInTheDocument();

    const editForm = editButton.closest('form');
    expect(editForm).toHaveAttribute('data-action', 'edit');
  });

  it('renders Delete button with correct form action and method', () => {
    render(<Contact loaderData={mockLoaderData} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeInTheDocument();

    const deleteForm = deleteButton.closest('form');
    expect(deleteForm).toHaveAttribute('data-action', 'destroy');
    expect(deleteForm).toHaveAttribute('data-method', 'post');
  });

  it('shows confirmation dialog when delete button is clicked', async () => {
    mockConfirm.mockReturnValue(true);
    const user = userEvent.setup();

    render(<Contact loaderData={mockLoaderData} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalledWith(
      'Please confirm you want to delete this record.'
    );
  });

  it('prevents form submission when delete is cancelled', () => {
    mockConfirm.mockReturnValue(false);

    render(<Contact loaderData={mockLoaderData} />);

    const deleteForm = screen
      .getByRole('button', { name: /delete/i })
      .closest('form')!;
    const mockPreventDefault = vi.fn();

    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(submitEvent, 'preventDefault', {
      value: mockPreventDefault,
    });

    fireEvent.submit(deleteForm, submitEvent);

    expect(mockConfirm).toHaveBeenCalled();
    expect(mockPreventDefault).toHaveBeenCalled();
  });

  describe('Favorite Component', () => {
    it('renders unfavorite star when contact is not favorite', () => {
      render(<Contact loaderData={mockLoaderData} />);

      const favoriteButton = screen.getByRole('button', {
        name: /add to favorites/i,
      });
      expect(favoriteButton).toBeInTheDocument();
      expect(favoriteButton).toHaveTextContent('☆');
      expect(favoriteButton).toHaveAttribute('value', 'true');
    });

    it('renders favorite star when contact is favorite', () => {
      const favoriteContact = {
        ...mockContact,
        favorite: true,
      };

      render(<Contact loaderData={{ contact: favoriteContact }} />);

      const favoriteButton = screen.getByRole('button', {
        name: /remove from favorites/i,
      });
      expect(favoriteButton).toBeInTheDocument();
      expect(favoriteButton).toHaveTextContent('★');
      expect(favoriteButton).toHaveAttribute('value', 'false');
    });

    it('uses fetcher form data when available', () => {
      const mockFetcherData = new FormData();
      mockFetcherData.append('favorite', 'true');

      mockUseFetcher.mockReturnValue({
        Form: ({ children, method, ...props }: any) => (
          <form data-method={method} {...props}>
            {children}
          </form>
        ),
        formData: mockFetcherData,
      });

      render(<Contact loaderData={mockLoaderData} />);

      // Should show favorite star even though contact.favorite is false
      const favoriteButton = screen.getByRole('button', {
        name: /remove from favorites/i,
      });
      expect(favoriteButton).toHaveTextContent('★');
    });

    it('favorite button has correct name attribute', () => {
      render(<Contact loaderData={mockLoaderData} />);

      const favoriteButton = screen.getByRole('button', {
        name: /add to favorites/i,
      });
      expect(favoriteButton).toHaveAttribute('name', 'favorite');
    });

    it('favorite form uses POST method', () => {
      render(<Contact loaderData={mockLoaderData} />);

      const favoriteButton = screen.getByRole('button', {
        name: /add to favorites/i,
      });
      const favoriteForm = favoriteButton.closest('form');
      expect(favoriteForm).toHaveAttribute('data-method', 'post');
    });
  });
});
