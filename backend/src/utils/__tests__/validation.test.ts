import {
  validateEmail,
  validateWalletAddress,
  validateUsername,
  validateMonetaryAmount,
  validateDateRange,
  validateRequiredFields,
  validateUUID,
  validateStringLength,
  validateIntegerRange,
  validateEnum,
  validateObject,
  CONTRACT_CREATION_SCHEMA,
  USER_CREATION_SCHEMA,
  CONTRACT_TYPES,
  ESCROW_STATUSES
} from '../validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(validateEmail('user123@test-domain.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail(null as any)).toBe(false);
      expect(validateEmail(undefined as any)).toBe(false);
    });
  });

  describe('validateWalletAddress', () => {
    it('should validate Ethereum addresses', () => {
      expect(validateWalletAddress('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6')).toBe(true);
      expect(validateWalletAddress('0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6')).toBe(true);
    });

    it('should validate Stellar addresses', () => {
      // Test with a valid Stellar address format (56 characters, base58)
      const validStellarAddress = 'G' + 'A'.repeat(55); // G followed by 55 A's
      expect(validateWalletAddress(validStellarAddress, 'stellar')).toBe(true);
    });

    it('should reject invalid wallet addresses', () => {
      expect(validateWalletAddress('invalid-address')).toBe(false);
      expect(validateWalletAddress('0x123')).toBe(false);
      expect(validateWalletAddress('')).toBe(false);
      expect(validateWalletAddress(null as any)).toBe(false);
    });
  });

  describe('validateUsername', () => {
    it('should validate correct usernames', () => {
      expect(validateUsername('john_doe')).toBe(true);
      expect(validateUsername('user123')).toBe(true);
      expect(validateUsername('test-user')).toBe(true);
      expect(validateUsername('abc')).toBe(true); // minimum length
      expect(validateUsername('a'.repeat(20))).toBe(true); // maximum length
    });

    it('should reject invalid usernames', () => {
      expect(validateUsername('ab')).toBe(false); // too short
      expect(validateUsername('a'.repeat(21))).toBe(false); // too long
      expect(validateUsername('user@name')).toBe(false); // invalid character
      expect(validateUsername('user name')).toBe(false); // space not allowed
      expect(validateUsername('')).toBe(false);
      expect(validateUsername(null as any)).toBe(false);
    });
  });

  describe('validateMonetaryAmount', () => {
    it('should validate correct monetary amounts', () => {
      expect(validateMonetaryAmount(100)).toBe(true);
      expect(validateMonetaryAmount(100.50)).toBe(true);
      expect(validateMonetaryAmount(0.01)).toBe(true);
      expect(validateMonetaryAmount('100')).toBe(true);
      expect(validateMonetaryAmount('100.50')).toBe(true);
    });

    it('should reject invalid monetary amounts', () => {
      expect(validateMonetaryAmount(0)).toBe(false);
      expect(validateMonetaryAmount(-100)).toBe(false);
      expect(validateMonetaryAmount(1000000001)).toBe(false); // too large
      expect(validateMonetaryAmount(100.1234567)).toBe(false); // too many decimal places
      expect(validateMonetaryAmount('invalid')).toBe(false);
      expect(validateMonetaryAmount(null as any)).toBe(false);
      expect(validateMonetaryAmount(undefined as any)).toBe(false);
    });
  });

  describe('validateDateRange', () => {
    it('should validate correct date ranges', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      expect(validateDateRange(start, end)).toBe(true);
      expect(validateDateRange('2024-01-01', '2024-12-31')).toBe(true);
    });

    it('should reject invalid date ranges', () => {
      const start = new Date('2024-12-31');
      const end = new Date('2024-01-01');
      expect(validateDateRange(start, end)).toBe(false);
      expect(validateDateRange('invalid', '2024-12-31')).toBe(false);
    });
  });

  describe('validateRequiredFields', () => {
    it('should return empty array for valid object', () => {
      const obj = { name: 'John', email: 'john@example.com', age: 30 };
      const fields = ['name', 'email'];
      expect(validateRequiredFields(obj, fields)).toEqual([]);
    });

    it('should return missing fields', () => {
      const obj = { name: 'John', age: 30 };
      const fields = ['name', 'email', 'phone'];
      expect(validateRequiredFields(obj, fields)).toEqual(['email', 'phone']);
    });

    it('should handle empty and null values', () => {
      const obj = { name: '', email: null, phone: undefined };
      const fields = ['name', 'email', 'phone'];
      expect(validateRequiredFields(obj, fields)).toEqual(['name', 'email', 'phone']);
    });
  });

  describe('validateUUID', () => {
    it('should validate correct UUIDs', () => {
      expect(validateUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(validateUUID('987fcdeb-51a2-43d7-8f9e-123456789abc')).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(validateUUID('invalid-uuid')).toBe(false);
      expect(validateUUID('123e4567-e89b-12d3-a456-42661417400')).toBe(false); // too short
      expect(validateUUID('123e4567-e89b-12d3-a456-4266141740000')).toBe(false); // too long
      expect(validateUUID('')).toBe(false);
      expect(validateUUID(null as any)).toBe(false);
    });
  });

  describe('validateStringLength', () => {
    it('should validate strings within range', () => {
      expect(validateStringLength('test', 1, 10)).toBe(true);
      expect(validateStringLength('a', 1, 10)).toBe(true);
      expect(validateStringLength('teststring', 1, 10)).toBe(true);
    });

    it('should reject strings outside range', () => {
      expect(validateStringLength('', 1, 10)).toBe(false);
      expect(validateStringLength('toolongstring', 1, 10)).toBe(false);
      expect(validateStringLength(null as any, 1, 10)).toBe(false);
    });
  });

  describe('validateIntegerRange', () => {
    it('should validate integers within range', () => {
      expect(validateIntegerRange(5, 1, 10)).toBe(true);
      expect(validateIntegerRange(1, 1, 10)).toBe(true);
      expect(validateIntegerRange(10, 1, 10)).toBe(true);
      expect(validateIntegerRange('5', 1, 10)).toBe(true);
    });

    it('should reject values outside range', () => {
      expect(validateIntegerRange(0, 1, 10)).toBe(false);
      expect(validateIntegerRange(11, 1, 10)).toBe(false);
      expect(validateIntegerRange(5.5, 1, 10)).toBe(false);
      expect(validateIntegerRange('invalid', 1, 10)).toBe(false);
    });
  });

  describe('validateEnum', () => {
    it('should validate correct enum values', () => {
      expect(validateEnum('project', CONTRACT_TYPES)).toBe(true);
      expect(validateEnum('service', CONTRACT_TYPES)).toBe(true);
      expect(validateEnum('pending', ESCROW_STATUSES)).toBe(true);
    });

    it('should reject invalid enum values', () => {
      expect(validateEnum('invalid', CONTRACT_TYPES)).toBe(false);
      expect(validateEnum('', CONTRACT_TYPES)).toBe(false);
    });
  });

  describe('validateObject', () => {
    describe('CONTRACT_CREATION_SCHEMA', () => {
      it('should validate correct contract data', () => {
        const contractData = {
          contract_type: 'project',
          freelancer_id: '123e4567-e89b-12d3-a456-426614174000',
          client_id: '987fcdeb-51a2-43d7-8f9e-123456789abc',
          contract_on_chain_id: 'chain_contract_123',
          amount_locked: 1000
        };

        const result = validateObject(contractData, CONTRACT_CREATION_SCHEMA);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should reject invalid contract data', () => {
        const contractData = {
          contract_type: 'invalid',
          freelancer_id: 'invalid-uuid',
          client_id: '987fcdeb-51a2-43d7-8f9e-123456789abc',
          contract_on_chain_id: '',
          amount_locked: -100
        };

        const result = validateObject(contractData, CONTRACT_CREATION_SCHEMA);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.some(e => e.field === 'contract_type')).toBe(true);
        expect(result.errors.some(e => e.field === 'freelancer_id')).toBe(true);
        expect(result.errors.some(e => e.field === 'contract_on_chain_id')).toBe(true);
        expect(result.errors.some(e => e.field === 'amount_locked')).toBe(true);
      });

      it('should handle missing required fields', () => {
        const contractData = {
          contract_type: 'project'
        };

        const result = validateObject(contractData, CONTRACT_CREATION_SCHEMA);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.code === 'REQUIRED_FIELD')).toBe(true);
      });
    });

    describe('USER_CREATION_SCHEMA', () => {
      it('should validate correct user data', () => {
        const userData = {
          wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          username: 'john_doe',
          email: 'john@example.com',
          name: 'John Doe',
          bio: 'Software developer',
          is_freelancer: true
        };

        const result = validateObject(userData, USER_CREATION_SCHEMA);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should reject invalid user data', () => {
        const userData = {
          wallet_address: 'invalid-address',
          username: 'jo', // too short
          email: 'invalid-email',
          name: 'a'.repeat(101), // too long
          bio: 'a'.repeat(501), // too long
          is_freelancer: 'not-boolean'
        };

        const result = validateObject(userData, USER_CREATION_SCHEMA);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      it('should handle optional fields correctly', () => {
        const userData = {
          wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          username: 'john_doe'
        };

        const result = validateObject(userData, USER_CREATION_SCHEMA);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });
    });
  });
});
