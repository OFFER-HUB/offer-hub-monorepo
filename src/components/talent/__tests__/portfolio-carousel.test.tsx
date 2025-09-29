import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PortfolioCarousel from '../talents/Portfolio';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock ProgressiveImage component
jest.mock('@/components/ui/progressive-image', () => {
  return function MockProgressiveImage({ src, alt, ...props }: any) {
    return (
      <img
        src={src}
        alt={alt}
        data-testid="progressive-image"
        {...props}
      />
    );
  };
});

// Mock portfolio items
const mockItems = [
  {
    id: '1',
    title: 'E-commerce Website',
    description: 'Modern e-commerce platform',
    date: 'January 2024',
    image: 'https://example.com/project1.jpg',
  },
  {
    id: '2',
    title: 'Mobile App',
    description: 'Fitness tracking app',
    date: 'February 2024',
    image: 'https://example.com/project2.jpg',
  },
  {
    id: '3',
    title: 'Dashboard Design',
    description: 'Analytics dashboard',
    date: 'March 2024',
    image: 'https://example.com/project3.jpg',
  },
  {
    id: '4',
    title: 'Landing Page',
    description: 'Marketing landing page',
    date: 'April 2024',
    image: 'https://example.com/project4.jpg',
  },
  {
    id: '5',
    title: 'API Integration',
    description: 'Third-party API integration',
    date: 'May 2024',
    image: 'https://example.com/project5.jpg',
  },
  {
    id: '6',
    title: 'Database Design',
    description: 'Database architecture',
    date: 'June 2024',
    image: 'https://example.com/project6.jpg',
  },
  {
    id: '7',
    title: 'Security Audit',
    description: 'Application security audit',
    date: 'July 2024',
    image: 'https://example.com/project7.jpg',
  },
];

describe('PortfolioCarousel with Progressive Loading', () => {
  const defaultProps = {
    items: mockItems,
    itemsPerPage: 6,
    talentId: 'talent-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders portfolio items with progressive images', () => {
    render(<PortfolioCarousel {...defaultProps} />);
    
    // Check that progressive images are rendered
    const progressiveImages = screen.getAllByTestId('progressive-image');
    expect(progressiveImages).toHaveLength(6); // First 6 items
    
    // Check image sources
    expect(progressiveImages[0]).toHaveAttribute('src', 'https://example.com/project1.jpg');
    expect(progressiveImages[1]).toHaveAttribute('src', 'https://example.com/project2.jpg');
  });

  it('uses placeholder when image is not provided', () => {
    const itemsWithMissingImages = [
      { ...mockItems[0], image: undefined },
      { ...mockItems[1], image: '' },
    ];
    
    render(<PortfolioCarousel {...defaultProps} items={itemsWithMissingImages} />);
    
    const progressiveImages = screen.getAllByTestId('progressive-image');
    expect(progressiveImages[0]).toHaveAttribute('src', '/placeholder.svg');
    expect(progressiveImages[1]).toHaveAttribute('src', '/placeholder.svg');
  });

  it('navigates to project detail when item is clicked', () => {
    render(<PortfolioCarousel {...defaultProps} />);
    
    const firstProject = screen.getByText('E-commerce Website').closest('[class*="cursor-pointer"]');
    fireEvent.click(firstProject!);
    
    expect(mockPush).toHaveBeenCalledWith('/talent/talent-123/portfolio/1');
  });

  it('handles pagination correctly', () => {
    render(<PortfolioCarousel {...defaultProps} />);
    
    // Initially shows first 6 items
    expect(screen.getByText('E-commerce Website')).toBeInTheDocument();
    expect(screen.getByText('Database Design')).toBeInTheDocument();
    expect(screen.queryByText('Security Audit')).not.toBeInTheDocument();
    
    // Click next button
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Should show the 7th item
    expect(screen.getByText('Security Audit')).toBeInTheDocument();
    expect(screen.queryByText('E-commerce Website')).not.toBeInTheDocument();
  });

  it('disables back button on first page', () => {
    render(<PortfolioCarousel {...defaultProps} />);
    
    const backButton = screen.getByText('Back');
    expect(backButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<PortfolioCarousel {...defaultProps} />);
    
    // Go to last page
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Next button should be disabled
    expect(nextButton).toBeDisabled();
  });

  it('shows correct page indicators', () => {
    render(<PortfolioCarousel {...defaultProps} />);
    
    // Should have 2 pages (7 items, 6 per page)
    const indicators = screen.getAllByRole('button', { hidden: true });
    const pageIndicators = indicators.filter(button => 
      button.className.includes('w-2 h-2 rounded-full')
    );
    
    expect(pageIndicators).toHaveLength(2);
  });

  it('navigates to specific page when indicator is clicked', () => {
    render(<PortfolioCarousel {...defaultProps} />);
    
    // Click second page indicator
    const indicators = screen.getAllByRole('button', { hidden: true });
    const secondPageIndicator = indicators.find(button => 
      button.className.includes('w-2 h-2 rounded-full') && 
      button.className.includes('bg-gray-300')
    );
    
    fireEvent.click(secondPageIndicator!);
    
    // Should show items from second page
    expect(screen.getByText('Security Audit')).toBeInTheDocument();
  });

  it('applies hover effects to images', () => {
    render(<PortfolioCarousel {...defaultProps} />);
    
    const progressiveImages = screen.getAllByTestId('progressive-image');
    progressiveImages.forEach(image => {
      expect(image).toHaveClass(
        'transform',
        'transition-transform',
        'duration-300',
        'ease-in-out',
        'hover:scale-110'
      );
    });
  });

  it('handles empty items array', () => {
    render(<PortfolioCarousel {...defaultProps} items={[]} />);
    
    // Should not crash and should not show any images
    expect(screen.queryByTestId('progressive-image')).not.toBeInTheDocument();
  });

  it('shows correct number of items per page', () => {
    render(<PortfolioCarousel {...defaultProps} itemsPerPage={3} />);
    
    const progressiveImages = screen.getAllByTestId('progressive-image');
    expect(progressiveImages).toHaveLength(3);
  });

  it('displays project titles and dates', () => {
    render(<PortfolioCarousel {...defaultProps} />);
    
    expect(screen.getByText('E-commerce Website')).toBeInTheDocument();
    expect(screen.getByText('January 2024')).toBeInTheDocument();
    expect(screen.getByText('Mobile App')).toBeInTheDocument();
    expect(screen.getByText('February 2024')).toBeInTheDocument();
  });

  it('applies correct styling to container', () => {
    render(<PortfolioCarousel {...defaultProps} />);
    
    const container = screen.getByText('Portfolio').closest('div');
    expect(container).toHaveClass('bg-gray-50', 'p-6', 'border');
  });

  it('handles custom title', () => {
    render(<PortfolioCarousel {...defaultProps} title="Custom Portfolio" />);
    
    expect(screen.getByText('Custom Portfolio')).toBeInTheDocument();
  });
});
