import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserAnalytics } from '../user-analytics';
import { useUserManagement } from '@/hooks/use-user-management';
import { UserAnalytics as UserAnalyticsType } from '@/types/user-management.types';

// Mock the useUserManagement hook
jest.mock('@/hooks/use-user-management', () => ({
  useUserManagement: jest.fn()
}));

// Mock Chart.js components
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart</div>,
  Pie: () => <div data-testid="pie-chart">Pie Chart</div>
}));

const mockAnalytics: UserAnalyticsType = {
  total_users: 1000,
  active_users: 850,
  suspended_users: 50,
  pending_verification: 100,
  user_growth: [
    { month: '2024-01', count: 100 },
    { month: '2024-02', count: 150 },
    { month: '2024-03', count: 200 },
    { month: '2024-04', count: 250 },
    { month: '2024-05', count: 300 },
    { month: '2024-06', count: 350 }
  ],
  role_distribution: {
    user: 800,
    moderator: 150,
    admin: 50
  },
  verification_status: {
    verified: 700,
    pending: 200,
    rejected: 100
  },
  user_activity: {
    daily_active: 500,
    weekly_active: 750,
    monthly_active: 900
  },
  geographic_distribution: {
    'North America': 400,
    'Europe': 300,
    'Asia': 200,
    'Other': 100
  },
  registration_sources: {
    'Direct': 600,
    'Social Media': 200,
    'Referral': 150,
    'Other': 50
  },
  user_engagement: {
    average_session_duration: 25.5,
    pages_per_session: 4.2,
    bounce_rate: 0.35
  },
  churn_rate: 0.05,
  retention_rate: 0.95,
  conversion_rate: 0.15
};

const mockUseUserManagement = {
  users: [],
  loading: false,
  error: null,
  selectedUsers: [],
  filters: {},
  fetchUsers: jest.fn(),
  setFilters: jest.fn(),
  searchUsers: jest.fn(),
  getUserById: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  updateUserStatus: jest.fn(),
  updateUserRole: jest.fn(),
  updateUserVerification: jest.fn(),
  bulkOperation: jest.fn(),
  getUserAnalytics: jest.fn().mockResolvedValue(mockAnalytics),
  exportUsers: jest.fn(),
  importUsers: jest.fn(),
  selectUser: jest.fn(),
  deselectUser: jest.fn(),
  selectAllUsers: jest.fn(),
  clearSelection: jest.fn(),
  setPage: jest.fn(),
  setUsers: jest.fn()
};

