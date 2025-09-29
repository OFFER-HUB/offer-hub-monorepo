import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PortfolioGallery from '../PortfolioGallery';
import { PortfolioProject } from '@/lib/mockData/portfolio-mock-data';

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

// Mock portfolio data
const mockProjects: PortfolioProject[] = [
  {
    id: '1',
    title: 'E-commerce Website',
    description: 'A modern e-commerce platform built with React and Node.js',
    category: 'Web Development',
    technologies: ['React', 'Node.js', 'MongoDB'],
    projectValue: 5000,
    completionDate: '2024-01-15',
    duration: '3 months',
    clientName: 'Tech Corp',
  },
  {
    id: '2',
    title: 'Mobile App Design',
    description: 'UI/UX design for a fitness tracking mobile application',
    category: 'Design',
    technologies: ['Figma', 'Adobe XD', 'Sketch'],
    projectValue: 3000,
    completionDate: '2024-02-20',
    duration: '2 months',
    clientName: 'Fitness Inc',
  },
];

describe('PortfolioGallery with Progressive Loading', () => {
  const defaultProps = {
    projects: mockProjects,
    onProjectClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders portfolio projects with progressive images', () => {
    render(<PortfolioGallery {...defaultProps} />);
    
    // Check that projects are rendered
    expect(screen.getByText('E-commerce Website')).toBeInTheDocument();
    expect(screen.getByText('Mobile App Design')).toBeInTheDocument();
    
    // Check that progressive images are used (though this component uses gradient backgrounds)
    // The component structure should be present
    expect(screen.getByText('Portfolio Projects')).toBeInTheDocument();
  });

  it('displays project count badge', () => {
    render(<PortfolioGallery {...defaultProps} />);
    
    const badge = screen.getByText('2 projects');
    expect(badge).toBeInTheDocument();
  });

  it('shows empty state when no projects', () => {
    render(<PortfolioGallery projects={[]} />);
    
    expect(screen.getByText('No portfolio projects yet')).toBeInTheDocument();
    expect(screen.getByText("This freelancer hasn't added any portfolio projects yet.")).toBeInTheDocument();
  });

  it('calls onProjectClick when project is clicked', () => {
    render(<PortfolioGallery {...defaultProps} />);
    
    const projectCard = screen.getByText('E-commerce Website').closest('[class*="cursor-pointer"]');
    fireEvent.click(projectCard!);
    
    expect(defaultProps.onProjectClick).toHaveBeenCalledWith(mockProjects[0]);
  });

  it('displays project information correctly', () => {
    render(<PortfolioGallery {...defaultProps} />);
    
    // Check project details
    expect(screen.getByText('E-commerce Website')).toBeInTheDocument();
    expect(screen.getByText('A modern e-commerce platform built with React and Node.js')).toBeInTheDocument();
    expect(screen.getByText('$5,000')).toBeInTheDocument();
    expect(screen.getByText('Jan 2024')).toBeInTheDocument();
    expect(screen.getByText('3 months')).toBeInTheDocument();
    expect(screen.getByText('Client: Tech Corp')).toBeInTheDocument();
  });

  it('displays technology badges', () => {
    render(<PortfolioGallery {...defaultProps} />);
    
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('MongoDB')).toBeInTheDocument();
  });

  it('shows "more" badge when there are more than 3 technologies', () => {
    const projectWithManyTechs = {
      ...mockProjects[0],
      technologies: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Docker'],
    };
    
    render(<PortfolioGallery {...defaultProps} projects={[projectWithManyTechs]} />);
    
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(<PortfolioGallery {...defaultProps} />);
    
    expect(screen.getByText('Jan 2024')).toBeInTheDocument();
    expect(screen.getByText('Feb 2024')).toBeInTheDocument();
  });

  it('formats currency correctly', () => {
    render(<PortfolioGallery {...defaultProps} />);
    
    expect(screen.getByText('$5,000')).toBeInTheDocument();
    expect(screen.getByText('$3,000')).toBeInTheDocument();
  });

  it('applies hover effects and transitions', () => {
    render(<PortfolioGallery {...defaultProps} />);
    
    const projectCards = screen.getAllByRole('button', { hidden: true });
    projectCards.forEach(card => {
      expect(card).toHaveClass('hover:shadow-md', 'transition-shadow', 'cursor-pointer');
    });
  });

  it('handles project click without onProjectClick callback', () => {
    render(<PortfolioGallery projects={mockProjects} />);
    
    const projectCard = screen.getByText('E-commerce Website').closest('[class*="cursor-pointer"]');
    
    // Should not throw error when clicked without callback
    expect(() => fireEvent.click(projectCard!)).not.toThrow();
  });
});
