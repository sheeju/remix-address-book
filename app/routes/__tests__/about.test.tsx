import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import About from '../about';

// Mock React Router Link component
vi.mock('react-router', () => ({
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

describe('About Route', () => {
  it('renders the about page container with correct id', () => {
    render(<About />);

    const aboutContainer = screen
      .getByRole('heading', { name: /about react router contacts/i })
      .closest('#about');
    expect(aboutContainer).toBeInTheDocument();
  });

  it('renders navigation link to go back to demo', () => {
    render(<About />);

    const backLink = screen.getByRole('link', { name: /← go to demo/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/');
  });

  it('renders main heading', () => {
    render(<About />);

    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading).toHaveTextContent('About React Router Contacts');
  });

  it('renders introduction paragraph', () => {
    render(<About />);

    const introParagraph = screen.getByText(
      /this is a demo application showing off/i
    );
    expect(introParagraph).toBeInTheDocument();
    expect(introParagraph).toHaveTextContent(
      /dynamic routing, nested routes, loaders, actions/i
    );
  });

  it('renders Features section', () => {
    render(<About />);

    const featuresHeading = screen.getByRole('heading', { name: /features/i });
    expect(featuresHeading).toBeInTheDocument();

    // Check features list
    expect(
      screen.getByText(/explore the demo to see how react router handles:/i)
    ).toBeInTheDocument();

    const featuresList = screen.getByRole('list');
    expect(featuresList).toBeInTheDocument();

    // Check individual features
    expect(
      screen.getByText(/data loading and mutations with loaders and actions/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/nested routing with parent\/child relationships/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/url-based routing with dynamic segments/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/pending and optimistic ui/i)).toBeInTheDocument();
  });

  it('renders Learn More section', () => {
    render(<About />);

    const learnMoreHeading = screen.getByRole('heading', {
      name: /learn more/i,
    });
    expect(learnMoreHeading).toBeInTheDocument();

    const documentationLink = screen.getByRole('link', {
      name: /reactrouter.com/i,
    });
    expect(documentationLink).toBeInTheDocument();
    expect(documentationLink).toHaveAttribute(
      'href',
      'https://reactrouter.com'
    );
  });

  it('has proper heading hierarchy', () => {
    render(<About />);

    const headings = screen.getAllByRole('heading');
    expect(headings).toHaveLength(3);

    // Check heading levels
    expect(headings[0]).toHaveTextContent('About React Router Contacts');
    expect(headings[1]).toHaveTextContent('Features');
    expect(headings[2]).toHaveTextContent('Learn More');
  });

  it('renders all feature list items', () => {
    render(<About />);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(4);

    const expectedFeatures = [
      /data loading and mutations with loaders and actions/i,
      /nested routing with parent\/child relationships/i,
      /url-based routing with dynamic segments/i,
      /pending and optimistic ui/i,
    ];

    expectedFeatures.forEach((feature, index) => {
      expect(listItems[index]).toHaveTextContent(feature);
    });
  });

  it('contains links to external resources', () => {
    render(<About />);

    const externalLinks = screen
      .getAllByRole('link')
      .filter(link => link.getAttribute('href')?.startsWith('http'));

    expect(externalLinks).toHaveLength(1);
    expect(externalLinks[0]).toHaveAttribute('href', 'https://reactrouter.com');
  });
});