describe('UserAnalytics', () => {
  beforeEach(() => {
    (useUserManagement as jest.Mock).mockReturnValue(mockUseUserManagement);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should render analytics dashboard', () => {
    render(<UserAnalytics />);

    expect(screen.getByText('User Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('User Growth')).toBeInTheDocument();
    expect(screen.getByText('Role Distribution')).toBeInTheDocument();
  });

  it('should display key metrics', () => {
    render(<UserAnalytics />);

    expect(screen.getByText('1,000')).toBeInTheDocument(); // Total users
    expect(screen.getByText('850')).toBeInTheDocument(); // Active users
    expect(screen.getByText('50')).toBeInTheDocument(); // Suspended users
    expect(screen.getByText('100')).toBeInTheDocument(); // Pending verification
  });

  it('should display user growth chart', () => {
    render(<UserAnalytics />);

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByText('User Growth Over Time')).toBeInTheDocument();
  });

  it('should display role distribution chart', () => {
    render(<UserAnalytics />);

    expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    expect(screen.getByText('Role Distribution')).toBeInTheDocument();
  });

  it('should display verification status chart', () => {
    render(<UserAnalytics />);

    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByText('Verification Status')).toBeInTheDocument();
  });

  it('should display geographic distribution chart', () => {
    render(<UserAnalytics />);

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByText('Geographic Distribution')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    (useUserManagement as jest.Mock).mockReturnValue({
      ...mockUseUserManagement,
      loading: true
    });

    render(<UserAnalytics />);

    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('should show error state', () => {
    (useUserManagement as jest.Mock).mockReturnValue({
      ...mockUseUserManagement,
      error: 'Failed to fetch analytics'
    });

    render(<UserAnalytics />);

    expect(screen.getByText('Error: Failed to fetch analytics')).toBeInTheDocument();
  });

  it('should handle date range filtering', async () => {
    render(<UserAnalytics />);

    const dateFromInput = screen.getByLabelText('From Date');
    const dateToInput = screen.getByLabelText('To Date');

    fireEvent.change(dateFromInput, { target: { value: '2024-01-01' } });
    fireEvent.change(dateToInput, { target: { value: '2024-12-31' } });

    const applyButton = screen.getByText('Apply Filter');
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(mockUseUserManagement.getUserAnalytics).toHaveBeenCalled();
    });
  });

  it('should handle export analytics', async () => {
    render(<UserAnalytics />);

    const exportButton = screen.getByText('Export Analytics');
    fireEvent.click(exportButton);

    const csvOption = screen.getByText('Export as CSV');
    fireEvent.click(csvOption);

    await waitFor(() => {
      expect(mockUseUserManagement.exportUsers).toHaveBeenCalled();
    });
  });

  it('should display user engagement metrics', () => {
    render(<UserAnalytics />);

    expect(screen.getByText('User Engagement')).toBeInTheDocument();
    expect(screen.getByText('25.5 min')).toBeInTheDocument(); // Average session duration
    expect(screen.getByText('4.2')).toBeInTheDocument(); // Pages per session
    expect(screen.getByText('35%')).toBeInTheDocument(); // Bounce rate
  });

  it('should display retention metrics', () => {
    render(<UserAnalytics />);

    expect(screen.getByText('Retention & Churn')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument(); // Retention rate
    expect(screen.getByText('5%')).toBeInTheDocument(); // Churn rate
    expect(screen.getByText('15%')).toBeInTheDocument(); // Conversion rate
  });

  it('should display activity metrics', () => {
    render(<UserAnalytics />);

    expect(screen.getByText('User Activity')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument(); // Daily active
    expect(screen.getByText('750')).toBeInTheDocument(); // Weekly active
    expect(screen.getByText('900')).toBeInTheDocument(); // Monthly active
  });

  it('should handle refresh analytics', async () => {
    render(<UserAnalytics />);

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockUseUserManagement.getUserAnalytics).toHaveBeenCalled();
    });
  });

  it('should display registration sources', () => {
    render(<UserAnalytics />);

    expect(screen.getByText('Registration Sources')).toBeInTheDocument();
    expect(screen.getByText('Direct: 600')).toBeInTheDocument();
    expect(screen.getByText('Social Media: 200')).toBeInTheDocument();
    expect(screen.getByText('Referral: 150')).toBeInTheDocument();
  });

  it('should handle chart type switching', () => {
    render(<UserAnalytics />);

    const chartTypeSelect = screen.getByLabelText('Chart Type');
    fireEvent.change(chartTypeSelect, { target: { value: 'bar' } });

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('should display time period selector', () => {
    render(<UserAnalytics />);

    expect(screen.getByText('Time Period')).toBeInTheDocument();
    expect(screen.getByText('Last 7 days')).toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    expect(screen.getByText('Last 90 days')).toBeInTheDocument();
    expect(screen.getByText('Last year')).toBeInTheDocument();
  });

  it('should handle time period change', async () => {
    render(<UserAnalytics />);

    const timePeriodSelect = screen.getByLabelText('Time Period');
    fireEvent.change(timePeriodSelect, { target: { value: '30' } });

    await waitFor(() => {
      expect(mockUseUserManagement.getUserAnalytics).toHaveBeenCalled();
    });
  });

  it('should display comparison metrics', () => {
    render(<UserAnalytics />);

    expect(screen.getByText('Comparison')).toBeInTheDocument();
    expect(screen.getByText('vs Previous Period')).toBeInTheDocument();
  });

  it('should handle mobile responsive design', () => {
    // Mock window.innerWidth for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    render(<UserAnalytics />);

    expect(screen.getByText('User Analytics Dashboard')).toBeInTheDocument();
  });

  it('should display real-time updates indicator', () => {
    render(<UserAnalytics />);

    expect(screen.getByText('Real-time Data')).toBeInTheDocument();
    expect(screen.getByText('Last updated:')).toBeInTheDocument();
  });

  it('should handle analytics export in different formats', async () => {
    render(<UserAnalytics />);

    const exportButton = screen.getByText('Export Analytics');
    fireEvent.click(exportButton);

    expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    expect(screen.getByText('Export as JSON')).toBeInTheDocument();
    expect(screen.getByText('Export as PDF')).toBeInTheDocument();
  });

  it('should display trend indicators', () => {
    render(<UserAnalytics />);

    expect(screen.getByText('Trends')).toBeInTheDocument();
    expect(screen.getByText('Growth Rate')).toBeInTheDocument();
    expect(screen.getByText('User Acquisition')).toBeInTheDocument();
  });

  it('should handle data drill-down', () => {
    render(<UserAnalytics />);

    const drillDownButton = screen.getByText('View Details');
    fireEvent.click(drillDownButton);

    expect(screen.getByText('Detailed Analytics')).toBeInTheDocument();
  });
});
