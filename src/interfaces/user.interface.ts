// Legacy User interface for backward compatibility with existing components
export interface User {
  id: number;
  name: string;
  email: string;
  emailValidated: boolean;
  identityCard: string;
  status: string;
  submissionDate: string;
  location: string;
  role: string;
  analytics: {
    totalClients: number;
    clientsChange: number;
    completedJobs: number;
    jobsChange: number;
    totalPayments: number;
    paymentsChange: number;
    profileViews: number;
    viewsChange: number;
  };
}

export interface AdminUser {
  id: string;
  wallet_address: string;
  username: string;
  name?: string;
  bio?: string;
  email?: string;
  is_freelancer?: boolean;
  created_at?: string;
}

export const mapAdminUserToLegacy = (adminUser: AdminUser): User => ({
  id: parseInt(adminUser.id.replace(/-/g, "").substring(0, 8), 16),
  name: adminUser.name || adminUser.username,
  email: adminUser.email || "",
  emailValidated: !!adminUser.email,
  identityCard: "",
  status: "Active",
  submissionDate: adminUser.created_at
    ? new Date(adminUser.created_at).toISOString().split("T")[0]
    : "",
  location: "",
  role:
    adminUser.is_freelancer === true
      ? "Freelancer"
      : adminUser.is_freelancer === false
        ? "Client"
        : "Unknown",
  analytics: {
    totalClients: 0,
    clientsChange: 0,
    completedJobs: 0,
    jobsChange: 0,
    totalPayments: 0,
    paymentsChange: 0,
    profileViews: 0,
    viewsChange: 0,
  },
});

export const getUserRole = (user: AdminUser): string => {
  if (user.is_freelancer === true) return "Freelancer";
  if (user.is_freelancer === false) return "Client";
  return "Unknown";
};

// export interface AnalyticsUser {
//     id: number
//     name: string
//     email: string
//     location: string
//     userId: string
//     role: string
//     status: string
//     dateJoined: string
//     analytics: {
//       totalClients: number
//       clientsChange: number
//       completedJobs: number
//       jobsChange: number
//       totalPayments: number
//       paymentsChange: number
//       profileViews: number
//       viewsChange: number
//     }
//   }
