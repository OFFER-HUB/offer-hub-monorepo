// Basic validation constants
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const CONTRACT_TYPES = ["project", "service"] as const;
export const ESCROW_STATUSES = [
  "pending",
  "funded",
  "released",
  "disputed",
] as const;
export const ACTIVE_ESCROW_STATUSES = [
  "funded",
  "released",
  "disputed",
] as const;

// Email validation - RFC compliant
export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Wallet address validation - supports multiple blockchain formats
export const WALLET_ADDRESS_REGEX = {
  ethereum: /^0x[a-fA-F0-9]{40}$/,
  stellar: /^[1-9A-HJ-NP-Za-km-z]{56}$/,
  bitcoin: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
  // Add more blockchain formats as needed
};

// Username validation
export const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;

// Monetary amount validation
export const MONETARY_AMOUNT_REGEX = /^\d+(\.\d{1,6})?$/;

// Date validation
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
export const DATETIME_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;

// Validation functions
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== "string") return false;
  return EMAIL_REGEX.test(email.trim());
};

export const validateWalletAddress = (
  address: string,
  blockchain: keyof typeof WALLET_ADDRESS_REGEX = "ethereum",
): boolean => {
  if (!address || typeof address !== "string") return false;
  return WALLET_ADDRESS_REGEX[blockchain].test(address.trim());
};

export const validateUsername = (username: string): boolean => {
  if (!username || typeof username !== "string") return false;
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 20) return false;
  return USERNAME_REGEX.test(trimmed);
};

export const validateMonetaryAmount = (amount: number | string): boolean => {
  if (amount === null || amount === undefined) return false;

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount) || numAmount <= 0) return false;

  // Check for reasonable maximum amount (1 billion)
  if (numAmount > 1000000000) return false;

  // Check decimal places (max 6 decimal places)
  const decimalPlaces = numAmount.toString().split(".")[1]?.length || 0;
  if (decimalPlaces > 6) return false;

  return true;
};

export const validateDateRange = (
  startDate: Date | string,
  endDate: Date | string,
): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;

  return start < end;
};

export const validateRequiredFields = (
  obj: Record<string, any>,
  fields: string[],
): string[] => {
  const missingFields: string[] = [];

  for (const field of fields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === "") {
      missingFields.push(field);
    }
  }

  return missingFields;
};

export const validateUUID = (id: string): boolean => {
  if (!id || typeof id !== "string") return false;
  return UUID_REGEX.test(id.trim());
};

export const validateStringLength = (
  str: string,
  minLength: number,
  maxLength: number,
): boolean => {
  if (!str || typeof str !== "string") return false;
  const trimmed = str.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
};

export const validateIntegerRange = (
  value: number | string,
  min: number,
  max: number,
): boolean => {
  const num = typeof value === "string" ? parseInt(value, 10) : value;
  if (isNaN(num)) return false;
  return Number.isInteger(num) && num >= min && num <= max;
};

export const validateEnum = <T extends string>(
  value: string,
  allowedValues: readonly T[],
): value is T => {
  return allowedValues.includes(value as T);
};

// Validation result type for detailed error reporting
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  value: any;
  reason: string;
  code: string;
}

