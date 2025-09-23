import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserList } from '../user-list';
import { UserProfile } from '../user-profile';
import { UserAnalytics } from '../user-analytics';
import { useUserManagement } from '@/hooks/use-user-management';
import { userManagementService } from '@/services/user-management.service';
import { UserManagementUser, UserAnalytics as UserAnalyticsType } from '@/types/user-management.types';

// Mock the useUserManagement hook
jest.mock('@/hooks/use-user-management', () => ({
  useUserManagement: jest.fn()
}));

// Mock the user management service
jest.mock('@/services/user-management.service', () => ({
  userManagementService: {
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    updateUserStatus: jest.fn(),
    updateUserRole: jest.fn(),
    updateUserVerification: jest.fn(),
    bulkUserOperation: jest.fn(),
    getUserAnalytics: jest.fn(),
    exportUsers: jest.fn(),
    importUsers: jest.fn()
  }
}));

// Mock Chart.js components
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart</div>,
  Pie: () => <div data-testid="pie-chart">Pie Chart</div>
}));

const mockUsers: UserManagementUser[] = [
  {
    id: 'user-1',
    username: 'user1',
    email: 'user1@test.com',
    first_name: 'John',
    last_name: 'Doe',
    status: 'active',
    role: 'user',
    verification_status: 'verified',
    is_freelancer: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-2',
    username: 'user2',
    email: 'user2@test.com',
    first_name: 'Jane',
    last_name: 'Smith',
    status: 'suspended',
    role: 'moderator',
    verification_status: 'pending',
    is_freelancer: false,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  }
];

