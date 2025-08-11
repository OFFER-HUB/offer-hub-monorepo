import { render, screen } from '@testing-library/react';
import FreelancerProfile from '../FreelancerProfile';
import { mockFreelancerProfiles } from '@/lib/mockData/freelancer-profile-mock';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Star: ({ className }: { className?: string }) => <div data-testid="star" className={className} />,
  MapPin: ({ className }: { className?: string }) => <div data-testid="map-pin" className={className} />,
  Clock: ({ className }: { className?: string }) => <div data-testid="clock" className={className} />,
  CheckCircle: ({ className }: { className?: string }) => <div data-testid="check-circle" className={className} />,
  Award: ({ className }: { className?: string }) => <div data-testid="award" className={className} />,
  Calendar: ({ className }: { className?: string }) => <div data-testid="calendar" className={className} />,
  DollarSign: ({ className }: { className?: string }) => <div data-testid="dollar-sign" className={className} />,
  Target: ({ className }: { className?: string }) => <div data-testid="target" className={className} />,
  TrendingUp: ({ className }: { className?: string }) => <div data-testid="trending-up" className={className} />,
  User: ({ className }: { className?: string }) => <div data-testid="user" className={className} />,
  Briefcase: ({ className }: { className?: string }) => <div data-testid="briefcase" className={className} />,
}));

// Mock the window.location for testing
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/talent/1/profile',
  },
  writable: true,
});

describe('FreelancerProfile', () => {
  const mockFreelancer = mockFreelancerProfiles[0];

  it('renders freelancer profile with correct information', () => {
    render(<FreelancerProfile freelancer={mockFreelancer} />);
    
    // Check if the freelancer name is displayed
    expect(screen.getByText(mockFreelancer.name)).toBeInTheDocument();
    
    // Check if the title is displayed (in the profile header)
    expect(screen.getByText(mockFreelancer.title, { selector: 'p' })).toBeInTheDocument();
    
    // Check if the location is displayed
    expect(screen.getByText(mockFreelancer.location)).toBeInTheDocument();
    
    // Check if the hourly rate is displayed
    expect(screen.getByText(`$${mockFreelancer.hourlyRate}/hr`)).toBeInTheDocument();
  });

  it('renders skills section', () => {
    render(<FreelancerProfile freelancer={mockFreelancer} />);
    
    expect(screen.getByText('Skills')).toBeInTheDocument();
    
    // Check if some skills are displayed (in the skills section)
    mockFreelancer.skills.slice(0, 3).forEach(skill => {
      expect(screen.getAllByText(skill.name).length).toBeGreaterThan(0);
    });
  });

  it('renders experience section', () => {
    render(<FreelancerProfile freelancer={mockFreelancer} />);
    
    expect(screen.getByText('Work Experience')).toBeInTheDocument();
    
    // Check if experience items are displayed
    mockFreelancer.experience.forEach(exp => {
      expect(screen.getAllByText(exp.position).length).toBeGreaterThan(0);
      expect(screen.getByText(exp.company)).toBeInTheDocument();
    });
  });

  it('renders reviews section', () => {
    render(<FreelancerProfile freelancer={mockFreelancer} />);
    
    expect(screen.getByText('Client Reviews')).toBeInTheDocument();
    
    // Check if reviews are displayed
    mockFreelancer.reviews.forEach(review => {
      expect(screen.getByText(review.clientName)).toBeInTheDocument();
    });
  });

  it('renders navigation tabs', () => {
    render(<FreelancerProfile freelancer={mockFreelancer} />);
    
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
  });
});
