/**
 * Unit Tests - Password Utilities
 * Tests for password hashing, comparison, and validation
 */

import {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
} from '../../src/shared/utils/password.utils';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // bcrypt uses random salt
    });

    it('should handle empty string', async () => {
      const hash = await hashPassword('');
      expect(hash).toBeDefined();
    });

    it('should handle special characters', async () => {
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = await hashPassword(password);
      expect(hash).toBeDefined();
    });

    it('should handle unicode characters', async () => {
      const password = '密码Test123!🔒';
      const hash = await hashPassword(password);
      expect(hash).toBeDefined();
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword(password, hash);

      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword(wrongPassword, hash);

      expect(isMatch).toBe(false);
    });

    it('should be case sensitive', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword('testpassword123!', hash);

      expect(isMatch).toBe(false);
    });

    it('should return false for empty password against hash', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword('', hash);

      expect(isMatch).toBe(false);
    });

    it('should handle special characters correctly', async () => {
      const password = '!@#Special$%^&*()';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword(password, hash);

      expect(isMatch).toBe(true);
    });

    it('should handle unicode characters correctly', async () => {
      const password = '密码Test123!🔒';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword(password, hash);

      expect(isMatch).toBe(true);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate a strong password', () => {
      const result = validatePasswordStrength('StrongPassword123!');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password shorter than 8 characters', () => {
      const result = validatePasswordStrength('Short1!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject password without uppercase letter', () => {
      const result = validatePasswordStrength('lowercase123!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase letter', () => {
      const result = validatePasswordStrength('UPPERCASE123!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without number', () => {
      const result = validatePasswordStrength('NoNumbers!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without special character', () => {
      const result = validatePasswordStrength('NoSpecial123');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should return multiple errors for weak password', () => {
      const result = validatePasswordStrength('weak');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain('Password must be at least 8 characters long');
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
      expect(result.errors).toContain('Password must contain at least one number');
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should accept password with various special characters', () => {
      const passwords = [
        'Password123!',
        'Password123@',
        'Password123#',
        'Password123$',
        'Password123%',
        'Password123^',
        'Password123&',
        'Password123*',
      ];

      passwords.forEach((password) => {
        const result = validatePasswordStrength(password);
        expect(result.valid).toBe(true);
      });
    });

    it('should handle edge case of exactly 8 characters', () => {
      const result = validatePasswordStrength('Pass123!');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle very long passwords', () => {
      const longPassword = 'A1!' + 'a'.repeat(100);
      const result = validatePasswordStrength(longPassword);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
