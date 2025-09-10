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
