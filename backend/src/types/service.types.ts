// Base service interface
export interface Service {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  min_price: number;
  max_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Service creation DTO
export interface CreateServiceDTO {
  user_id: string;
  title: string;
  description: string;
  category: string;
  min_price: number;
  max_price: number;
}

// Service update DTO (all fields optional except constraints)
export interface UpdateServiceDTO {
  title?: string;
  description?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  is_active?: boolean;
}

// Freelancer info for service listings
export interface FreelancerInfo {
  id?: string;
  name?: string; // Instead of first_name/last_name
  username?: string; // Add username
  email?: string;
  bio?: string;
  reputation_score?: number;
}

// Service with freelancer information
export interface ServiceWithFreelancer extends Service {
  freelancer: FreelancerInfo;
}

// Filter options for service search
export interface ServiceFilters {
  category?: string;
  min_price?: number;
  max_price?: number;
  keyword?: string;
  page?: number;
  limit?: number;
}

// API Response interfaces
export interface ServiceResponse {
  success: boolean;
  message: string;
  data?: Service | ServiceWithFreelancer;
}

export interface ServicesListResponse {
  success: boolean;
  message: string;
  data?: ServiceWithFreelancer[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_services: number;
    per_page: number;
  };
}

export interface ServiceDeleteResponse {
  success: boolean;
  message: string;
}

// Database table structure (for reference)
export interface ServiceTable {
  id: string; // UUID primary key
  user_id: string; // UUID foreign key to users table
  title: string; // NOT NULL
  description: string; // NOT NULL
  category: string; // NOT NULL
  min_price: number; // DECIMAL(10,2) NOT NULL
  max_price: number; // DECIMAL(10,2) NOT NULL
  is_active: boolean; // DEFAULT true
  created_at: string; // TIMESTAMP DEFAULT NOW()
  updated_at: string; // TIMESTAMP DEFAULT NOW()
}
