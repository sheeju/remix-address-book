import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../home';

describe('Home Route', () => {
  it('renders the home page content', () => {
    render(<Home />);

    // Check main paragraph with correct id
    const mainParagraph = screen.getByText(/this is a demo for react router/i);
    expect(mainParagraph).toBeInTheDocument();
    expect(mainParagraph).toHaveAttribute('id', 'index-page');
  });

  it('renders the React Router documentation link', () => {
    render(<Home />);

    const docsLink = screen.getByRole('link', {
      name: /the docs at reactrouter.com/i,
    });
    expect(docsLink).toBeInTheDocument();
    expect(docsLink).toHaveAttribute('href', 'https://reactrouter.com');
  });

  it('renders line break in the content', () => {
    render(<Home />);

    const paragraph = screen.getByText(/this is a demo for react router/i);
    expect(paragraph.innerHTML).toContain('<br>');
  });

  it('has the correct text content structure', () => {
    render(<Home />);

    // Check that the text is properly structured
    const mainParagraph = screen.getByText(/this is a demo for react router/i);
    expect(mainParagraph).toBeInTheDocument();
    expect(screen.getByText(/check out/i)).toBeInTheDocument();
    expect(screen.getByText('the docs at reactrouter.com')).toBeInTheDocument();
  });
});
