export interface ConversionRates {
  XLM: { USD: number; EUR: number };
  USD: { XLM: number; EUR: number };
  EUR: { XLM: number; USD: number };
  [key: string]: { [key: string]: number };
}

export interface CoinImages {
  XLM: string;
  USD: string;
  EUR: string;
  [key: string]: string;
}

// Updated Service interface to match backend structure
export interface Service {
  id: string; // Changed from number to string (UUID)
  title: string; // Changed from 'name' to 'title'
  description: string; // NEW FIELD - required by backend
  category: string; // NEW FIELD - required by backend
  min_price: number; // NEW FIELD - required by backend
  max_price: number; // NEW FIELD - required by backend
  currency?: string; // Frontend-only field (optional)
  user_id?: string; // From backend response
}

// Legacy interface for backward compatibility during migration
export interface LegacyService {
  id: number;
  name: string;
  price: string;
  currency: string;
}
