export interface User {
  id: string;
  wallet_address: string;
  username: string;
  name?: string;
  bio?: string;
  email?: string;
  is_freelancer?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserDTO {
  wallet_address: string;
  username: string;
  name?: string;
  bio?: string;
  email?: string;
  is_freelancer?: boolean;
}

export interface UpdateUserDTO {
  name?: string;
  bio?: string;
  email?: string;
  username?: string;
  is_freelancer?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type ProfileResponse = ApiResponse<User>;

export type UpdateProfileResponse = ApiResponse<Partial<User>>;

export interface ProfileError {
  message: string;
  code?: string;
}

export interface ProfileFormData {
  name: string;
  username: string;
  email: string;
  bio: string;
}