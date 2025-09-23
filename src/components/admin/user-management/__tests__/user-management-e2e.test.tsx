import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserList } from '../user-list';
import { UserProfile } from '../user-profile';
import { UserAnalytics } from '../user-analytics';
import { useUserManagement } from '@/hooks/use-user-management';
import { UserManagementUser, UserAnalytics as UserAnalyticsType } from '@/types/user-management.types';

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

describe('User Management E2E Tests', () => {
  beforeEach(() => {
    (useUserManagement as jest.Mock).mockReturnValue(mockUseUserManagement);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Complete User Management Flow', () => {
    it('should handle complete user management workflow', async () => {
      // 1. Render user list
      render(<UserList />);

      // 2. Verify initial state
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();

      // 3. Search for users
      const searchInput = screen.getByPlaceholderText('Search users...');
      fireEvent.change(searchInput, { target: { value: 'user1' } });

      await waitFor(() => {
        expect(mockUseUserManagement.searchUsers).toHaveBeenCalledWith('user1');
      });

      // 4. Filter users by status
      const statusFilter = screen.getByLabelText('Status');
      fireEvent.change(statusFilter, { target: { value: 'active' } });

      await waitFor(() => {
        expect(mockUseUserManagement.setFilters).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'active'
          })
        );
      });

      // 5. Select users for bulk operations
      const userCheckbox = screen.getAllByRole('checkbox')[1]; // First user checkbox
      fireEvent.click(userCheckbox);

      expect(mockUseUserManagement.selectUser).toHaveBeenCalledWith('user-1');

      // 6. Perform bulk operation
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

      // 7. View user profile
      const viewButton = screen.getAllByText('View')[0];
      fireEvent.click(viewButton);

      expect(screen.getByText('User Details')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();

      // 8. Edit user profile
      const editButton = screen.getByText('Edit Profile');
      fireEvent.click(editButton);

      expect(screen.getByText('Edit User Profile')).toBeInTheDocument();

      // 9. Update user information
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

      // 10. Change user status
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

      // 11. Change user role
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

      // 12. Update verification status
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
      render(<UserList />);

      // 1. Open create user modal
      const createButton = screen.getByText('Create User');
      fireEvent.click(createButton);

      expect(screen.getByText('Create New User')).toBeInTheDocument();

      // 2. Fill user form
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

      // 3. Submit form
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

    it('should handle user deletion workflow', async () => {
      render(<UserList />);

      // 1. Click delete button
      const deleteButton = screen.getAllByText('Delete')[0];
      fireEvent.click(deleteButton);

      // 2. Confirm deletion
      const confirmButton = screen.getByText('Confirm Delete');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockUseUserManagement.deleteUser).toHaveBeenCalledWith('user-1');
      });
    });

    it('should handle data export workflow', async () => {
      render(<UserList />);

      // 1. Click export button
      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);

      // 2. Select export format
      const csvOption = screen.getByText('Export as CSV');
      fireEvent.click(csvOption);

      await waitFor(() => {
        expect(mockUseUserManagement.exportUsers).toHaveBeenCalledWith(
          expect.objectContaining({
            format: 'csv'
          })
        );
      });
    });

    it('should handle data import workflow', async () => {
      render(<UserList />);

      // 1. Click import button
      const importButton = screen.getByText('Import');
      fireEvent.click(importButton);

      // 2. Select file
      const fileInput = screen.getByLabelText('Select CSV file');
      const file = new File(['test,data'], 'test.csv', { type: 'text/csv' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockUseUserManagement.importUsers).toHaveBeenCalled();
      });
    });

    it('should handle analytics workflow', async () => {
      render(<UserAnalytics />);

      // 1. Verify analytics dashboard loads
      expect(screen.getByText('User Analytics Dashboard')).toBeInTheDocument();

      // 2. Check key metrics are displayed
      expect(screen.getByText('1,000')).toBeInTheDocument(); // Total users
      expect(screen.getByText('850')).toBeInTheDocument(); // Active users

      // 3. Verify charts are rendered
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();

      // 4. Test date range filtering
      const dateFromInput = screen.getByLabelText('From Date');
      const dateToInput = screen.getByLabelText('To Date');

      fireEvent.change(dateFromInput, { target: { value: '2024-01-01' } });
      fireEvent.change(dateToInput, { target: { value: '2024-12-31' } });

      const applyButton = screen.getByText('Apply Filter');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(mockUseUserManagement.getUserAnalytics).toHaveBeenCalled();
      });

      // 5. Test export analytics
      const exportButton = screen.getByText('Export Analytics');
      fireEvent.click(exportButton);

      const csvOption = screen.getByText('Export as CSV');
      fireEvent.click(csvOption);

      await waitFor(() => {
        expect(mockUseUserManagement.exportUsers).toHaveBeenCalled();
      });
    });

    it('should handle pagination workflow', async () => {
      render(<UserList />);

      // 1. Navigate to next page
      const nextPageButton = screen.getByText('Next');
      fireEvent.click(nextPageButton);

      await waitFor(() => {
        expect(mockUseUserManagement.setPage).toHaveBeenCalledWith(2);
      });

      // 2. Navigate to previous page
      const prevPageButton = screen.getByText('Previous');
      fireEvent.click(prevPageButton);

      await waitFor(() => {
        expect(mockUseUserManagement.setPage).toHaveBeenCalledWith(1);
      });
    });

    it('should handle sorting workflow', async () => {
      render(<UserList />);

      // 1. Click sort button
      const sortButton = screen.getByText('Created Date');
      fireEvent.click(sortButton);

      // 2. Select sort order
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
      render(<UserProfile userId="user-1" />);

      // 1. Click send message button
      const messageButton = screen.getByText('Send Message');
      fireEvent.click(messageButton);

      expect(screen.getByText('Send Message to John Doe')).toBeInTheDocument();

      // 2. Fill message form
      const subjectInput = screen.getByLabelText('Subject');
      const messageInput = screen.getByLabelText('Message');

      fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });
      fireEvent.change(messageInput, { target: { value: 'Test Message' } });

      // 3. Send message
      const sendButton = screen.getByText('Send');
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText('Message sent successfully')).toBeInTheDocument();
      });
    });

    it('should handle error states gracefully', async () => {
      // Test error state in user list
      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUseUserManagement,
        error: 'Failed to fetch users'
      });

      render(<UserList />);

      expect(screen.getByText('Error: Failed to fetch users')).toBeInTheDocument();

      // Test error state in analytics
      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUseUserManagement,
        error: 'Failed to fetch analytics'
      });

      render(<UserAnalytics />);

      expect(screen.getByText('Error: Failed to fetch analytics')).toBeInTheDocument();
    });

    it('should handle loading states gracefully', async () => {
      // Test loading state in user list
      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUseUserManagement,
        loading: true
      });

      render(<UserList />);

      expect(screen.getByText('Loading users...')).toBeInTheDocument();

      // Test loading state in analytics
      (useUserManagement as jest.Mock).mockReturnValue({
        ...mockUseUserManagement,
        loading: true
      });

      render(<UserAnalytics />);

      expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
    });
  });
});