const mockAnalytics: UserAnalyticsType = {
  total_users: 1000,
  active_users: 850,
  suspended_users: 50,
  pending_verification: 100,
  user_growth: [
    { month: '2024-01', count: 100 },
    { month: '2024-02', count: 150 }
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
  users: mockUsers,
  loading: false,
  error: null,
  selectedUsers: [],
  filters: {
    page: 1,
    limit: 20,
    search: '',
    status: undefined,
    role: undefined,
    verification_status: undefined,
    is_freelancer: undefined,
    date_from: undefined,
    date_to: undefined,
    sort_by: 'created_at',
    sort_order: 'desc'
  },
  fetchUsers: jest.fn(),
  setFilters: jest.fn(),
  searchUsers: jest.fn(),
  getUserById: jest.fn().mockResolvedValue(mockUsers[0]),
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

// Helper function to render components with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('User Management Integration Tests', () => {
  beforeEach(() => {
    (useUserManagement as jest.Mock).mockReturnValue(mockUseUserManagement);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Complete User Management Workflow', () => {
    it('should handle full user management cycle', async () => {
      // 1. Start with user list
      renderWithRouter(<UserList />);

      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();

      // 2. Search functionality
      const searchInput = screen.getByPlaceholderText('Search users...');
      fireEvent.change(searchInput, { target: { value: 'user1' } });

      await waitFor(() => {
        expect(mockUseUserManagement.searchUsers).toHaveBeenCalledWith('user1');
      });

      // 3. Filter functionality
      const statusFilter = screen.getByLabelText('Status');
      fireEvent.change(statusFilter, { target: { value: 'active' } });

      await waitFor(() => {
        expect(mockUseUserManagement.setFilters).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'active'
          })
        );
      });

      // 4. User selection and bulk operations
      const userCheckbox = screen.getAllByRole('checkbox')[1];
      fireEvent.click(userCheckbox);

      expect(mockUseUserManagement.selectUser).toHaveBeenCalledWith('user-1');

      // 5. Bulk operation
      const bulkActionButton = screen.getByText('Bulk Actions');
      fireEvent.click(bulkActionButton);

      const suspendButton = screen.getByText('Suspend Selected');
      fireEvent.click(suspendButton);

      await waitFor(() => {
        expect(mockUseUserManagement.bulkOperation).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'suspend',
            user_ids: ['user-1']
          })
        );
      });

      // 6. Navigate to user profile
      const viewButton = screen.getAllByText('View')[0];
      fireEvent.click(viewButton);

      expect(screen.getByText('User Details')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();

      // 7. Edit user profile
      const editButton = screen.getByText('Edit Profile');
      fireEvent.click(editButton);

      expect(screen.getByText('Edit User Profile')).toBeInTheDocument();

      // 8. Update user information
      const firstNameInput = screen.getByDisplayValue('John');
      fireEvent.change(firstNameInput, { target: { value: 'Johnny' } });

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUseUserManagement.updateUser).toHaveBeenCalledWith(
          'user-1',
          expect.objectContaining({
            first_name: 'Johnny'
          })
        );
      });

      // 9. Change user status
      const statusButton = screen.getByText('Active');
      fireEvent.click(statusButton);

      const suspendOption = screen.getByText('Suspend');
      fireEvent.click(suspendOption);

      await waitFor(() => {
        expect(mockUseUserManagement.updateUserStatus).toHaveBeenCalledWith(
          'user-1',
          'suspended',
          expect.any(String)
        );
      });

      // 10. Change user role
      const roleButton = screen.getByText('User');
      fireEvent.click(roleButton);

      const moderatorOption = screen.getByText('Moderator');
      fireEvent.click(moderatorOption);

      await waitFor(() => {
        expect(mockUseUserManagement.updateUserRole).toHaveBeenCalledWith(
          'user-1',
          'moderator',
          expect.any(String)
        );
      });

      // 11. Update verification status
      const verificationButton = screen.getByText('Verified');
      fireEvent.click(verificationButton);

      const pendingOption = screen.getByText('Pending');
      fireEvent.click(pendingOption);

      await waitFor(() => {
        expect(mockUseUserManagement.updateUserVerification).toHaveBeenCalledWith(
          'user-1',
          expect.objectContaining({
            verification_status: 'pending'
          })
        );
      });
    });

    it('should handle user creation workflow', async () => {
      renderWithRouter(<UserList />);

      // Open create user modal
      const createButton = screen.getByText('Create User');
      fireEvent.click(createButton);

      expect(screen.getByText('Create New User')).toBeInTheDocument();

      // Fill user form
      const usernameInput = screen.getByLabelText('Username');
      const emailInput = screen.getByLabelText('Email');
      const firstNameInput = screen.getByLabelText('First Name');
      const lastNameInput = screen.getByLabelText('Last Name');
      const walletInput = screen.getByLabelText('Wallet Address');

      fireEvent.change(usernameInput, { target: { value: 'newuser' } });
      fireEvent.change(emailInput, { target: { value: 'newuser@test.com' } });
      fireEvent.change(firstNameInput, { target: { value: 'New' } });
      fireEvent.change(lastNameInput, { target: { value: 'User' } });
      fireEvent.change(walletInput, { target: { value: '0x1234567890abcdef' } });

      // Submit form
      const submitButton = screen.getByText('Create User');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUseUserManagement.createUser).toHaveBeenCalledWith(
          expect.objectContaining({
            username: 'newuser',
            email: 'newuser@test.com',
            first_name: 'New',
            last_name: 'User',
            wallet_address: '0x1234567890abcdef'
          })
        );
      });
    });

    it('should handle data export and import workflow', async () => {
      renderWithRouter(<UserList />);

      // Export functionality
      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);

      const csvOption = screen.getByText('Export as CSV');
      fireEvent.click(csvOption);

      await waitFor(() => {
        expect(mockUseUserManagement.exportUsers).toHaveBeenCalledWith(
          expect.objectContaining({
            format: 'csv'
          })
        );
      });

      // Import functionality
      const importButton = screen.getByText('Import');
      fireEvent.click(importButton);

      const fileInput = screen.getByLabelText('Select CSV file');
      const file = new File(['test,data'], 'test.csv', { type: 'text/csv' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockUseUserManagement.importUsers).toHaveBeenCalled();
      });
    });

    it('should handle analytics workflow', async () => {
      renderWithRouter(<UserAnalytics />);

      // Verify analytics dashboard loads
      expect(screen.getByText('User Analytics Dashboard')).toBeInTheDocument();

      // Check key metrics are displayed
      expect(screen.getByText('1,000')).toBeInTheDocument(); // Total users
      expect(screen.getByText('850')).toBeInTheDocument(); // Active users

      // Verify charts are rendered
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();

      // Test date range filtering
      const dateFromInput = screen.getByLabelText('From Date');
      const dateToInput = screen.getByLabelText('To Date');

      fireEvent.change(dateFromInput, { target: { value: '2024-01-01' } });
      fireEvent.change(dateToInput, { target: { value: '2024-12-31' } });

      const applyButton = screen.getByText('Apply Filter');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(mockUseUserManagement.getUserAnalytics).toHaveBeenCalled();
      });

      // Test export analytics
      const exportButton = screen.getByText('Export Analytics');
      fireEvent.click(exportButton);

      const csvOption = screen.getByText('Export as CSV');
      fireEvent.click(csvOption);

      await waitFor(() => {
        expect(mockUseUserManagement.exportUsers).toHaveBeenCalled();
      });
    });

    it('should handle error states gracefully', async () => {
      // Test error state in user list
      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUseUserManagement,
        error: 'Failed to fetch users'
      });

      renderWithRouter(<UserList />);

      expect(screen.getByText('Error: Failed to fetch users')).toBeInTheDocument();

      // Test error state in analytics
      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUseUserManagement,
        error: 'Failed to fetch analytics'
      });

      renderWithRouter(<UserAnalytics />);

      expect(screen.getByText('Error: Failed to fetch analytics')).toBeInTheDocument();
    });

    it('should handle loading states gracefully', async () => {
      // Test loading state in user list
      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUseUserManagement,
        loading: true
      });

      renderWithRouter(<UserList />);

      expect(screen.getByText('Loading users...')).toBeInTheDocument();

      // Test loading state in analytics
      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUseUserManagement,
        loading: true
      });

      renderWithRouter(<UserAnalytics />);

      expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
    });

    it('should handle pagination and sorting', async () => {
      renderWithRouter(<UserList />);

      // Test pagination
      const nextPageButton = screen.getByText('Next');
      fireEvent.click(nextPageButton);

      await waitFor(() => {
        expect(mockUseUserManagement.setPage).toHaveBeenCalledWith(2);
      });

      // Test sorting
      const sortButton = screen.getByText('Created Date');
      fireEvent.click(sortButton);

      const ascendingOption = screen.getByText('Ascending');
      fireEvent.click(ascendingOption);

      await waitFor(() => {
        expect(mockUseUserManagement.setFilters).toHaveBeenCalledWith(
          expect.objectContaining({
            sort_by: 'created_at',
            sort_order: 'asc'
          })
        );
      });
    });

    it('should handle communication workflow', async () => {
      renderWithRouter(<UserProfile userId="user-1" />);

      // Click send message button
      const messageButton = screen.getByText('Send Message');
      fireEvent.click(messageButton);

      expect(screen.getByText('Send Message to John Doe')).toBeInTheDocument();

      // Fill message form
      const subjectInput = screen.getByLabelText('Subject');
      const messageInput = screen.getByLabelText('Message');

      fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });
      fireEvent.change(messageInput, { target: { value: 'Test Message' } });

      // Send message
      const sendButton = screen.getByText('Send');
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText('Message sent successfully')).toBeInTheDocument();
      });
    });
  });
});