// Comprehensive validation function
export const validateObject = (
  obj: Record<string, any>,
  schema: Record<string, ValidationRule>,
): ValidationResult => {
  const errors: ValidationError[] = [];

  for (const [field, rule] of Object.entries(schema)) {
    const value = obj[field];

    // Check required fields
    if (
      rule.required &&
      (value === undefined || value === null || value === "")
    ) {
      errors.push({
        field,
        value,
        reason: "Field is required",
        code: "REQUIRED_FIELD",
      });
      continue;
    }

    // Skip validation if field is not required and empty
    if (
      !rule.required &&
      (value === undefined || value === null || value === "")
    ) {
      continue;
    }

    // Type validation
    if (rule.type && typeof value !== rule.type) {
      errors.push({
        field,
        value,
        reason: `Expected ${rule.type}, got ${typeof value}`,
        code: "INVALID_TYPE",
      });
      continue;
    }

    // Custom validation
    if (rule.validator && !rule.validator(value)) {
      errors.push({
        field,
        value,
        reason: rule.errorMessage || "Validation failed",
        code: rule.errorCode || "VALIDATION_FAILED",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export interface ValidationRule {
  required?: boolean;
  type?: string;
  validator?: (value: any) => boolean;
  errorMessage?: string;
  errorCode?: string;
}

// Predefined validation schemas
export const USER_CREATION_SCHEMA: Record<string, ValidationRule> = {
  wallet_address: {
    required: true,
    type: "string",
    validator: (value) => validateWalletAddress(value),
    errorMessage: "Invalid wallet address format",
    errorCode: "INVALID_WALLET_ADDRESS",
  },
  username: {
    required: true,
    type: "string",
    validator: (value) => validateUsername(value),
    errorMessage:
      "Username must be 3-20 characters, alphanumeric with underscores and hyphens only",
    errorCode: "INVALID_USERNAME",
  },
  email: {
    required: false,
    type: "string",
    validator: (value) => validateEmail(value),
    errorMessage: "Invalid email format",
    errorCode: "INVALID_EMAIL",
  },
  name: {
    required: false,
    type: "string",
    validator: (value) => validateStringLength(value, 1, 100),
    errorMessage: "Name must be between 1 and 100 characters",
    errorCode: "INVALID_NAME_LENGTH",
  },
  bio: {
    required: false,
    type: "string",
    validator: (value) => validateStringLength(value, 0, 500),
    errorMessage: "Bio must be less than 500 characters",
    errorCode: "INVALID_BIO_LENGTH",
  },
  is_freelancer: {
    required: false,
    type: "boolean",
  },
};

// Predefined validation schemas
export const PROFILE_CREATION_SCHEMA: Record<string, ValidationRule> = {
  display_name: {
    required: false,
    type: "string",
    validator: (value) => validateStringLength(value, 1, 100),
    errorMessage: "Display name must be between 1 and 100 characters",
    errorCode: "INVALID_DISPLAY_NAME_LENGTH",
  },
  location: {
    required: false,
    type: "string",
    validator: (value) => validateStringLength(value, 1, 100),
    errorMessage: "Location must be between 1 and 100 characters",
    errorCode: "INVALID_LOCATION_LENGTH",
  },
  date_of_birth: {
    required: false,
    type: "string",
    validator: (value) => DATE_REGEX.test(value),
    errorMessage: "Date of birth must be in YYYY-MM-DD format",
    errorCode: "INVALID_DATE_OF_BIRTH",
  },
  website: {
    required: false,
    type: "string",
    // write regex to validate website url
    validator: (value) =>
      /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(value) &&
      validateStringLength(value, 1, 255),
    errorMessage: "Invalid website format",
    errorCode: "INVALID_WEBSITE",
  },
  bio: {
    required: false,
    type: "string",
    validator: (value) => validateStringLength(value, 1, 500),
    errorMessage: "Bio must be less than 500 characters",
    errorCode: "INVALID_BIO_LENGTH",
  },
  skills: {
    required: false,
    type: "object",
    validator: (value) =>
      Array.isArray(value) && validateStringLength(value.join(", "), 0, 500),
    errorMessage: "Skills must be less than 500 characters in total",
    errorCode: "INVALID_SKILLS_LENGTH",
  },
};

export const CONTRACT_CREATION_SCHEMA: Record<string, ValidationRule> = {
  contract_type: {
    required: true,
    type: "string",
    validator: (value) => validateEnum(value, CONTRACT_TYPES),
    errorMessage: 'Contract type must be "project" or "service"',
    errorCode: "INVALID_CONTRACT_TYPE",
  },
  freelancer_id: {
    required: true,
    type: "string",
    validator: (value) => validateUUID(value),
    errorMessage: "Invalid freelancer ID format",
    errorCode: "INVALID_FREELANCER_ID",
  },
  client_id: {
    required: true,
    type: "string",
    validator: (value) => validateUUID(value),
    errorMessage: "Invalid client ID format",
    errorCode: "INVALID_CLIENT_ID",
  },
  contract_on_chain_id: {
    required: true,
    type: "string",
    validator: (value) => validateStringLength(value, 1, 255),
    errorMessage: "Contract on-chain ID cannot be empty",
    errorCode: "INVALID_CONTRACT_ON_CHAIN_ID",
  },
  amount_locked: {
    required: true,
    type: "number",
    validator: (value) => validateMonetaryAmount(value),
    errorMessage: "Amount must be greater than 0",
    errorCode: "INVALID_AMOUNT",
  },
};

// Avatar URL validation
export const AVATAR_IMAGE_EXTENSIONS = Object.freeze([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
]) as readonly string[];
export const AVATAR_URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

export const validateAvatarUrl = (url: string): boolean => {
  if (!url || typeof url !== "string") return false;

  const trimmedUrl = url.trim();

  // Check basic URL format
  if (!AVATAR_URL_REGEX.test(trimmedUrl)) return false;

  try {
    const parsed = new URL(trimmedUrl);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const pathnameLower = parsed.pathname.toLowerCase();
    return AVATAR_IMAGE_EXTENSIONS.some((ext) => pathnameLower.endsWith(ext));
  } catch {
    return false;
  }
};

// Profile validation schema - all fields optional for updates
export const PROFILE_UPDATE_SCHEMA: Record<string, ValidationRule> = {
  displayName: {
    required: false,
    type: 'string',
    validator: (value) => {
      // Allow empty strings (will be converted to null)
      if (value === '' || value === null) return true;
      return validateStringLength(value, 0, 100);
    },
    errorMessage: 'Display name must be less than 100 characters',
    errorCode: 'INVALID_DISPLAY_NAME_LENGTH'
  },
  bio: {
    required: false,
    type: 'string',
    validator: (value) => {
      // Allow empty strings (will be converted to null)
      if (value === '' || value === null) return true;
      return validateStringLength(value, 0, 500);
    },
    errorMessage: 'Bio must be less than 500 characters',
    errorCode: 'INVALID_BIO_LENGTH'
  },
  avatarUrl: {
    required: false,
    type: 'string',
    validator: (value) => {
      // Allow empty strings (will be converted to null)
      if (value === '' || value === null) return true;
      return validateAvatarUrl(value);
    },
    errorMessage: 'Invalid avatar URL format. Must be a valid URL ending with .jpg, .jpeg, .png, .gif, or .webp',
    errorCode: 'INVALID_AVATAR_URL'
  },
  dateOfBirth: {
    required: false,
    // No type check - validator handles both Date objects and ISO strings
    validator: (value) => {
      // Allow null
      if (value === null || value === undefined) return true;
      // Must be a valid Date object
      if (value instanceof Date) {
        return !isNaN(value.getTime());
      }
      // Allow ISO date strings
      if (typeof value === 'string') {
        const date = new Date(value);
        return !isNaN(date.getTime());
      }
      return false;
    },
    errorMessage: 'Date of birth must be a valid date',
    errorCode: 'INVALID_DATE_OF_BIRTH'
  },
  location: {
    required: false,
    type: 'string',
    validator: (value) => {
      // Allow empty strings (will be converted to null)
      if (value === '' || value === null) return true;
      return validateStringLength(value, 0, 100);
    },
    errorMessage: 'Location must be less than 100 characters',
    errorCode: 'INVALID_LOCATION_LENGTH'
  },
  skills: {
    required: false,
    type: 'object',
    validator: (value) => {
      // Allow null or undefined
      if (value === null || value === undefined) return true;
      // Must be an array
      if (!Array.isArray(value)) return false;
      // All items must be strings
      return value.every(item => typeof item === 'string');
    },
    errorMessage: 'Skills must be an array of strings',
    errorCode: 'INVALID_SKILLS_FORMAT'
  },
  website: {
    required: false,
    type: 'string',
    validator: (value) => {
      // Allow empty strings (will be converted to null)
      if (value === '' || value === null) return true;
      // Validate URL format and length
      if (!validateStringLength(value, 0, 255)) return false;
      // Basic URL validation
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    errorMessage: 'Website must be a valid URL and less than 255 characters',
    errorCode: 'INVALID_WEBSITE_URL'
  }
};
